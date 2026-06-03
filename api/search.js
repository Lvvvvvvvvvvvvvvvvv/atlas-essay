import { withAuth } from './_lib/auth.js';
import { mcpOperation } from './_lib/mcp.js';

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
