// Report — final published essay. Lead paragraph, sections with figures,
// pull quotes, marginal references column. Polished editorial output.

const REPORT_META = {
  issue: '№ 241',
  date: '2026 · MAY · 21',
  duration: '07:42',
  words: '2,418',
  sources: 9,
  reading: '6 min',
  category: 'INDUSTRY · 行业研究',
};

const REPORT_METRICS = [
  { value: '¥11.4亿', en: 'TOTAL', cn: '融资总额',  accent: false },
  { value: '+38%',   en: 'YOY',   cn: '同比增长',  accent: true },
  { value: '9',       en: 'DEALS', cn: '公开事件',  accent: false },
  { value: '6 / 9',   en: 'JAN',   cn: '集中于 1 月', accent: false },
];

const REPORT_SECTIONS = [
  {
    id: 's1', num: '01', en: 'TL;DR', cn: '核心结论',
    blocks: [
      { kind: 'lede',
        text: '钱没少，故事变了——资本退出"高密度精品"叙事，重新拥抱规模与下沉。' },
      { kind: 'p',
        text: '2025 年第一季度，国内连锁咖啡品牌共发生 9 起公开融资事件，总金额约 11.4 亿元§1。其中 6 起集中在 1 月，3 起分布在 2 月与 3 月，节奏明显前置——多数公司选择把好消息放在春节前后释放，回避后段的传统淡季窗口。' },
      { kind: 'p',
        text: '更值得注意的是融资标的的迁移：从过去两年的"精品 / 第三空间 / 高密度门店"叙事，转向"规模化 / 下沉 / 加盟"叙事。两端同时拿钱，中间最难。' },
    ],
  },
  {
    id: 's2', num: '02', en: 'The state of capital', cn: '资本的新姿态',
    blocks: [
      { kind: 'p',
        text: 'Manner 在 1 月完成新一轮融资，估值约 30 亿美元§2，并同步释放"5 年内开设 5,000 家门店"的计划——目前 Manner 的门店数约 1,300 家，这意味着接下来 4 年要保持每年新增 ~900 家的速度。' },
      { kind: 'quote',
        text: '资本不再用"每平米营收"读懂咖啡，它开始用"每个县城"读懂咖啡。',
        by: '一位连锁咖啡品牌的早期投资人 · 行业访谈' },
      { kind: 'p',
        text: '这是公司首次明确表态规模化路径——此前 Manner 长期被视作精品咖啡的代表，2024 年还曾因门店密度过低而被外界质疑增长上限。新的估值与计划，是一次清晰的姿态切换。' },
    ],
  },
  {
    id: 's3', num: '03', en: 'The sprawl beneath', cn: '下沉之下',
    blocks: [
      { kind: 'p',
        text: '另一端则是库迪、挪瓦、本来不该有等品牌密集出现在三四线城市§3。库迪 1 月披露的加盟数据显示，下沉市场加盟商占比已超过 60%。' },
      { kind: 'figure', label: 'Fig. 1 · 季度融资金额分布 (亿元)',
        caption: '数据来源：IT 桔子 · 2025 Q1 一级市场数据库' },
      { kind: 'p',
        text: '从单店模型上看，这些品牌的客单价在 9-12 元之间，比一二线城市的精品咖啡低近一倍。模型成立的前提是低租金、低人力、半成品供应链——这是另一套生意，需要另一套估值体系。' },
    ],
  },
  {
    id: 's4', num: '04', en: 'What to watch', cn: '接下来看什么',
    blocks: [
      { kind: 'p',
        text: '两个信号需要持续跟踪：其一，Manner 的展店速度是否能稳定在年化 ~900 家——这是判断"规模化叙事"能否成立的关键指标。其二，下沉市场的单店模型是否仍能维持 ~12 个月的回本周期。' },
      { kind: 'p',
        text: '如果两条线都顺利，2025 年 H2 会迎来下一波融资。如果有一条断了，资本就会重新回到"中间地带"，那些目前最尴尬的城市——比如杭州、苏州、宁波——可能反而成为新的故事来源。' },
    ],
  },
];

const REPORT_REFS = [
  { n: '[1]', src: 'IT 桔子', title: '2025 Q1 一级市场融资数据库', url: 'itjuzi.com', date: '2025.04.02' },
  { n: '[2]', src: '36 氪',   title: 'Manner 新一轮融资消息',         url: '36kr.com',  date: '2025.01.18' },
  { n: '[3]', src: '窄门餐眼', title: '咖啡品牌门店分布数据',         url: 'zhaimen.cn', date: '2025.03.30' },
  { n: '[4]', src: '行业访谈', title: '5 位早期投资人匿名访谈',       url: 'internal',   date: '2025.04.10' },
];

function Report({ t, onExport, marginaliaOn = true, density = 'editorial' }) {
  const [activeSec, setActiveSec] = React.useState('s1');
  const containerRef = React.useRef(null);

  // Scroll-spy: as user scrolls, highlight current section in left rail
  React.useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const handler = () => {
      const headings = REPORT_SECTIONS.map(s => ({ id: s.id, el: root.querySelector(`[data-sec="${s.id}"]`) }));
      const top = root.scrollTop + 120;
      let current = headings[0].id;
      for (const h of headings) {
        if (h.el && h.el.offsetTop <= top) current = h.id;
      }
      setActiveSec(current);
    };
    root.addEventListener('scroll', handler);
    return () => root.removeEventListener('scroll', handler);
  }, []);

  const editorial = density === 'editorial';
  const bodyCols = editorial
    ? (marginaliaOn ? '180px 1fr 600px 220px 1fr' : '180px 1fr 720px 1fr')
    : (marginaliaOn ? '160px 1fr 540px 200px 1fr' : '160px 1fr 660px 1fr');

  const scrollTo = (id) => {
    const el = containerRef.current?.querySelector(`[data-sec="${id}"]`);
    if (el) containerRef.current.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
  };

  return (
    <div style={{ flex: 1, background: t.paper, color: t.ink, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      {/* Report header bar */}
      <div style={{
        padding: '12px 36px', borderBottom: `1px solid ${t.rule}`,
        display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, background: t.paper,
      }}>
        <Tag t={t} accent>◆ {REPORT_META.issue} · DONE</Tag>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>
          {REPORT_META.words} 字 · {REPORT_META.sources} 来源 · {REPORT_META.reading}阅读
        </span>
        <span style={{ flex: 1 }}/>
        <Btn t={t} size="sm">▸ 重跑</Btn>
        <Btn t={t} size="sm">⌖ 收藏</Btn>
        <Btn t={t} size="sm" primary accent onClick={onExport}>↗ 导出 / 分享</Btn>
      </div>

      {/* Scrollable body */}
      <div ref={containerRef} style={{
        flex: 1, minHeight: 0, overflow: 'auto',
        display: 'grid', gridTemplateColumns: bodyCols,
      }}>
        {/* Left rail: section index */}
        <aside style={{
          padding: '40px 20px 40px 32px', position: 'sticky', top: 0, alignSelf: 'start',
        }}>
          <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1.4, marginBottom: 14 }}>
            CONTENTS · 目录
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {REPORT_SECTIONS.map(s => (
              <button key={s.id}
                type="button"
                onClick={() => scrollTo(s.id)}
                style={{
                  display: 'block', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '10px 0 10px 10px',
                  borderLeft: activeSec === s.id ? `3px solid ${t.accent}` : `3px solid transparent`,
                  fontFamily: t.fontBody, color: t.ink,
                }}>
                <div style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, letterSpacing: 0.5 }}>{s.num}</div>
                <div style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 2 }}>{s.en}</div>
                <div style={{ fontFamily: t.fontCN, fontSize: 12, color: activeSec === s.id ? t.ink : t.mute, marginTop: 1 }}>{s.cn}</div>
              </button>
            ))}
          </div>
        </aside>

        {/* Outer gutter */}
        <div/>

        {/* Center body */}
        <article style={{ padding: '32px 0 80px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Title block */}
          <header style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <Tag t={t}>◆ {REPORT_META.category}</Tag>
              <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, letterSpacing: 1 }}>{REPORT_META.date}</span>
              <span style={{ flex: 1, height: 1, background: t.rule }}/>
              <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>by ATLAS · 04:07–07:42</span>
            </div>
            <div style={{
              fontFamily: t.fontDisplay, fontWeight: 900,
              fontSize: editorial ? 64 : 52, lineHeight: 0.95, letterSpacing: -2,
              color: t.ink,
            }}>
              Cold brew,<br/>
              <span style={{ fontFamily: t.fontSerif, fontStyle: 'italic', fontWeight: 500, color: t.accent }}>hotter</span> capital.
            </div>
            <div style={{
              fontFamily: t.fontCN, fontWeight: 700, fontSize: editorial ? 26 : 22,
              lineHeight: 1.3, color: t.inkSoft,
            }}>
              2025 Q1 国内咖啡赛道融资速记。从 Manner 的新一轮，到下沉市场的快速展店。
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0,
              borderTop: `2px solid ${t.ink}`, borderBottom: `1px solid ${t.ink}`,
              paddingTop: 16, paddingBottom: 16, marginTop: 4,
            }}>
              {REPORT_METRICS.map((m, i) => (
                <div key={m.en} style={{
                  paddingLeft: i === 0 ? 0 : 18,
                  borderLeft: i === 0 ? 'none' : `1px solid ${t.rule}`,
                }}>
                  <Metric {...m} t={t}/>
                </div>
              ))}
            </div>
          </header>

          {REPORT_SECTIONS.map(s => (
            <section key={s.id} data-sec={s.id} style={{
              display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 24, scrollMarginTop: 80,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, borderTop: `2px solid ${t.ink}`, paddingTop: 10 }}>
                <span style={{ fontFamily: t.fontMono, fontSize: 11, color: t.accent, letterSpacing: 0.5 }}>§ {s.num}</span>
                <span style={{ fontFamily: t.fontDisplay, fontWeight: 800, fontSize: 16, letterSpacing: 1.4, textTransform: 'uppercase' }}>{s.en}</span>
                <span style={{ fontFamily: t.fontCN, fontSize: 16, fontWeight: 700, color: t.inkSoft }}>· {s.cn}</span>
              </div>
              <div style={{
                fontFamily: t.fontCN, fontSize: editorial ? 16 : 15,
                lineHeight: 1.85, color: t.inkSoft,
                display: 'flex', flexDirection: 'column', gap: 16,
              }}>
                {s.blocks.map((b, i) => <ReportBlock key={i} block={b} t={t}/>)}
              </div>
            </section>
          ))}

          {/* Follow-up composer */}
          <div style={{
            marginTop: 36, padding: '18px 22px',
            border: `1.5px solid ${t.ink}`, background: t.cardOn,
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag t={t} filled>FOLLOW-UP</Tag>
              <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>追问、要求改写或继续</span>
            </div>
            <textarea defaultValue="把第 3 节扩写一倍，加上来自小红书的真实用户评论。"
              style={{
                fontFamily: t.fontCN, fontSize: 14, lineHeight: 1.55, color: t.ink,
                padding: '4px 0', border: 'none', outline: 'none', resize: 'none', minHeight: 44, background: 'transparent',
              }}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag t={t}>引用 §3</Tag>
              <Tag t={t}>+ 小红书数据源</Tag>
              <span style={{ flex: 1 }}/>
              <Btn t={t} size="sm" primary accent>↗ Send</Btn>
            </div>
          </div>
        </article>

        {/* Right rail: references */}
        {marginaliaOn && (
          <aside style={{ padding: '32px 0 32px 24px', borderLeft: `1px dashed ${t.rule}` }}>
            <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1.4, marginBottom: 14 }}>
              REFERENCES · 引用 ({REPORT_REFS.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {REPORT_REFS.map((r, i) => (
                <div key={r.n} style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 12, borderBottom: `1px dashed ${t.rule}` }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                    <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.accent, fontWeight: 700 }}>{r.n}</span>
                    <span style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase' }}>{r.src}</span>
                  </div>
                  <span style={{ fontFamily: t.fontCN, fontSize: 12, color: t.inkSoft, lineHeight: 1.45, marginLeft: 24 }}>{r.title}</span>
                  <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, marginLeft: 24 }}>{r.url} · {r.date}</span>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 18, padding: 12, border: `1.5px solid ${t.ink}`, background: t.cardOn,
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1.4 }}>SHARE · 分享</span>
              <Btn t={t} size="sm" onClick={onExport}>↗ 创建链接</Btn>
              <Btn t={t} size="sm" onClick={onExport}>↓ 导出 PDF</Btn>
            </div>
          </aside>
        )}
        <div/>
      </div>
    </div>
  );
}

function ReportBlock({ block, t }) {
  if (block.kind === 'lede') {
    return (
      <p style={{ margin: 0, fontWeight: 700, fontSize: 19, lineHeight: 1.55, color: t.ink }}>
        {renderFootnotes(block.text, t)}
      </p>
    );
  }
  if (block.kind === 'figure') {
    return <Figure t={t} type="chart" label={block.label} caption={block.caption} height={240}/>;
  }
  if (block.kind === 'quote') {
    return <PullQuote t={t} attribution={block.by}>{block.text}</PullQuote>;
  }
  return (
    <p style={{ margin: 0 }}>
      {renderFootnotes(block.text, t)}
    </p>
  );
}

function renderFootnotes(text, t) {
  const parts = [];
  const re = /§(\d+)/g;
  let lastIdx = 0;
  let match;
  while ((match = re.exec(text)) !== null) {
    parts.push(text.slice(lastIdx, match.index));
    parts.push({ sup: match[1] });
    lastIdx = match.index + match[0].length;
  }
  parts.push(text.slice(lastIdx));
  return parts.map((p, i) => typeof p === 'string'
    ? <React.Fragment key={i}>{p}</React.Fragment>
    : <Sup key={i} n={p.sup} t={t}/>);
}

Object.assign(window, { Report, REPORT_META, REPORT_SECTIONS, REPORT_REFS });
