import { requireAuth } from './_lib/auth.js';
import { supabaseAdmin } from './_lib/supabase.js';
import { decrypt } from './_lib/crypto.js';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let user;
  try { user = await requireAuth(req); }
  catch (e) { return res.status(e.status || 401).json({ error: e.message }); }

  const { provider, messages, model, temperature, top_p, frequency_penalty, presence_penalty, max_tokens } = req.body || {};

  // Look up encrypted key for this user + provider
  const { data: keyRow } = await supabaseAdmin
    .from('api_keys')
    .select('key_enc, api_url')
    .eq('user_id', user.id)
    .eq('provider', provider || 'anthropic')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!keyRow) return res.status(404).json({ error: 'No server-side API key found for this provider' });

  let apiKey;
  try { apiKey = decrypt(keyRow.key_enc); }
  catch { return res.status(500).json({ error: 'Failed to decrypt API key' }); }

  const apiUrl = (keyRow.api_url || 'https://api.anthropic.com/v1').replace(/\/$/, '');

  // Proxy the streaming request
  try {
    const upstream = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model, messages, stream: true,
        max_tokens: max_tokens || 4000,
        temperature: temperature ?? 0.45,
        ...(top_p          != null ? { top_p }           : {}),
        ...(frequency_penalty != null ? { frequency_penalty } : {}),
        ...(presence_penalty  != null ? { presence_penalty }  : {}),
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.text();
      return res.status(upstream.status).json({ error: err.slice(0, 300) });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
    res.end();
  } catch (e) {
    if (!res.headersSent) res.status(502).json({ error: e.message });
  }
}
