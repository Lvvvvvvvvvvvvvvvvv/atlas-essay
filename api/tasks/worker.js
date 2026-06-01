import { Receiver } from '@upstash/qstash';
import { supabaseAdmin } from '../_lib/supabase.js';
import { decrypt } from '../_lib/crypto.js';

export const config = { maxDuration: 60 };

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || '',
  nextSigningKey:    process.env.QSTASH_NEXT_SIGNING_KEY    || '',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Verify QStash signature
  const signature = req.headers['upstash-signature'] || '';
  const rawBody   = JSON.stringify(req.body);
  try {
    await receiver.verify({ signature, body: rawBody });
  } catch {
    return res.status(401).json({ error: 'Invalid QStash signature' });
  }

  const { taskId, userId, input } = req.body || {};
  if (!taskId || !userId) return res.status(400).json({ error: 'Missing taskId or userId' });

  // Mark as running
  await supabaseAdmin.from('tasks').update({ status: 'running', updated_at: new Date() }).eq('id', taskId);

  try {
    // Get server-side API key for this user
    const { data: keyRow } = await supabaseAdmin
      .from('api_keys')
      .select('key_enc, api_url, provider')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!keyRow) throw new Error('No server-side API key found');

    const apiKey = decrypt(keyRow.key_enc);
    const apiUrl = (keyRow.api_url || 'https://api.anthropic.com/v1').replace(/\/$/, '');

    // Run generation (non-streaming, collect full response)
    const resp = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ ...input, stream: false }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`API error ${resp.status}: ${err.slice(0, 200)}`);
    }

    const data    = await resp.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Save report to reports table
    const title = content.split('\n').find(l => l.startsWith('#'))?.replace(/^#+\s*/, '').slice(0, 80) || input.prompt?.slice(0, 60) || '报告';
    const { data: report } = await supabaseAdmin
      .from('reports')
      .insert({ user_id: userId, prompt: input.prompt, title, content, meta: { source: 'background_task', taskId } })
      .select('id')
      .single();

    // Mark task done
    await supabaseAdmin.from('tasks').update({
      status: 'done',
      output: { reportId: report?.id, wordCount: content.replace(/\s/g, '').length },
      updated_at: new Date(),
    }).eq('id', taskId);

    res.json({ ok: true, reportId: report?.id });
  } catch (err) {
    await supabaseAdmin.from('tasks').update({
      status: 'failed', error: err.message, updated_at: new Date(),
    }).eq('id', taskId);

    res.status(500).json({ error: err.message });
  }
}
