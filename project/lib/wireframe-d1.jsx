// Direction 01 — TIMELINE LEDGER
// Dual-column. Left = chat/control. Right = vertical timeline of agent steps.
// Editorial display type, red signal-dot, medium density.

const D1 = {
  bg: WF.paper,
  ledger: '#fbfaf7',
};

function D1TopBar({ active }) {
  const items = [
    { en:'NEW', cn:'新建' },
    { en:'LIBRARY', cn:'报告库' },
    { en:'SOURCES', cn:'数据源' },
    { en:'EXPORT', cn:'导出' },
  ];
  return (
    <div style={{
      height:56, borderBottom:`1.5px solid ${WF.ink}`,
      display:'flex', alignItems:'center', padding:'0 32px', flexShrink:0,
    }}>
      <div style={{display:'flex', alignItems:'baseline', gap:10}}>
        <span style={{
          fontFamily:"'Archivo', system-ui", fontWeight:800,
          fontSize:18, letterSpacing:1.6, textTransform:'uppercase',
        }}>Atlas</span>
        <span style={{
          fontFamily:"'JetBrains Mono', monospace", fontSize:10,
          color:WF.mute, letterSpacing:0.5,
        }}>report.agent · 报告智能体</span>
      </div>
      <div style={{flex:1}}/>
      <div style={{display:'flex', gap:24}}>
        {items.map(it => (
          <span key={it.en} style={{
            fontFamily:"'Archivo', system-ui", fontWeight:700,
            fontSize:11, letterSpacing:1.4, textTransform:'uppercase',
            borderBottom: active === it.en ? `2px solid ${WF.accent}` : '2px solid transparent',
            paddingBottom: 4,
          }}>{it.en} <span style={{color:WF.mute, marginLeft:4, fontFamily:"'Noto Sans SC'", letterSpacing:0.5}}>{it.cn}</span></span>
        ))}
      </div>
      <div style={{flex:1}}/>
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        <WireTag>2026·05·21</WireTag>
        <WireAvatar kind="user" size={26}/>
      </div>
    </div>
  );
}

// ── Screen A: Home / Task input ──────────────────────────────────────
function D1Home() {
  const templates = [
    { num:'01', en:'Industry Scan', cn:'行业研究', tag:'RESEARCH' },
    { num:'02', en:'Data Analysis', cn:'数据分析', tag:'DATA' },
    { num:'03', en:'Weekly Brief', cn:'工作周报', tag:'INTERNAL' },
    { num:'04', en:'Competitor Teardown', cn:'竞品拆解', tag:'RESEARCH' },
    { num:'05', en:'Meeting Recap', cn:'会议纪要', tag:'INTERNAL' },
    { num:'06', en:'Custom Brief', cn:'自定义', tag:'BLANK' },
  ];
  return (
    <WireWindow url="atlas.report/new" screenLabel="01-A · D1 Home">
      <D1TopBar active="NEW"/>
      <div style={{flex:1, display:'grid', gridTemplateColumns:'1fr 1fr', minHeight:0}}>
        {/* LEFT: input */}
        <div style={{padding:'48px 56px', borderRight:`1px solid ${WF.rule}`, display:'flex', flexDirection:'column', gap:32, overflow:'hidden'}}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <WireTag color={WF.accent}>◆  Issue №.241</WireTag>
            <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute}}>5月21日 · Thu</span>
          </div>
          <WireBilingualHead
            en="What shall we report on today."
            cn="今天，要写一份什么样的报告？"
            size="xxl"
          />
          <div style={{
            border:`1.5px solid ${WF.ink}`, padding:'20px 22px',
            display:'flex', flexDirection:'column', gap:14, background:WF.paper,
          }}>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <WireTag bg={WF.ink} color={WF.paper} border={false}>PROMPT</WireTag>
              <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute}}>describe the report you want</span>
            </div>
            <div style={{
              fontFamily:"'Noto Sans SC'", fontSize:15, lineHeight:1.55, color:WF.ink,
            }}>
              分析过去 12 个月新能源车 SUV 市场在 25-40 岁女性用户中的渗透情况，对比比亚迪、理想、特斯拉 Model Y 三个车型，给出价位段、用户画像和增长趋势的洞察。
            </div>
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              paddingTop:14, borderTop:`1px solid ${WF.rule}`,
            }}>
              <div style={{display:'flex', gap:8}}>
                <WireTag>＋ 数据源 3</WireTag>
                <WireTag>语气：分析</WireTag>
                <WireTag>长度：2500 字</WireTag>
              </div>
              <WireBtn primary size="lg" accent>Generate ↗</WireBtn>
            </div>
          </div>
          <div>
            <div style={{
              fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute,
              letterSpacing:1, textTransform:'uppercase', marginBottom:10,
            }}>Recent · 最近</div>
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              {['消费电子 Q1 复盘', '团队 OKR 月度回顾', '宠物食品赛道访谈整理'].map((t,i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'8px 0', borderBottom:`1px dashed ${WF.rule}`,
                }}>
                  <span style={{fontFamily:"'Noto Sans SC'", fontSize:13}}>{t}</span>
                  <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute}}>05·1{8-i}  →</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: template ledger */}
        <div style={{padding:'48px 56px', background:D1.ledger, overflow:'hidden'}}>
          <WireSectionHead num="§ 02" en="Templates" cn="快捷模板"/>
          <div style={{
            display:'grid', gridTemplateColumns:'1fr 1fr', gap:0,
            borderTop:`1px solid ${WF.rule}`, borderLeft:`1px solid ${WF.rule}`,
          }}>
            {templates.map((t,i) => (
              <div key={t.num} style={{
                borderRight:`1px solid ${WF.rule}`, borderBottom:`1px solid ${WF.rule}`,
                padding:'20px 18px', minHeight:140, background:WF.paper,
                display:'flex', flexDirection:'column', justifyContent:'space-between',
              }}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                  <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute}}>{t.num}</span>
                  <WireTag color={i===0?WF.accent:WF.mute}>{t.tag}</WireTag>
                </div>
                <div>
                  <div style={{
                    fontFamily:"'Archivo', system-ui", fontWeight:800,
                    fontSize:14, letterSpacing:0.5,
                  }}>{t.en}</div>
                  <div style={{
                    fontFamily:"'Noto Sans SC'", fontSize:13, color:WF.mute, marginTop:2,
                  }}>{t.cn}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:24, display:'flex', alignItems:'center', gap:8}}>
            <span style={{flex:1, height:1, background:WF.rule}}/>
            <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute}}>OR FROM SCRATCH ↓</span>
            <span style={{flex:1, height:1, background:WF.rule}}/>
          </div>
        </div>
      </div>
    </WireWindow>
  );
}

// ── Screen B: Running / Process ──────────────────────────────────────
function D1Running() {
  const steps = [
    { time:'00:00:03', state:'done', en:'PLAN', cn:'拆解任务为 6 个子步骤' },
    { time:'00:00:18', state:'done', en:'FETCH', cn:'抓取乘联会 2025 年 1-12 月销量数据' },
    { time:'00:01:42', state:'done', en:'FETCH', cn:'读取小红书相关讨论 218 条' },
    { time:'00:03:07', state:'done', en:'ANALYZE', cn:'按价位段对销量数据聚类' },
    { time:'00:04:55', state:'live', en:'WRITE', cn:'正在撰写章节「用户画像」…' },
    { time:'—', state:'queued', en:'CHART', cn:'生成 3 张图表' },
    { time:'—', state:'queued', en:'CITE', cn:'校对引用，整理参考来源' },
  ];
  return (
    <WireWindow url="atlas.report/run/r-7841" screenLabel="01-B · D1 Running">
      <D1TopBar active="NEW"/>
      <div style={{flex:1, display:'grid', gridTemplateColumns:'1fr 1fr', minHeight:0}}>
        {/* LEFT: chat */}
        <div style={{padding:'28px 40px', borderRight:`1px solid ${WF.rule}`, display:'flex', flexDirection:'column', gap:18, overflow:'hidden'}}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <LiveDot/>
            <WireTag color={WF.accent}>LIVE · 运行中</WireTag>
            <span style={{flex:1}}/>
            <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute}}>04:55 / ~07:00</span>
          </div>
          <div style={{height:2, background:WF.faint, position:'relative'}}>
            <div style={{position:'absolute', left:0, top:0, height:'100%', width:'70%', background:WF.accent}}/>
          </div>

          <div style={{display:'flex', gap:12}}>
            <WireAvatar kind="user" size={28}/>
            <div style={{flex:1, fontFamily:"'Noto Sans SC'", fontSize:13, lineHeight:1.6}}>
              分析过去 12 个月新能源车 SUV 市场在 25-40 岁女性用户中的渗透情况……
            </div>
          </div>

          <div style={{display:'flex', gap:12}}>
            <WireAvatar kind="agent" size={28}/>
            <div style={{flex:1, display:'flex', flexDirection:'column', gap:8}}>
              <div style={{fontFamily:"'Noto Sans SC'", fontSize:13, lineHeight:1.6}}>
                好的。我会从销量数据、用户讨论、价位段三个维度入手，先抓取 4 个公开数据源，再做对比分析。预计需要 7 分钟。
              </div>
              <div style={{border:`1px solid ${WF.rule}`, padding:'10px 12px', display:'flex', flexDirection:'column', gap:6}}>
                <div style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute, letterSpacing:1}}>PLAN · 计划</div>
                <WireLines lines={3} widths={['96%','88%','72%']} height={5}/>
              </div>
            </div>
          </div>

          <div style={{display:'flex', gap:12, opacity:0.6}}>
            <WireAvatar kind="user" size={28}/>
            <div style={{flex:1, display:'flex', alignItems:'center', gap:8}}>
              <div style={{
                flex:1, height:32, border:`1px solid ${WF.rule}`, padding:'8px 12px',
                fontFamily:"'Noto Sans SC'", fontSize:12, color:WF.muteSoft,
              }}>追加要求或问题…</div>
              <WireBtn size="sm">SEND</WireBtn>
            </div>
          </div>
        </div>

        {/* RIGHT: timeline ledger */}
        <div style={{padding:'28px 40px', background:D1.ledger, overflow:'hidden', display:'flex', flexDirection:'column'}}>
          <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:18}}>
            <WireBilingualHead en="Execution Ledger" cn="执行轨迹" size="sm"/>
            <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute}}>R-7841 · 7 STEPS</span>
          </div>

          <div style={{flex:1, position:'relative', paddingLeft:28, minHeight:0, overflow:'hidden'}}>
            {/* timeline rail */}
            <div style={{position:'absolute', left:8, top:8, bottom:8, width:1, background:WF.ink}}/>
            <div style={{display:'flex', flexDirection:'column', gap:18}}>
              {steps.map((s,i) => (
                <div key={i} style={{position:'relative'}}>
                  <div style={{
                    position:'absolute', left:-26, top:4, width:15, height:15,
                    border:`1.5px solid ${s.state==='queued' ? WF.muteSoft : WF.ink}`,
                    background: s.state==='done' ? WF.ink : (s.state==='live' ? WF.accent : WF.paper),
                  }}/>
                  <div style={{
                    display:'flex', alignItems:'baseline', gap:10,
                    opacity: s.state==='queued' ? 0.45 : 1,
                  }}>
                    <span style={{
                      fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute,
                      minWidth:64,
                    }}>{s.time}</span>
                    <span style={{
                      fontFamily:"'Archivo', system-ui", fontWeight:800,
                      fontSize:11, letterSpacing:1.2, color: s.state==='live' ? WF.accent : WF.ink,
                    }}>{s.en}</span>
                    {s.state==='live' && <LiveDot size={6}/>}
                  </div>
                  <div style={{
                    fontFamily:"'Noto Sans SC'", fontSize:13, marginTop:4, marginLeft:74,
                    color: s.state==='queued' ? WF.muteSoft : WF.ink,
                  }}>{s.cn}</div>
                  {s.state==='live' && (
                    <div style={{marginLeft:74, marginTop:8, padding:'10px 12px', border:`1.5px solid ${WF.accent}`, background:WF.paper}}>
                      <WireLines lines={2} widths={['96%','62%']} height={4} color={WF.muteSoft}/>
                      <div style={{marginTop:6, fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.accent}}>
                        ▮ writing… 1,247 / 2,500 字
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{display:'flex', gap:8, paddingTop:16, borderTop:`1px solid ${WF.rule}`, marginTop:16}}>
            <WireBtn size="sm">⏸ PAUSE</WireBtn>
            <WireBtn size="sm">EDIT PLAN</WireBtn>
            <div style={{flex:1}}/>
            <WireBtn size="sm" accent>⊗ CANCEL</WireBtn>
          </div>
        </div>
      </div>
    </WireWindow>
  );
}

// ── Screen C: Report view ─────────────────────────────────────────────
function D1Report() {
  const outline = [
    { num:'01', en:'TL;DR', cn:'核心结论', active:true },
    { num:'02', en:'Market Size', cn:'市场规模' },
    { num:'03', en:'User Profile', cn:'用户画像' },
    { num:'04', en:'Price Tiers', cn:'价位段分析' },
    { num:'05', en:'Trends', cn:'增长趋势' },
    { num:'06', en:'Notes', cn:'附录与引用' },
  ];
  return (
    <WireWindow url="atlas.report/r-7841" screenLabel="01-C · D1 Report">
      <D1TopBar active="LIBRARY"/>
      <div style={{flex:1, display:'grid', gridTemplateColumns:'220px 1fr 1fr', minHeight:0}}>
        {/* outline */}
        <div style={{borderRight:`1px solid ${WF.rule}`, padding:'24px 20px', overflow:'hidden'}}>
          <div style={{fontFamily:"'JetBrains Mono'", fontSize:9, color:WF.mute, letterSpacing:1.2, marginBottom:14}}>OUTLINE · 大纲</div>
          <div style={{display:'flex', flexDirection:'column'}}>
            {outline.map(o => (
              <div key={o.num} style={{
                display:'flex', gap:10, padding:'8px 0',
                borderBottom:`1px solid ${WF.rule}`,
                borderLeft: o.active ? `3px solid ${WF.accent}` : '3px solid transparent',
                paddingLeft: 8,
              }}>
                <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute}}>{o.num}</span>
                <div>
                  <div style={{fontFamily:"'Archivo'", fontWeight:700, fontSize:11, letterSpacing:0.8, textTransform:'uppercase'}}>{o.en}</div>
                  <div style={{fontFamily:"'Noto Sans SC'", fontSize:12, color:WF.mute}}>{o.cn}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* document */}
        <div style={{padding:'28px 36px', borderRight:`1px solid ${WF.rule}`, overflow:'hidden'}}>
          <WireTag color={WF.accent}>◆  R-7841 · 已完成</WireTag>
          <div style={{marginTop:14}}>
            <WireBilingualHead
              en="EV SUV penetration among women, 25–40."
              cn="新能源 SUV 在 25–40 岁女性用户中的渗透研究"
              size="lg"
            />
          </div>
          <div style={{display:'flex', gap:18, marginTop:18, padding:'12px 0', borderTop:`1px solid ${WF.rule}`, borderBottom:`1px solid ${WF.rule}`}}>
            <WireMetric value="38.4%" en="PEN." cn="渗透率"/>
            <WireMetric value="+12pt" en="YOY" cn="同比" accent/>
            <WireMetric value="¥24.8万" en="AVG.P" cn="均价"/>
            <WireMetric value="218" en="QUOTE" cn="访谈"/>
          </div>
          <div style={{marginTop:20, display:'flex', flexDirection:'column', gap:14}}>
            <div style={{fontFamily:"'Archivo'", fontWeight:800, fontSize:13, letterSpacing:1, textTransform:'uppercase'}}>01 · TL;DR</div>
            <div style={{fontFamily:"'Noto Sans SC'", fontSize:14, lineHeight:1.7}}>
              过去 12 个月，25-40 岁女性已成为新能源 SUV 增量的核心人群——
              <span style={{borderBottom:`2px solid ${WF.accent}`}}>渗透率从 26% 跃升至 38.4%</span>，
              其中 20-30 万元价位段贡献了 62% 的增量。
            </div>
            <WireLines lines={4} widths={['96%','100%','88%','64%']} height={5}/>
            <WireBox h={180} label="Chart · 价位段销量对比" hatch/>
            <WireLines lines={3} widths={['94%','100%','72%']} height={5}/>
          </div>
        </div>

        {/* meta + actions */}
        <div style={{padding:'24px 24px', background:D1.ledger, overflow:'hidden', display:'flex', flexDirection:'column', gap:18}}>
          <div>
            <div style={{fontFamily:"'JetBrains Mono'", fontSize:9, color:WF.mute, letterSpacing:1.2, marginBottom:10}}>SOURCES · 来源 (12)</div>
            <div style={{display:'flex', flexDirection:'column', gap:8}}>
              {['乘联会·2025年销量月报','小红书·新能源讨论','J.D. Power 中国','行业访谈 218 条'].map((s,i)=>(
                <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`1px dashed ${WF.rule}`}}>
                  <span style={{fontFamily:"'Noto Sans SC'", fontSize:12}}>{s}</span>
                  <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute}}>[{String(i+1).padStart(2,'0')}]</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontFamily:"'JetBrains Mono'", fontSize:9, color:WF.mute, letterSpacing:1.2, marginBottom:10}}>EXPORT · 导出</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
              <WireBtn>PDF</WireBtn>
              <WireBtn>DOCX</WireBtn>
              <WireBtn>NOTION</WireBtn>
              <WireBtn>LINK</WireBtn>
            </div>
          </div>
          <div style={{marginTop:'auto', padding:14, border:`1.5px solid ${WF.ink}`, background:WF.paper}}>
            <div style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute, letterSpacing:1, marginBottom:8}}>ASK A FOLLOW-UP</div>
            <div style={{display:'flex', gap:6}}>
              <div style={{flex:1, height:28, border:`1px solid ${WF.rule}`, padding:'6px 8px', fontFamily:"'Noto Sans SC'", fontSize:11, color:WF.muteSoft}}>把第 3 节扩写一倍…</div>
              <WireBtn size="sm" primary accent>↗</WireBtn>
            </div>
          </div>
        </div>
      </div>
    </WireWindow>
  );
}

Object.assign(window, { D1Home, D1Running, D1Report });
