// Direction 03 — WORKBENCH
// Three-column engineering aesthetic. Left nav, center canvas (node graph or
// document), right inspector. Very dense, small uniform type, grid-heavy.
// The agent's process is shown as a directed graph of subtasks.

const D3 = {
  bg: '#fafaf8',
  panel: '#ffffff',
  rule: WF.rule,
};

function D3Frame({ children, screenLabel, url, leftActive }) {
  return (
    <WireWindow url={url} screenLabel={screenLabel}>
      <div style={{flex:1, display:'grid', gridTemplateColumns:'200px 1fr 280px', minHeight:0, background:D3.bg}}>
        <D3LeftNav active={leftActive}/>
        {children}
      </div>
    </WireWindow>
  );
}

function D3LeftNav({ active = 'reports' }) {
  const sections = [
    {
      head:'WORKSPACE · 工作台',
      items:[
        {k:'reports', en:'Reports', cn:'报告', count:'24'},
        {k:'drafts', en:'Drafts', cn:'草稿', count:'3'},
        {k:'runs', en:'Active Runs', cn:'进行中', count:'1', accent:true},
      ],
    },
    {
      head:'SOURCES · 数据源',
      items:[
        {k:'kb', en:'Knowledge Base', cn:'知识库', count:'412'},
        {k:'sql', en:'Databases', cn:'数据库', count:'7'},
        {k:'web', en:'Web Sources', cn:'网络抓取', count:'∞'},
        {k:'files', en:'Files', cn:'文件', count:'186'},
      ],
    },
    {
      head:'AGENTS · 智能体',
      items:[
        {k:'res', en:'Researcher', cn:'研究员'},
        {k:'analyst', en:'Analyst', cn:'分析师'},
        {k:'writer', en:'Writer', cn:'写作'},
        {k:'critic', en:'Critic', cn:'审校'},
      ],
    },
  ];
  return (
    <div style={{
      borderRight:`1px solid ${D3.rule}`, background:D3.panel,
      display:'flex', flexDirection:'column', overflow:'hidden',
    }}>
      <div style={{padding:'14px 16px', borderBottom:`1px solid ${D3.rule}`, display:'flex', alignItems:'center', gap:8}}>
        <div style={{width:18, height:18, background:WF.ink}}/>
        <span style={{fontFamily:"'Archivo'", fontWeight:800, fontSize:12, letterSpacing:1.4, textTransform:'uppercase'}}>Atlas/Bench</span>
      </div>
      <div style={{flex:1, overflow:'hidden', padding:'14px 0'}}>
        {sections.map(s => (
          <div key={s.head} style={{marginBottom:18}}>
            <div style={{padding:'0 16px 6px', fontFamily:"'JetBrains Mono'", fontSize:9, color:WF.mute, letterSpacing:1.4}}>{s.head}</div>
            {s.items.map(it => (
              <div key={it.k} style={{
                padding:'7px 16px', display:'flex', alignItems:'center', gap:8,
                background: active===it.k ? WF.faint : 'transparent',
                borderLeft: active===it.k ? `2px solid ${WF.accent}` : '2px solid transparent',
              }}>
                {it.accent && <LiveDot size={6}/>}
                <span style={{fontFamily:"'Noto Sans SC'", fontSize:12, flex:1}}>{it.cn}</span>
                <span style={{fontFamily:"'JetBrains Mono'", fontSize:9, color:WF.mute}}>{it.count}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{padding:'12px 16px', borderTop:`1px solid ${D3.rule}`, fontFamily:"'JetBrains Mono'", fontSize:9, color:WF.mute, lineHeight:1.6}}>
        v0.41·b/4127<br/>
        SYNCED · 5月21日 14:08
      </div>
    </div>
  );
}

function D3Tabs({ tabs, active }) {
  return (
    <div style={{
      height:36, borderBottom:`1px solid ${D3.rule}`, padding:'0 14px',
      display:'flex', alignItems:'center', gap:0, background:D3.panel, flexShrink:0,
    }}>
      {tabs.map(t => (
        <div key={t} style={{
          padding:'0 14px', height:'100%', display:'flex', alignItems:'center',
          fontFamily:"'JetBrains Mono'", fontSize:10, letterSpacing:1.2, textTransform:'uppercase',
          color: active===t ? WF.ink : WF.mute,
          borderBottom: active===t ? `2px solid ${WF.accent}` : '2px solid transparent',
          marginBottom:-1,
        }}>{t}</div>
      ))}
      <div style={{flex:1}}/>
      <div style={{display:'flex', alignItems:'center', gap:8, fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute}}>
        <span style={{padding:'2px 6px', border:`1px solid ${WF.rule}`}}>⌘ K</span>
      </div>
    </div>
  );
}

// ── Screen A: Home / workbench landing ────────────────────────────────
function D3Home() {
  return (
    <D3Frame screenLabel="03-A · D3 Home" url="atlas.bench/new" leftActive="drafts">
      {/* center */}
      <div style={{display:'flex', flexDirection:'column', minHeight:0, borderRight:`1px solid ${D3.rule}`, background:D3.bg}}>
        <D3Tabs tabs={['新报告','流程图','数据流']} active="新报告"/>
        <div style={{padding:'24px 28px', overflow:'hidden', flex:1, display:'flex', flexDirection:'column', gap:18}}>
          <div style={{display:'flex', alignItems:'baseline', gap:10}}>
            <WireTag>R-DRAFT</WireTag>
            <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute}}>untitled · 5月21日 14:08</span>
          </div>
          <WireBilingualHead en="New Report" cn="新建报告" size="md"/>

          {/* prompt */}
          <div style={{border:`1px solid ${WF.ink}`, background:WF.paper}}>
            <div style={{
              padding:'8px 12px', borderBottom:`1px solid ${WF.rule}`,
              display:'flex', alignItems:'center', gap:8, fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute, letterSpacing:1,
            }}>
              <span>PROMPT.md</span>
              <span style={{flex:1}}/>
              <span>UTF-8 · 0 / 4000</span>
            </div>
            <div style={{padding:'14px 16px', fontFamily:"'Noto Sans SC'", fontSize:14, lineHeight:1.6, color:WF.muteSoft, minHeight:110}}>
              # 任务<br/>
              描述你想要的报告…<br/><br/>
              <span style={{color:WF.muteSoft}}>例：用过去三个季度的销售数据，分析华南区品类增长情况，输出 1500 字的内部分析报告。</span>
            </div>
          </div>

          {/* config row */}
          <div style={{
            display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr',
            border:`1px solid ${D3.rule}`, background:WF.paper,
          }}>
            {[
              ['SOURCES','数据源','+ 添加'],
              ['AGENTS','智能体','Researcher · Writer'],
              ['LENGTH','长度','~1,500 字'],
              ['STYLE','文体','分析报告'],
            ].map(([en,cn,v],i)=>(
              <div key={en} style={{padding:'10px 14px', borderRight: i<3?`1px solid ${D3.rule}`:'none'}}>
                <div style={{fontFamily:"'JetBrains Mono'", fontSize:9, color:WF.mute, letterSpacing:1.2, marginBottom:4}}>{en}</div>
                <div style={{fontFamily:"'Noto Sans SC'", fontSize:11, marginBottom:2}}>{cn}</div>
                <div style={{fontFamily:"'JetBrains Mono'", fontSize:11, color:WF.ink}}>{v}</div>
              </div>
            ))}
          </div>

          {/* graph preview */}
          <div style={{
            flex:1, border:`1px dashed ${D3.rule}`, background:WF.paper,
            position:'relative', minHeight:0, overflow:'hidden',
          }}>
            <div style={{position:'absolute', left:12, top:10, fontFamily:"'JetBrains Mono'", fontSize:9, color:WF.mute, letterSpacing:1.2}}>
              PIPELINE PREVIEW · 流程预览 (4 节点)
            </div>
            <D3GraphMini/>
          </div>

          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <WireBtn size="md">SAVE DRAFT 保存</WireBtn>
            <span style={{flex:1}}/>
            <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute}}>ETA · 约 6 分钟</span>
            <WireBtn primary accent size="md">RUN ▸ 开始运行</WireBtn>
          </div>
        </div>
      </div>

      {/* right inspector */}
      <div style={{background:D3.panel, overflow:'hidden', display:'flex', flexDirection:'column'}}>
        <D3Tabs tabs={['INSPECT','TEMPLATES','HISTORY']} active="TEMPLATES"/>
        <div style={{padding:'16px 16px', overflow:'hidden', display:'flex', flexDirection:'column', gap:12}}>
          {[
            ['T-01','行业研究','5 节点 · ~8min'],
            ['T-02','数据分析','7 节点 · ~12min'],
            ['T-03','周报生成','3 节点 · ~3min'],
            ['T-04','竞品拆解','6 节点 · ~10min'],
            ['T-05','会议纪要','2 节点 · ~1min'],
          ].map(([id,t,m])=>(
            <div key={id} style={{
              border:`1px solid ${D3.rule}`, padding:'10px 12px',
              display:'flex', flexDirection:'column', gap:4,
            }}>
              <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between'}}>
                <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute}}>{id}</span>
                <span style={{fontFamily:"'JetBrains Mono'", fontSize:9, color:WF.mute}}>{m}</span>
              </div>
              <span style={{fontFamily:"'Noto Sans SC'", fontSize:13, fontWeight:600}}>{t}</span>
              <div style={{display:'flex', gap:4, marginTop:4}}>
                <WireTag>FETCH</WireTag>
                <WireTag>ANALYZE</WireTag>
                <WireTag>WRITE</WireTag>
              </div>
            </div>
          ))}
        </div>
      </div>
    </D3Frame>
  );
}

// Compact preview-graph at home screen
function D3GraphMini() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 540 240" style={{position:'absolute', inset:0}}>
      <defs>
        <marker id="d3-arrow-mini" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={WF.ink}/>
        </marker>
      </defs>
      <g fontFamily="'JetBrains Mono', monospace" fontSize="10" fill={WF.ink}>
        <NodeMini x={40} y={100} label="PROMPT" cn="提问"/>
        <line x1="125" y1="110" x2="195" y2="80" stroke={WF.ink} strokeWidth="1" markerEnd="url(#d3-arrow-mini)"/>
        <line x1="125" y1="120" x2="195" y2="155" stroke={WF.ink} strokeWidth="1" markerEnd="url(#d3-arrow-mini)"/>
        <NodeMini x={200} y={50} label="FETCH" cn="检索"/>
        <NodeMini x={200} y={125} label="ANALYZE" cn="分析"/>
        <line x1="285" y1="80" x2="355" y2="100" stroke={WF.ink} strokeWidth="1" markerEnd="url(#d3-arrow-mini)"/>
        <line x1="285" y1="155" x2="355" y2="125" stroke={WF.ink} strokeWidth="1" markerEnd="url(#d3-arrow-mini)"/>
        <NodeMini x={360} y={100} label="WRITE" cn="撰写"/>
        <line x1="445" y1="115" x2="495" y2="115" stroke={WF.ink} strokeWidth="1" markerEnd="url(#d3-arrow-mini)"/>
        <NodeMini x={500} y={100} label="REPORT" cn="报告" accent/>
      </g>
    </svg>
  );
}
function NodeMini({ x, y, label, cn, accent }) {
  const fill = accent ? WF.accent : WF.paper;
  const stroke = accent ? WF.accent : WF.ink;
  const tx = x + 42;
  return (
    <g>
      <rect x={x} y={y} width={85} height={32} fill={fill} stroke={stroke} strokeWidth="1.2"/>
      <text x={tx} y={y+13} textAnchor="middle" fontSize="9" fontWeight="700" letterSpacing="1" fill={accent?WF.paper:WF.ink}>{label}</text>
      <text x={tx} y={y+25} textAnchor="middle" fontSize="9" fill={accent?WF.paper:WF.mute} fontFamily="'Noto Sans SC'">{cn}</text>
    </g>
  );
}

// ── Screen B: Running with node graph ─────────────────────────────────
function D3Running() {
  return (
    <D3Frame screenLabel="03-B · D3 Running" url="atlas.bench/run/r-7841" leftActive="runs">
      <div style={{display:'flex', flexDirection:'column', minHeight:0, borderRight:`1px solid ${D3.rule}`, background:D3.bg}}>
        <D3Tabs tabs={['流程图','报告草稿','日志']} active="流程图"/>
        <div style={{padding:'14px 24px 8px', borderBottom:`1px solid ${D3.rule}`, background:WF.paper, display:'flex', alignItems:'center', gap:14}}>
          <LiveDot/>
          <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.accent, letterSpacing:1.2}}>RUN R-7841 · STEP 4/7</span>
          <div style={{flex:1, height:2, background:WF.faint, position:'relative'}}>
            <div style={{position:'absolute', left:0, top:0, height:'100%', width:'57%', background:WF.accent}}/>
          </div>
          <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute}}>04:55 · ETA 02:12</span>
          <WireBtn size="sm">⏸</WireBtn>
        </div>
        <div style={{flex:1, position:'relative', overflow:'hidden', background:`
          linear-gradient(0deg, ${WF.faint} 1px, transparent 1px) 0 0 / 20px 20px,
          linear-gradient(90deg, ${WF.faint} 1px, transparent 1px) 0 0 / 20px 20px,
          ${WF.paper}
        `}}>
          <D3GraphFull/>
        </div>
      </div>

      {/* right: inspector for selected node */}
      <div style={{background:D3.panel, overflow:'hidden', display:'flex', flexDirection:'column'}}>
        <D3Tabs tabs={['INSPECT','LOG','CHAT']} active="INSPECT"/>
        <div style={{padding:'14px 16px', display:'flex', flexDirection:'column', gap:14, overflow:'hidden'}}>
          <div>
            <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:4}}>
              <LiveDot size={6}/>
              <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.accent, letterSpacing:1}}>NODE · 04 · WRITE</span>
            </div>
            <div style={{fontFamily:"'Noto Sans SC'", fontSize:14, fontWeight:700}}>撰写「用户画像」段落</div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
            {[
              ['INPUTS','输入','2'],
              ['OUTPUTS','输出','—'],
              ['TOKENS','令牌','12.4K'],
              ['COST','耗时','03:08'],
            ].map(([en,cn,v])=>(
              <div key={en} style={{border:`1px solid ${D3.rule}`, padding:'8px 10px'}}>
                <div style={{fontFamily:"'JetBrains Mono'", fontSize:9, color:WF.mute, letterSpacing:1}}>{en} · {cn}</div>
                <div style={{fontFamily:"'Archivo'", fontWeight:800, fontSize:18, letterSpacing:0.4, marginTop:2}}>{v}</div>
              </div>
            ))}
          </div>

          <div>
            <div style={{fontFamily:"'JetBrains Mono'", fontSize:9, color:WF.mute, letterSpacing:1, marginBottom:6}}>INPUTS · 输入</div>
            <div style={{display:'flex', flexDirection:'column', gap:6}}>
              <InspectorRow tag="DATA" cn="销量聚类结果" id="N-03"/>
              <InspectorRow tag="DOCS" cn="小红书讨论摘要" id="N-02"/>
            </div>
          </div>

          <div>
            <div style={{fontFamily:"'JetBrains Mono'", fontSize:9, color:WF.mute, letterSpacing:1, marginBottom:6}}>STREAM · 实时输出</div>
            <div style={{
              border:`1px solid ${D3.rule}`, padding:'10px 12px', background:'#fbfaf6',
              fontFamily:"'Noto Sans SC'", fontSize:12, lineHeight:1.55, maxHeight:140, overflow:'hidden',
            }}>
              25-40 岁女性用户在选择新能源 SUV 时，最看重的三个因素依次是
              <span style={{borderBottom:`1.5px solid ${WF.accent}`}}>智能驾驶辅助、内饰质感和品牌服务体验</span>……
              <span style={{display:'inline-block', width:8, height:14, background:WF.accent, verticalAlign:'middle', marginLeft:2}}/>
            </div>
          </div>
        </div>
      </div>
    </D3Frame>
  );
}

function InspectorRow({ tag, cn, id }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:8, padding:'6px 8px',
      border:`1px solid ${D3.rule}`, background:WF.paper,
    }}>
      <WireTag>{tag}</WireTag>
      <span style={{fontFamily:"'Noto Sans SC'", fontSize:11, flex:1}}>{cn}</span>
      <span style={{fontFamily:"'JetBrains Mono'", fontSize:9, color:WF.mute}}>{id}</span>
    </div>
  );
}

// Full graph used in running screen — 7 nodes, mix of done/live/queued
function D3GraphFull() {
  const nodes = [
    { id:'N-01', x:30, y:160, label:'PROMPT', cn:'任务拆解', state:'done', kind:'plan' },
    { id:'N-02', x:180, y:60, label:'FETCH', cn:'乘联会销量', state:'done', kind:'data' },
    { id:'N-03', x:180, y:160, label:'FETCH', cn:'小红书讨论', state:'done', kind:'data' },
    { id:'N-04', x:180, y:260, label:'FETCH', cn:'JD Power 报告', state:'done', kind:'data' },
    { id:'N-05', x:340, y:110, label:'ANALYZE', cn:'价位段聚类', state:'done', kind:'compute' },
    { id:'N-06', x:340, y:230, label:'ANALYZE', cn:'文本主题抽取', state:'done', kind:'compute' },
    { id:'N-07', x:510, y:170, label:'WRITE', cn:'撰写章节', state:'live', kind:'write' },
    { id:'N-08', x:680, y:170, label:'REPORT', cn:'输出报告', state:'queued', kind:'out' },
  ];
  const edges = [
    ['N-01','N-02'],['N-01','N-03'],['N-01','N-04'],
    ['N-02','N-05'],['N-03','N-05'],['N-03','N-06'],['N-04','N-06'],
    ['N-05','N-07'],['N-06','N-07'],
    ['N-07','N-08'],
  ];
  const byId = Object.fromEntries(nodes.map(n=>[n.id,n]));
  return (
    <svg width="100%" height="100%" viewBox="0 0 780 360" style={{position:'absolute', inset:0}}>
      <defs>
        <marker id="d3-arrow-full" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={WF.ink}/>
        </marker>
        <marker id="d3-arrow-red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill={WF.accent}/>
        </marker>
      </defs>
      {edges.map(([a,b],i) => {
        const A = byId[a], B = byId[b];
        const x1 = A.x + 110, y1 = A.y + 30;
        const x2 = B.x, y2 = B.y + 30;
        const live = A.state==='live' || B.state==='live';
        const queued = B.state==='queued';
        return (
          <path key={i} d={`M ${x1} ${y1} C ${x1+50} ${y1}, ${x2-50} ${y2}, ${x2} ${y2}`}
            stroke={live ? WF.accent : (queued ? WF.muteSoft : WF.ink)} strokeWidth={live?1.6:1.2}
            fill="none" strokeDasharray={queued?'4 4':'none'} markerEnd={live?'url(#d3-arrow-red)':'url(#d3-arrow-full)'}/>
        );
      })}
      {nodes.map(n => (
        <D3Node key={n.id} {...n}/>
      ))}
    </svg>
  );
}
function D3Node({ x, y, label, cn, state, id }) {
  const live = state==='live';
  const queued = state==='queued';
  const stroke = live ? WF.accent : (queued ? WF.muteSoft : WF.ink);
  const headFill = state==='done' ? WF.ink : (live ? WF.accent : WF.paper);
  const headColor = (state==='done' || live) ? WF.paper : WF.ink;
  return (
    <g>
      {/* shadow plate when live */}
      {live && <rect x={x-3} y={y-3} width={116} height={66} fill="none" stroke={WF.accent} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6"/>}
      <rect x={x} y={y} width={110} height={60} fill={WF.paper} stroke={stroke} strokeWidth="1.3"/>
      <rect x={x} y={y} width={110} height={20} fill={headFill} stroke={stroke} strokeWidth="1.3"/>
      <text x={x+6} y={y+13} fontFamily="'JetBrains Mono', monospace" fontSize="9" letterSpacing="0.8" fill={headColor} fontWeight="700">{label}</text>
      <text x={x+104} y={y+13} textAnchor="end" fontFamily="'JetBrains Mono', monospace" fontSize="8" fill={headColor} opacity="0.8">{id}</text>
      <text x={x+8} y={y+38} fontFamily="'Noto Sans SC'" fontSize="11" fill={queued?WF.muteSoft:WF.ink}>{cn}</text>
      <text x={x+8} y={y+53} fontFamily="'JetBrains Mono', monospace" fontSize="8" fill={WF.mute}>
        {state==='done' && '✓ done'}
        {live && '▶ running…'}
        {queued && '⌖ queued'}
      </text>
    </g>
  );
}

// ── Screen C: Report view (workbench) ─────────────────────────────────
function D3Report() {
  return (
    <D3Frame screenLabel="03-C · D3 Report" url="atlas.bench/r-7841" leftActive="reports">
      <div style={{display:'flex', flexDirection:'column', minHeight:0, borderRight:`1px solid ${D3.rule}`, background:D3.bg}}>
        <D3Tabs tabs={['报告','数据','流程','分享']} active="报告"/>
        <div style={{padding:'18px 28px', overflow:'hidden', flex:1, display:'flex', flexDirection:'column', gap:14}}>
          <div style={{display:'flex', alignItems:'baseline', gap:10}}>
            <WireTag color={WF.accent}>R-7841 · DONE</WireTag>
            <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute}}>2,418 字 · 9 来源 · 8 节点 · 07:42</span>
            <span style={{flex:1}}/>
            <WireBtn size="sm">EDIT</WireBtn>
            <WireBtn size="sm">EXPORT ↗</WireBtn>
          </div>
          <WireBilingualHead en="EV SUV penetration · 25–40 women" cn="新能源 SUV 在 25–40 岁女性用户中的渗透研究" size="md"/>

          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0, border:`1px solid ${D3.rule}`, background:WF.paper}}>
            {[
              ['38.4%','PEN.','渗透率', false],
              ['+12pt','YOY','同比', true],
              ['¥24.8万','AVG.P','均价', false],
              ['218','QUOTE','访谈', false],
            ].map(([v,en,cn,a],i)=>(
              <div key={en} style={{padding:'12px 16px', borderRight: i<3?`1px solid ${D3.rule}`:'none'}}>
                <WireMetric value={v} en={en} cn={cn} accent={a}/>
              </div>
            ))}
          </div>

          <div style={{
            flex:1, border:`1px solid ${D3.rule}`, background:WF.paper, padding:'18px 22px',
            overflow:'hidden', display:'flex', flexDirection:'column', gap:12,
          }}>
            <div style={{fontFamily:"'Archivo'", fontWeight:800, fontSize:12, letterSpacing:1.2, textTransform:'uppercase'}}>01 · TL;DR</div>
            <div style={{fontFamily:"'Noto Sans SC'", fontSize:14, lineHeight:1.7}}>
              过去 12 个月，25-40 岁女性已成为新能源 SUV 增量的核心人群。其中 20-30 万元价位段贡献了 62% 的增量
              <sup style={{color:WF.accent, fontFamily:"'JetBrains Mono'", fontSize:9}}>[N-05]</sup>，
              在消费决策中"智能驾驶辅助"权重明显高于男性用户
              <sup style={{color:WF.accent, fontFamily:"'JetBrains Mono'", fontSize:9}}>[N-06]</sup>。
            </div>
            <WireLines lines={2} widths={['96%','62%']} height={5}/>
            <div style={{fontFamily:"'Archivo'", fontWeight:800, fontSize:12, letterSpacing:1.2, textTransform:'uppercase', marginTop:6}}>02 · USER PROFILE</div>
            <WireLines lines={4} widths={['96%','100%','88%','64%']} height={5}/>
            <WireBox h={120} label="Fig.2 · 用户画像聚类" hatch/>
          </div>
        </div>
      </div>

      <div style={{background:D3.panel, overflow:'hidden', display:'flex', flexDirection:'column'}}>
        <D3Tabs tabs={['LINEAGE','SOURCES','CHAT']} active="LINEAGE"/>
        <div style={{padding:'14px 16px', display:'flex', flexDirection:'column', gap:14, overflow:'hidden'}}>
          <div>
            <div style={{fontFamily:"'JetBrains Mono'", fontSize:9, color:WF.mute, letterSpacing:1, marginBottom:6}}>PIPELINE · 流程</div>
            <div style={{
              height:120, background:WF.faint, border:`1px solid ${D3.rule}`, position:'relative', overflow:'hidden',
            }}>
              <D3GraphMini/>
            </div>
          </div>

          <div>
            <div style={{fontFamily:"'JetBrains Mono'", fontSize:9, color:WF.mute, letterSpacing:1, marginBottom:6}}>SOURCES · 9 个来源</div>
            <div style={{display:'flex', flexDirection:'column', gap:6}}>
              {[
                ['[N-02]','乘联会 · 销量月报'],
                ['[N-03]','小红书 · 218 条讨论'],
                ['[N-04]','J.D. Power · 中国'],
                ['[N-05]','内部 · 价位聚类'],
                ['[N-06]','内部 · 主题抽取'],
              ].map(([id,t])=>(
                <div key={id} style={{display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px dashed ${D3.rule}`}}>
                  <span style={{fontFamily:"'Noto Sans SC'", fontSize:11}}>{t}</span>
                  <span style={{fontFamily:"'JetBrains Mono'", fontSize:9, color:WF.mute}}>{id}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{marginTop:'auto', padding:12, border:`1.5px solid ${WF.ink}`, background:WF.paper}}>
            <div style={{fontFamily:"'JetBrains Mono'", fontSize:9, color:WF.mute, letterSpacing:1, marginBottom:6}}>FOLLOW-UP · 追问</div>
            <div style={{display:'flex', gap:6}}>
              <div style={{flex:1, height:24, border:`1px solid ${D3.rule}`, padding:'4px 6px', fontFamily:"'Noto Sans SC'", fontSize:10, color:WF.muteSoft}}>对 N-05 的结论再追问…</div>
              <WireBtn size="sm" primary accent>↗</WireBtn>
            </div>
          </div>
        </div>
      </div>
    </D3Frame>
  );
}

Object.assign(window, { D3Home, D3Running, D3Report });
