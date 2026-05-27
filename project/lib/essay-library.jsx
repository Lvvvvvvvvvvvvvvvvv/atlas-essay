// Library — magazine-style archive of past reports. Grid of "issues",
// filterable by category. Each card opens the report view.

const LIBRARY_ENTRIES = [
  {
    issue: 241, status: 'NEW',
    title: { en: 'Cold brew, hotter capital.', cn: '2025 Q1 国内咖啡赛道融资速记' },
    category: 'INDUSTRY · 行业研究', tag: 'RESEARCH',
    date: '5月21日', words: '2,418', reading: '6 min', sources: 9,
    by: 'ATLAS · 04:07–07:42',
    teaser: '钱没少，故事变了——资本退出"高密度精品"叙事，重新拥抱规模与下沉。',
    feature: true,
  },
  {
    issue: 240, status: '',
    title: { en: 'Q1 sales · South China', cn: '华南区 Q1 品类增长复盘' },
    category: 'DATA · 数据分析', tag: 'DATA',
    date: '5月18日', words: '1,524', reading: '4 min', sources: 4,
    by: 'ATLAS · 02:41',
    teaser: '低线城市贡献了 70% 增量，但毛利空间收窄到 8 个百分点。',
  },
  {
    issue: 239, status: '',
    title: { en: 'Notion AI · ChatGPT Teams', cn: 'AI 协作工具竞品拆解' },
    category: 'COMPETITOR · 竞品', tag: 'RESEARCH',
    date: '5月15日', words: '3,102', reading: '9 min', sources: 14,
    by: 'ATLAS · 11:08',
    teaser: '两家在「知识检索」上的产品差异，比定价策略更值得讨论。',
  },
  {
    issue: 238, status: '',
    title: { en: 'Weekly · Wk20 / 2026', cn: '团队周报 · 第 20 周' },
    category: 'INTERNAL · 内部', tag: 'INTERNAL',
    date: '5月12日', words: '812', reading: '3 min', sources: 2,
    by: 'ATLAS · 01:24',
    teaser: '上线 2 个功能，客户 A 谈判进入第二阶段，HR 系统迁移延期。',
  },
  {
    issue: 237, status: '',
    title: { en: 'Home robotics scan', cn: '家用清洁机器人赛道扫描' },
    category: 'INDUSTRY · 行业研究', tag: 'RESEARCH',
    date: '5月09日', words: '2,710', reading: '7 min', sources: 11,
    by: 'ATLAS · 08:55',
    teaser: '价格带正在被 1,500-2,500 元这一段重新定义。',
  },
  {
    issue: 236, status: '',
    title: { en: 'Remote work · rent', cn: '远程办公对一线城市租房市场影响' },
    category: 'SOCIETY · 社会观察', tag: 'RESEARCH',
    date: '5月05日', words: '2,194', reading: '5 min', sources: 8,
    by: 'ATLAS · 06:38',
    teaser: '远郊租金回升了 4-6%，市中心仍在跌——但比一年前已收窄。',
  },
  {
    issue: 235, status: '',
    title: { en: 'Q1 board memo', cn: '一季度董事会备忘录' },
    category: 'INTERNAL · 内部', tag: 'INTERNAL',
    date: '5月02日', words: '1,406', reading: '4 min', sources: 3,
    by: 'ATLAS · 02:18',
    teaser: '三大业务线达成、超出、未达 Q1 目标的分布与原因。',
  },
  {
    issue: 234, status: 'ARCHIVED',
    title: { en: 'Q4 retro · go-to-market', cn: 'Q4 GTM 复盘' },
    category: 'INTERNAL · 内部', tag: 'INTERNAL',
    date: '4月28日', words: '1,802', reading: '5 min', sources: 5,
    by: 'ATLAS · 03:51',
    teaser: '渠道侧的 CAC 显著优于直销，但 LTV 还需要 2 个季度验证。',
  },
];

const LIB_FILTERS = [
  { k: 'ALL',        en: 'All',         cn: '全部' },
  { k: 'RESEARCH',   en: 'Research',    cn: '研究' },
  { k: 'DATA',       en: 'Data',        cn: '数据分析' },
  { k: 'INTERNAL',   en: 'Internal',    cn: '内部' },
];

function Library({ t, onOpen }) {
  const [filter, setFilter] = React.useState('ALL');
  const [sort, setSort] = React.useState('date');

  const entries = LIBRARY_ENTRIES.filter(e =>
    filter === 'ALL' ? true : e.tag === filter
  );
  const feature = entries.find(e => e.feature) || entries[0];
  const rest = entries.filter(e => e !== feature);

  return (
    <div style={{
      flex: 1, background: t.paper, color: t.ink,
      display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'auto',
    }}>
      {/* Masthead */}
      <div style={{
        padding: '36px 36px 24px',
        display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'flex-end',
        borderBottom: `2px solid ${t.ink}`,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
            <Tag t={t} accent>◆ THE ARCHIVE · 报告库</Tag>
            <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>{LIBRARY_ENTRIES.length} entries · 全部 {LIBRARY_ENTRIES.length} 期</span>
          </div>
          <div style={{
            fontFamily: t.fontDisplay, fontWeight: 900,
            fontSize: 80, lineHeight: 0.92, letterSpacing: -3, color: t.ink,
          }}>
            Every essay <span style={{ fontFamily: t.fontSerif, fontStyle: 'italic', fontWeight: 500, color: t.accent }}>Atlas</span><br/>has ever filed.
          </div>
        </div>
        <div style={{
          textAlign: 'right',
          display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end',
        }}>
          <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, letterSpacing: 1.2 }}>SINCE</span>
          <span style={{ fontFamily: t.fontDisplay, fontWeight: 800, fontSize: 28, letterSpacing: -0.5 }}>2025 · 09 · 12</span>
          <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>241 issues · 487,210 words</span>
        </div>
      </div>

      {/* Filters bar */}
      <div style={{
        padding: '14px 36px', display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: `1px solid ${t.rule}`, background: t.paper,
      }}>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, letterSpacing: 1.2 }}>FILTER ·</span>
        {LIB_FILTERS.map(f => (
          <button key={f.k}
            type="button"
            onClick={() => setFilter(f.k)}
            style={{
              padding: '5px 12px', border: `1px solid ${filter === f.k ? t.ink : t.rule}`,
              background: filter === f.k ? t.ink : 'transparent',
              color: filter === f.k ? t.paper : t.ink,
              fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 10,
              letterSpacing: 1.2, textTransform: 'uppercase', cursor: 'pointer',
              display: 'inline-flex', gap: 6,
            }}>
            <span>{f.en}</span>
            <span style={{ fontFamily: t.fontCN, opacity: 0.7 }}>{f.cn}</span>
          </button>
        ))}
        <span style={{ flex: 1 }}/>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>SORT</span>
        <button type="button" onClick={() => setSort(s => s === 'date' ? 'words' : 'date')}
          style={{
            padding: '5px 10px', border: `1px solid ${t.rule}`, background: 'transparent',
            fontFamily: t.fontMono, fontSize: 10, color: t.ink, cursor: 'pointer',
            letterSpacing: 1, textTransform: 'uppercase',
          }}>
          {sort === 'date' ? 'BY DATE ↓' : 'BY LENGTH ↓'}
        </button>
        <button type="button"
          style={{
            padding: '5px 10px', border: `1px solid ${t.rule}`, background: 'transparent',
            fontFamily: t.fontMono, fontSize: 10, color: t.ink, cursor: 'pointer',
            letterSpacing: 1, textTransform: 'uppercase',
          }}>SEARCH ⌘ K</button>
      </div>

      {/* Featured */}
      {feature && (
        <article onClick={() => onOpen(feature)} style={{
          padding: '36px 36px', borderBottom: `1px solid ${t.ink}`,
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36,
          cursor: 'pointer', background: t.paper,
          transition: 'background 0.12s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = t.faint}
          onMouseLeave={e => e.currentTarget.style.background = t.paper}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Tag t={t} accent filled>◆ ISSUE № {feature.issue} · LATEST</Tag>
              <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>{feature.category}</span>
            </div>
            <div style={{
              fontFamily: t.fontDisplay, fontWeight: 900,
              fontSize: 48, lineHeight: 0.96, letterSpacing: -1.6,
            }}>{feature.title.en}</div>
            <div style={{ fontFamily: t.fontCN, fontWeight: 700, fontSize: 22, lineHeight: 1.3, color: t.inkSoft }}>
              {feature.title.cn}
            </div>
            <div style={{ fontFamily: t.fontCN, fontSize: 14, lineHeight: 1.7, color: t.inkSoft, marginTop: 4 }}>
              {feature.teaser}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8, alignItems: 'center' }}>
              <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, letterSpacing: 1 }}>{feature.date}</span>
              <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>{feature.words} 字</span>
              <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>{feature.sources} 来源</span>
              <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>{feature.reading}</span>
              <span style={{ flex: 1 }}/>
              <Btn t={t} size="sm" accent primary>Read ↗</Btn>
            </div>
          </div>
          <CoverArt t={t} entry={feature}/>
        </article>
      )}

      {/* Rest grid */}
      <div style={{
        padding: '24px 36px 48px',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
        borderTop: `1px solid ${t.rule}`, borderLeft: `1px solid ${t.rule}`,
        marginLeft: 0, marginRight: 0,
      }}>
        {rest.map(e => <LibraryCard key={e.issue} entry={e} t={t} onOpen={onOpen}/>)}
      </div>
    </div>
  );
}

function LibraryCard({ entry, t, onOpen }) {
  return (
    <article onClick={() => onOpen(entry)} style={{
      borderRight: `1px solid ${t.rule}`, borderBottom: `1px solid ${t.rule}`,
      padding: '22px 22px', cursor: 'pointer', background: t.paper,
      display: 'flex', flexDirection: 'column', gap: 12, minHeight: 280,
      transition: 'background 0.12s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = t.faint}
      onMouseLeave={e => e.currentTarget.style.background = t.paper}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, letterSpacing: 1.2 }}>№ {entry.issue}</span>
        <Tag t={t}>{entry.tag}</Tag>
      </div>
      <CoverArt t={t} entry={entry} mini/>
      <div>
        <div style={{ fontFamily: t.fontDisplay, fontWeight: 800, fontSize: 17, letterSpacing: -0.3, lineHeight: 1.1, marginBottom: 4 }}>
          {entry.title.en}
        </div>
        <div style={{ fontFamily: t.fontCN, fontWeight: 600, fontSize: 13, color: t.inkSoft, lineHeight: 1.3 }}>
          {entry.title.cn}
        </div>
      </div>
      <div style={{ fontFamily: t.fontCN, fontSize: 12, color: t.mute, lineHeight: 1.5, flex: 1 }}>
        {entry.teaser}
      </div>
      <div style={{
        display: 'flex', gap: 10, alignItems: 'center', paddingTop: 8, borderTop: `1px solid ${t.rule}`,
      }}>
        <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 0.5 }}>{entry.date}</span>
        <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute }}>·</span>
        <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute }}>{entry.words} 字</span>
        <span style={{ flex: 1 }}/>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.accent }}>↗</span>
      </div>
    </article>
  );
}

// Simple typographic "cover art" — bold geometric composition per category
function CoverArt({ t, entry, mini = false }) {
  const h = mini ? 110 : 280;
  // Color & shapes vary by tag
  const variants = {
    RESEARCH: { bg: t.ink, fg: t.paper, accent: t.accent },
    DATA:     { bg: t.accent, fg: t.paper, accent: t.ink },
    INTERNAL: { bg: t.paperAlt, fg: t.ink, accent: t.accent },
  };
  const v = variants[entry.tag] || variants.RESEARCH;
  const seed = entry.issue;
  return (
    <div style={{
      height: h, background: v.bg, color: v.fg,
      border: `1px solid ${t.ink}`,
      position: 'relative', overflow: 'hidden',
      fontFamily: t.fontDisplay,
    }}>
      <CoverArtComposition issue={entry.issue} v={v} t={t} mini={mini}/>
      <div style={{ position: 'absolute', top: 10, left: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontFamily: t.fontMono, fontSize: mini ? 8 : 10, letterSpacing: 1.4, opacity: 0.85 }}>VOL.04</span>
        <span style={{ fontFamily: t.fontMono, fontSize: mini ? 8 : 10, letterSpacing: 1.4, opacity: 0.85 }}>№ {entry.issue}</span>
      </div>
      <div style={{ position: 'absolute', bottom: 10, right: 12 }}>
        <span style={{ fontFamily: t.fontMono, fontSize: mini ? 8 : 10, letterSpacing: 1.2, opacity: 0.85 }}>{entry.date}</span>
      </div>
    </div>
  );
}

function CoverArtComposition({ issue, v, t, mini }) {
  // Pseudo-random but deterministic composition per issue
  const r = (s) => ((Math.sin((issue + s) * 91.3) + 1) / 2);
  const big = mini ? 36 : 88;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      {/* Big number */}
      <text x={50} y={64 + (mini ? 4 : 0)} textAnchor="middle"
        fontFamily="Archivo, sans-serif" fontWeight="900"
        fontSize={mini ? 48 : 78} letterSpacing="-4"
        fill={v.fg} opacity="0.18">{issue}</text>
      {/* Random shapes */}
      <circle cx={20 + r(1) * 30} cy={30 + r(2) * 20} r={4 + r(3) * 6}
        fill={v.accent} opacity="0.85"/>
      <rect x={60} y={20 + r(4) * 10} width={28} height={3} fill={v.fg} opacity="0.6"/>
      <line x1={10} y1={70} x2={92} y2={70} stroke={v.fg} strokeWidth="0.3" opacity="0.6"/>
      <text x={10} y={92} fontFamily="JetBrains Mono, monospace" fontSize="3.5" letterSpacing="0.4"
        fill={v.fg} opacity="0.7">A · T · L · A · S · ESSAYS</text>
    </svg>
  );
}

Object.assign(window, { Library, LIBRARY_ENTRIES });
