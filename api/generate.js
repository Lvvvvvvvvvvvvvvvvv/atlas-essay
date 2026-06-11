import { requireAuth } from './_lib/auth.js';
import { supabaseAdmin } from './_lib/supabase.js';
import { decrypt } from './_lib/crypto.js';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let user;
  try { user = await requireAuth(req); }
  catch (e) { return res.status(e.status || 401).json({ error: e.message }); }

  const { provider, messages, model, temperature, top_p, frequency_penalty, presence_penalty, max_tokens, tools, tool_choice, stream } = req.body || {};
  const wantStream = stream !== false; // default true; agentic tool-decision rounds send false

  // 1. Try personal key first
  let keyRow = null;
  const { data: personalKey } = await supabaseAdmin
    .from('api_keys')
    .select('key_enc, api_url')
    .eq('user_id', user.id)
    .eq('provider', provider || 'anthropic')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  keyRow = personalKey;

  // 2. Fall back to team key if no personal key
  if (!keyRow) {
    const { data: membership } = await supabaseAdmin
      .from('team_members')
      .select('team_id, role')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (membership && membership.role !== 'viewer') {
      const { data: teamKey } = await supabaseAdmin
        .from('api_keys')
        .select('key_enc, api_url')
        .eq('team_id', membership.team_id)
        .eq('provider', provider || 'anthropic')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      keyRow = teamKey;
    }
  }

  // Normalize a base URL: trim whitespace/trailing slash, drop an accidental
  // /chat/completions suffix, and append /v1 when no version segment is present.
  const normalizeApiUrl = (raw) => {
    let u = (raw || 'https://api.anthropic.com/v1').trim().replace(/\/+$/, '');
    u = u.replace(/\/chat\/completions$/, '');
    if (!/\/v\d+[a-z]*$/.test(u)) u += '/v1';
    return u;
  };

  // 3. Fall back to system shared key (env SHARED_API_KEY)
  let apiKey, apiUrl;
  if (keyRow) {
    try { apiKey = decrypt(keyRow.key_enc); }
    catch { return res.status(500).json({ error: 'Failed to decrypt API key' }); }
    apiUrl = normalizeApiUrl(keyRow.api_url);
  } else if (process.env.SHARED_API_KEY) {
    apiKey = (process.env.SHARED_API_KEY || '').trim();
    apiUrl = normalizeApiUrl(process.env.SHARED_API_URL);
  } else {
    return res.status(404).json({ error: 'No server-side API key found for this provider' });
  }

  // Proxy the request (streaming for report generation, JSON for tool-decision rounds)
  try {
    const upstream = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model, messages, stream: wantStream,
        max_tokens: max_tokens || 4000,
        temperature: temperature ?? 0.45,
        ...(top_p          != null ? { top_p }           : {}),
        ...(frequency_penalty != null ? { frequency_penalty } : {}),
        ...(presence_penalty  != null ? { presence_penalty }  : {}),
        ...(tools ? { tools } : {}),
        ...(tool_choice ? { tool_choice } : {}),
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.text();
      return res.status(upstream.status).json({ error: err.slice(0, 300), upstream_url: `${apiUrl}/chat/completions` });
    }

    // Non-streaming (tool-decision round): pass the JSON body straight through
    if (!wantStream) {
      const json = await upstream.json();
      return res.status(200).json(json);
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

