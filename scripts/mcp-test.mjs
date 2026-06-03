// Live verification of the SHIPPED MCP logic (api/_lib/mcp.js) against a real
// local MCP HTTP server implementing the protocol. Tests three server modes:
//   A) stateless + JSON responses
//   B) stateless + SSE (text/event-stream) responses
//   C) per-request session check (session ok within one operation)
//   D) single-session: forbids a 2nd initialize → exposes the cross-operation
//      re-handshake limitation of the stateless proxy
// Run: node scripts/mcp-test.mjs
import http from 'http';
import { mcpOperation } from '../api/_lib/mcp.js';

const TOOLS = [{
  name: 'echo',
  description: 'Echo back the input text',
  inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
}];

function rpcResult(id, result) { return { jsonrpc: '2.0', id, result }; }

function makeServer({ mode }) {
  // mode: 'json' | 'sse' | 'strict' | 'single-session'
  let issuedSession = null;
  let initCount = 0;
  return http.createServer((req, res) => {
    let body = '';
    req.on('data', c => (body += c));
    req.on('end', () => {
      let msg = {};
      try { msg = JSON.parse(body); } catch {}
      const sid = req.headers['mcp-session-id'] || null;

      // single-session: a server that only permits ONE initialize for its
      // lifetime. The stateless proxy re-initializes on every operation, so the
      // 2nd operation's initialize is rejected → tools/call fails.
      if (mode === 'single-session' && msg.method === 'initialize') {
        initCount++;
        if (initCount > 1) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ jsonrpc: '2.0', id: msg.id ?? null, error: { code: -32000, message: 'Session already initialized' } }));
        }
      }

      // Strict session enforcement: every non-initialize request must carry the
      // session id we issued at initialize, else 400 (mimics session servers).
      if (mode === 'strict' && msg.method !== 'initialize') {
        if (!sid || sid !== issuedSession) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ jsonrpc: '2.0', id: msg.id ?? null, error: { code: -32000, message: 'Invalid or missing session' } }));
        }
      }

      // Notifications (no id) → 202 no body
      if (msg.id === undefined) { res.writeHead(202); return res.end(); }

      let payload;
      if (msg.method === 'initialize') {
        issuedSession = 'sess-' + Math.random().toString(36).slice(2, 8);
        payload = rpcResult(msg.id, { protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'mock', version: '1' } });
      } else if (msg.method === 'tools/list') {
        payload = rpcResult(msg.id, { tools: TOOLS });
      } else if (msg.method === 'tools/call') {
        const text = msg.params?.arguments?.text ?? '';
        payload = rpcResult(msg.id, { content: [{ type: 'text', text: `ECHO: ${text}` }] });
      } else {
        payload = { jsonrpc: '2.0', id: msg.id, error: { code: -32601, message: 'Method not found' } };
      }

      const headers = { 'Mcp-Session-Id': issuedSession || '' };
      if (mode === 'sse') {
        headers['Content-Type'] = 'text/event-stream';
        res.writeHead(200, headers);
        res.end(`event: message\ndata: ${JSON.stringify(payload)}\n\n`);
      } else {
        headers['Content-Type'] = 'application/json';
        res.writeHead(200, headers);
        res.end(JSON.stringify(payload));
      }
    });
  });
}

function listen(server) {
  return new Promise(r => server.listen(0, '127.0.0.1', () => r(server.address().port)));
}

async function runMode(mode) {
  const server = makeServer({ mode });
  const port = await listen(server);
  const url = `http://127.0.0.1:${port}/mcp`;
  const out = { mode };
  try {
    const list = await mcpOperation(url, '', 'tools/list', {});
    out.toolsDiscovered = (list?.tools || []).map(t => t.name);
    const call = await mcpOperation(url, '', 'tools/call', { name: 'echo', arguments: { text: 'hello-mcp' } });
    out.callResult = call?.content?.[0]?.text;
    out.ok = out.toolsDiscovered.includes('echo') && out.callResult === 'ECHO: hello-mcp';
  } catch (e) {
    out.ok = false;
    out.error = String(e.message || e);
  } finally {
    server.close();
  }
  return out;
}

const results = [];
for (const mode of ['json', 'sse', 'strict', 'single-session']) {
  results.push(await runMode(mode));
}
console.log(JSON.stringify(results, null, 2));
