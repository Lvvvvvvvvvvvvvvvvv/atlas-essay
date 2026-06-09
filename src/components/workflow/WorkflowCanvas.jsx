import React, { useState, useCallback, useRef } from 'react';
import {
  ReactFlow, Background, Controls,
  addEdge, useNodesState, useEdgesState,
  Handle, Position, Panel, useReactFlow, ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div style={{ position: 'fixed', top: 56, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', pointerEvents: 'none' }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === 'error' ? '#c25a5a' : t.type === 'success' ? '#4a9b7a' : '#29261b',
          color: '#faf9f6', padding: '7px 18px', borderRadius: 4,
          fontSize: 12, lineHeight: 1.5, boxShadow: '0 2px 8px rgba(0,0,0,.18)',
          animation: 'fadeIn .15s ease',
        }}>{t.msg}</div>
      ))}
    </div>
  );
}

// ── Shared node primitives ────────────────────────────────────────────────────
function NodeShell({ label, color, children, selected }) {
  return (
    <div style={{
      background: '#faf9f6', border: `1.5px solid ${selected ? '#29261b' : '#e0ddd6'}`,
      borderTop: `3px solid ${color}`, borderRadius: 6, minWidth: 210, maxWidth: 240,
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      boxShadow: selected ? '0 2px 12px rgba(0,0,0,.12)' : '0 1px 4px rgba(0,0,0,.06)',
    }}>
      <div style={{ padding: '7px 12px 5px', borderBottom: '1px solid #ebe9e3' }}>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.8, color: '#767368', textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div style={{ padding: '10px 12px', fontSize: 11, color: '#29261b', lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 7 }}>
      <div style={{ fontSize: 9, letterSpacing: 0.6, color: '#aaa', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
      {children}
    </div>
  );
}

// 使用原生 input + nodrag 防止拖拽干扰输入
const inputStyle = { width: '100%', boxSizing: 'border-box', fontSize: 11, padding: '3px 7px', border: '1px solid #ddd', borderRadius: 3, background: '#fff', color: '#29261b', outline: 'none', fontFamily: 'inherit' };
const selectStyle = { ...inputStyle, paddingRight: 4 };

// ── Node components（使用 useReactFlow().updateNodeData，消除 stale-closure 导致的数字跳动）
function InputNode({ data, id, selected }) {
  const { updateNodeData } = useReactFlow();
  const u = (k, v) => updateNodeData(id, { [k]: v });
  return (
    <NodeShell label="输入" color="#5a7fa8" selected={selected}>
      <Field label="报告主题">
        <input className="nodrag" style={inputStyle} value={data.topic || ''} placeholder="输入报告主题…"
          onChange={e => u('topic', e.target.value)}/>
      </Field>
      <Field label="写作风格">
        <select className="nodrag" style={selectStyle} value={data.style || 'formal'} onChange={e => u('style', e.target.value)}>
          <option value="formal">正式</option>
          <option value="analytical">分析</option>
          <option value="narrative">叙事</option>
          <option value="concise">简洁</option>
        </select>
      </Field>
      <Field label="目标字数">
        <input className="nodrag" style={inputStyle} type="number" min={500} max={20000} step={500}
          value={data.wordTarget ?? 3000}
          onChange={e => u('wordTarget', parseInt(e.target.value) || 3000)}/>
      </Field>
      <Handle type="source" position={Position.Right} style={{ background: '#5a7fa8', width: 8, height: 8 }}/>
    </NodeShell>
  );
}

function ResearchNode({ data, id, selected }) {
  const { updateNodeData } = useReactFlow();
  return (
    <NodeShell label="联网研究" color="#4a9b7a" selected={selected}>
      <Handle type="target" position={Position.Left} style={{ background: '#4a9b7a', width: 8, height: 8 }}/>
      <Field label="搜索条数（1–10）">
        <input className="nodrag" style={inputStyle} type="number" min={1} max={10} step={1}
          value={data.maxResults ?? 5}
          onChange={e => updateNodeData(id, { maxResults: Math.min(10, Math.max(1, parseInt(e.target.value) || 5)) })}/>
      </Field>
      <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>Tavily API 实时搜索，注入报告上下文</div>
      <Handle type="source" position={Position.Right} style={{ background: '#4a9b7a', width: 8, height: 8 }}/>
    </NodeShell>
  );
}

function OutlineNode({ data, id, selected }) {
  const { updateNodeData } = useReactFlow();
  return (
    <NodeShell label="生成大纲" color="#b87a3a" selected={selected}>
      <Handle type="target" position={Position.Left} style={{ background: '#b87a3a', width: 8, height: 8 }}/>
      <Field label="章节数量（2–10）">
        <input className="nodrag" style={inputStyle} type="number" min={2} max={10} step={1}
          value={data.sectionCount ?? 5}
          onChange={e => updateNodeData(id, { sectionCount: Math.min(10, Math.max(2, parseInt(e.target.value) || 5)) })}/>
      </Field>
      <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>AI 生成可编辑章节结构</div>
      <Handle type="source" position={Position.Right} style={{ background: '#b87a3a', width: 8, height: 8 }}/>
    </NodeShell>
  );
}

function GenerateNode({ data, id, selected }) {
  const { updateNodeData } = useReactFlow();
  const u = (k, v) => updateNodeData(id, { [k]: v });
  return (
    <NodeShell label="生成报告" color="#8a5aa8" selected={selected}>
      <Handle type="target" position={Position.Left} style={{ background: '#8a5aa8', width: 8, height: 8 }}/>
      <Field label="Temperature（0–1）">
        <input className="nodrag" style={inputStyle} type="number" min={0} max={1} step={0.05}
          value={data.temperature ?? 0.45}
          onChange={e => u('temperature', Math.min(1, Math.max(0, parseFloat(e.target.value) || 0.45)))}/>
      </Field>
      <Field label="Max Tokens">
        <input className="nodrag" style={inputStyle} type="number" min={500} max={16000} step={500}
          value={data.maxTokens ?? 4000}
          onChange={e => u('maxTokens', parseInt(e.target.value) || 4000)}/>
      </Field>
      <Handle type="source" position={Position.Right} style={{ background: '#8a5aa8', width: 8, height: 8 }}/>
    </NodeShell>
  );
}

function MergeNode({ data, id, selected }) {
  return (
    <NodeShell label="合并内容" color="#7a7a7a" selected={selected}>
      <Handle type="target" position={Position.Left} id="a" style={{ background: '#7a7a7a', width: 8, height: 8, top: '35%' }}/>
      <Handle type="target" position={Position.Left} id="b" style={{ background: '#7a7a7a', width: 8, height: 8, top: '65%' }}/>
      <div style={{ fontSize: 10, color: '#aaa', textAlign: 'center', padding: '4px 0' }}>合并多个上游节点的输出内容</div>
      <Handle type="source" position={Position.Right} style={{ background: '#7a7a7a', width: 8, height: 8 }}/>
    </NodeShell>
  );
}

function ExportNode({ data, id, selected }) {
  const { updateNodeData } = useReactFlow();
  return (
    <NodeShell label="导出保存" color="#c25a5a" selected={selected}>
      <Handle type="target" position={Position.Left} style={{ background: '#c25a5a', width: 8, height: 8 }}/>
      <Field label="输出格式">
        <select className="nodrag" style={selectStyle} value={data.format || 'markdown'} onChange={e => updateNodeData(id, { format: e.target.value })}>
          <option value="markdown">Markdown</option>
          <option value="docx">Word (DOCX)</option>
          <option value="pdf">PDF</option>
        </select>
      </Field>
      <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>报告写入报告库，可在 LIBRARY 查看</div>
    </NodeShell>
  );
}

const NODE_TYPES = { input: InputNode, research: ResearchNode, outline: OutlineNode, generate: GenerateNode, merge: MergeNode, export: ExportNode };

// ── Default workflow ──────────────────────────────────────────────────────────
const DEFAULT_NODES = [
  { id: 'n1', type: 'input',    position: { x: 60,   y: 160 }, data: { topic: '', style: 'formal', language: 'zh', wordTarget: 3000 } },
  { id: 'n2', type: 'research', position: { x: 320,  y: 160 }, data: { maxResults: 5 } },
  { id: 'n3', type: 'outline',  position: { x: 580,  y: 160 }, data: { sectionCount: 5 } },
  { id: 'n4', type: 'generate', position: { x: 840,  y: 160 }, data: { temperature: 0.45, maxTokens: 4000 } },
  { id: 'n5', type: 'export',   position: { x: 1100, y: 160 }, data: { format: 'markdown' } },
];
const DEFAULT_EDGES = [
  { id: 'e1', source: 'n1', target: 'n2', animated: true },
  { id: 'e2', source: 'n2', target: 'n3', animated: true },
  { id: 'e3', source: 'n3', target: 'n4', animated: true },
  { id: 'e4', source: 'n4', target: 'n5', animated: true },
];

// ── 预设模板 ───────────────────────────────────────────────────────────────────
const PRESETS = [
  {
    label: '标准研究报告',
    nodes: DEFAULT_NODES,
    edges: DEFAULT_EDGES,
  },
  {
    label: '快速生成（无研究）',
    nodes: [
      { id: 'p1', type: 'input',    position: { x: 60,  y: 160 }, data: { topic: '', style: 'formal', language: 'zh', wordTarget: 2000 } },
      { id: 'p2', type: 'outline',  position: { x: 320, y: 160 }, data: { sectionCount: 4 } },
      { id: 'p3', type: 'generate', position: { x: 580, y: 160 }, data: { temperature: 0.45, maxTokens: 3000 } },
      { id: 'p4', type: 'export',   position: { x: 840, y: 160 }, data: { format: 'markdown' } },
    ],
    edges: [
      { id: 'pe1', source: 'p1', target: 'p2', animated: true },
      { id: 'pe2', source: 'p2', target: 'p3', animated: true },
      { id: 'pe3', source: 'p3', target: 'p4', animated: true },
    ],
  },
  {
    label: '深度研究报告',
    nodes: [
      { id: 'q1', type: 'input',    position: { x: 60,  y: 160 }, data: { topic: '', style: 'analytical', language: 'zh', wordTarget: 5000 } },
      { id: 'q2', type: 'research', position: { x: 320, y: 160 }, data: { maxResults: 10 } },
      { id: 'q3', type: 'outline',  position: { x: 580, y: 160 }, data: { sectionCount: 7 } },
      { id: 'q4', type: 'generate', position: { x: 840, y: 160 }, data: { temperature: 0.35, maxTokens: 8000 } },
      { id: 'q5', type: 'export',   position: { x: 1100, y: 160 }, data: { format: 'docx' } },
    ],
    edges: [
      { id: 'qe1', source: 'q1', target: 'q2', animated: true },
      { id: 'qe2', source: 'q2', target: 'q3', animated: true },
      { id: 'qe3', source: 'q3', target: 'q4', animated: true },
      { id: 'qe4', source: 'q4', target: 'q5', animated: true },
    ],
  },
];

// ── 侧边栏节点面板 ─────────────────────────────────────────────────────────────
const PALETTE = [
  { type: 'input',    label: '输入',     color: '#5a7fa8', desc: '主题 / 风格 / 字数' },
  { type: 'research', label: '联网研究', color: '#4a9b7a', desc: 'Tavily 实时搜索' },
  { type: 'outline',  label: '生成大纲', color: '#b87a3a', desc: 'AI 结构化章节' },
  { type: 'generate', label: '生成报告', color: '#8a5aa8', desc: 'AI 撰写正文' },
  { type: 'merge',    label: '合并内容', color: '#7a7a7a', desc: '合并多路输出' },
  { type: 'export',   label: '导出保存', color: '#c25a5a', desc: '写入报告库' },
];

// ── Canvas 内部（必须在 ReactFlowProvider 内才能用 useReactFlow）────────────────
function CanvasInner({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onDrop, onDragOver, idRef }) {
  return (
    <ReactFlow
      nodes={nodes} edges={edges}
      onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}
      onDrop={onDrop} onDragOver={onDragOver}
      nodeTypes={NODE_TYPES}
      fitView
      deleteKeyCode="Delete"
      style={{ background: '#f5f3ee' }}>
      <Background color="#d4d1ca" gap={20} size={1}/>
      <Controls style={{ button: { background: '#faf9f6', border: '1px solid #e0ddd6' } }}/>
      <Panel position="top-right" style={{ fontSize: 10, color: '#aaa', background: 'transparent', marginTop: 8, marginRight: 8 }}>
        {nodes.length} 节点 · {edges.length} 连线 · 选中节点按 Delete 可删除
      </Panel>
    </ReactFlow>
  );
}

// ── 主组件 ─────────────────────────────────────────────────────────────────────
function WorkflowCanvasInner({ workflow, onSave, onRun, running, runStatus, saving }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(workflow?.definition?.nodes || DEFAULT_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow?.definition?.edges || DEFAULT_EDGES);
  const [name, setName]     = useState(workflow?.name || '未命名工作流');
  const [toasts, setToasts] = useState([]);
  const idRef               = useRef(Date.now());

  const addToast = (msg, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  };

  const onConnect = useCallback((params) => setEdges(es => addEdge({ ...params, animated: true }, es)), [setEdges]);
  const onDragOver = useCallback((e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/atlas-node');
    if (!type) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const position = { x: e.clientX - bounds.left - 105, y: e.clientY - bounds.top - 50 };
    const id = `n${++idRef.current}`;
    const defaults = {
      input: { topic: '', style: 'formal', language: 'zh', wordTarget: 3000 },
      research: { maxResults: 5 }, outline: { sectionCount: 5 },
      generate: { temperature: 0.45, maxTokens: 4000 }, merge: {}, export: { format: 'markdown' },
    };
    setNodes(ns => [...ns, { id, type, position, data: defaults[type] || {} }]);
  }, [setNodes]);

  const applyPreset = (preset) => {
    setNodes(preset.nodes);
    setEdges(preset.edges);
    addToast(`已加载预设：${preset.label}`);
  };

  const handleSave = async () => {
    try {
      await onSave?.({ name, definition: { nodes, edges } });
      addToast('工作流已保存', 'success');
    } catch {
      addToast('保存失败，请重试', 'error');
    }
  };

  const handleRun = async () => {
    if (running) return;
    const inputNode = nodes.find(n => n.type === 'input');
    if (!inputNode?.data?.topic?.trim()) {
      addToast('请先在「输入」节点填写报告主题', 'error');
      return;
    }
    addToast('工作流已加入后台队列，完成后在 LIBRARY 查看报告', 'info', 5000);
    try {
      await onRun?.({ name, definition: { nodes, edges } });
    } catch {
      addToast('启动失败，请确认已配置 API Key', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: '#f5f3ee', position: 'relative' }}>
      <Toast toasts={toasts}/>

      {/* 侧边栏 */}
      <div style={{ width: 188, background: '#faf9f6', borderRight: '1px solid #e0ddd6', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
        {/* 节点面板 */}
        <div style={{ padding: '12px 14px 6px', borderBottom: '1px solid #e0ddd6' }}>
          <div style={{ fontSize: 9, letterSpacing: 1.2, color: '#aaa', textTransform: 'uppercase', marginBottom: 6 }}>拖拽节点至画布</div>
        </div>
        {PALETTE.map(p => (
          <div key={p.type} draggable
            onDragStart={e => { e.dataTransfer.setData('application/atlas-node', p.type); e.dataTransfer.effectAllowed = 'move'; }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', cursor: 'grab', userSelect: 'none' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0ede8'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }}/>
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#29261b' }}>{p.label}</div>
              <div style={{ fontSize: 9, color: '#aaa' }}>{p.desc}</div>
            </div>
          </div>
        ))}

        {/* 预设模板 */}
        <div style={{ padding: '10px 14px 6px', borderTop: '1px solid #e0ddd6', marginTop: 4 }}>
          <div style={{ fontSize: 9, letterSpacing: 1.2, color: '#aaa', textTransform: 'uppercase', marginBottom: 6 }}>常用预设</div>
        </div>
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => applyPreset(p)}
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 14px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 11, color: '#29261b' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0ede8'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            {p.label}
          </button>
        ))}

        {/* 运行状态 */}
        {runStatus && (
          <div style={{ padding: '10px 14px', borderTop: '1px solid #e0ddd6', marginTop: 'auto' }}>
            <div style={{ fontSize: 9, letterSpacing: 1, color: '#aaa', textTransform: 'uppercase', marginBottom: 6 }}>执行进度</div>
            {(runStatus.steps || []).map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: s.status === 'done' ? '#4a9b7a' : s.status === 'running' ? '#b87a3a' : s.status === 'failed' ? '#c25a5a' : '#ccc' }}>
                  {s.status === 'done' ? '✓' : s.status === 'running' ? '…' : s.status === 'failed' ? '✕' : '○'}
                </span>
                <span style={{ fontSize: 11, color: '#767368' }}>{s.type}</span>
              </div>
            ))}
            {runStatus.status === 'done' && <div style={{ fontSize: 10, color: '#4a9b7a', marginTop: 4 }}>完成，前往 LIBRARY 查看</div>}
            {runStatus.status === 'failed' && <div style={{ fontSize: 10, color: '#c25a5a', marginTop: 4 }}>{runStatus.error || '执行失败'}</div>}
          </div>
        )}
      </div>

      {/* 画布区域 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* 工具栏 */}
        <div style={{ height: 44, background: '#faf9f6', borderBottom: '1px solid #e0ddd6', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0 }}>
          <input value={name} onChange={e => setName(e.target.value)}
            style={{ fontSize: 12, fontWeight: 500, border: 'none', background: 'transparent', outline: 'none', color: '#29261b', minWidth: 160 }}/>
          <div style={{ flex: 1 }}/>
          <span style={{ fontSize: 10, color: '#aaa' }}>
            {running ? '运行中，完成后报告出现在 LIBRARY…' : ''}
          </span>
          <button onClick={handleSave} disabled={saving}
            style={{ fontSize: 11, padding: '4px 12px', border: '1px solid #ccc', borderRadius: 4, background: '#fff', color: '#29261b', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? '保存中…' : '保存工作流'}
          </button>
          <button onClick={handleRun} disabled={running}
            style={{ fontSize: 11, padding: '4px 14px', border: 'none', borderRadius: 4, background: running ? '#aaa' : '#29261b', color: '#faf9f6', cursor: running ? 'wait' : 'pointer', fontWeight: 500 }}>
            {running ? '运行中…' : '运行工作流'}
          </button>
        </div>

        <div style={{ flex: 1, minHeight: 0 }} onDragOver={onDragOver} onDrop={onDrop}>
          <CanvasInner nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onConnect={onConnect} onDrop={onDrop} onDragOver={onDragOver} idRef={idRef}/>
        </div>
      </div>
    </div>
  );
}

// 包裹 ReactFlowProvider（useReactFlow 必须在 Provider 内使用）
export default function WorkflowCanvas(props) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props}/>
    </ReactFlowProvider>
  );
}
