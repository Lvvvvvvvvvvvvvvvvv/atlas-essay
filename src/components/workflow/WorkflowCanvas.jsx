import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow, Background, Controls,
  addEdge, useNodesState, useEdgesState,
  Handle, Position, Panel, useReactFlow, ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div style={{ position:'fixed', top:56, left:'50%', transform:'translateX(-50%)', zIndex:9999, display:'flex', flexDirection:'column', gap:6, alignItems:'center', pointerEvents:'none' }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background: t.type==='error'?'#c25a5a': t.type==='success'?'#4a9b7a':'#29261b', color:'#faf9f6', padding:'7px 18px', borderRadius:4, fontSize:12, lineHeight:1.5, boxShadow:'0 2px 8px rgba(0,0,0,.18)', maxWidth:420, textAlign:'center' }}>{t.msg}</div>
      ))}
    </div>
  );
}

// ── 本地字段 hook（解决数字跳动：本地 state，onBlur 提交到 React Flow）─────────
function useField(nodeId, field, initialValue) {
  const { updateNodeData } = useReactFlow();
  const [local, setLocal] = useState(String(initialValue ?? ''));
  const prevRef = useRef(initialValue);
  useEffect(() => {
    if (prevRef.current !== initialValue) { setLocal(String(initialValue ?? '')); prevRef.current = initialValue; }
  }, [initialValue]);
  return {
    value: local,
    onChange: e => setLocal(e.target.value),
    onBlur: (parse) => {
      const v = parse ? parse(local) : local;
      updateNodeData(nodeId, { [field]: v });
      setLocal(String(v));
    },
  };
}

// ── 基础样式 ────────────────────────────────────────────────────────────────────
const base = { width:'100%', boxSizing:'border-box', fontSize:11, padding:'3px 7px', border:'1px solid #ddd', borderRadius:3, background:'#fff', color:'#29261b', outline:'none', fontFamily:'inherit' };
const textarea = { ...base, resize:'vertical', minHeight:52, padding:'4px 7px', lineHeight:1.5 };

function NodeShell({ label, color, badge, children, selected }) {
  return (
    <div style={{ background:'#faf9f6', border:`1.5px solid ${selected?'#29261b':'#e0ddd6'}`, borderTop:`3px solid ${color}`, borderRadius:6, minWidth:220, maxWidth:260, fontFamily:'ui-sans-serif,system-ui,sans-serif', boxShadow: selected?'0 2px 12px rgba(0,0,0,.12)':'0 1px 4px rgba(0,0,0,.06)' }}>
      <div style={{ padding:'6px 12px 5px', borderBottom:'1px solid #ebe9e3', display:'flex', alignItems:'center', gap:6 }}>
        <span style={{ fontSize:10, fontWeight:600, letterSpacing:0.8, color:'#767368', textTransform:'uppercase', flex:1 }}>{label}</span>
        {badge && <span style={{ fontSize:9, padding:'1px 5px', borderRadius:3, background:color+'22', color:color, fontWeight:600, letterSpacing:0.5 }}>{badge}</span>}
      </div>
      <div style={{ padding:'10px 12px', fontSize:11, color:'#29261b', lineHeight:1.6 }}>{children}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ fontSize:9, letterSpacing:0.6, color:'#aaa', textTransform:'uppercase', marginBottom:2, display:'flex', justifyContent:'space-between' }}>
        <span>{label}</span>{hint && <span style={{ fontWeight:400, textTransform:'none', letterSpacing:0 }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const H = ({ color, top }) => (
  <Handle type={top?'target':'source'} position={top?Position.Left:Position.Right} style={{ background:color, width:8, height:8 }}/>
);

// ═══════════════════════════════════════════════════════════════════════════════
// 节点组件
// ═══════════════════════════════════════════════════════════════════════════════

// ── 触发层 ─────────────────────────────────────────────────────────────────────
function InputNode({ data, id, selected }) {
  const { updateNodeData } = useReactFlow();
  const topic = useField(id, 'topic', data.topic ?? '');
  const wt    = useField(id, 'wordTarget', data.wordTarget ?? 3000);
  return (
    <NodeShell label="手动输入" color="#5a7fa8" badge="触发" selected={selected}>
      <Field label="报告主题">
        <input className="nodrag" style={base} placeholder="输入报告主题…" value={topic.value} onChange={topic.onChange} onBlur={() => topic.onBlur()}/>
      </Field>
      <Field label="写作风格">
        <select className="nodrag" style={base} value={data.style||'formal'} onChange={e => updateNodeData(id,{style:e.target.value})}>
          <option value="formal">正式报告</option><option value="analytical">分析报告</option>
          <option value="narrative">叙事风格</option><option value="concise">简洁摘要</option>
        </select>
      </Field>
      <Field label="目标字数">
        <input className="nodrag" style={base} type="number" min={500} max={20000} step={500}
          value={wt.value} onChange={wt.onChange}
          onBlur={() => wt.onBlur(v => Math.max(500, Math.min(20000, parseInt(v)||3000)))}/>
      </Field>
      <H color="#5a7fa8"/>
    </NodeShell>
  );
}

function WebhookNode({ data, id, selected }) {
  const { updateNodeData } = useReactFlow();
  return (
    <NodeShell label="Webhook 触发" color="#5a7fa8" badge="触发" selected={selected}>
      <Field label="端点路径" hint="只读">
        <input className="nodrag" style={{...base, background:'#f5f3ee', color:'#999'}} readOnly value={`/api/webhooks/${data.webhookId||'<保存后生成>'}`}/>
      </Field>
      <Field label="认证方式">
        <select className="nodrag" style={base} value={data.auth||'token'} onChange={e=>updateNodeData(id,{auth:e.target.value})}>
          <option value="token">Bearer Token</option><option value="none">无认证（公开）</option>
        </select>
      </Field>
      <div style={{ fontSize:10, color:'#aaa' }}>外部系统 POST 到此端点触发工作流，主题从 Body 的 topic 字段读取</div>
      <H color="#5a7fa8"/>
    </NodeShell>
  );
}

// ── 数据层 ─────────────────────────────────────────────────────────────────────
function ResearchNode({ data, id, selected }) {
  const { updateNodeData } = useReactFlow();
  const mr = useField(id, 'maxResults', data.maxResults ?? 5);
  return (
    <NodeShell label="联网搜索" color="#4a9b7a" badge="数据" selected={selected}>
      <H color="#4a9b7a" top/>
      <Field label="搜索引擎">
        <select className="nodrag" style={base} value={data.engine||'tavily'} onChange={e=>updateNodeData(id,{engine:e.target.value})}>
          <option value="tavily">Tavily（推荐）</option><option value="serper">Serper</option><option value="bing">Bing</option>
        </select>
      </Field>
      <Field label="结果条数（1–20）">
        <input className="nodrag" style={base} type="number" min={1} max={20} step={1}
          value={mr.value} onChange={mr.onChange}
          onBlur={() => mr.onBlur(v => Math.max(1, Math.min(20, parseInt(v)||5)))}/>
      </Field>
      <Field label="搜索深度">
        <select className="nodrag" style={base} value={data.depth||'basic'} onChange={e=>updateNodeData(id,{depth:e.target.value})}>
          <option value="basic">基础（快速）</option><option value="advanced">深度（较慢）</option>
        </select>
      </Field>
      <H color="#4a9b7a"/>
    </NodeShell>
  );
}

function ScraperNode({ data, id, selected }) {
  const url = useField(id, 'url', data.url ?? '');
  return (
    <NodeShell label="网页抓取" color="#4a9b7a" badge="数据" selected={selected}>
      <H color="#4a9b7a" top/>
      <Field label="目标 URL（支持变量 {{topic}}）">
        <input className="nodrag" style={base} placeholder="https://…" value={url.value} onChange={url.onChange} onBlur={() => url.onBlur()}/>
      </Field>
      <div style={{ fontSize:10, color:'#aaa' }}>抓取指定页面正文，注入后续节点上下文</div>
      <H color="#4a9b7a"/>
    </NodeShell>
  );
}

function FileInputNode({ data, id, selected }) {
  const { updateNodeData } = useReactFlow();
  return (
    <NodeShell label="文件读取" color="#4a9b7a" badge="数据" selected={selected}>
      <H color="#4a9b7a" top/>
      <Field label="文件类型">
        <select className="nodrag" style={base} value={data.fileType||'pdf'} onChange={e=>updateNodeData(id,{fileType:e.target.value})}>
          <option value="pdf">PDF</option><option value="docx">Word</option><option value="txt">TXT</option><option value="csv">CSV</option>
        </select>
      </Field>
      <div style={{ fontSize:10, color:'#aaa' }}>运行时从请求 Body 接收 base64 编码的文件内容</div>
      <H color="#4a9b7a"/>
    </NodeShell>
  );
}

// ── 配置层 ─────────────────────────────────────────────────────────────────────
function AgentConfigNode({ data, id, selected }) {
  const { updateNodeData } = useReactFlow();
  return (
    <NodeShell label="智能体配置" color="#7a5aa8" badge="配置" selected={selected}>
      <H color="#7a5aa8" top/>
      <Field label="大模型">
        <select className="nodrag" style={base} value={data.model||'claude-3-5-sonnet'} onChange={e=>updateNodeData(id,{model:e.target.value})}>
          <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
          <option value="claude-3-opus">Claude 3 Opus</option>
          <option value="gpt-4o">GPT-4o</option>
          <option value="gpt-4o-mini">GPT-4o Mini</option>
          <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
          <option value="deepseek-r1">DeepSeek R1</option>
        </select>
      </Field>
      <Field label="输出语言">
        <select className="nodrag" style={base} value={data.language||'zh'} onChange={e=>updateNodeData(id,{language:e.target.value})}>
          <option value="zh">中文</option><option value="en">English</option>
          <option value="zh-tw">繁体中文</option><option value="ja">日语</option>
        </select>
      </Field>
      <Field label="角色定位">
        <input className="nodrag" style={base} placeholder="你是一名专业的安防行业分析师…" value={data.persona||''} onChange={e=>updateNodeData(id,{persona:e.target.value})}/>
      </Field>
      <H color="#7a5aa8"/>
    </NodeShell>
  );
}

function SystemPromptNode({ data, id, selected }) {
  const prompt = useField(id, 'prompt', data.prompt ?? '');
  return (
    <NodeShell label="系统提示词" color="#7a5aa8" badge="配置" selected={selected}>
      <H color="#7a5aa8" top/>
      <Field label="Prompt（支持变量 {{topic}} {{style}}）">
        <textarea className="nodrag" style={textarea} placeholder="你是一名专业的报告撰写者。\n主题：{{topic}}\n要求：…" value={prompt.value} onChange={prompt.onChange} onBlur={() => prompt.onBlur()}/>
      </Field>
      <H color="#7a5aa8"/>
    </NodeShell>
  );
}

function ContextInjectNode({ data, id, selected }) {
  const { updateNodeData } = useReactFlow();
  return (
    <NodeShell label="上下文注入" color="#7a5aa8" badge="配置" selected={selected}>
      <H color="#7a5aa8" top/>
      <Field label="注入来源">
        <select className="nodrag" style={base} value={data.source||'team_knowledge'} onChange={e=>updateNodeData(id,{source:e.target.value})}>
          <option value="team_knowledge">团队知识库</option>
          <option value="user_memory">用户记忆</option>
          <option value="static">静态文本</option>
        </select>
      </Field>
      {data.source==='static' && (
        <Field label="静态内容">
          <textarea className="nodrag" style={{...textarea, minHeight:40}} placeholder="硬编码背景信息…" value={data.staticText||''} onChange={e=>updateNodeData(id,{staticText:e.target.value})}/>
        </Field>
      )}
      <H color="#7a5aa8"/>
    </NodeShell>
  );
}

// ── AI 处理层 ──────────────────────────────────────────────────────────────────
function OutlineNode({ data, id, selected }) {
  const sc = useField(id, 'sectionCount', data.sectionCount ?? 5);
  return (
    <NodeShell label="生成大纲" color="#b87a3a" badge="AI" selected={selected}>
      <H color="#b87a3a" top/>
      <Field label="章节数量（2–10）">
        <input className="nodrag" style={base} type="number" min={2} max={10} step={1}
          value={sc.value} onChange={sc.onChange}
          onBlur={() => sc.onBlur(v => Math.max(2, Math.min(10, parseInt(v)||5)))}/>
      </Field>
      <div style={{ fontSize:10, color:'#aaa' }}>AI 生成结构化章节大纲，可被 Generate 节点引用</div>
      <H color="#b87a3a"/>
    </NodeShell>
  );
}

function GenerateNode({ data, id, selected }) {
  const temp = useField(id, 'temperature', data.temperature ?? 0.45);
  const mt   = useField(id, 'maxTokens',   data.maxTokens   ?? 4000);
  return (
    <NodeShell label="生成内容" color="#b87a3a" badge="AI" selected={selected}>
      <H color="#b87a3a" top/>
      <Field label="Temperature（0–1）">
        <input className="nodrag" style={base} type="number" min={0} max={1} step={0.05}
          value={temp.value} onChange={temp.onChange}
          onBlur={() => temp.onBlur(v => Math.max(0, Math.min(1, parseFloat(v)||0.45)))}/>
      </Field>
      <Field label="Max Tokens">
        <input className="nodrag" style={base} type="number" min={500} max={16000} step={500}
          value={mt.value} onChange={mt.onChange}
          onBlur={() => mt.onBlur(v => Math.max(500, Math.min(16000, parseInt(v)||4000)))}/>
      </Field>
      <H color="#b87a3a"/>
    </NodeShell>
  );
}

function LLMCallNode({ data, id, selected }) {
  const { updateNodeData } = useReactFlow();
  const prompt = useField(id, 'userPrompt', data.userPrompt ?? '');
  const temp   = useField(id, 'temperature', data.temperature ?? 0.7);
  return (
    <NodeShell label="自定义 LLM" color="#b87a3a" badge="AI" selected={selected}>
      <H color="#b87a3a" top/>
      <Field label="模型">
        <select className="nodrag" style={base} value={data.model||'inherit'} onChange={e=>updateNodeData(id,{model:e.target.value})}>
          <option value="inherit">继承智能体配置</option>
          <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
          <option value="gpt-4o">GPT-4o</option>
          <option value="gpt-4o-mini">GPT-4o Mini</option>
        </select>
      </Field>
      <Field label="用户 Prompt（支持 {{上游节点输出}}）">
        <textarea className="nodrag" style={textarea} placeholder="基于以下内容：{{research}}\n请完成…" value={prompt.value} onChange={prompt.onChange} onBlur={() => prompt.onBlur()}/>
      </Field>
      <Field label="Temperature">
        <input className="nodrag" style={base} type="number" min={0} max={1} step={0.05}
          value={temp.value} onChange={temp.onChange}
          onBlur={() => temp.onBlur(v => Math.max(0, Math.min(1, parseFloat(v)||0.7)))}/>
      </Field>
      <H color="#b87a3a"/>
    </NodeShell>
  );
}

function SummarizeNode({ data, id, selected }) {
  const { updateNodeData } = useReactFlow();
  const ml = useField(id, 'maxLength', data.maxLength ?? 500);
  return (
    <NodeShell label="文本摘要" color="#b87a3a" badge="AI" selected={selected}>
      <H color="#b87a3a" top/>
      <Field label="摘要最大字数">
        <input className="nodrag" style={base} type="number" min={100} max={2000} step={100}
          value={ml.value} onChange={ml.onChange}
          onBlur={() => ml.onBlur(v => Math.max(100, Math.min(2000, parseInt(v)||500)))}/>
      </Field>
      <Field label="语气">
        <select className="nodrag" style={base} value={data.tone||'neutral'} onChange={e=>updateNodeData(id,{tone:e.target.value})}>
          <option value="neutral">中性客观</option><option value="executive">执行摘要风</option><option value="bullets">要点列表</option>
        </select>
      </Field>
      <H color="#b87a3a"/>
    </NodeShell>
  );
}

function TranslateNode({ data, id, selected }) {
  const { updateNodeData } = useReactFlow();
  return (
    <NodeShell label="翻译" color="#b87a3a" badge="AI" selected={selected}>
      <H color="#b87a3a" top/>
      <Field label="目标语言">
        <select className="nodrag" style={base} value={data.targetLang||'en'} onChange={e=>updateNodeData(id,{targetLang:e.target.value})}>
          <option value="en">英文</option><option value="zh">中文</option>
          <option value="ja">日文</option><option value="ko">韩文</option>
          <option value="de">德文</option><option value="fr">法文</option>
        </select>
      </Field>
      <div style={{ fontSize:10, color:'#aaa' }}>保留原文格式和章节结构</div>
      <H color="#b87a3a"/>
    </NodeShell>
  );
}

// ── 流程控制 ───────────────────────────────────────────────────────────────────
function MergeNode({ data, id, selected }) {
  const { updateNodeData } = useReactFlow();
  return (
    <NodeShell label="合并内容" color="#7a7a7a" badge="控制" selected={selected}>
      <Handle type="target" position={Position.Left} id="a" style={{ background:'#7a7a7a', width:8, height:8, top:'35%' }}/>
      <Handle type="target" position={Position.Left} id="b" style={{ background:'#7a7a7a', width:8, height:8, top:'65%' }}/>
      <Field label="合并方式">
        <select className="nodrag" style={base} value={data.strategy||'concat'} onChange={e=>updateNodeData(id,{strategy:e.target.value})}>
          <option value="concat">顺序拼接</option>
          <option value="sections">按章节合并</option>
          <option value="dedupe">去重合并</option>
        </select>
      </Field>
      <H color="#7a7a7a"/>
    </NodeShell>
  );
}

function BranchNode({ data, id, selected }) {
  const cond = useField(id, 'condition', data.condition ?? '');
  return (
    <NodeShell label="条件分支" color="#7a7a7a" badge="控制" selected={selected}>
      <H color="#7a7a7a" top/>
      <Field label="条件（JS 表达式）" hint="返回 true/false">
        <input className="nodrag" style={base} placeholder='output.length > 1000' value={cond.value} onChange={cond.onChange} onBlur={() => cond.onBlur()}/>
      </Field>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'#aaa', marginTop:2 }}>
        <span>true → 右上</span><span>false → 右下</span>
      </div>
      <Handle type="source" position={Position.Right} id="true"  style={{ background:'#4a9b7a', width:8, height:8, top:'35%' }}/>
      <Handle type="source" position={Position.Right} id="false" style={{ background:'#c25a5a', width:8, height:8, top:'65%' }}/>
    </NodeShell>
  );
}

function SetVariableNode({ data, id, selected }) {
  const varName = useField(id, 'varName', data.varName ?? '');
  const expr    = useField(id, 'expr',    data.expr    ?? '');
  return (
    <NodeShell label="变量赋值" color="#7a7a7a" badge="控制" selected={selected}>
      <H color="#7a7a7a" top/>
      <Field label="变量名">
        <input className="nodrag" style={base} placeholder="myVar" value={varName.value} onChange={varName.onChange} onBlur={() => varName.onBlur()}/>
      </Field>
      <Field label="表达式">
        <input className="nodrag" style={base} placeholder="input.topic + '_v2'" value={expr.value} onChange={expr.onChange} onBlur={() => expr.onBlur()}/>
      </Field>
      <H color="#7a7a7a"/>
    </NodeShell>
  );
}

// ── 输出层 ─────────────────────────────────────────────────────────────────────
function ExportNode({ data, id, selected }) {
  const { updateNodeData } = useReactFlow();
  return (
    <NodeShell label="保存报告" color="#c25a5a" badge="输出" selected={selected}>
      <H color="#c25a5a" top/>
      <Field label="输出格式">
        <select className="nodrag" style={base} value={data.format||'markdown'} onChange={e=>updateNodeData(id,{format:e.target.value})}>
          <option value="markdown">Markdown</option>
          <option value="docx">Word (DOCX)</option>
          <option value="pdf">PDF</option>
        </select>
      </Field>
      <div style={{ fontSize:10, color:'#aaa' }}>完成后在 LIBRARY 查看报告</div>
    </NodeShell>
  );
}

function WebhookOutputNode({ data, id, selected }) {
  const url = useField(id, 'url', data.url ?? '');
  return (
    <NodeShell label="Webhook 推送" color="#c25a5a" badge="输出" selected={selected}>
      <H color="#c25a5a" top/>
      <Field label="目标 URL">
        <input className="nodrag" style={base} placeholder="https://hooks.slack.com/…" value={url.value} onChange={url.onChange} onBlur={() => url.onBlur()}/>
      </Field>
      <div style={{ fontSize:10, color:'#aaa' }}>POST JSON { '{' }content, topic, status{ '}' } 到目标地址</div>
    </NodeShell>
  );
}

function NotifyNode({ data, id, selected }) {
  const { updateNodeData } = useReactFlow();
  const tmpl = useField(id, 'template', data.template ?? '');
  return (
    <NodeShell label="通知" color="#c25a5a" badge="输出" selected={selected}>
      <H color="#c25a5a" top/>
      <Field label="渠道">
        <select className="nodrag" style={base} value={data.channel||'email'} onChange={e=>updateNodeData(id,{channel:e.target.value})}>
          <option value="email">邮件</option>
          <option value="slack">Slack</option>
          <option value="feishu">飞书</option>
          <option value="wechat">企业微信</option>
        </select>
      </Field>
      <Field label="消息模板">
        <textarea className="nodrag" style={{...textarea, minHeight:36}} placeholder="报告《{{topic}}》已生成" value={tmpl.value} onChange={tmpl.onChange} onBlur={() => tmpl.onBlur()}/>
      </Field>
    </NodeShell>
  );
}

// ── 节点注册表 ─────────────────────────────────────────────────────────────────
const NODE_TYPES = {
  input: InputNode, webhook_trigger: WebhookNode,
  research: ResearchNode, scraper: ScraperNode, file_input: FileInputNode,
  agent_config: AgentConfigNode, system_prompt: SystemPromptNode, context_inject: ContextInjectNode,
  outline: OutlineNode, generate: GenerateNode, llm_call: LLMCallNode, summarize: SummarizeNode, translate: TranslateNode,
  merge: MergeNode, branch: BranchNode, set_variable: SetVariableNode,
  export: ExportNode, webhook_output: WebhookOutputNode, notify: NotifyNode,
};

// ── 节点调色板（分类展示）─────────────────────────────────────────────────────
const PALETTE = [
  { category: '触发', color: '#5a7fa8', nodes: [
    { type: 'input',           label: '手动输入',   desc: '主题 / 风格 / 字数' },
    { type: 'webhook_trigger', label: 'Webhook',    desc: '外部系统触发', badge:'待开放' },
  ]},
  { category: '数据', color: '#4a9b7a', nodes: [
    { type: 'research',   label: '联网搜索',  desc: 'Tavily / Serper' },
    { type: 'scraper',    label: '网页抓取',  desc: '指定 URL 正文' },
    { type: 'file_input', label: '文件读取',  desc: 'PDF / Word / CSV', badge:'待开放' },
  ]},
  { category: '配置', color: '#7a5aa8', nodes: [
    { type: 'agent_config',    label: '智能体配置', desc: '模型 / 语言 / 角色' },
    { type: 'system_prompt',   label: '系统提示词', desc: '自定义 Prompt' },
    { type: 'context_inject',  label: '上下文注入', desc: '知识库 / 记忆' },
  ]},
  { category: 'AI 处理', color: '#b87a3a', nodes: [
    { type: 'outline',   label: '生成大纲',  desc: 'AI 结构化章节' },
    { type: 'generate',  label: '生成内容',  desc: 'AI 撰写正文' },
    { type: 'llm_call',  label: '自定义 LLM', desc: '自写 Prompt' },
    { type: 'summarize', label: '文本摘要',  desc: '压缩上游输出' },
    { type: 'translate', label: '翻译',      desc: '多语言输出' },
  ]},
  { category: '流程控制', color: '#7a7a7a', nodes: [
    { type: 'merge',        label: '合并内容',  desc: '多路汇聚' },
    { type: 'branch',       label: '条件分支',  desc: 'if / else' },
    { type: 'set_variable', label: '变量赋值',  desc: 'JS 表达式' },
  ]},
  { category: '输出', color: '#c25a5a', nodes: [
    { type: 'export',         label: '保存报告',   desc: '写入 LIBRARY' },
    { type: 'webhook_output', label: 'Webhook 推送', desc: 'POST JSON' },
    { type: 'notify',         label: '通知',       desc: '邮件 / Slack / 飞书', badge:'待开放' },
  ]},
];

// ── 预设模板 ───────────────────────────────────────────────────────────────────
function makePresetNodes(list) {
  return list.map(([id, type, x, y, data]) => ({ id, type, position:{x,y}, data: data||{} }));
}
function makePresetEdges(list) {
  return list.map(([id, source, target]) => ({ id, source, target, animated:true }));
}

const PRESETS = [
  {
    label: '标准研究报告',
    nodes: makePresetNodes([
      ['p1','agent_config',  40, 40,  { model:'claude-3-5-sonnet', language:'zh' }],
      ['p2','input',         40, 200, { topic:'', style:'formal', wordTarget:3000 }],
      ['p3','research',     320, 200, { maxResults:5 }],
      ['p4','outline',      580, 200, { sectionCount:5 }],
      ['p5','generate',     840, 200, { temperature:0.45, maxTokens:4000 }],
      ['p6','export',      1080, 200, { format:'markdown' }],
    ]),
    edges: makePresetEdges([
      ['e1','p1','p2'],['e2','p2','p3'],['e3','p3','p4'],['e4','p4','p5'],['e5','p5','p6'],
    ]),
  },
  {
    label: '快速生成（无研究）',
    nodes: makePresetNodes([
      ['f1','agent_config', 40, 40,  { model:'gpt-4o-mini', language:'zh' }],
      ['f2','input',        40, 200, { topic:'', style:'concise', wordTarget:1500 }],
      ['f3','outline',     300, 200, { sectionCount:4 }],
      ['f4','generate',    560, 200, { temperature:0.6, maxTokens:2000 }],
      ['f5','export',      800, 200, { format:'markdown' }],
    ]),
    edges: makePresetEdges([
      ['fe1','f1','f2'],['fe2','f2','f3'],['fe3','f3','f4'],['fe4','f4','f5'],
    ]),
  },
  {
    label: '深度研究 + 翻译双语',
    nodes: makePresetNodes([
      ['d1','agent_config',   40, 40,  { model:'claude-3-5-sonnet', language:'zh' }],
      ['d2','input',          40, 200, { topic:'', style:'analytical', wordTarget:5000 }],
      ['d3','research',      300, 200, { maxResults:10, depth:'advanced' }],
      ['d4','outline',       560, 200, { sectionCount:7 }],
      ['d5','generate',      820, 200, { temperature:0.35, maxTokens:8000 }],
      ['d6','translate',    1080, 100, { targetLang:'en' }],
      ['d7','export',       1080, 300, { format:'docx' }],
    ]),
    edges: makePresetEdges([
      ['de1','d1','d2'],['de2','d2','d3'],['de3','d3','d4'],['de4','d4','d5'],
      ['de5','d5','d6'],['de6','d5','d7'],
    ]),
  },
  {
    label: '多源研究 + 合并',
    nodes: makePresetNodes([
      ['m1','agent_config', 40,  80,  { model:'claude-3-5-sonnet', language:'zh' }],
      ['m2','input',        40,  240, { topic:'', style:'analytical', wordTarget:4000 }],
      ['m3','research',    300,  140, { maxResults:8, engine:'tavily' }],
      ['m4','scraper',     300,  340, { url:'' }],
      ['m5','merge',       560,  240, { strategy:'sections' }],
      ['m6','generate',    800,  240, { temperature:0.4, maxTokens:6000 }],
      ['m7','export',     1040,  240, { format:'markdown' }],
    ]),
    edges: makePresetEdges([
      ['me1','m1','m2'],['me2','m2','m3'],['me3','m2','m4'],
      ['me4','m3','m5'],['me5','m4','m5'],['me6','m5','m6'],['me7','m6','m7'],
    ]),
  },
];

const DEFAULT_NODES = PRESETS[0].nodes;
const DEFAULT_EDGES = PRESETS[0].edges;

// ═══════════════════════════════════════════════════════════════════════════════
// 侧边栏
// ═══════════════════════════════════════════════════════════════════════════════
function Sidebar({ runStatus, addToast }) {
  const [search, setSearch]   = useState('');
  const [tab, setTab]         = useState('nodes'); // 'nodes' | 'presets'
  const [collapsed, setCollapsed] = useState({});

  const filtered = search.trim()
    ? PALETTE.map(cat => ({ ...cat, nodes: cat.nodes.filter(n => n.label.includes(search) || n.desc.includes(search)) })).filter(cat => cat.nodes.length)
    : PALETTE;

  const toggleCat = (cat) => setCollapsed(p => ({ ...p, [cat]: !p[cat] }));

  return (
    <div style={{ width:196, background:'#faf9f6', borderRight:'1px solid #e0ddd6', display:'flex', flexDirection:'column', flexShrink:0 }}>
      {/* 标签 */}
      <div style={{ display:'flex', borderBottom:'1px solid #e0ddd6' }}>
        {[['nodes','节点'],['presets','预设']].map(([k,label]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ flex:1, padding:'8px 0', fontSize:10, letterSpacing:0.8, border:'none', background:'transparent', cursor:'pointer', fontWeight: tab===k?700:400, color: tab===k?'#29261b':'#aaa', borderBottom: tab===k?'2px solid #29261b':'2px solid transparent' }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'nodes' && (
        <>
          <div style={{ padding:'8px 10px', borderBottom:'1px solid #f0ede8' }}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索节点…"
              style={{ width:'100%', boxSizing:'border-box', fontSize:11, padding:'4px 8px', border:'1px solid #ddd', borderRadius:3, outline:'none', background:'#fff' }}/>
          </div>
          <div style={{ overflowY:'auto', flex:1, paddingBottom:8 }}>
            {filtered.map(cat => (
              <div key={cat.category}>
                <div onClick={() => toggleCat(cat.category)}
                  style={{ display:'flex', alignItems:'center', padding:'6px 10px 4px', cursor:'pointer', userSelect:'none' }}>
                  <span style={{ width:6, height:6, borderRadius:1, background:cat.color, marginRight:6, flexShrink:0 }}/>
                  <span style={{ fontSize:9, fontWeight:700, letterSpacing:1, color:'#aaa', textTransform:'uppercase', flex:1 }}>{cat.category}</span>
                  <span style={{ fontSize:9, color:'#ccc' }}>{collapsed[cat.category]?'▸':'▾'}</span>
                </div>
                {!collapsed[cat.category] && cat.nodes.map(n => (
                  <div key={n.type} draggable
                    onDragStart={e => { e.dataTransfer.setData('application/atlas-node', n.type); e.dataTransfer.effectAllowed='move'; }}
                    style={{ display:'flex', alignItems:'center', gap:7, padding:'5px 10px 5px 22px', cursor:'grab', userSelect:'none' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#f0ede8'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <div>
                      <div style={{ fontSize:11, color:'#29261b', lineHeight:1.3 }}>
                        {n.label}
                        {n.badge && <span style={{ marginLeft:4, fontSize:8, padding:'1px 4px', borderRadius:2, background:'#f0ede8', color:'#aaa' }}>{n.badge}</span>}
                      </div>
                      <div style={{ fontSize:9, color:'#bbb' }}>{n.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div style={{ padding:'8px 10px 4px', marginTop:4, borderTop:'1px solid #f0ede8' }}>
              <div style={{ fontSize:9, fontWeight:700, letterSpacing:1, color:'#ccc', textTransform:'uppercase', marginBottom:4 }}>插件</div>
              <div style={{ fontSize:10, color:'#ccc', padding:'4px 0', lineHeight:1.4 }}>
                自定义节点即将开放，<br/>支持 JSON Schema 定义
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'presets' && (
        <div style={{ overflowY:'auto', flex:1 }}>
          {PRESETS.map((p,i) => (
            <div key={i} data-preset={i}
              style={{ padding:'9px 12px', borderBottom:'1px solid #f0ede8', cursor:'pointer' }}
              onMouseEnter={e=>e.currentTarget.style.background='#f0ede8'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={{ fontSize:11, fontWeight:500, color:'#29261b', marginBottom:2 }}>{p.label}</div>
              <div style={{ fontSize:9, color:'#bbb' }}>{p.nodes.length} 个节点</div>
            </div>
          ))}
        </div>
      )}

      {/* 运行状态 */}
      {runStatus?.steps?.length > 0 && (
        <div style={{ padding:'10px 12px', borderTop:'1px solid #e0ddd6', background:'#faf9f6' }}>
          <div style={{ fontSize:9, letterSpacing:1, color:'#aaa', textTransform:'uppercase', marginBottom:5 }}>执行进度</div>
          {runStatus.steps.map(s => (
            <div key={s.id} style={{ display:'flex', alignItems:'center', gap:5, marginBottom:3 }}>
              <span style={{ fontSize:10, color: s.status==='done'?'#4a9b7a': s.status==='running'?'#b87a3a': s.status==='failed'?'#c25a5a':'#ccc' }}>
                {s.status==='done'?'✓': s.status==='running'?'…': s.status==='failed'?'✕':'○'}
              </span>
              <span style={{ fontSize:10, color:'#767368' }}>{s.type}</span>
            </div>
          ))}
          {runStatus.status==='done'   && <div style={{ fontSize:9, color:'#4a9b7a', marginTop:3 }}>完成 → 前往 LIBRARY</div>}
          {runStatus.status==='failed' && <div style={{ fontSize:9, color:'#c25a5a', marginTop:3 }}>{runStatus.error||'执行失败'}</div>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 画布内层（必须在 ReactFlowProvider 内）
// ═══════════════════════════════════════════════════════════════════════════════
function CanvasInner({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onDrop, onDragOver }) {
  return (
    <ReactFlow nodes={nodes} edges={edges}
      onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
      onConnect={onConnect} onDrop={onDrop} onDragOver={onDragOver}
      nodeTypes={NODE_TYPES} fitView deleteKeyCode={['Backspace', 'Delete']}
      style={{ background:'#f5f3ee' }}>
      <Background color="#d4d1ca" gap={20} size={1}/>
      <Controls style={{ button:{ background:'#faf9f6', border:'1px solid #e0ddd6' } }}/>
      <Panel position="top-right" style={{ fontSize:9, color:'#ccc', background:'transparent', marginTop:6, marginRight:6 }}>
        {nodes.length} 节点 · {edges.length} 连线 · 选中后 Delete 删除
      </Panel>
    </ReactFlow>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 主组件
// ═══════════════════════════════════════════════════════════════════════════════
function WorkflowCanvasInner({ workflow, onSave, onRun, running, runStatus, saving, loggedIn, initialTopic }) {
  // 从已保存工作流或默认预设初始化
  const initNodes = useCallback(() => {
    const base = workflow?.definition?.nodes || DEFAULT_NODES;
    // 如果外部传入了主题，注入 Input 节点
    if (initialTopic) {
      return base.map(n => n.type === 'input' ? { ...n, data: { ...n.data, topic: initialTopic } } : n);
    }
    return base;
  }, [workflow, initialTopic]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow?.definition?.edges || DEFAULT_EDGES);
  const [name, setName]     = useState(workflow?.name || '未命名工作流');
  const [toasts, setToasts] = useState([]);
  const idRef               = useRef(Date.now());

  const addToast = useCallback((msg, type='info', duration=3500) => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), duration);
  }, []);

  const onConnect  = useCallback(p => setEdges(es => addEdge({ ...p, animated:true }, es)), [setEdges]);
  const onDragOver = useCallback(e => { e.preventDefault(); e.dataTransfer.dropEffect='move'; }, []);

  const NODE_DEFAULTS = {
    input: { topic:'', style:'formal', wordTarget:3000 },
    webhook_trigger: { auth:'token' },
    research: { maxResults:5, engine:'tavily', depth:'basic' },
    scraper: { url:'' },
    file_input: { fileType:'pdf' },
    agent_config: { model:'claude-3-5-sonnet', language:'zh' },
    system_prompt: { prompt:'' },
    context_inject: { source:'team_knowledge' },
    outline: { sectionCount:5 },
    generate: { temperature:0.45, maxTokens:4000 },
    llm_call: { model:'inherit', userPrompt:'', temperature:0.7 },
    summarize: { maxLength:500, tone:'neutral' },
    translate: { targetLang:'en' },
    merge: { strategy:'concat' },
    branch: { condition:'' },
    set_variable: { varName:'', expr:'' },
    export: { format:'markdown' },
    webhook_output: { url:'' },
    notify: { channel:'email', template:'' },
  };

  const onDrop = useCallback(e => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/atlas-node');
    if (!type) return;
    const bounds   = e.currentTarget.getBoundingClientRect();
    const position = { x: e.clientX - bounds.left - 110, y: e.clientY - bounds.top - 60 };
    setNodes(ns => [...ns, { id:`n${++idRef.current}`, type, position, data: NODE_DEFAULTS[type]||{} }]);
  }, [setNodes]);

  // 点击预设时通过侧边栏冒泡处理
  const handleSidebarClick = useCallback(e => {
    const el = e.target.closest('[data-preset]');
    if (!el) return;
    const p = PRESETS[+el.dataset.preset];
    if (p) { setNodes(p.nodes); setEdges(p.edges); addToast(`已加载预设：${p.label}`); }
  }, [setNodes, setEdges, addToast]);

  const handleSave = async () => {
    if (!loggedIn) { addToast('保存需要先登录账号', 'error'); return; }
    try {
      await onSave?.({ name, definition:{ nodes, edges } });
      addToast('工作流已保存', 'success');
    } catch (e) {
      addToast(`保存失败：${e.message || '请检查网络连接'}`, 'error', 5000);
    }
  };

  const handleRun = async () => {
    if (running) return;
    const inputNode = nodes.find(n => n.type === 'input');
    if (!inputNode?.data?.topic?.trim()) { addToast('请先在「手动输入」节点填写报告主题', 'error'); return; }
    if (!loggedIn) { addToast('运行工作流需要先登录账号', 'error'); return; }
    addToast('工作流已加入后台队列，完成后在 LIBRARY 查看报告', 'info', 5000);
    try { await onRun?.({ name, definition:{ nodes, edges } }); }
    catch (e) { addToast(`启动失败：${e.message || '请确认已配置 API Key'}`, 'error', 5000); }
  };

  return (
    <div style={{ display:'flex', height:'100%', background:'#f5f3ee', position:'relative' }}>
      <Toast toasts={toasts}/>

      {/* 侧边栏 */}
      <div onClick={handleSidebarClick}>
        <Sidebar runStatus={runStatus} addToast={addToast}/>
      </div>

      {/* 画布区域 */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        {/* 顶部工具栏 */}
        <div style={{ height:44, background:'#faf9f6', borderBottom:'1px solid #e0ddd6', display:'flex', alignItems:'center', padding:'0 16px', gap:12, flexShrink:0 }}>
          <input value={name} onChange={e=>setName(e.target.value)}
            style={{ fontSize:12, fontWeight:500, border:'none', background:'transparent', outline:'none', color:'#29261b', minWidth:180 }}/>
          <div style={{ flex:1 }}/>
          {!loggedIn && <span style={{ fontSize:10, color:'#c25a5a' }}>未登录，保存/运行需先登录</span>}
          {running   && <span style={{ fontSize:10, color:'#b87a3a' }}>运行中，完成后报告出现在 LIBRARY</span>}
          <button onClick={handleSave} disabled={saving}
            style={{ fontSize:11, padding:'4px 12px', border:'1px solid #ccc', borderRadius:4, background:'#fff', color:'#29261b', cursor:saving?'wait':'pointer', opacity:saving?0.6:1 }}>
            {saving?'保存中…':'保存工作流'}
          </button>
          <button onClick={handleRun} disabled={running}
            style={{ fontSize:11, padding:'4px 14px', border:'none', borderRadius:4, background:running?'#aaa':'#29261b', color:'#faf9f6', cursor:running?'wait':'pointer', fontWeight:500 }}>
            {running?'运行中…':'运行工作流'}
          </button>
        </div>

        {/* React Flow 画布 */}
        <div style={{ flex:1, minHeight:0 }}>
          <CanvasInner nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onConnect={onConnect} onDrop={onDrop} onDragOver={onDragOver}/>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowCanvas(props) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props}/>
    </ReactFlowProvider>
  );
}
