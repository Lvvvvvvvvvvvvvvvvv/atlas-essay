import React, { useState, useCallback, useRef } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  addEdge, useNodesState, useEdgesState,
  Handle, Position, Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ── Default workflow ──────────────────────────────────────────────────────────
const DEFAULT_NODES = [
  { id: 'n1', type: 'input',    position: { x: 60,  y: 180 }, data: { topic: '', style: 'formal', language: 'zh', wordTarget: 3000 } },
  { id: 'n2', type: 'research', position: { x: 320, y: 180 }, data: { maxResults: 5 } },
  { id: 'n3', type: 'outline',  position: { x: 580, y: 180 }, data: { sectionCount: 5 } },
  { id: 'n4', type: 'generate', position: { x: 840, y: 180 }, data: { temperature: 0.45, maxTokens: 4000 } },
  { id: 'n5', type: 'export',   position: { x: 1100, y: 180 }, data: { format: 'markdown' } },
];
const DEFAULT_EDGES = [
  { id: 'e1', source: 'n1', target: 'n2' },
  { id: 'e2', source: 'n2', target: 'n3' },
  { id: 'e3', source: 'n3', target: 'n4' },
  { id: 'e4', source: 'n4', target: 'n5' },
];

// ── Shared node shell ─────────────────────────────────────────────────────────
function NodeShell({ label, color, children, selected }) {
  return (
    <div style={{
      background: '#faf9f6', border: `1.5px solid ${selected ? '#29261b' : '#e0ddd6'}`,
      borderTop: `3px solid ${color}`, borderRadius: 6, minWidth: 200, maxWidth: 240,
      fontFamily: 'ui-sans-serif, system-ui, sans-serif', boxShadow: selected ? '0 2px 12px rgba(0,0,0,.12)' : '0 1px 4px rgba(0,0,0,.06)',
    }}>
      <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid #ebe9e3', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.8, color: '#767368', textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div style={{ padding: '10px 12px', fontSize: 11, color: '#29261b', lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontSize: 9, letterSpacing: 0.6, color: '#999', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
      {children}
    </div>
  );
}

function NInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', boxSizing: 'border-box', fontSize: 11, padding: '3px 6px', border: '1px solid #ddd', borderRadius: 3, background: '#fff', color: '#29261b', outline: 'none' }} />
  );
}

function NSelect({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: '100%', fontSize: 11, padding: '3px 6px', border: '1px solid #ddd', borderRadius: 3, background: '#fff', color: '#29261b', outline: 'none' }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ── Node types ────────────────────────────────────────────────────────────────
function InputNode({ data, selected, id }) {
  const upd = (k, v) => data.onChange?.(id, k, v);
  return (
    <NodeShell label="输入" color="#5a7fa8" selected={selected}>
      <Field label="报告主题"><NInput value={data.topic || ''} onChange={v => upd('topic', v)} placeholder="输入报告主题…"/></Field>
      <Field label="写作风格">
        <NSelect value={data.style || 'formal'} onChange={v => upd('style', v)} options={[
          { value: 'formal', label: '正式' }, { value: 'analytical', label: '分析' },
          { value: 'narrative', label: '叙事' }, { value: 'concise', label: '简洁' },
        ]}/>
      </Field>
      <Field label="目标字数"><NInput type="number" value={data.wordTarget || 3000} onChange={v => upd('wordTarget', parseInt(v) || 3000)}/></Field>
      <Handle type="source" position={Position.Right} style={{ background: '#5a7fa8', width: 8, height: 8 }}/>
    </NodeShell>
  );
}

function ResearchNode({ data, selected, id }) {
  const upd = (k, v) => data.onChange?.(id, k, v);
  return (
    <NodeShell label="联网研究" color="#4a9b7a" selected={selected}>
      <Handle type="target" position={Position.Left} style={{ background: '#4a9b7a', width: 8, height: 8 }}/>
      <Field label="搜索条数（1–10）"><NInput type="number" value={data.maxResults || 5} onChange={v => upd('maxResults', Math.min(10, Math.max(1, parseInt(v) || 5)))}/></Field>
      <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>使用 Tavily API 搜索实时资料</div>
      <Handle type="source" position={Position.Right} style={{ background: '#4a9b7a', width: 8, height: 8 }}/>
    </NodeShell>
  );
}

function OutlineNode({ data, selected, id }) {
  const upd = (k, v) => data.onChange?.(id, k, v);
  return (
    <NodeShell label="生成大纲" color="#b87a3a" selected={selected}>
      <Handle type="target" position={Position.Left} style={{ background: '#b87a3a', width: 8, height: 8 }}/>
      <Field label="章节数量（2–10）"><NInput type="number" value={data.sectionCount || 5} onChange={v => upd('sectionCount', Math.min(10, Math.max(2, parseInt(v) || 5)))}/></Field>
      <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>AI 生成可编辑章节大纲</div>
      <Handle type="source" position={Position.Right} style={{ background: '#b87a3a', width: 8, height: 8 }}/>
    </NodeShell>
  );
}

function GenerateNode({ data, selected, id }) {
  const upd = (k, v) => data.onChange?.(id, k, v);
  return (
    <NodeShell label="生成报告" color="#8a5aa8" selected={selected}>
      <Handle type="target" position={Position.Left} style={{ background: '#8a5aa8', width: 8, height: 8 }}/>
      <Field label="Temperature（0–1）"><NInput type="number" value={data.temperature ?? 0.45} onChange={v => upd('temperature', parseFloat(v) || 0.45)}/></Field>
      <Field label="Max Tokens"><NInput type="number" value={data.maxTokens || 4000} onChange={v => upd('maxTokens', parseInt(v) || 4000)}/></Field>
      <Handle type="source" position={Position.Right} style={{ background: '#8a5aa8', width: 8, height: 8 }}/>
    </NodeShell>
  );
}

function MergeNode({ data, selected, id }) {
  return (
    <NodeShell label="合并" color="#7a7a7a" selected={selected}>
      <Handle type="target" position={Position.Left} id="a" style={{ background: '#7a7a7a', width: 8, height: 8, top: '35%' }}/>
      <Handle type="target" position={Position.Left} id="b" style={{ background: '#7a7a7a', width: 8, height: 8, top: '65%' }}/>
      <div style={{ fontSize: 10, color: '#999', textAlign: 'center', padding: '4px 0' }}>合并多个上游内容</div>
      <Handle type="source" position={Position.Right} style={{ background: '#7a7a7a', width: 8, height: 8 }}/>
    </NodeShell>
  );
}

function ExportNode({ data, selected, id }) {
  const upd = (k, v) => data.onChange?.(id, k, v);
  return (
    <NodeShell label="导出保存" color="#c25a5a" selected={selected}>
      <Handle type="target" position={Position.Left} style={{ background: '#c25a5a', width: 8, height: 8 }}/>
      <Field label="输出格式">
        <NSelect value={data.format || 'markdown'} onChange={v => upd('format', v)} options={[
          { value: 'markdown', label: 'Markdown' }, { value: 'docx', label: 'Word (DOCX)' }, { value: 'pdf', label: 'PDF' },
        ]}/>
      </Field>
      <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>保存至报告库</div>
    </NodeShell>
  );
}

const NODE_TYPES = { input: InputNode, research: ResearchNode, outline: OutlineNode, generate: GenerateNode, merge: MergeNode, export: ExportNode };

// ── Node palette item ─────────────────────────────────────────────────────────
const PALETTE = [
  { type: 'input',    label: '输入',     color: '#5a7fa8', desc: '报告主题与参数' },
  { type: 'research', label: '联网研究', color: '#4a9b7a', desc: 'Tavily 实时搜索' },
  { type: 'outline',  label: '生成大纲', color: '#b87a3a', desc: 'AI 结构化大纲' },
  { type: 'generate', label: '生成报告', color: '#8a5aa8', desc: 'AI 撰写正文' },
  { type: 'merge',    label: '合并内容', color: '#7a7a7a', desc: '合并多路输入' },
  { type: 'export',   label: '导出保存', color: '#c25a5a', desc: '写入报告库' },
];

// ── Main WorkflowCanvas component ────────────────────────────────────────────
export default function WorkflowCanvas({ t, workflow, onSave, onRun, running, runStatus, saving }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    (workflow?.definition?.nodes || DEFAULT_NODES).map(n => ({
      ...n,
      data: { ...n.data, onChange: (id, k, v) => updateNodeData(id, k, v) },
    }))
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow?.definition?.edges || DEFAULT_EDGES);
  const [name, setName]   = useState(workflow?.name || '未命名工作流');
  const idRef             = useRef(Date.now());

  const updateNodeData = useCallback((nodeId, key, value) => {
    setNodes(ns => ns.map(n => n.id === nodeId ? { ...n, data: { ...n.data, [key]: value } } : n));
  }, [setNodes]);

  const onConnect = useCallback((params) => setEdges(es => addEdge(params, es)), [setEdges]);

  const onDragOver = useCallback((e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/atlas-node');
    if (!type) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const position = { x: e.clientX - bounds.left - 100, y: e.clientY - bounds.top - 40 };
    const id = `n${++idRef.current}`;
    const defaults = {
      input:    { topic: '', style: 'formal', language: 'zh', wordTarget: 3000 },
      research: { maxResults: 5 },
      outline:  { sectionCount: 5 },
      generate: { temperature: 0.45, maxTokens: 4000 },
      merge:    {},
      export:   { format: 'markdown' },
    };
    const newNode = { id, type, position, data: { ...defaults[type], onChange: (nid, k, v) => updateNodeData(nid, k, v) } };
    setNodes(ns => [...ns, newNode]);
  }, [setNodes, updateNodeData]);

  const handleSave = () => {
    const cleanNodes = nodes.map(({ data: { onChange, ...d }, ...n }) => ({ ...n, data: d }));
    onSave?.({ name, definition: { nodes: cleanNodes, edges } });
  };

  const handleRun = () => {
    const cleanNodes = nodes.map(({ data: { onChange, ...d }, ...n }) => ({ ...n, data: d }));
    onRun?.({ name, definition: { nodes: cleanNodes, edges } });
  };

  return (
    <div style={{ display: 'flex', height: '100%', background: '#f5f3ee' }}>
      {/* Sidebar */}
      <div style={{ width: 180, background: '#faf9f6', borderRight: '1px solid #e0ddd6', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '14px 14px 8px', borderBottom: '1px solid #e0ddd6' }}>
          <div style={{ fontSize: 9, letterSpacing: 1.2, color: '#999', textTransform: 'uppercase', marginBottom: 8 }}>节点类型</div>
          <div style={{ fontSize: 10, color: '#aaa' }}>拖拽至画布</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {PALETTE.map(p => (
            <div key={p.type} draggable
              onDragStart={e => e.dataTransfer.setData('application/atlas-node', p.type)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', cursor: 'grab', borderLeft: `3px solid transparent` }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0ede8'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }}/>
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#29261b' }}>{p.label}</div>
                <div style={{ fontSize: 9, color: '#aaa' }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Run status */}
        {runStatus && (
          <div style={{ padding: '12px 14px', borderTop: '1px solid #e0ddd6', background: '#f0ede8' }}>
            <div style={{ fontSize: 9, letterSpacing: 1, color: '#999', textTransform: 'uppercase', marginBottom: 8 }}>执行状态</div>
            {(runStatus.steps || []).map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: s.status === 'done' ? '#4a9b7a' : s.status === 'running' ? '#b87a3a' : s.status === 'failed' ? '#c25a5a' : '#ccc' }}>
                  {s.status === 'done' ? '✓' : s.status === 'running' ? '…' : s.status === 'failed' ? '✕' : '○'}
                </span>
                <span style={{ fontSize: 10, color: '#767368' }}>{s.type}</span>
              </div>
            ))}
            {runStatus.status === 'done' && <div style={{ fontSize: 10, color: '#4a9b7a', marginTop: 4 }}>完成，已保存至报告库</div>}
            {runStatus.status === 'failed' && <div style={{ fontSize: 10, color: '#c25a5a', marginTop: 4 }}>执行失败：{runStatus.error}</div>}
          </div>
        )}
      </div>

      {/* Canvas area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Toolbar */}
        <div style={{ height: 44, background: '#faf9f6', borderBottom: '1px solid #e0ddd6', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0 }}>
          <input value={name} onChange={e => setName(e.target.value)}
            style={{ fontSize: 12, fontWeight: 500, border: 'none', background: 'transparent', outline: 'none', color: '#29261b', minWidth: 160 }}/>
          <div style={{ flex: 1 }}/>
          <button onClick={handleSave} disabled={saving}
            style={{ fontSize: 11, padding: '4px 12px', border: '1px solid #ccc', borderRadius: 4, background: '#fff', color: '#29261b', cursor: saving ? 'wait' : 'pointer' }}>
            {saving ? '保存中…' : '保存'}
          </button>
          <button onClick={handleRun} disabled={running}
            style={{ fontSize: 11, padding: '4px 14px', border: 'none', borderRadius: 4, background: running ? '#aaa' : '#29261b', color: '#faf9f6', cursor: running ? 'wait' : 'pointer', fontWeight: 500 }}>
            {running ? '运行中…' : '运行工作流'}
          </button>
        </div>

        {/* React Flow canvas */}
        <div style={{ flex: 1, minHeight: 0 }} onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}
            nodeTypes={NODE_TYPES}
            fitView
            style={{ background: '#f5f3ee' }}>
            <Background color="#d4d1ca" gap={20} size={1}/>
            <Controls style={{ button: { background: '#faf9f6', border: '1px solid #e0ddd6' } }}/>
            <MiniMap nodeColor={n => {
              const colors = { input: '#5a7fa8', research: '#4a9b7a', outline: '#b87a3a', generate: '#8a5aa8', merge: '#7a7a7a', export: '#c25a5a' };
              return colors[n.type] || '#ccc';
            }} style={{ background: '#f5f3ee', border: '1px solid #e0ddd6' }}/>
            <Panel position="top-right" style={{ fontSize: 10, color: '#aaa', background: 'transparent' }}>
              {nodes.length} 个节点 · {edges.length} 条连线
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
