import { Receiver } from '@upstash/qstash';
import { supabaseAdmin } from '../_lib/supabase.js';
import { decrypt } from '../_lib/crypto.js';

export const config = { maxDuration: 60 };

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || '',
  nextSigningKey:    process.env.QSTASH_NEXT_SIGNING_KEY    || '',
});

// ── Topological sort ─────────────────────────────────────────────────────────
function topoSort(nodes, edges) {
  const inDegree = {};
  const graph    = {};
  for (const n of nodes) { inDegree[n.id] = 0; graph[n.id] = []; }
  for (const e of edges)  { graph[e.source].push(e.target); inDegree[e.target]++; }
  const queue  = nodes.filter(n => inDegree[n.id] === 0).map(n => n.id);
  const result = [];
  while (queue.length) {
    const id = queue.shift();
    result.push(id);
    for (const next of (graph[id] || [])) {
      if (--inDegree[next] === 0) queue.push(next);
    }
  }
  return result.map(id => nodes.find(n => n.id === id)).filter(Boolean);
}

// ── Node executors ────────────────────────────────────────────────────────────
async function execInput(node, globalCfg = {}) {
  return {
    topic:      node.data.topic      || '',
    style:      node.data.style      || 'formal',
    language:   node.data.language   || globalCfg.language || 'zh',
    wordTarget: node.data.wordTarget || 3000,
    persona:    globalCfg.persona    || '',
  };
}

async function execResearch(node, incoming) {
  const query   = incoming.topic || node.data.query || '';
  const maxResults = node.data.maxResults || 5;
  if (!query || !process.env.TAVILY_API_KEY) return { ...incoming, researchContext: '' };

  const resp = await fetch('https://api.tavily.com/search', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query, max_results: maxResults, search_depth: 'basic', include_answer: false,
    }),
  });
  if (!resp.ok) return { ...incoming, researchContext: '' };

  const raw     = await resp.json();
  const context = (raw.results || [])
    .map(r => `### ${r.title}\n${(r.content || r.snippet || '').slice(0, 1500)}`)
    .join('\n\n');
  return { ...incoming, researchContext: context };
}

async function execOutline(node, incoming, apiKey, apiUrl, model) {
  const { topic, style, language, persona, researchContext } = incoming;
  const sectionCount = node.data.sectionCount || 5;
  const contextBlock = researchContext
    ? `\n\n<research_context>\n${researchContext}\n</research_context>` : '';
  const langLabel = language === 'zh' ? '中文' : language === 'zh-tw' ? '繁体中文' : language === 'ja' ? '日语' : 'English';
  const sysMsg = persona ? [{ role: 'system', content: persona }] : [];
  const prompt = `请为以下报告生成包含 ${sectionCount} 个章节的大纲。
报告主题：${topic}
写作风格：${style}
输出语言：${langLabel}
${contextBlock}

只输出大纲，每行一个章节标题，格式：
## 1. 章节标题
## 2. 章节标题
...`;

  const resp = await fetch(`${apiUrl}/chat/completions`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, stream: false, max_tokens: 800, temperature: 0.3,
      messages: [...sysMsg, { role: 'user', content: prompt }] }),
  });
  if (!resp.ok) throw new Error(`Outline API error ${resp.status}`);
  const data    = await resp.json();
  const outline = data.choices?.[0]?.message?.content || '';
  return { ...incoming, outline };
}

async function execGenerate(node, incoming, apiKey, apiUrl, model) {
  const { topic, style, language, persona, outline, researchContext, wordTarget } = incoming;
  const temperature  = node.data.temperature  ?? 0.45;
  const maxTokens    = node.data.maxTokens    || 4000;
  const langLabel    = language === 'zh' ? '中文' : language === 'zh-tw' ? '繁体中文' : language === 'ja' ? '日语' : 'English';
  const contextBlock = researchContext
    ? `\n\n<research_context>\n${researchContext}\n</research_context>` : '';
  const outlineBlock = outline
    ? `\n\n请严格按照以下大纲生成内容：\n${outline}` : '';
  const sysMsg = persona ? [{ role: 'system', content: persona }] : [];
  const prompt = `请撰写一篇关于「${topic}」的${style === 'formal' ? '正式' : style}报告。
目标字数约 ${wordTarget} 字，输出语言：${langLabel}。
${outlineBlock}${contextBlock}

直接输出报告正文，使用 Markdown 格式，第一行为 # 报告标题。`;

  const resp = await fetch(`${apiUrl}/chat/completions`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, stream: false, max_tokens: maxTokens, temperature,
      messages: [...sysMsg, { role: 'user', content: prompt }] }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Generate API error ${resp.status}: ${err.slice(0, 200)}`);
  }
  const data    = await resp.json();
  const content = data.choices?.[0]?.message?.content || '';
  return { ...incoming, content };
}

// 自定义 LLM 调用（用户自写 prompt，支持 {{变量}} 插值）
async function execLLMCall(node, incoming, apiKey, apiUrl, globalCfg) {
  const model       = node.data.model === 'inherit' ? globalCfg.model : (node.data.model || globalCfg.model);
  const temperature = node.data.temperature ?? 0.7;
  const maxTokens   = node.data.maxTokens || 4000;
  const rawPrompt   = node.data.userPrompt || '';
  // 替换 {{变量}} 占位符
  const userPrompt  = rawPrompt.replace(/\{\{(\w+)\}\}/g, (_, k) => incoming[k] ?? `{{${k}}}`);
  const sysMsg = (node.data.systemPrompt || globalCfg.persona)
    ? [{ role: 'system', content: node.data.systemPrompt || globalCfg.persona }] : [];

  const resp = await fetch(`${apiUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, stream: false, max_tokens: maxTokens, temperature,
      messages: [...sysMsg, { role: 'user', content: userPrompt }] }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`LLMCall API error ${resp.status}: ${err.slice(0, 200)}`);
  }
  const data    = await resp.json();
  const content = data.choices?.[0]?.message?.content || '';
  return { ...incoming, content };
}

// 文本摘要
async function execSummarize(node, incoming, apiKey, apiUrl, globalCfg) {
  const model      = globalCfg.model;
  const maxLength  = node.data.maxLength || 500;
  const tone       = node.data.tone || 'neutral';
  const toneLabel  = tone === 'executive' ? '执行摘要风格，适合高层阅读' : tone === 'bullets' ? '要点列表（每条一行，-开头）' : '中性客观';
  const src        = incoming.content || incoming.researchContext || '';
  if (!src) return incoming;
  const prompt     = `请对以下内容生成不超过 ${maxLength} 字的摘要。\n风格：${toneLabel}\n\n${src.slice(0, 6000)}`;

  const resp = await fetch(`${apiUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, stream: false, max_tokens: Math.ceil(maxLength * 2), temperature: 0.3,
      messages: [{ role: 'user', content: prompt }] }),
  });
  if (!resp.ok) throw new Error(`Summarize API error ${resp.status}`);
  const data    = await resp.json();
  const summary = data.choices?.[0]?.message?.content || '';
  return { ...incoming, content: summary };
}

// 翻译
async function execTranslate(node, incoming, apiKey, apiUrl, globalCfg) {
  const model      = globalCfg.model;
  const targetLang = node.data.targetLang || 'en';
  const langMap    = { en: 'English', zh: '简体中文', 'zh-tw': '繁体中文', ja: '日语', ko: '韩语', de: '德语', fr: '法语' };
  const langLabel  = langMap[targetLang] || targetLang;
  const src        = incoming.content || '';
  if (!src) return incoming;
  const prompt     = `请将以下内容翻译为${langLabel}，保留原文的 Markdown 格式和章节结构：\n\n${src}`;

  const resp = await fetch(`${apiUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, stream: false, max_tokens: 8000, temperature: 0.2,
      messages: [{ role: 'user', content: prompt }] }),
  });
  if (!resp.ok) throw new Error(`Translate API error ${resp.status}`);
  const data    = await resp.json();
  const content = data.choices?.[0]?.message?.content || '';
  return { ...incoming, content };
}

async function execMerge(node, incoming) {
  // incoming.mergeInputs is an array collected by the runner from all upstream nodes
  const parts = (incoming.mergeInputs || [incoming.content]).filter(Boolean);
  const merged = parts.join('\n\n---\n\n');
  return { ...incoming, content: merged };
}

async function execExport(node, incoming, userId) {
  const { topic, content } = incoming;
  if (!content) return incoming;
  const title = content.split('\n').find(l => l.startsWith('#'))
    ?.replace(/^#+\s*/, '').slice(0, 80) || topic?.slice(0, 60) || '工作流报告';
  const { data: report } = await supabaseAdmin
    .from('reports')
    .insert({ user_id: userId, title, content, prompt: topic,
              meta: { source: 'workflow', format: node.data.format || 'markdown' } })
    .select('id').single();
  return { ...incoming, reportId: report?.id };
}

// ── Workflow execution engine ─────────────────────────────────────────────────
async function executeWorkflow({ taskId, userId, input }) {
  const { definition, overrides = {} } = input;
  const { nodes = [], edges = [] }     = definition;

  // Fetch API key for AI calls
  let keyRow = null;
  const { data: personalKey } = await supabaseAdmin
    .from('api_keys').select('key_enc, api_url, provider')
    .eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single();
  keyRow = personalKey;
  if (!keyRow) {
    const { data: mem } = await supabaseAdmin
      .from('team_members').select('team_id').eq('user_id', userId).limit(1).single();
    if (mem) {
      const { data: teamKey } = await supabaseAdmin
        .from('api_keys').select('key_enc, api_url, provider')
        .eq('team_id', mem.team_id).order('created_at', { ascending: false }).limit(1).single();
      keyRow = teamKey;
    }
  }
  if (!keyRow) throw new Error('No API key found for this user');

  const apiKey = decrypt(keyRow.key_enc);
  const apiUrl = (keyRow.api_url || 'https://api.anthropic.com/v1').replace(/\/$/, '');

  // Phase 1: 从 AgentConfig 节点提取全局配置，覆盖模型/语言/角色
  const agentConfigNode = nodes.find(n => n.type === 'agent_config');
  const globalCfg = {
    model:    agentConfigNode?.data?.model    || overrides.model || 'claude-3-5-sonnet-20241022',
    language: agentConfigNode?.data?.language || overrides.language || 'zh',
    persona:  agentConfigNode?.data?.persona  || overrides.persona  || '',
  };
  const model = globalCfg.model;

  const order       = topoSort(nodes, edges);
  const nodeOutputs = {};  // nodeId -> output object

  // initialise progress tracking
  const steps = order.map(n => ({ id: n.id, type: n.type, status: 'pending' }));
  const updateProgress = async (nodeId, status) => {
    const s = steps.find(x => x.id === nodeId);
    if (s) { s.status = status; if (status === 'running') s.startedAt = new Date().toISOString();
             if (status === 'done') s.completedAt = new Date().toISOString(); }
    await supabaseAdmin.from('tasks').update({ meta: { steps }, updated_at: new Date() }).eq('id', taskId);
  };

  for (const node of order) {
    await updateProgress(node.id, 'running');

    // Collect outputs from all upstream nodes, merging into one object.
    // For merge nodes, also build a mergeInputs array.
    const incomingEdges   = edges.filter(e => e.target === node.id);
    const upstreamOutputs = incomingEdges.map(e => nodeOutputs[e.source]).filter(Boolean);
    const merged          = Object.assign({}, ...upstreamOutputs, node.data);
    if (node.type === 'merge') {
      merged.mergeInputs = upstreamOutputs.map(o => o.content).filter(Boolean);
    }

    try {
      switch (node.type) {
        // 触发 / 配置节点（直接透传 + 注入全局配置）
        case 'input':          nodeOutputs[node.id] = await execInput(node, globalCfg); break;
        case 'agent_config':   nodeOutputs[node.id] = { ...merged, ...node.data }; break;
        case 'system_prompt':  nodeOutputs[node.id] = { ...merged, systemPrompt: node.data.prompt || '' }; break;
        case 'context_inject': nodeOutputs[node.id] = { ...merged }; break; // TODO: team knowledge lookup
        case 'webhook_trigger':nodeOutputs[node.id] = merged; break;
        // 数据节点
        case 'research':       nodeOutputs[node.id] = await execResearch(node, merged); break;
        case 'scraper':        nodeOutputs[node.id] = merged; break; // TODO: scraper impl
        case 'file_input':     nodeOutputs[node.id] = merged; break; // TODO: file parse impl
        // AI 处理节点
        case 'outline':        nodeOutputs[node.id] = await execOutline(node, merged, apiKey, apiUrl, model); break;
        case 'generate':       nodeOutputs[node.id] = await execGenerate(node, merged, apiKey, apiUrl, model); break;
        case 'llm_call':       nodeOutputs[node.id] = await execLLMCall(node, merged, apiKey, apiUrl, globalCfg); break;
        case 'summarize':      nodeOutputs[node.id] = await execSummarize(node, merged, apiKey, apiUrl, globalCfg); break;
        case 'translate':      nodeOutputs[node.id] = await execTranslate(node, merged, apiKey, apiUrl, globalCfg); break;
        // 流程控制节点
        case 'merge':          nodeOutputs[node.id] = await execMerge(node, merged); break;
        case 'branch':         nodeOutputs[node.id] = merged; break; // TODO: conditional routing
        case 'set_variable':   nodeOutputs[node.id] = { ...merged, [node.data.varName]: node.data.expr }; break;
        // 输出节点
        case 'export':         nodeOutputs[node.id] = await execExport(node, merged, userId); break;
        case 'webhook_output': nodeOutputs[node.id] = merged; break; // TODO: POST to target URL
        case 'notify':         nodeOutputs[node.id] = merged; break; // TODO: notification impl
        default:               nodeOutputs[node.id] = merged;
      }
    } catch (err) {
      await updateProgress(node.id, 'failed');
      throw err;
    }

    await updateProgress(node.id, 'done');
  }

  // Final result: last node's output
  const lastNode   = order[order.length - 1];
  const finalOut   = nodeOutputs[lastNode?.id] || {};
  const reportId   = finalOut.reportId;
  const wordCount  = (finalOut.content || '').replace(/\s/g, '').length;

  await supabaseAdmin.from('tasks').update({
    status: 'done',
    output: { reportId, wordCount },
    meta:   { steps },
    updated_at: new Date(),
  }).eq('id', taskId);
}

// ── Main handler ─────────────────────────────────────────────────────────────
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

  await supabaseAdmin.from('tasks').update({ status: 'running', updated_at: new Date() }).eq('id', taskId);

  try {
    // Route to workflow engine or standard generation
    if (input?.workflowId || input?.definition) {
      await executeWorkflow({ taskId, userId, input });
      return res.json({ ok: true });
    }

    // ── Original single-report generation ────────────────────────────────
    const { data: keyRow } = await supabaseAdmin
      .from('api_keys').select('key_enc, api_url, provider')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single();
    if (!keyRow) throw new Error('No server-side API key found');

    const apiKey = decrypt(keyRow.key_enc);
    const apiUrl = (keyRow.api_url || 'https://api.anthropic.com/v1').replace(/\/$/, '');

    const resp = await fetch(`${apiUrl}/chat/completions`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ ...input, stream: false }),
    });
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`API error ${resp.status}: ${err.slice(0, 200)}`);
    }
    const data    = await resp.json();
    const content = data.choices?.[0]?.message?.content || '';
    const title   = content.split('\n').find(l => l.startsWith('#'))
      ?.replace(/^#+\s*/, '').slice(0, 80) || input.prompt?.slice(0, 60) || '报告';
    const { data: report } = await supabaseAdmin
      .from('reports')
      .insert({ user_id: userId, prompt: input.prompt, title, content,
                meta: { source: 'background_task', taskId } })
      .select('id').single();
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
