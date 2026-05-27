// Direction 04 — STACK (Tab Cards)
// Single-column. Top tabs switch between CHAT / PROCESS / REPORT / SOURCES.
// Agent process = vertical stack of large cards, one per step, current one
// expanded with live detail. Medium density, geometric neutral type.

const D4 = {
  bg: '#f0efe9',
  card: '#ffffff',
};

function D4TopBar({ tab }) {
  const tabs = [
    { k:'CHAT', cn:'对话', dot:false },
    { k:'PROCESS', cn:'过程', dot:true },
    { k:'REPORT', cn:'报告', dot:false },
    { k:'SOURCES', cn:'来源', dot:false },
  ];
  return (
    <div style={{
      borderBottom:`1px solid ${WF.ink}`, background:D4.card, flexShrink:0,
    }}>
      <div style={{padding:'14px 32px', display:'flex', alignItems:'center', gap:16}}>
        <div style={{display:'flex', alignItems:'baseline', gap:10}}>
          <span style={{
            fontFamily:"'Archivo'", fontWeight:800, fontSize:16,
            letterSpacing:1.6, textTransform:'uppercase',
          }}>Atlas</span>
          <span style={{fontFamily:"'Noto Sans SC'", fontSize:11, color:WF.mute}}>· 报告智能体</span>
        </div>
        <span style={{flex:1}}/>
        <WireTag>R-7841</WireTag>
        <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute}}>5月21日 · Thu</span>
        <WireAvatar kind="user" size={26}/>
      </div>
      <div style={{padding:'0 32px', display:'flex', gap:0, height:48, alignItems:'flex-end'}}>
        {tabs.map(t => (
          <div key={t.k} style={{
            padding:'0 22px', height:'100%', display:'flex', alignItems:'center', gap:6,
            borderBottom: tab===t.k ? `3px solid ${WF.accent}` : '3px solid transparent',
            marginBottom:-1,
          }}>
            <span style={{
              fontFamily:"'Archivo'", fontWeight:800, fontSize:12, letterSpacing:1.4, textTransform:'uppercase',
              color: tab===t.k ? WF.ink : WF.mute,
            }}>{t.k}</span>
            <span style={{
              fontFamily:"'Noto Sans SC'", fontSize:11,
              color: tab===t.k ? WF.ink : WF.mute,
            }}>{t.cn}</span>
            {t.dot && <LiveDot size={6}/>}
          </div>
        ))}
        <span style={{flex:1}}/>
        <div style={{paddingBottom:8, display:'flex', gap:8}}>
          <WireBtn size="sm">⏸</WireBtn>
          <WireBtn size="sm" accent>↗ EXPORT</WireBtn>
        </div>
      </div>
    </div>
  );
}

// ── Screen A: CHAT tab — home / input ─────────────────────────────────
function D4Home() {
  const suggestions = [
    { icon:'◉', en:'Industry Scan', cn:'行业研究', sub:'选一个赛道，我先全网扫一遍' },
    { icon:'▦', en:'Data Analysis', cn:'数据分析', sub:'传一份表格，让我读懂它' },
    { icon:'◐', en:'Weekly Brief', cn:'工作周报', sub:'用上周的事情写一份周报' },
    { icon:'◆', en:'Meeting Recap', cn:'会议纪要', sub:'整理一段会议录音' },
  ];
  return (
    <WireWindow url="atlas.app/new" screenLabel="04-A · D4 Home">
      <D4TopBar tab="CHAT"/>
      <div style={{flex:1, background:D4.bg, overflow:'hidden', display:'flex', justifyContent:'center'}}>
        <div style={{maxWidth:780, width:'100%', padding:'48px 32px', display:'flex', flexDirection:'column', gap:28}}>
          <div style={{display:'flex', alignItems:'baseline', gap:10}}>
            <WireTag color={WF.accent}>◆ NEW</WireTag>
            <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute}}>2026·05·21 · 下午好</span>
          </div>
          <WireBilingualHead en="Tell Atlas what to write." cn="跟我说说，要写什么。" size="xl"/>

          {/* Composer card */}
          <div style={{
            background:D4.card, border:`1.5px solid ${WF.ink}`,
            display:'flex', flexDirection:'column',
          }}>
            <div style={{
              padding:'12px 16px', borderBottom:`1px solid ${WF.rule}`,
              display:'flex', alignItems:'center', gap:10, fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute, letterSpacing:1,
            }}>
              <WireTag bg={WF.ink} color={WF.paper} border={false}>PROMPT</WireTag>
              <span>describe the report</span>
              <span style={{flex:1}}/>
              <span>↩ to send · ⇧↩ for newline</span>
            </div>
            <div style={{padding:'20px 22px', fontFamily:"'Noto Sans SC'", fontSize:15, lineHeight:1.55, minHeight:96, color:WF.muteSoft}}>
              比如，"用过去三个季度的销售数据，分析华南区不同品类的增长情况，输出一份 1,500 字的内部分析报告，给销售总监看。"
            </div>
            <div style={{
              padding:'10px 14px', borderTop:`1px solid ${WF.rule}`,
              display:'flex', alignItems:'center', gap:8, background:WF.faint,
            }}>
              <WireTag>＋ ATTACH 附件</WireTag>
              <WireTag>＋ 数据源</WireTag>
              <WireTag>语气 · 分析</WireTag>
              <span style={{flex:1}}/>
              <WireBtn primary accent size="md">START ↗ 开始</WireBtn>
            </div>
          </div>

          <div>
            <div style={{
              display:'flex', alignItems:'baseline', gap:12, marginBottom:14,
              borderTop:`1px solid ${WF.ink}`, paddingTop:8,
            }}>
              <span style={{fontFamily:"'Archivo'", fontWeight:800, fontSize:11, letterSpacing:1.4, textTransform:'uppercase'}}>OR PICK A STARTER</span>
              <span style={{fontFamily:"'Noto Sans SC'", fontSize:11, color:WF.mute}}>从模板开始</span>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
              {suggestions.map((s,i) => (
                <div key={i} style={{
                  background:D4.card, border:`1px solid ${WF.ink}`,
                  padding:'14px 16px', display:'flex', alignItems:'center', gap:14,
                }}>
                  <div style={{
                    width:36, height:36, border:`1.5px solid ${WF.ink}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:"'Archivo'", fontSize:18, fontWeight:800,
                    background: i===0 ? WF.accent : WF.paper,
                    color: i===0 ? WF.paper : WF.ink,
                  }}>{s.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Archivo'", fontWeight:700, fontSize:12, letterSpacing:1, textTransform:'uppercase'}}>{s.en}</div>
                    <div style={{fontFamily:"'Noto Sans SC'", fontSize:13, fontWeight:600, marginTop:2}}>{s.cn}</div>
                    <div style={{fontFamily:"'Noto Sans SC'", fontSize:11, color:WF.mute, marginTop:2}}>{s.sub}</div>
                  </div>
                  <span style={{fontFamily:"'JetBrains Mono'", fontSize:11, color:WF.mute}}>↗</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </WireWindow>
  );
}

// ── Screen B: PROCESS tab — stack of step cards ───────────────────────
function D4Running() {
  const steps = [
    { n:'01', state:'done', en:'PLAN', cn:'拆解任务', meta:'4 个子步骤 · 12 秒' },
    { n:'02', state:'done', en:'FETCH', cn:'读取销量数据', meta:'乘联会 2025·1-12 月 · 1m 24s' },
    { n:'03', state:'done', en:'FETCH', cn:'抓取社交讨论', meta:'小红书 218 条 · 2m 08s' },
    { n:'04', state:'done', en:'ANALYZE', cn:'价位段聚类', meta:'K-means k=4 · 47 秒' },
    { n:'05', state:'live', en:'WRITE', cn:'撰写「用户画像」', meta:'1,247 / 2,500 字 · running' },
    { n:'06', state:'queued', en:'CHART', cn:'生成图表', meta:'3 张 · queued' },
    { n:'07', state:'queued', en:'CITE', cn:'校对引用', meta:'queued' },
  ];
  return (
    <WireWindow url="atlas.app/run/r-7841" screenLabel="04-B · D4 Running">
      <D4TopBar tab="PROCESS"/>
      <div style={{flex:1, background:D4.bg, overflow:'hidden', display:'flex', justifyContent:'center'}}>
        <div style={{maxWidth:820, width:'100%', padding:'28px 32px', display:'flex', flexDirection:'column', gap:14, overflow:'hidden'}}>
          {/* run header */}
          <div style={{background:D4.card, border:`1.5px solid ${WF.ink}`, padding:'16px 20px'}}>
            <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:8}}>
              <LiveDot/>
              <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.accent, letterSpacing:1.2}}>LIVE · 运行中</span>
              <span style={{flex:1}}/>
              <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute}}>04:55 / ~07:00 · ETA 02:12</span>
            </div>
            <div style={{fontFamily:"'Noto Sans SC'", fontSize:14, fontWeight:600, marginBottom:10}}>
              分析过去 12 个月新能源 SUV 在 25-40 岁女性用户中的渗透情况
            </div>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <div style={{flex:1, height:4, background:WF.faint, position:'relative'}}>
                <div style={{position:'absolute', left:0, top:0, height:'100%', width:'70%', background:WF.accent}}/>
              </div>
              <span style={{fontFamily:"'JetBrains Mono'", fontSize:11, fontWeight:700}}>4 / 7</span>
            </div>
          </div>

          {/* Step stack */}
          <div style={{flex:1, overflow:'hidden', display:'flex', flexDirection:'column', gap:8}}>
            {steps.map(s => <D4StepCard key={s.n} step={s}/>)}
          </div>
        </div>
      </div>
    </WireWindow>
  );
}

function D4StepCard({ step }) {
  const { n, state, en, cn, meta } = step;
  const done = state==='done';
  const live = state==='live';
  const queued = state==='queued';
  const borderColor = live ? WF.accent : (queued ? WF.muteSoft : WF.ink);
  return (
    <div style={{
      background:D4.card, border:`${live?2:1}px solid ${borderColor}`,
      padding: live ? '14px 18px' : '10px 16px',
      display:'flex', flexDirection: live ? 'column' : 'row',
      gap: live ? 10 : 14, alignItems: live ? 'stretch' : 'center',
      opacity: queued ? 0.55 : 1,
    }}>
      <div style={{display:'flex', alignItems:'center', gap:12, flex: live?'0 0 auto':'1 1 auto'}}>
        {/* step number badge */}
        <div style={{
          width:32, height:32, flexShrink:0,
          border:`1.5px solid ${borderColor}`,
          background: done ? WF.ink : (live ? WF.accent : WF.paper),
          color: (done||live) ? WF.paper : WF.ink,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontFamily:"'Archivo'", fontWeight:800, fontSize:12, letterSpacing:0.4,
        }}>{done ? '✓' : n}</div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:'flex', alignItems:'baseline', gap:10}}>
            <span style={{
              fontFamily:"'Archivo'", fontWeight:800, fontSize:12, letterSpacing:1.2, textTransform:'uppercase',
              color: live ? WF.accent : WF.ink,
            }}>{en}</span>
            <span style={{fontFamily:"'Noto Sans SC'", fontSize:13, fontWeight:600}}>{cn}</span>
            {live && <LiveDot size={6}/>}
          </div>
          <div style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute, letterSpacing:0.5, marginTop:2}}>{meta}</div>
        </div>
        {!live && (
          <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute}}>{done?'▾':'⌖'}</span>
        )}
      </div>
      {live && (
        <div style={{
          background:WF.faint, border:`1px dashed ${WF.accent}`,
          padding:'12px 14px', display:'flex', flexDirection:'column', gap:10,
        }}>
          <div style={{display:'flex', alignItems:'center', gap:8, fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute, letterSpacing:1}}>
            STREAM · 实时输出
            <span style={{flex:1}}/>
            <span>▮ 1,247 / 2,500 字</span>
          </div>
          <div style={{fontFamily:"'Noto Sans SC'", fontSize:13, lineHeight:1.65}}>
            25-40 岁女性用户在选择新能源 SUV 时，最看重的三个因素依次是
            <span style={{borderBottom:`1.5px solid ${WF.accent}`}}>智能驾驶辅助、内饰质感和品牌服务体验</span>……
            <span style={{display:'inline-block', width:8, height:14, background:WF.accent, verticalAlign:'middle', marginLeft:2}}/>
          </div>
          <div style={{display:'flex', gap:6, paddingTop:8, borderTop:`1px solid ${WF.rule}`}}>
            <WireTag>↗ N-03 销量</WireTag>
            <WireTag>↗ N-04 讨论</WireTag>
            <span style={{flex:1}}/>
            <WireBtn size="sm">JUMP →</WireBtn>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Screen C: REPORT tab — final document ─────────────────────────────
function D4Report() {
  return (
    <WireWindow url="atlas.app/r-7841" screenLabel="04-C · D4 Report">
      <D4TopBar tab="REPORT"/>
      <div style={{flex:1, background:D4.bg, overflow:'hidden', display:'flex', justifyContent:'center'}}>
        <div style={{maxWidth:820, width:'100%', padding:'28px 32px', overflow:'hidden', display:'flex', flexDirection:'column', gap:14}}>
          {/* meta card */}
          <div style={{background:D4.card, border:`1px solid ${WF.ink}`, padding:'16px 20px', display:'flex', flexDirection:'column', gap:10}}>
            <div style={{display:'flex', alignItems:'baseline', gap:10}}>
              <WireTag color={WF.accent}>◆ R-7841 · DONE</WireTag>
              <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute}}>2,418 字 · 9 来源 · 完成于 07:42</span>
              <span style={{flex:1}}/>
              <WireBtn size="sm">▸ 重跑</WireBtn>
              <WireBtn size="sm">↗ 分享</WireBtn>
            </div>
            <WireBilingualHead en="EV SUV penetration · 25–40 women" cn="新能源 SUV 在 25–40 岁女性用户中的渗透研究" size="md"/>
            <div style={{display:'flex', gap:14, paddingTop:8, borderTop:`1px solid ${WF.rule}`}}>
              <WireMetric value="38.4%" en="PEN." cn="渗透率"/>
              <WireMetric value="+12pt" en="YOY" cn="同比" accent/>
              <WireMetric value="¥24.8万" en="AVG.P" cn="均价"/>
              <WireMetric value="218" en="QUOTE" cn="访谈"/>
            </div>
          </div>

          {/* document card */}
          <div style={{
            flex:1, background:D4.card, border:`1px solid ${WF.ink}`, padding:'24px 32px',
            display:'flex', flexDirection:'column', gap:14, overflow:'hidden',
          }}>
            <div style={{fontFamily:"'Archivo'", fontWeight:800, fontSize:12, letterSpacing:1.2, textTransform:'uppercase'}}>01 · TL;DR · 核心结论</div>
            <div style={{fontFamily:"'Noto Sans SC'", fontSize:15, lineHeight:1.8, fontWeight:600}}>
              过去 12 个月，25-40 岁女性已成为新能源 SUV 增量的核心人群——
              <span style={{borderBottom:`2px solid ${WF.accent}`}}>渗透率从 26% 跃升至 38.4%</span>，
              其中 20-30 万元价位段贡献了 62% 的增量。
            </div>
            <WireLines lines={3} widths={['98%','94%','72%']} height={5}/>
            <div style={{fontFamily:"'Archivo'", fontWeight:800, fontSize:12, letterSpacing:1.2, textTransform:'uppercase', marginTop:6}}>02 · USER PROFILE · 用户画像</div>
            <WireBox h={120} label="Fig.2 · 价位段销量对比" hatch/>
            <WireLines lines={3} widths={['94%','100%','62%']} height={5}/>
          </div>

          {/* follow up */}
          <div style={{background:WF.ink, color:WF.paper, padding:'14px 18px', display:'flex', alignItems:'center', gap:12}}>
            <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, letterSpacing:1.2, color:WF.muteSoft}}>FOLLOW-UP · 追问</span>
            <div style={{flex:1, height:28, border:`1px solid ${WF.muteSoft}`, padding:'6px 10px', fontFamily:"'Noto Sans SC'", fontSize:12, color:WF.muteSoft}}>把第 3 节扩写一倍，加上来自小红书的真实评论…</div>
            <WireBtn size="sm" primary accent>↗ SEND</WireBtn>
          </div>
        </div>
      </div>
    </WireWindow>
  );
}

Object.assign(window, { D4Home, D4Running, D4Report });
