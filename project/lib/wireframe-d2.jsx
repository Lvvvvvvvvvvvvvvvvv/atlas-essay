// Direction 02 — ESSAY (Document-first)
// Single-column long-form. Prompt → report happens on the same scrollable
// page. Agent process appears as marginalia + inline footnotes. Big display
// type, generous whitespace, very low density above the fold.

const D2 = {
  paper: '#fbf9f4',
  ink: '#0f0f0f',
};

function D2TopBar({ context = 'home' }) {
  return (
    <div style={{
      height:48, borderBottom:`1px solid ${WF.ink}`, padding:'0 40px',
      display:'flex', alignItems:'center', flexShrink:0, background:D2.paper,
    }}>
      <span style={{
        fontFamily:"'Archivo', system-ui", fontWeight:800,
        fontSize:14, letterSpacing:2, textTransform:'uppercase',
      }}>Atlas ⎯ Essays</span>
      <span style={{flex:1, height:1, background:WF.ink, margin:'0 24px'}}/>
      <div style={{display:'flex', alignItems:'baseline', gap:18}}>
        <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute, letterSpacing:1}}>VOL. 04 · ISSUE 241</span>
        <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute, letterSpacing:1}}>2026·MAY·21</span>
        <WireAvatar kind="user" size={24}/>
      </div>
    </div>
  );
}

// ── Screen A: Home — magazine cover / prompt ──────────────────────────
function D2Home() {
  return (
    <WireWindow url="atlas.essays/new" screenLabel="02-A · D2 Home">
      <D2TopBar/>
      <div style={{flex:1, background:D2.paper, overflow:'hidden', display:'flex'}}>
        {/* left rail: vertical caption */}
        <div style={{
          width:48, borderRight:`1px solid ${WF.ink}`,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-between',
          padding:'24px 0',
        }}>
          <span style={{fontFamily:"'JetBrains Mono'", fontSize:9, letterSpacing:1.5, writingMode:'vertical-rl', transform:'rotate(180deg)'}}>
            № 241 ·  WRITE ANYTHING
          </span>
          <span style={{fontFamily:"'JetBrains Mono'", fontSize:9, letterSpacing:1, color:WF.mute, writingMode:'vertical-rl', transform:'rotate(180deg)'}}>
            报告智能体 · ATLAS
          </span>
        </div>

        {/* cover */}
        <div style={{flex:1, padding:'56px 80px 40px', display:'flex', flexDirection:'column', overflow:'hidden'}}>
          <div style={{display:'flex', alignItems:'baseline', gap:14, marginBottom:32}}>
            <span style={{
              fontFamily:"'JetBrains Mono'", fontSize:10, letterSpacing:1.5, color:WF.mute,
            }}>The Cover Story  /  封面故事</span>
            <span style={{flex:1, height:1, background:WF.ink}}/>
            <WireTag color={WF.accent}>◆ PROMPT</WireTag>
          </div>

          <div style={{
            fontFamily:"'Archivo', 'Noto Sans SC', system-ui", fontWeight:900,
            fontSize: 92, lineHeight: 0.95, letterSpacing:-3, textWrap:'balance',
            marginBottom: 36,
          }}>
            告诉我，<br/>
            <span style={{color:WF.accent}}>你要写</span><br/>
            什么报告？
          </div>

          <div style={{
            borderTop:`2px solid ${WF.ink}`, borderBottom:`1px solid ${WF.rule}`,
            padding:'18px 0', display:'flex', alignItems:'center', gap:18,
          }}>
            <span style={{
              fontFamily:"'JetBrains Mono'", fontSize:11, letterSpacing:1.4, color:WF.mute, minWidth:60,
            }}>TYPE →</span>
            <span style={{
              flex:1, fontFamily:"'Noto Sans SC'", fontSize:22,
              color:WF.muteSoft, fontWeight:400, lineHeight:1.4,
            }}>
              比如，"梳理一下 2025 年 Q1 的咖啡赛道融资动态…"
            </span>
            <WireBtn primary size="lg">START WRITING ↗</WireBtn>
          </div>

          <div style={{marginTop:'auto', display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
            <div style={{maxWidth:480}}>
              <div style={{fontFamily:"'JetBrains Mono'", fontSize:10, letterSpacing:1.4, color:WF.mute, marginBottom:8}}>
                FEATURED · 本期推荐
              </div>
              <div style={{display:'flex', flexDirection:'column', gap:8}}>
                {[
                  ['I.','调研一个我没听过的赛道'],
                  ['II.','把这堆访谈整理成一份洞察'],
                  ['III.','给老板写一份 10 分钟读完的周报'],
                ].map(([n,t]) => (
                  <div key={n} style={{display:'flex', alignItems:'baseline', gap:14, padding:'6px 0', borderBottom:`1px dashed ${WF.rule}`}}>
                    <span style={{fontFamily:"'Archivo', serif", fontWeight:700, fontSize:16, color:WF.accent, minWidth:30}}>{n}</span>
                    <span style={{fontFamily:"'Noto Sans SC'", fontSize:15}}>{t}</span>
                    <span style={{flex:1}}/>
                    <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute}}>↗</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{
              border:`1.5px solid ${WF.ink}`, padding:'14px 18px', maxWidth:280,
              display:'flex', flexDirection:'column', gap:6,
            }}>
              <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute, letterSpacing:1.2}}>EDITOR'S NOTE · 编者按</span>
              <span style={{fontFamily:"'Noto Sans SC'", fontSize:12, lineHeight:1.55}}>
                这一期，我学会了引用脚注的更好排版方式。试试在写完后让我"再细致一些"。
              </span>
              <span style={{fontFamily:"'JetBrains Mono'", fontSize:9, color:WF.mute, marginTop:4}}>— ATLAS v0.41</span>
            </div>
          </div>
        </div>
      </div>
    </WireWindow>
  );
}

// ── Screen B: Running — same page, prompt up top, draft writing below ─
function D2Running() {
  return (
    <WireWindow url="atlas.essays/r-7841" screenLabel="02-B · D2 Running">
      <D2TopBar/>
      <div style={{flex:1, background:D2.paper, overflow:'hidden', display:'flex', flexDirection:'column'}}>
        {/* fixed header bar — shows progress + the prompt */}
        <div style={{
          padding:'14px 60px', borderBottom:`1px solid ${WF.rule}`,
          display:'flex', alignItems:'center', gap:20,
        }}>
          <LiveDot/>
          <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, letterSpacing:1.4, color:WF.accent}}>LIVE · 撰写中</span>
          <div style={{flex:1, height:2, background:WF.faint, position:'relative'}}>
            <div style={{position:'absolute', left:0, top:0, height:'100%', width:'46%', background:WF.accent}}/>
          </div>
          <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute}}>1,128 / 2,500 字</span>
          <WireBtn size="sm">⏸</WireBtn>
        </div>

        {/* essay layout: narrow body + right margin notes */}
        <div style={{flex:1, overflow:'hidden', display:'grid', gridTemplateColumns:'1fr 580px 200px 1fr'}}>
          <div/>
          <div style={{paddingTop:36, paddingBottom:36, overflow:'hidden'}}>
            <div style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute, letterSpacing:1.4, marginBottom:14}}>
              YOUR PROMPT · 你的提问
            </div>
            <div style={{
              fontFamily:"'Noto Sans SC'", fontSize:15, lineHeight:1.6,
              padding:'14px 0', borderTop:`1px solid ${WF.ink}`, borderBottom:`1px solid ${WF.ink}`,
              marginBottom:36,
            }}>
              梳理 2025 年 Q1 国内咖啡赛道的融资动态，重点说说 Manner、库迪和挪瓦的新动向。
            </div>

            <div style={{
              fontFamily:"'Archivo', 'Noto Sans SC'", fontWeight:900,
              fontSize: 44, lineHeight: 1.05, letterSpacing:-1, marginBottom:24,
            }}>
              Cold brew, hotter capital.
              <div style={{fontSize:24, color:WF.mute, marginTop:4, letterSpacing:-0.5}}>2025 Q1 咖啡赛道融资速记</div>
            </div>

            <div style={{
              fontFamily:"'Noto Sans SC', serif", fontSize:15, lineHeight:1.85, color:WF.ink,
              display:'flex', flexDirection:'column', gap:14,
            }}>
              <p style={{margin:0}}>
                2025 年第一季度，国内连锁咖啡品牌共发生 9 起公开融资事件，金额从 800 万元到 3.2 亿元不等
                <sup style={{color:WF.accent, fontFamily:"'JetBrains Mono'", fontSize:10}}>[1]</sup>。
                热度集中在两端——一头是 Manner 的二级市场布局，一头是下沉市场的快速展店。
              </p>
              <p style={{margin:0}}>
                Manner 在 1 月完成的新一轮融资中，估值已逼近 30 亿美元
                <sup style={{color:WF.accent, fontFamily:"'JetBrains Mono'", fontSize:10}}>[2]</sup>，
                公司同步释放了"5 年内开设 5,000 家门店"的计划……
              </p>
              <div style={{display:'flex', alignItems:'center', gap:8, color:WF.accent}}>
                <span style={{display:'inline-block', width:12, height:18, background:WF.accent, animation:'wf-blink 1s steps(2) infinite'}}/>
                <span style={{fontFamily:"'JetBrains Mono'", fontSize:11}}>writing paragraph 3…</span>
              </div>
            </div>
          </div>

          {/* margin notes — live agent activity */}
          <div style={{
            paddingTop:36, paddingBottom:36, paddingLeft:24,
            borderLeft:`1px dashed ${WF.rule}`,
            display:'flex', flexDirection:'column', gap:18, overflow:'hidden',
          }}>
            <div style={{fontFamily:"'JetBrains Mono'", fontSize:9, color:WF.mute, letterSpacing:1.4, marginBottom:0}}>
              MARGINALIA · 边注
            </div>
            <MarginNote tag="PLAN" cn="先抓 IT 桔子 + 36 氪相关报道" time="00:02"/>
            <MarginNote tag="FETCH" cn="读取 18 篇相关报道，提取金额、轮次" time="00:34" done/>
            <MarginNote tag="CITE [1]" cn="IT 桔子 2025·Q1 融资数据库" time="01:12" done/>
            <MarginNote tag="CITE [2]" cn="36 氪 · Manner 估值消息" time="01:46" done/>
            <MarginNote tag="WRITE" cn="正在写「下沉市场」段落…" time="03:08" live/>
            <MarginNote tag="QUEUED" cn="生成融资金额柱状图" time="—"/>
          </div>
          <div/>
        </div>
      </div>
      <style>{`@keyframes wf-blink { 50% { opacity: 0; } }`}</style>
    </WireWindow>
  );
}

function MarginNote({ tag, cn, time, done = false, live = false }) {
  return (
    <div style={{
      paddingLeft: 10, borderLeft:`2px solid ${live ? WF.accent : (done ? WF.ink : WF.rule)}`,
      display:'flex', flexDirection:'column', gap:4,
      opacity: done && !live ? 0.55 : 1,
    }}>
      <div style={{display:'flex', alignItems:'center', gap:6}}>
        <span style={{fontFamily:"'JetBrains Mono'", fontSize:9, letterSpacing:1, fontWeight:700, color: live ? WF.accent : WF.ink}}>{tag}</span>
        {live && <LiveDot size={5}/>}
        <span style={{flex:1}}/>
        <span style={{fontFamily:"'JetBrains Mono'", fontSize:9, color:WF.mute}}>{time}</span>
      </div>
      <span style={{fontFamily:"'Noto Sans SC'", fontSize:11, lineHeight:1.45}}>{cn}</span>
    </div>
  );
}

// ── Screen C: Report view — final essay ───────────────────────────────
function D2Report() {
  return (
    <WireWindow url="atlas.essays/r-7841" screenLabel="02-C · D2 Report">
      <D2TopBar/>
      <div style={{flex:1, background:D2.paper, overflow:'hidden', display:'grid', gridTemplateColumns:'1fr 600px 200px 1fr'}}>
        <div/>
        {/* essay body */}
        <div style={{padding:'40px 0 32px', overflow:'hidden'}}>
          <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:24}}>
            <WireTag color={WF.accent}>◆ ISSUE №.241</WireTag>
            <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.mute}}>2,418 字 · 9 来源 · 完成于 07:42</span>
          </div>

          <div style={{
            fontFamily:"'Archivo', 'Noto Sans SC'", fontWeight:900,
            fontSize: 56, lineHeight: 0.95, letterSpacing:-1.5, marginBottom:10,
          }}>
            Cold brew,<br/>hotter capital.
          </div>
          <div style={{
            fontFamily:"'Noto Sans SC'", fontSize:22, color:WF.mute,
            marginBottom:28, lineHeight:1.3,
          }}>
            2025 Q1 国内咖啡赛道融资速记。从 Manner 的新一轮，到下沉市场的快速展店。
          </div>

          <div style={{
            fontFamily:"'Noto Sans SC', serif", fontSize:16, lineHeight:1.85, color:WF.ink,
            paddingTop:20, borderTop:`2px solid ${WF.ink}`,
            display:'flex', flexDirection:'column', gap:16,
          }}>
            <p style={{margin:0, fontWeight:700, fontSize:18, lineHeight:1.5}}>
              一句话总结：钱没少，故事变了——资本退出"高密度精品"叙事，重新拥抱规模与下沉。
            </p>
            <p style={{margin:0, columnCount:1}}>
              2025 年第一季度，国内连锁咖啡品牌共发生 9 起公开融资事件，总金额约 11.4 亿元
              <sup style={{color:WF.accent, fontFamily:"'JetBrains Mono'", fontSize:10}}>[1]</sup>。
              其中 6 起集中在 1 月，3 起分布在 2-3 月，呈现明显的"前置"特征。
            </p>
            <WireBox h={160} label="Fig. 1 · 季度融资金额分布" hatch/>
            <p style={{margin:0}}>
              Manner 在 1 月完成新一轮融资，估值约 30 亿美元
              <sup style={{color:WF.accent, fontFamily:"'JetBrains Mono'", fontSize:10}}>[2]</sup>……
            </p>
            <WireLines lines={5} widths={['100%','94%','98%','82%','100%']} height={5}/>
          </div>
        </div>

        {/* right rail — references */}
        <div style={{padding:'40px 24px', borderLeft:`1px dashed ${WF.rule}`, overflow:'hidden'}}>
          <div style={{fontFamily:"'JetBrains Mono'", fontSize:9, color:WF.mute, letterSpacing:1.4, marginBottom:14}}>
            REFERENCES · 引用
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            {[
              ['[1]','IT 桔子','2025 Q1 融资数据库'],
              ['[2]','36 氪','Manner 新一轮融资消息'],
              ['[3]','窄门餐眼','咖啡品牌门店数据'],
              ['[4]','Manner','官网门店分布'],
              ['[5]','库迪咖啡','加盟政策白皮书'],
            ].map(([n,src,t]) => (
              <div key={n} style={{display:'flex', flexDirection:'column', gap:2, paddingBottom:10, borderBottom:`1px dashed ${WF.rule}`}}>
                <div style={{display:'flex', gap:6, alignItems:'baseline'}}>
                  <span style={{fontFamily:"'JetBrains Mono'", fontSize:10, color:WF.accent}}>{n}</span>
                  <span style={{fontFamily:"'Archivo'", fontWeight:700, fontSize:11, letterSpacing:0.6, textTransform:'uppercase'}}>{src}</span>
                </div>
                <span style={{fontFamily:"'Noto Sans SC'", fontSize:11, color:WF.mute, marginLeft:24}}>{t}</span>
              </div>
            ))}
          </div>

          <div style={{marginTop:24, paddingTop:18, borderTop:`1px solid ${WF.ink}`}}>
            <div style={{fontFamily:"'JetBrains Mono'", fontSize:9, color:WF.mute, letterSpacing:1.4, marginBottom:10}}>
              CONTINUE · 接着写
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:6}}>
              <WireBtn size="sm">让我再细致一些 ↗</WireBtn>
              <WireBtn size="sm">写一段总结</WireBtn>
              <WireBtn size="sm" accent>导出 PDF</WireBtn>
            </div>
          </div>
        </div>
        <div/>
      </div>
    </WireWindow>
  );
}

Object.assign(window, { D2Home, D2Running, D2Report });
