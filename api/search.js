import { withAuth } from './_lib/auth.js';

// ── MCP (Model Context Protocol) remote HTTP proxy ───────────────────────────
// Stateless: a full handshake (initialize → initialized → method) is performed
// within this single serverless invocation. Only remote HTTP / Streamable HTTP
// MCP servers are supported (stdio servers cannot run on serverless — see
// Harness Engineering/T-Tooling.md).

const MCP_PROTOCOL_VERSION = '2024-11-05';

// Perform one JSON-RPC POST and return the parsed message. Handles both
// application/json and text/event-stream (SSE) responses.
async function mcpPost(serverUrl, token, body, sessionId) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (sessionId) headers['Mcp-Session-Id'] = sessionId;

  const resp = await fetch(serverUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });

  const newSession = resp.headers.get('Mcp-Session-Id') || sessionId || null;
  const ctype = resp.headers.get('Content-Type') || '';

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`MCP ${resp.status}: ${errText.slice(0, 200)}`);
  }

  // Notifications (no id) may return 202 with empty body
  if (body.id === undefined) return { message: null, sessionId: newSession };

  let message = null;
  if (ctype.includes('text/event-stream')) {
    // Parse SSE: collect data: lines, find the JSON-RPC reply matching our id
    const text = await resp.text();
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      try {
        const obj = JSON.parse(trimmed.slice(5).trim());
        if (obj.id === body.id) { message = obj; break; }
        if (message === null) message = obj;
      } catch {}
    }
  } else {
    const text = await resp.text();
    try { message = text ? JSON.parse(text) : null; } catch { message = null; }
  }

  return { message, sessionId: newSession };
}

// Run a full stateless MCP operation: initialize → initialized → method.
async function mcpOperation(serverUrl, token, method, params) {
  // 1. initialize
  const init = await mcpPost(serverUrl, token, {
    jsonrpc: '2.0', id: 1, method: 'initialize',
    params: {
      protocolVersion: MCP_PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: 'atlas-report-agent', version: '2.7' },
    },
  }, null);
  const sessionId = init.sessionId;
  if (init.message?.error) throw new Error(init.message.error.message || 'initialize failed');

  // 2. initialized notification (best-effort)
  try {
    await mcpPost(serverUrl, token, { jsonrpc: '2.0', method: 'notifications/initialized' }, sessionId);
  } catch {}

  // 3. actual method
  const out = await mcpPost(serverUrl, token, {
    jsonrpc: '2.0', id: 2, method, params: params || {},
  }, sessionId);
  if (out.message?.error) throw new Error(out.message.error.message || `${method} failed`);
  return out.message?.result || null;
}

async function handleMcp(req, res) {
  const { serverUrl, token, method, params } = req.body || {};
  if (!serverUrl || !method) return res.status(400).json({ error: 'serverUrl and method required' });
  if (!['tools/list', 'tools/call'].includes(method)) {
    return res.status(400).json({ error: 'unsupported method' });
  }
  try {
    const result = await mcpOperation(serverUrl, token, method, params);
    return res.json({ result });
  } catch (e) {
    return res.status(502).json({ error: String(e.message || e).slice(0, 200) });
  }
}

// ── Tavily search (default action) ───────────────────────────────────────────
async function handleSearch(req, res) {
  const { query, maxResults = 5 } = req.body || {};
  if (!query?.trim()) return res.status(400).json({ error: 'query required' });

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Tavily API key not configured' });

  const resp = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query: query.trim(),
      max_results: Math.min(maxResults, 10),
      search_depth: 'basic',
      include_answer: false,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    return res.status(502).json({ error: `Tavily error ${resp.status}: ${err.slice(0, 200)}` });
  }

  const data = await resp.json();
  const results = (data.results || []).map(r => ({
    title: r.title || '',
    url: r.url || '',
    content: (r.content || r.snippet || '').slice(0, 1500),
    score: r.score || 0,
  }));

  res.json({ results });
}

export default withAuth(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const action = req.body?.action || 'search';
  if (action === 'mcp') return handleMcp(req, res);
  return handleSearch(req, res);
});
