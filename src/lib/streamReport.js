import { BASE_SYSTEM_PROMPT, BUILTIN_STYLES } from './constants.js';

// ── Live API streaming -----------------------------------------------
export async function fetchUrlContents(urls, onProgress) {
  const results = [];
  for (let i = 0; i < urls.length; i++) {
    onProgress?.(i, urls.length);
    try {
      const resp = await fetch(`https://r.jina.ai/${encodeURIComponent(urls[i])}`, {
        headers: { Accept: 'text/plain', 'X-No-Cache': 'true' },
        signal: AbortSignal.timeout(12000),
      });
      const text = await resp.text();
      results.push({ url: urls[i], content: text.slice(0, 2000), ok: true });
    } catch (e) {
      results.push({ url: urls[i], content: '', ok: false, error: String(e) });
    }
  }
  onProgress?.(urls.length, urls.length);
  return results;
}

// ── Agentic research (P4 stage 2 · Tool Use) ─────────────────────────────────
// Tool schemas exposed to the model (OpenAI function-calling format)
export const RESEARCH_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'web_search',
      description: '联网搜索实时信息。当你需要最新数据、事实核查、或不确定的细节时调用。',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '搜索关键词，简洁精确' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'fetch_url',
      description: '读取指定网页的正文内容。当你已知一个具体 URL 需要深入了解其内容时调用。',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: '要读取的完整网页 URL' },
        },
        required: ['url'],
      },
    },
  },
];

// Resolve a non-streaming model endpoint (handles both server-key proxy and direct key)
export async function resolveModelCall(model) {
  const apiKey = model.apiKey || '';
  const apiUrl = (model.apiUrl || 'https://api.xiaomimimo.com/v1').replace(/\/$/, '');
  const useServerKey = !apiKey && !!model.provider;
  let sessionToken = null;
  if (useServerKey) {
    try {
      const { supabase } = await import('./supabase.js');
      const { data: { session } } = await supabase.auth.getSession();
      sessionToken = session?.access_token || null;
    } catch {}
  }
  const url = useServerKey && sessionToken ? '/api/generate' : `${apiUrl}/chat/completions`;
  const auth = useServerKey && sessionToken ? sessionToken : apiKey;
  return { url, auth, provider: model.provider };
}

// ── MCP (remote HTTP) tool discovery & execution ─────────────────────────────
// Servers configured in localStorage: [{ id, name, url, token }]
export function getMcpServers() {
  try { return JSON.parse(localStorage.getItem('atlas_mcp_servers') || '[]'); } catch { return []; }
}

// ── MCP OAuth 2.1 (remote HTTP servers) ──────────────────────────────────────
// NOTE: untested end-to-end (no reachable OAuth MCP server in CI). Fully
// gracefully degrades: no token → behaves exactly like the no-auth path.
export function getMcpTokens() {
  try { return JSON.parse(localStorage.getItem('atlas_mcp_tokens') || '{}'); } catch { return {}; }
}
export function saveMcpToken(url, tok) {
  const all = getMcpTokens(); all[url] = { ...tok, savedAt: Date.now() };
  try { localStorage.setItem('atlas_mcp_tokens', JSON.stringify(all)); } catch {}
}
export function removeMcpToken(url) {
  const all = getMcpTokens(); delete all[url];
  try { localStorage.setItem('atlas_mcp_tokens', JSON.stringify(all)); } catch {}
}
const _b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
async function _pkce() {
  const verifier = _b64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = _b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
  return { verifier, challenge };
}
async function _sessionToken() {
  const { supabase } = await import('./supabase.js');
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || '';
}

// Kick off the OAuth authorization-code + PKCE redirect for a server.
export async function startMcpOAuth(server) {
  const redirectUri = window.location.origin + '/';
  const auth = await _sessionToken();
  const res = await fetch('/api/search', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth}` },
    body: JSON.stringify({ action: 'mcp_oauth_discover', serverUrl: server.url, redirectUri }),
  });
  if (!res.ok) { alert('OAuth 发现失败：' + (await res.text()).slice(0, 120)); return; }
  const disc = await res.json();
  if (!disc.authorization_endpoint || !disc.client_id) {
    alert('该服务器不支持自动 OAuth（缺少授权端点或动态客户端注册）。'); return;
  }
  const { verifier, challenge } = await _pkce();
  const state = _b64url(crypto.getRandomValues(new Uint8Array(16)));
  let pending; try { pending = JSON.parse(localStorage.getItem('atlas_mcp_oauth_pending') || '{}'); } catch { pending = {}; }
  pending[state] = { url: server.url, verifier, client_id: disc.client_id, token_endpoint: disc.token_endpoint, redirectUri };
  localStorage.setItem('atlas_mcp_oauth_pending', JSON.stringify(pending));
  const p = new URLSearchParams({ response_type: 'code', client_id: disc.client_id, redirect_uri: redirectUri, code_challenge: challenge, code_challenge_method: 'S256', state });
  if (disc.resource) p.set('resource', disc.resource);
  if ((disc.scopes_supported || []).length) p.set('scope', disc.scopes_supported.join(' '));
  window.location.href = disc.authorization_endpoint + (disc.authorization_endpoint.includes('?') ? '&' : '?') + p.toString();
}

// On app load: if the URL carries an OAuth code matching a pending MCP state,
// exchange it for a token. Returns true if it handled an MCP callback.
export async function completeMcpOAuth() {
  const q = new URLSearchParams(window.location.search);
  const code = q.get('code'), state = q.get('state');
  if (!code || !state) return false;
  let pending; try { pending = JSON.parse(localStorage.getItem('atlas_mcp_oauth_pending') || '{}'); } catch { pending = {}; }
  const p = pending[state];
  if (!p) return false; // not an MCP callback (e.g. Supabase) — leave it alone
  try {
    const auth = await _sessionToken();
    const res = await fetch('/api/search', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth}` },
      body: JSON.stringify({ action: 'mcp_oauth_token', tokenEndpoint: p.token_endpoint, params: { grant_type: 'authorization_code', code, redirect_uri: p.redirectUri, client_id: p.client_id, code_verifier: p.verifier } }),
    });
    if (res.ok) { saveMcpToken(p.url, await res.json()); alert('MCP 授权成功'); }
    else alert('MCP 令牌兑换失败：' + (await res.text()).slice(0, 120));
  } catch (e) { alert('MCP 授权失败：' + (e?.message || '')); }
  delete pending[state]; localStorage.setItem('atlas_mcp_oauth_pending', JSON.stringify(pending));
  window.history.replaceState({}, '', window.location.pathname);
  return true;
}

export async function mcpProxy(server, method, params) {
  const auth = await _sessionToken();
  const oauth = getMcpTokens()[server.url];
  const token = oauth?.access_token || server.token || '';
  const resp = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth}` },
    body: JSON.stringify({ action: 'mcp', serverUrl: server.url, token, method, params }),
  });
  if (!resp.ok) {
    let msg = `MCP ${resp.status}`;
    try { const d = await resp.json(); msg = d.error || msg; } catch {}
    throw new Error(msg);
  }
  const data = await resp.json();
  return data.result;
}

// Discover tools from all configured MCP servers. Returns { tools, toolMap }.
// tools: OpenAI function-calling schemas (namespaced); toolMap: name → { server, original }.
export async function discoverMcpTools(servers) {
  const tools = [];
  const toolMap = {};
  for (let si = 0; si < servers.length; si++) {
    const server = servers[si];
    try {
      const result = await mcpProxy(server, 'tools/list', {});
      const list = result?.tools || [];
      for (const tl of list) {
        const safeName = `mcp_${si}_${(tl.name || '').replace(/[^a-zA-Z0-9_-]/g, '_')}`.slice(0, 64);
        tools.push({
          type: 'function',
          function: {
            name: safeName,
            description: `[${server.name || 'MCP'}] ${tl.description || tl.name || ''}`.slice(0, 1024),
            parameters: tl.inputSchema || { type: 'object', properties: {} },
          },
        });
        toolMap[safeName] = { server, original: tl.name };
      }
    } catch { /* skip unreachable server */ }
  }
  return { tools, toolMap };
}

// Run an MCP tool call → string result for the model
export async function executeMcpTool(entry, args, onStatus) {
  onStatus?.({ phase: 'research', action: 'mcp', detail: `${entry.server.name || 'MCP'} · ${entry.original}` });
  try {
    const result = await mcpProxy(entry.server, 'tools/call', { name: entry.original, arguments: args || {} });
    const content = result?.content;
    if (Array.isArray(content)) {
      return content.map(c => c.text || (c.type === 'text' ? c.text : JSON.stringify(c))).filter(Boolean).join('\n') || '（无返回内容）';
    }
    return typeof result === 'string' ? result : JSON.stringify(result || {}).slice(0, 4000);
  } catch (e) {
    return `MCP 调用失败：${String(e.message || e).slice(0, 120)}`;
  }
}

// Execute a single tool call → returns a string result for the model
export async function executeResearchTool(name, args, onStatus, mcpToolMap) {
  // MCP tool?
  if (mcpToolMap && mcpToolMap[name]) {
    return executeMcpTool(mcpToolMap[name], args, onStatus);
  }
  try {
    if (name === 'web_search') {
      const query = (args?.query || '').trim();
      if (!query) return '（空查询）';
      onStatus?.({ phase: 'research', action: 'search', detail: query });
      const { supabase } = await import('./supabase.js');
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
        body: JSON.stringify({ query, maxResults: 5 }),
      });
      if (!resp.ok) return `搜索失败（${resp.status}）`;
      const data = await resp.json();
      const results = data.results || [];
      if (!results.length) return '无搜索结果';
      return results.map((r, i) => `[${i + 1}] ${r.title}（${r.url}）\n${r.content}`).join('\n\n');
    }
    if (name === 'fetch_url') {
      const url = (args?.url || '').trim();
      if (!url) return '（空 URL）';
      onStatus?.({ phase: 'research', action: 'fetch', detail: url });
      const [res] = await fetchUrlContents([url]);
      return res?.ok ? res.content : '网页抓取失败';
    }
  } catch (e) {
    return `工具执行出错：${String(e).slice(0, 120)}`;
  }
  return '未知工具';
}

// Run the agentic research loop. Returns { context, log }.
// MiMo: single-round only (upstream bug #44 rejects tool-call history on round 2+).
export async function runAgenticResearch({ model, prompt, onStatus }) {
  const { url, auth, provider } = await resolveModelCall(model);
  const singleRound = provider === 'mimo'; // MiMo can't take tool history multi-turn
  const maxRounds = singleRound ? 1 : 3;

  // Discover MCP tools (remote HTTP servers) and merge with built-ins
  let mcpTools = [], mcpToolMap = {};
  const servers = getMcpServers();
  if (servers.length) {
    try { ({ tools: mcpTools, toolMap: mcpToolMap } = await discoverMcpTools(servers)); } catch {}
  }
  const allTools = [...RESEARCH_TOOLS, ...mcpTools];

  const log = [];
  const gathered = [];
  const messages = [
    { role: 'system', content: '你是一名严谨的研究助理。在为用户撰写报告前，先判断是否需要联网搜索或读取网页来补充事实、数据或最新信息。如需要就调用工具；如已掌握足够信息，直接回复"RESEARCH_DONE"即可，不要写报告正文。' },
    { role: 'user', content: `报告主题：${prompt}` },
  ];

  for (let round = 0; round < maxRounds; round++) {
    let data;
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth}` },
        body: JSON.stringify({
          model: model.id,
          provider: model.provider,
          messages,
          tools: allTools,
          tool_choice: round === 0 ? 'auto' : 'auto',
          stream: false,
          max_tokens: 1024,
          temperature: 0.3,
        }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      data = await resp.json();
    } catch (e) {
      // Any failure (incl. MiMo #44 on round 2) → stop gracefully, keep what we have
      log.push({ type: 'error', detail: String(e).slice(0, 80) });
      break;
    }

    const choice = data.choices?.[0];
    const msg = choice?.message;
    const toolCalls = msg?.tool_calls || [];

    if (!toolCalls.length) break; // model decided no (more) tools needed

    // Append assistant's tool-call message, then execute each tool
    messages.push(msg);
    for (const tc of toolCalls) {
      const fname = tc.function?.name;
      let args = {};
      try { args = JSON.parse(tc.function?.arguments || '{}'); } catch {}
      const result = await executeResearchTool(fname, args, onStatus, mcpToolMap);
      const isMcp = !!mcpToolMap[fname];
      const label = isMcp ? (mcpToolMap[fname].original) : (fname === 'web_search' ? '搜索' : '网页');
      const detail = args.query || args.url || JSON.stringify(args).slice(0, 60);
      log.push({ type: isMcp ? 'mcp' : fname, detail, ok: true });
      gathered.push(`【${label}：${detail}】\n${result}`);
      messages.push({ role: 'tool', tool_call_id: tc.id, content: String(result).slice(0, 4000) });
    }

    if (singleRound) break; // MiMo: stop after first round of tool execution
  }

  const context = gathered.length
    ? gathered.join('\n\n---\n\n')
    : '';
  return { context, log };
}

export function validateReport(text, { effectiveLength, templateSections } = {}) {
  const warnings = [];
  const clean = text
    .replace(/^\[TITLE:[^\]]*\]\s*/m, '')
    .replace(/\[REFS\][\s\S]*?(?:\[\/REFS\]|$)/g, '');
  const trimmed = clean.trim();
  if (!trimmed) return warnings;

  // 1. Starts with a heading
  if (!/^#{1,3}\s/.test(trimmed)) {
    warnings.push('报告未以标题开头，格式可能异常');
  }

  // 2. Section count
  const minSections = (templateSections?.length) ||
    ((effectiveLength || 2500) < 1200 ? 3 : (effectiveLength || 2500) < 3000 ? 5 : 7);
  const sectionCount = (trimmed.match(/^## /gm) || []).length;
  if (sectionCount > 0 && sectionCount < minSections) {
    warnings.push(`章节数不足（检测到 ${sectionCount} 章，建议 ≥ ${minSections}）`);
  }

  // 3. Char count vs target
  const minChars = Math.round((effectiveLength || 2500) * 0.65);
  const charCount = trimmed.replace(/\s+/g, '').length;
  if (charCount > 0 && charCount < minChars) {
    warnings.push(`字数偏少（${charCount.toLocaleString()} 字，建议 ≥ ${minChars.toLocaleString()}）`);
  }

  // 4. Unclosed code fence
  const fenceCount = (text.match(/^```/gm) || []).length;
  if (fenceCount % 2 !== 0) {
    warnings.push('存在未闭合的代码块');
  }

  // 5. Truncation: tail 150 chars must contain a sentence-ending marker
  const tail = text.trimEnd().slice(-150);
  const hasNormalEnd = /[。！？….!?]/.test(tail)
    || /\[\/REFS\]/.test(tail)
    || /^#{1,3}\s.+$/m.test(tail);
  if (!hasNormalEnd) {
    warnings.unshift('输出可能被截断，建议在设置中增大 Max Tokens 后重新生成');
  }

  return warnings;
}

// Benchmark scoring — objective 0-100 quality score for a generated report.
function scoreReport(text, targetLength) {
  if (!text) return { words: 0, sections: 0, citations: 0, truncated: true, structureOk: false, adherence: 0, score: 0 };
  const warnings = validateReport(text, { effectiveLength: targetLength });
  const clean = text.replace(/^\[TITLE:[^\]]*\]\s*/m, '').replace(/\[REFS\][\s\S]*?(?:\[\/REFS\]|$)/g, '').trim();
  const words = clean.replace(/\s+/g, '').length;
  const sections = (clean.match(/^##\s/gm) || []).length;
  const citations = new Set(text.match(/§\d+/g) || []).size;
  const truncated = warnings.some(w => w.includes('截断'));
  const structureOk = !warnings.some(w => w.includes('标题') || w.includes('章节'));
  let adherence = 1;
  if (targetLength) {
    const ratio = words / targetLength;
    adherence = ratio >= 1 ? Math.max(0, 1 - (ratio - 1) * 0.6) : ratio / 0.9; // penalise both short & bloated
    adherence = Math.max(0, Math.min(1, adherence));
  }
  let score = 0;
  score += structureOk ? 30 : 10;                              // structure
  score += truncated ? 0 : 20;                                 // completeness
  score += Math.round(adherence * 30);                          // length adherence
  score += citations >= 3 ? 20 : citations > 0 ? 12 : 0;        // sourcing
  return { words, sections, citations, truncated, structureOk, adherence, score: Math.max(0, Math.min(100, score)) };
}

function parseOutlineFromText(text) {
  const sections = [];
  const parts = text.split(/^## /gm).filter(Boolean);
  for (const part of parts) {
    const lines = part.trim().split('\n');
    const title = lines[0].replace(/^[一二三四五六七八九十]+[、．\.\s]+/, '').trim();
    const reqLine = lines.slice(1).join(' ').replace(/^写作要求[：:]\s*/, '').trim();
    if (title) sections.push({ title, req: reqLine });
  }
  return sections;
}

async function streamOutline({ model, prompt, language, onChunk, onDone, onError }) {
  const langInstr = language?.instr || '使用简体中文写作';
  const systemPrompt = `你是专业报告写作助手。根据用户提供的话题，生成一份结构化报告大纲。${langInstr}。

格式要求（严格遵守）：
- 生成 4-6 个章节
- 每章节格式：
## 章节标题（简洁，≤15字）
写作要求：具体说明这章要分析的核心问题、数据角度、逻辑框架（30-60字）

只输出大纲，不写正文内容，不要任何前言或后记。`;

  const apiKey = model.apiKey || '';
  const apiUrl = (model.apiUrl || '').replace(/\/$/, '');
  try {
    const resp = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: model.id,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `请为以下话题生成报告大纲：\n\n${prompt}` },
        ],
        stream: true,
        max_tokens: 1500,
        temperature: 0.4,
      }),
    });
    if (!resp.ok) { const e = await resp.text(); throw new Error(`API ${resp.status}: ${e.slice(0, 200)}`); }
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            const text = data.choices?.[0]?.delta?.content || '';
            if (text) onChunk(text);
          } catch {}
        }
      }
    }
    onDone();
  } catch (err) {
    onError(err.message || String(err));
  }
}

// ── M · Memory layer (localStorage-backed, injected via <user_memory>) ────────
function getWritingProfile() {
  try { return JSON.parse(localStorage.getItem('atlas_writing_profile') || '{}'); } catch { return {}; }
}
function saveWritingProfile(p) {
  try { localStorage.setItem('atlas_writing_profile', JSON.stringify(p)); } catch {}
}
function addProfileAvoid(item) {
  const p = getWritingProfile();
  p.avoid = [...new Set([...(p.avoid || []), item])].slice(0, 12);
  saveWritingProfile(p);
}
function getEntityMemory() {
  try { return JSON.parse(localStorage.getItem('atlas_entity_memory') || '[]'); } catch { return []; }
}
function saveEntityMemory(list) {
  try { localStorage.setItem('atlas_entity_memory', JSON.stringify(list)); } catch {}
}

// Build the <user_memory> system-prompt block from profile + topic-matched entities.
// Returns '' when there is nothing to inject (→ identical to no-memory behaviour).
function buildMemoryBlock(topic) {
  const lines = [];
  const prof = getWritingProfile();
  if (prof.notes?.length)  lines.push('用户写作偏好：' + prof.notes.join('；'));
  if (prof.avoid?.length)  lines.push('需主动避免（基于历史差评）：' + prof.avoid.join('；'));
  const t = String(topic || '');
  const matched = getEntityMemory().filter(e => (e.keywords || []).some(k => k && t.includes(k)));
  const ents = [...new Set(matched.flatMap(e => e.entities || []))].filter(Boolean);
  if (ents.length) lines.push('涉及相关主题时，重点关注并尽量覆盖以下对象：' + ents.join('、'));
  return lines.length ? `\n<user_memory>\n${lines.join('\n')}\n</user_memory>` : '';
}

// Derive a read-only profile view from history (dominant settings, good-rated weighted).
function deriveProfileStats(reports) {
  const good = reports.filter(r => r.rating === 'good');
  const pool = good.length >= 3 ? good : reports;
  const top = (key) => {
    const c = {};
    pool.forEach(r => { const v = r.meta?.[key]; if (v) c[v] = (c[v] || 0) + 1; });
    const e = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
    return e ? e[0] : null;
  };
  return { basis: good.length >= 3 ? 'good' : 'all', n: pool.length, model: top('model'), generationMode: top('generationMode'), tone: top('tone'), language: top('language'), style: top('style') };
}

export async function streamReport({ model, prompt, toolbarConfig, onChunk, onDone, onError, onStatus }) {
  const { tone, language, style, length, selectedSources, attachments, urlContexts, searchContexts: rawSearchContexts, gatheredContext, temperature, systemPromptExtra, topP, frequencyPenalty, presencePenalty, maxTokensOverride, templateSections, webSearchEnabled } = toolbarConfig || {};

  // Auto web search: if enabled and no manual search contexts, call Tavily before building context
  let searchContexts = rawSearchContexts || [];
  if (webSearchEnabled && searchContexts.length === 0) {
    onStatus?.({ phase: 'searching' });
    try {
      const { supabase } = await import('./supabase.js');
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
        body: JSON.stringify({ query: prompt.slice(0, 300), maxResults: 6 }),
      });
      if (resp.ok) {
        const data = await resp.json();
        searchContexts = data.results || [];
      }
    } catch { /* degrade silently */ }
  }
  const toneCN = tone?.cn || '分析性';
  const langInstr = language?.instr || '使用简体中文写作';
  const styleInstr = style?.instr || BUILTIN_STYLES[0].instr;
  const targetLength = length || 2500;

  const minSections = templateSections?.length || (
    targetLength < 300 ? 1 : targetLength < 700 ? 2 : targetLength < 1200 ? 3 :
    targetLength < 2000 ? 5 : targetLength < 3000 ? 6 : 8
  );
  const minWordsPerSection = Math.round(targetLength / minSections * 0.75);

  // Zone 3: Fetch URL contents via Jina Reader API
  let fetchedUrls = [];
  if (urlContexts?.length > 0) {
    onStatus?.({ phase: 'fetching', total: urlContexts.length, done: 0 });
    fetchedUrls = await fetchUrlContents(urlContexts, (done, total) => {
      onStatus?.({ phase: 'fetching', total, done });
    });
  }
  onStatus?.({ phase: 'connecting' });

  // Zone 3: Build <context> block (date + fetched URL content + Tavily search results)
  const now = new Date();
  const DAY_CN_CTX = ['日','一','二','三','四','五','六'];
  const dateStr = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日（周${DAY_CN_CTX[now.getDay()]}）`;
  const urlContextBlock = fetchedUrls.length > 0
    ? '\n\n' + fetchedUrls.map((r, i) =>
        r.ok
          ? `【参考网页 ${i+1}】${r.url}\n${r.content}`
          : `【参考网页 ${i+1}】${r.url}\n（抓取失败，忽略此来源）`
      ).join('\n\n---\n\n')
    : '';

  const searchContextBlock = searchContexts?.length > 0
    ? '\n\n' + searchContexts.map((r, i) =>
        `【搜索结果 ${i+1}】${r.title}（${r.url}）\n${r.content}`
      ).join('\n\n---\n\n')
    : '';

  // Agentic research findings (P4 stage 2): model-gathered context
  const researchBlock = gatheredContext
    ? `\n\n【模型自主研究资料】\n${gatheredContext}`
    : '';

  const contextBlock = `<context>
生成日期：${dateStr}${urlContextBlock}${searchContextBlock}${researchBlock}
</context>`;

  const sourceNote = (() => {
    if (!selectedSources?.size) return '';
    const allS = typeof SOURCES !== 'undefined' ? SOURCES : [];
    const enriched = [...selectedSources].map(name => {
      const found = allS.find(s => s.name === name);
      return { name, quality: found?.quality || 'A' };
    });
    enriched.sort((a, b) => ({ A: 0, B: 1, C: 2 }[a.quality] - ({ A: 0, B: 1, C: 2 }[b.quality] || 0)));
    const tiers = { A: [], B: [], C: [] };
    enriched.forEach(s => (tiers[s.quality] || tiers.A).push(s.name));
    let note = '\n   - A级（核心来源，优先引用）：' + (tiers.A.join('、') || '—');
    if (tiers.B.length) note += `\n   - B级（可参考，适度引用）：${tiers.B.join('、')}`;
    if (tiers.C.length) note += `\n   - C级（低优先级，谨慎引用）：${tiers.C.join('、')}`;
    return `\n\n参考数据源（按质量优先级排序）：${note}`;
  })();

  const displayLength = targetLength;
  const lengthInstr = targetLength < 100
    ? `目标字数：约 ${displayLength} 字`
    : `目标字数：${displayLength} 字（必须达到 ${Math.round(targetLength * 0.88)} 字以上，上限 ${Math.round(targetLength * 1.12)} 字，不得少于下限）`;

  const systemPrompt = `${BASE_SYSTEM_PROMPT}

${contextBlock}

<output_language>
${langInstr}
</output_language>

<style>
报告风格：${styleInstr}
写作语气：${toneCN}（全程必须体现，不得偏离）
</style>

${templateSections?.length ? `<structure>
本次报告必须严格按以下章节框架展开，不可增减章节，不可重排顺序：

${templateSections.map((s, i) => {
  const nums = ['一','二','三','四','五','六','七','八'];
  return `${nums[i] || (i+1)}、${s.title}\n写作要求：${s.req}`;
}).join('\n\n')}

${lengthInstr}（总字数分配到以上 ${templateSections.length} 个章节）
每章最少字数：${minWordsPerSection} 字
</structure>` : `<structure>
本次报告结构要求：
- 最少章节数：${minSections} 个，每章用「一、」「二、」等中文序号 + ## 标题格式
- 每章最少字数：${minWordsPerSection} 字
- ${lengthInstr}
</structure>`}

<citations>
重要数据用 §1 §2 §3 标注脚注编号，报告末尾输出：
[REFS]
[1] 来源机构 — 文献名 — 网址 — YYYY.MM
[/REFS]
条数与正文 §N 标注一致。${sourceNote}
</citations>
${systemPromptExtra ? `\n<custom>\n${systemPromptExtra}\n</custom>` : ''}${buildMemoryBlock(prompt)}

输出格式：第一行必须是 [TITLE: 精炼标题（20字以内）]，然后空行，再输出各章节，最后输出 [REFS]...[/REFS]。不要任何其他前言后记。`;

  // Build user message: prompt + optional attachment context
  const attachText = attachments?.length > 0
    ? '\n\n【附件参考资料】\n' + attachments.map(a => `《${a.name}》\n${a.content}`).join('\n\n---\n\n')
    : '';
  const userContent = prompt + attachText;

  // max_tokens: always at least 4000 so reasoning models have room to think + output
  // For longer targets, scale up generously (2.5 tokens/char + 2000 buffer)
  const maxTokens = Math.min(Math.max(Math.ceil(targetLength * 2.5) + 2000, 4000), 16000);

  const apiKey = model.apiKey || '';
  const apiUrl = (model.apiUrl || 'https://api.xiaomimimo.com/v1').replace(/\/$/, '');

  // Check if a server-side key is available — route through /api/generate if so
  const useServerKey = !apiKey && !!model.provider;
  let sessionToken = null;
  if (useServerKey) {
    try {
      const { supabase } = await import('./supabase.js');
      const { data: { session } } = await supabase.auth.getSession();
      sessionToken = session?.access_token || null;
    } catch {}
  }

  const reqBody = {
    model: model.id,
    provider: model.provider,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    stream: true,
    max_tokens: (maxTokensOverride && maxTokensOverride > 0) ? Math.min(maxTokensOverride, 131072) : maxTokens,
    temperature: (temperature !== undefined && !isNaN(Number(temperature))) ? Number(temperature) : 0.7,
    ...(topP != null ? { top_p: Number(topP) } : {}),
    ...(frequencyPenalty != null ? { frequency_penalty: Number(frequencyPenalty) } : {}),
    ...(presencePenalty != null ? { presence_penalty: Number(presencePenalty) } : {}),
  };

  try {
    const resp = await fetch(
      useServerKey && sessionToken ? '/api/generate' : `${apiUrl}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(useServerKey && sessionToken
            ? { Authorization: `Bearer ${sessionToken}` }
            : { Authorization: `Bearer ${apiKey}` }),
        },
        body: JSON.stringify(reqBody),
      }
    );

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`API error ${resp.status}: ${errText.slice(0, 200)}`);
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let totalTokens = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            const delta = data.choices?.[0]?.delta;
            // Support both standard content and reasoning-model content fields
            const text = delta?.content || '';
            if (text) onChunk(text);
            // Capture token usage from final chunk (some providers send usage mid-stream)
            if (data.usage?.total_tokens) totalTokens = data.usage.total_tokens;
            else if (data.usage?.completion_tokens) totalTokens = (data.usage.prompt_tokens || 0) + data.usage.completion_tokens;
          } catch {}
        }
      }
    }
    onDone(totalTokens);
  } catch (err) {
    onError(err.message || String(err));
  }
}
