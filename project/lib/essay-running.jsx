// Running — agent at work. Center column streams the essay paragraph by
// paragraph; right column collects marginalia in real time. Total demo
// duration ~26s. User can pause, slow down, or skip to the finished report.

// ── Paragraph copy --------------------------------------------------------
const RUN_PARAGRAPHS = [
  { kind: 'lede',
    text: '一句话总结：钱没少，故事变了——资本退出"高密度精品"的叙事，重新拥抱规模与下沉。' },
  { kind: 'p',
    text: '2025 年第一季度，国内连锁咖啡品牌共发生 9 起公开融资事件，总金额约 11.4 亿元§1。其中 6 起集中在 1 月，3 起分布在 2 月与 3 月——节奏明显前置，且回避了春节后的传统淡季窗口。' },
  { kind: 'p',
    text: 'Manner 在 1 月完成新一轮融资，估值约 30 亿美元§2，并同步释放"5 年内开设 5,000 家门店"的计划。这是公司首次明确表态规模化路径，此前 Manner 长期被视作精品咖啡的代表。' },
  { kind: 'p',
    text: '另一端则是库迪、挪瓦、本来不该有等品牌密集出现在三四线城市§3。库迪 1 月披露的加盟数据显示，下沉市场加盟商占比已超过 60%。' },
];

// ── Timeline ------------------------------------------------------------
const RUN_EVENTS = [
  // 0–8s: planning + fetching + analyzing
  { at: 0.0,  kind: 'marginStart', id: 'plan',    tag: 'PLAN',    cn: '拆解任务为 5 个子步骤' },
  { at: 2.4,  kind: 'marginDone',  id: 'plan' },
  { at: 2.6,  kind: 'marginStart', id: 'fetch1',  tag: 'FETCH',   cn: '抓取 IT 桔子 2025·Q1 融资数据库' },
  { at: 4.6,  kind: 'marginDone',  id: 'fetch1' },
  { at: 4.7,  kind: 'marginStart', id: 'fetch2',  tag: 'FETCH',   cn: '读取 36 氪 18 篇相关报道' },
  { at: 6.4,  kind: 'marginDone',  id: 'fetch2' },
  { at: 6.6,  kind: 'marginStart', id: 'analyze', tag: 'ANALYZE', cn: '提取金额 · 轮次 · 估值' },
  { at: 8.2,  kind: 'marginDone',  id: 'analyze' },
  // 8.5–20s: writing essay paragraph by paragraph
  { at: 8.5,  kind: 'marginStart', id: 'write',   tag: 'WRITE',   cn: '撰写正文 (1 / 4)' },
  { at: 8.6,  kind: 'paragraph',   idx: 0 },
  { at: 10.8, kind: 'paragraph',   idx: 1 },
  { at: 11.1, kind: 'marginAdd',   id: 'cite1',   tag: 'CITE [1]', cn: 'IT 桔子 · 2025 Q1 融资数据库' },
  { at: 14.0, kind: 'paragraph',   idx: 2 },
  { at: 14.4, kind: 'marginAdd',   id: 'cite2',   tag: 'CITE [2]', cn: '36 氪 · Manner 新一轮融资消息' },
  { at: 17.4, kind: 'paragraph',   idx: 3 },
  { at: 17.8, kind: 'marginAdd',   id: 'cite3',   tag: 'CITE [3]', cn: '窄门餐眼 · 咖啡品牌门店数据' },
  { at: 20.5, kind: 'marginDone',  id: 'write' },
  // 20.5–26s: chart + review
  { at: 20.7, kind: 'marginStart', id: 'chart',   tag: 'CHART',   cn: '生成融资金额柱状图' },
  { at: 22.4, kind: 'figure' },
  { at: 22.5, kind: 'marginDone',  id: 'chart' },
  { at: 22.7, kind: 'marginStart', id: 'review',  tag: 'REVIEW',  cn: '审校与引用核对' },
  { at: 25.2, kind: 'marginDone',  id: 'review' },
  { at: 26.0, kind: 'complete' },
];

const RUN_TOTAL = 26.0;

// ── Component -----------------------------------------------------------
function Running({ t, prompt, onDone, onTimelineComplete, marginaliaOn = true, density = 'editorial' }) {
  const [elapsed, setElapsed] = React.useState(0);
  const [playing, setPlaying] = React.useState(true);
  const [speed, setSpeed] = React.useState(1);
  const startedRef = React.useRef(Date.now());
  const offsetRef = React.useRef(0);
  const firedDoneRef = React.useRef(false);

  React.useEffect(() => {
    if (!playing) {
      offsetRef.current = elapsed;
      return;
    }
    startedRef.current = Date.now();
    const id = setInterval(() => {
      const e = offsetRef.current + ((Date.now() - startedRef.current) / 1000) * speed;
      setElapsed(Math.min(e, RUN_TOTAL + 0.5));
      if (e >= RUN_TOTAL) {
        offsetRef.current = RUN_TOTAL;
        setPlaying(false);
      }
    }, 80);
    return () => clearInterval(id);
  }, [playing, speed]);

  // Fire onTimelineComplete exactly once when the timeline finishes
  React.useEffect(() => {
    if (elapsed >= RUN_TOTAL && !firedDoneRef.current) {
      firedDoneRef.current = true;
      onTimelineComplete && onTimelineComplete();
    }
  }, [elapsed, onTimelineComplete]);

  // Derive state from events
  const { margins, paraIdx, showFigure, complete } = React.useMemo(() => {
    const margins = new Map();
    let paraIdx = -1;
    let showFigure = false;
    let complete = false;
    for (const ev of RUN_EVENTS) {
      if (ev.at > elapsed) break;
      switch (ev.kind) {
        case 'marginStart':
          margins.set(ev.id, { id: ev.id, tag: ev.tag, cn: ev.cn, state: 'live', t: ev.at });
          break;
        case 'marginDone':
          if (margins.has(ev.id)) margins.get(ev.id).state = 'done';
          break;
        case 'marginAdd':
          margins.set(ev.id, { id: ev.id, tag: ev.tag, cn: ev.cn, state: 'done', t: ev.at });
          break;
        case 'paragraph':
          paraIdx = Math.max(paraIdx, ev.idx);
          break;
        case 'figure':
          showFigure = true;
          break;
        case 'complete':
          complete = true;
          break;
      }
    }
    return { margins: Array.from(margins.values()), paraIdx, showFigure, complete };
  }, [elapsed]);

  // Compute typewriter reveal for the active paragraph
  const activePara = React.useMemo(() => {
    if (paraIdx < 0) return null;
    // Find when this paragraph started
    const startEv = RUN_EVENTS.find(e => e.kind === 'paragraph' && e.idx === paraIdx);
    // Find when next paragraph started (if any), else when figure or complete
    const nextEv = RUN_EVENTS.find(e =>
      e.at > (startEv?.at || 0) &&
      (e.kind === 'paragraph' || e.kind === 'figure' || e.kind === 'complete')
    );
    const start = startEv?.at || 0;
    const finish = nextEv?.at || RUN_TOTAL;
    const span = finish - start;
    const para = RUN_PARAGRAPHS[paraIdx];
    if (!para) return null;
    const progress = Math.max(0, Math.min(1, (elapsed - start) / Math.max(span * 0.92, 0.6)));
    const revealCount = Math.floor(progress * para.text.length);
    return { ...para, idx: paraIdx, revealCount, complete: elapsed >= finish - 0.2 };
  }, [paraIdx, elapsed]);

  const progressPct = Math.min(100, (elapsed / RUN_TOTAL) * 100);
  const eta = Math.max(0, RUN_TOTAL - elapsed);

  const editorial = density === 'editorial';
  const bodyCols = editorial
    ? (marginaliaOn ? '1fr 600px 220px 1fr' : '1fr 720px 1fr')
    : (marginaliaOn ? '1fr 540px 200px 1fr' : '1fr 660px 1fr');

  return (
    <div style={{
      flex: 1, background: t.paper, color: t.ink,
      display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden',
    }}>
      {/* Run header — progress + controls */}
      <div style={{
        padding: '14px 36px', borderBottom: `1px solid ${t.rule}`,
        display: 'flex', alignItems: 'center', gap: 18, background: t.paper, flexShrink: 0,
      }}>
        <LiveDot color={complete ? '#10b981' : t.accent}/>
        <span style={{
          fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.4,
          color: complete ? '#10b981' : t.accent, minWidth: 100,
        }}>
          {complete ? 'DONE · 撰写完成' : 'LIVE · 撰写中'}
        </span>
        <div style={{ flex: 1, height: 3, background: t.faint, position: 'relative' }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, height: '100%',
            width: `${progressPct}%`, background: complete ? '#10b981' : t.accent,
            transition: 'width 0.08s linear',
          }}/>
        </div>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, minWidth: 100, textAlign: 'right' }}>
          {complete ? '完成 · 26.0s' : `${elapsed.toFixed(1)}s / ~${RUN_TOTAL.toFixed(0)}s`}
        </span>
        <Btn t={t} size="sm" onClick={() => setPlaying(p => !p)} disabled={complete}>{playing ? '⏸' : '▶'}</Btn>
        <Btn t={t} size="sm" onClick={() => setSpeed(s => s === 1 ? 2 : s === 2 ? 4 : 1)} disabled={complete}>
          ×{speed}
        </Btn>
        {!complete && (
          <Btn t={t} size="sm" onClick={() => {
            offsetRef.current = RUN_TOTAL; setElapsed(RUN_TOTAL); setPlaying(false);
          }}>SKIP →</Btn>
        )}
        {complete && (
          <Btn t={t} size="sm" primary accent onClick={onDone}>View report ↗</Btn>
        )}
      </div>

      {/* Essay layout */}
      <div style={{
        flex: 1, display: 'grid', gridTemplateColumns: bodyCols, minHeight: 0, overflow: 'auto',
      }}>
        <div/>
        {/* Center essay column */}
        <div style={{ padding: '36px 0 48px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <PromptHeader t={t} prompt={prompt}/>

          <div>
            <BilingualHead t={t} size="md"
              en="Cold brew, hotter capital."
              cn="2025 Q1 国内咖啡赛道融资速记"
              emphasis="From Manner's new round to the sprawl of small-town chains."
            />
          </div>

          <div style={{
            fontFamily: t.fontCN, fontSize: editorial ? 16 : 15,
            lineHeight: 1.85, color: t.inkSoft,
            display: 'flex', flexDirection: 'column', gap: 18,
            paddingTop: 18, borderTop: `2px solid ${t.ink}`,
          }}>
            {RUN_PARAGRAPHS.slice(0, paraIdx + 1).map((p, i) => {
              const isActive = i === paraIdx && !complete && !(activePara && activePara.complete);
              const text = isActive && activePara ? activePara.text.slice(0, activePara.revealCount) : p.text;
              return <Paragraph key={i} t={t} para={{ ...p, text }} isLead={p.kind === 'lede'} isActive={isActive}/>;
            })}
            {showFigure && (
              <Figure t={t} type="chart" label="Fig. 1 · 季度融资金额分布 (亿元)"
                caption="数据来源：IT 桔子 · 2025 Q1 一级市场数据库" height={220}/>
            )}
            {paraIdx < 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: t.mute, fontSize: 13 }}>
                <span style={{
                  display: 'inline-block', width: 10, height: 18, background: t.accent,
                  animation: 'essay-blink 1s steps(2) infinite',
                }}/>
                <span style={{ fontFamily: t.fontMono, fontSize: 11 }}>thinking…</span>
              </div>
            )}
          </div>
        </div>

        {/* Marginalia column */}
        {marginaliaOn && (
          <div style={{
            padding: '36px 0 36px 24px', borderLeft: `1px dashed ${t.rule}`,
            display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden',
          }}>
            <div style={{
              fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1.4,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              MARGINALIA · 边注
              <span style={{ flex: 1 }}/>
              <span>{margins.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {margins.map(m => (
                <MarginNote key={m.id} t={t} tag={m.tag} cn={m.cn} state={m.state}
                  time={formatTime(m.t)}/>
              ))}
              {complete && (
                <div style={{
                  padding: '12px 14px', border: `1.5px solid #10b981`, background: t.cardOn,
                  fontFamily: t.fontCN, fontSize: 12, lineHeight: 1.55, color: t.inkSoft,
                }}>
                  ✓ 写完了。共 2,418 字，9 处引用，4 段。
                </div>
              )}
            </div>
          </div>
        )}
        <div/>
      </div>
    </div>
  );
}

function Paragraph({ t, para, isLead, isActive }) {
  // Render text with §N footnote markers converted to superscripts
  const parts = [];
  const re = /§(\d+)/g;
  let lastIdx = 0;
  let match;
  while ((match = re.exec(para.text)) !== null) {
    parts.push(para.text.slice(lastIdx, match.index));
    parts.push({ sup: match[1] });
    lastIdx = match.index + match[0].length;
  }
  parts.push(para.text.slice(lastIdx));

  const style = isLead ? {
    margin: 0, fontWeight: 700, fontSize: 19, lineHeight: 1.55, color: t.ink,
  } : { margin: 0 };

  return (
    <p style={style}>
      {parts.map((p, i) => typeof p === 'string'
        ? <React.Fragment key={i}>{p}</React.Fragment>
        : <Sup key={i} n={p.sup} t={t}/>)}
      {isActive && <span style={{
        display: 'inline-block', width: 8, height: 16, background: t.accent,
        verticalAlign: '-3px', marginLeft: 2, animation: 'essay-blink 1s steps(2) infinite',
      }}/>}
    </p>
  );
}

function PromptHeader({ t, prompt }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Tag t={t} accent>◆ YOUR PROMPT · 你的提问</Tag>
      <div style={{
        padding: '12px 0', borderTop: `1px solid ${t.ink}`, borderBottom: `1px solid ${t.ink}`,
        fontFamily: t.fontCN, fontSize: 14, lineHeight: 1.6, color: t.inkSoft,
      }}>{prompt}</div>
    </div>
  );
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

Object.assign(window, { Running, RUN_PARAGRAPHS, RUN_EVENTS, RUN_TOTAL });
