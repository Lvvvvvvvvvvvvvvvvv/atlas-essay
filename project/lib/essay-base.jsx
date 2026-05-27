// Essay direction — shared base. Tokens, top nav, footer, primitives.

// Tokens vary by tweak (theme + accent). Returns a consistent palette.
function essayTokens({ theme = 'cream', accent = 'red' }) {
  const accents = {
    red:    { hex: '#e5251d', soft: '#fde4e2', name: 'SIGNAL RED' },
    amber:  { hex: '#c2540a', soft: '#fbe7d2', name: 'CINNABAR' },
    forest: { hex: '#1f6f44', soft: '#daece1', name: 'EDITORIAL SAGE' },
    cobalt: { hex: '#1d4ed8', soft: '#dee5fb', name: 'PRESS BLUE' },
  };
  const a = accents[accent] || accents.red;

  const themes = {
    cream: {
      paper:    '#fbf9f4',
      paperAlt: '#f5f1e8',
      ink:      '#0f0f0f',
      inkSoft:  '#1f1d1a',
      mute:     '#767368',
      muteSoft: '#a8a395',
      rule:     '#d8d4ca',
      faint:    '#efebe1',
      cardOn:   '#ffffff',
    },
    slate: {
      paper:    '#15140f',
      paperAlt: '#1d1c17',
      ink:      '#f4f1e8',
      inkSoft:  '#e2dfd5',
      mute:     '#8c8778',
      muteSoft: '#5d5a4f',
      rule:     '#2a2823',
      faint:    '#1a1914',
      cardOn:   '#1d1c17',
    },
  };
  const palette = themes[theme] || themes.cream;

  return {
    ...palette,
    accent: a.hex,
    accentSoft: a.soft,
    accentName: a.name,
    theme,
    fontDisplay: "'Archivo', 'Noto Sans SC', system-ui, sans-serif",
    fontBody:    "'Hanken Grotesk', 'Noto Sans SC', system-ui, sans-serif",
    fontSerif:   "'Newsreader', 'Noto Serif SC', Georgia, serif",
    fontMono:    "'JetBrains Mono', ui-monospace, monospace",
    fontCN:      "'Noto Sans SC', system-ui, sans-serif",
  };
}

// ── Top nav: wordmark + section nav + meta -------------------------------
const NAV_ITEMS = [
  { k: 'home',    en: 'NEW',     cn: '新建' },
  { k: 'library', en: 'LIBRARY', cn: '报告库' },
  { k: 'sources', en: 'SOURCES', cn: '数据源' },
];

function TopBar({ route, setRoute, t, runState = 'idle', issueNum = 241 }) {
  return (
    <div style={{
      borderBottom: `1px solid ${t.ink}`, background: t.paper, flexShrink: 0,
      padding: '0 36px', height: 60,
      display: 'flex', alignItems: 'center', gap: 24,
    }}>
      <div onClick={() => setRoute('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: 10, whiteSpace: 'nowrap', flexShrink: 0 }}>
        <span style={{
          fontFamily: t.fontDisplay, fontWeight: 800, fontSize: 18,
          letterSpacing: 2.6, textTransform: 'uppercase', color: t.ink,
        }}>Atlas</span>
        <span style={{
          fontFamily: t.fontDisplay, fontWeight: 500, fontSize: 11,
          letterSpacing: 1.4, color: t.mute, textTransform: 'uppercase',
        }}>⎯ Essays</span>
      </div>

      <span style={{ flex: 1, height: 1, background: t.ink, opacity: 0.55, margin: '0 8px' }}/>

      <nav style={{ display: 'flex', gap: 26, flexShrink: 0 }}>
        {NAV_ITEMS.map(n => (
          <span key={n.k}
            onClick={() => setRoute(n.k)}
            style={{
              cursor: 'pointer', display: 'inline-flex', alignItems: 'baseline', gap: 6,
              padding: '4px 0',
              borderBottom: route === n.k ? `2px solid ${t.accent}` : '2px solid transparent',
              fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 11,
              letterSpacing: 1.4, textTransform: 'uppercase',
              color: route === n.k ? t.ink : t.mute,
            }}>
            <span>{n.en}</span>
            <span style={{ fontFamily: t.fontCN, fontSize: 11, letterSpacing: 0.5, color: route === n.k ? t.ink : t.mute }}>{n.cn}</span>
          </span>
        ))}
      </nav>

      <span style={{ flex: 1, height: 1, background: t.ink, opacity: 0.55, margin: '0 8px' }}/>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0, whiteSpace: 'nowrap' }}>
        {runState === 'running' && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <LiveDot color={t.accent}/>
            <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.accent, letterSpacing: 1.2 }}>LIVE</span>
          </span>
        )}
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, letterSpacing: 1 }}>
          VOL.04 · № {issueNum}
        </span>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, letterSpacing: 1 }}>2026·05·21</span>
        <UserAvatar t={t}/>
      </div>
    </div>
  );
}

function UserAvatar({ t }) {
  return (
    <div style={{
      width: 28, height: 28, border: `1.5px solid ${t.ink}`, background: t.paper, color: t.ink,
      fontFamily: t.fontDisplay, fontWeight: 800, fontSize: 11, letterSpacing: 0.4,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>JL</div>
  );
}

// ── Page footer: thin issue bar -----------------------------------------
function IssueFooter({ t, page = '01', section = 'COVER', issue = 241 }) {
  const cell = { whiteSpace: 'nowrap', flexShrink: 0 };
  const dot = { ...cell, opacity: 0.5 };
  return (
    <div style={{
      borderTop: `1px solid ${t.ink}`, background: t.paper,
      padding: '0 36px', height: 32, flexShrink: 0,
      display: 'flex', alignItems: 'center', gap: 14,
      fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1, color: t.mute, textTransform: 'uppercase',
      overflow: 'hidden',
    }}>
      <span style={cell}>PAGE {page}</span>
      <span style={dot}>·</span>
      <span style={cell}>{section}</span>
      <span style={{ flex: 1 }}/>
      <span style={cell}>Atlas v0.41</span>
      <span style={dot}>·</span>
      <span style={cell}>An essay engine</span>
      <span style={{ flex: 1 }}/>
      <span style={cell}>ISSUE № {issue}</span>
      <span style={dot}>·</span>
      <span style={cell}>2026·MAY</span>
    </div>
  );
}

// ── Small primitives ----------------------------------------------------

function LiveDot({ size = 8, color }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size, background: color || '#e5251d',
      borderRadius: size, flexShrink: 0, position: 'relative',
      boxShadow: `0 0 0 0 ${color || '#e5251d'}`, animation: 'essay-pulse 1.6s ease-out infinite',
    }}/>
  );
}

function Tag({ children, t, color, bg, accent = false, filled = false, style = {} }) {
  const fg = accent ? t.accent : (color || t.ink);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
      fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase',
      padding: '3px 7px', border: filled ? 'none' : `1px solid ${fg}`,
      background: filled ? fg : (bg || 'transparent'),
      color: filled ? t.paper : fg, lineHeight: 1,
      ...style,
    }}>{children}</span>
  );
}

function Btn({ children, t, primary = false, accent = false, size = 'md', onClick, disabled, style = {} }) {
  const sizes = {
    xs: { p: '5px 9px',  f: 9 },
    sm: { p: '7px 12px', f: 10 },
    md: { p: '10px 16px', f: 11 },
    lg: { p: '14px 22px', f: 13 },
  }[size];
  const fg = accent ? t.accent : t.ink;
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
        padding: sizes.p, fontSize: sizes.f,
        fontFamily: t.fontDisplay, fontWeight: 700, letterSpacing: 1.3, textTransform: 'uppercase',
        border: `1.5px solid ${fg}`,
        background: primary ? fg : t.paper,
        color: primary ? t.paper : fg,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        userSelect: 'none', transition: 'background 0.12s, color 0.12s, transform 0.08s',
        ...style,
      }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'translateY(1px)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >{children}</button>
  );
}

function Hairline({ t, color, vertical = false, opacity = 1 }) {
  return vertical
    ? <span style={{ width: 1, alignSelf: 'stretch', background: color || t.rule, opacity }}/>
    : <span style={{ height: 1, width: '100%', background: color || t.rule, opacity }}/>;
}

function Sup({ n, t, color }) {
  return (
    <sup style={{
      color: color || t.accent, fontFamily: t.fontMono, fontSize: 10,
      padding: '0 1px', fontWeight: 700,
    }}>[{n}]</sup>
  );
}

// Big bilingual head — EN kicker over CN title (or just EN)
function BilingualHead({ en, cn, t, size = 'lg', emphasis = '' }) {
  const sizes = {
    xs:  { en: 10, cn: 14, gap: 4 },
    sm:  { en: 11, cn: 18, gap: 4 },
    md:  { en: 12, cn: 26, gap: 6 },
    lg:  { en: 13, cn: 38, gap: 8 },
    xl:  { en: 14, cn: 52, gap: 10 },
    xxl: { en: 16, cn: 68, gap: 14 },
  }[size];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: sizes.gap }}>
      {en && (
        <div style={{
          fontFamily: t.fontDisplay, fontWeight: 800, fontSize: sizes.en,
          letterSpacing: 1.6, textTransform: 'uppercase', color: t.ink,
        }}>{en}</div>
      )}
      {cn && (
        <div style={{
          fontFamily: t.fontCN, fontWeight: 800, fontSize: sizes.cn,
          lineHeight: 1.05, letterSpacing: -0.5, color: t.ink,
          textWrap: 'balance', wordBreak: 'keep-all',
        }}>{cn}</div>
      )}
      {emphasis && (
        <div style={{
          fontFamily: t.fontSerif, fontStyle: 'italic', fontSize: sizes.cn * 0.45,
          color: t.mute, letterSpacing: 0,
        }}>{emphasis}</div>
      )}
    </div>
  );
}

// Metric pull-out: huge number + caption
function Metric({ value, en, cn, t, accent = false, big = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{
        fontFamily: t.fontDisplay, fontWeight: 800,
        fontSize: big ? 48 : 32, lineHeight: 0.95, letterSpacing: -1.4,
        color: accent ? t.accent : t.ink,
      }}>{value}</span>
      <span style={{
        fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase', color: t.mute,
      }}>{en} · {cn}</span>
    </div>
  );
}

// Pull quote — italic serif emphasis block
function PullQuote({ children, t, attribution }) {
  return (
    <figure style={{ margin: '8px 0', padding: '20px 0', borderTop: `1px solid ${t.ink}`, borderBottom: `1px solid ${t.ink}` }}>
      <blockquote style={{
        margin: 0, fontFamily: t.fontSerif, fontStyle: 'italic',
        fontSize: 26, lineHeight: 1.3, color: t.ink, letterSpacing: -0.3,
      }}>“{children}”</blockquote>
      {attribution && (
        <figcaption style={{
          marginTop: 10, fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1.2,
          color: t.mute, textTransform: 'uppercase',
        }}>— {attribution}</figcaption>
      )}
    </figure>
  );
}

// Figure placeholder — diagonal hatched rect with caption
function Figure({ t, label, caption, height = 200, type = 'chart' }) {
  return (
    <figure style={{ margin: '12px 0' }}>
      <div style={{
        width: '100%', height, border: `1px solid ${t.ink}`, position: 'relative',
        background: type === 'chart'
          ? `repeating-linear-gradient(135deg, ${t.faint} 0 6px, transparent 6px 12px), ${t.cardOn}`
          : t.cardOn,
        overflow: 'hidden',
      }}>
        {type === 'chart' && <FigureChart t={t}/>}
        {type === 'image' && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: t.fontMono, fontSize: 11, color: t.mute, letterSpacing: 1, textTransform: 'uppercase',
          }}>◇ Image · {label}</div>
        )}
        <span style={{
          position: 'absolute', top: 8, left: 10,
          fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1.2,
        }}>{label}</span>
      </div>
      {caption && (
        <figcaption style={{
          marginTop: 6, fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1,
          color: t.mute, textTransform: 'uppercase',
        }}>{caption}</figcaption>
      )}
    </figure>
  );
}

// Sample bar chart drawn inside a Figure
function FigureChart({ t }) {
  const bars = [
    { label: '10万以下', v: 8 },
    { label: '10-15万', v: 22 },
    { label: '15-20万', v: 38 },
    { label: '20-30万', v: 62, hi: true },
    { label: '30-50万', v: 28 },
    { label: '50万以上', v: 12 },
  ];
  const max = 70;
  return (
    <svg viewBox="0 0 600 200" preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <g transform="translate(60, 20)">
        {/* y-axis ticks */}
        {[0, 25, 50, 75].map(y => (
          <g key={y}>
            <line x1={-4} x2={540} y1={140 - (y / max) * 130} y2={140 - (y / max) * 130}
              stroke={t.rule} strokeWidth="0.5" strokeDasharray="2 3"/>
            <text x={-8} y={144 - (y / max) * 130} textAnchor="end"
              fontFamily={t.fontMono} fontSize="9" fill={t.mute}>{y}</text>
          </g>
        ))}
        {/* baseline */}
        <line x1={0} x2={540} y1={140} y2={140} stroke={t.ink} strokeWidth="1"/>
        {bars.map((b, i) => {
          const x = i * 90 + 10;
          const w = 70;
          const h = (b.v / max) * 130;
          return (
            <g key={b.label}>
              <rect x={x} y={140 - h} width={w} height={h}
                fill={b.hi ? t.accent : t.ink}/>
              <text x={x + w / 2} y={156} textAnchor="middle"
                fontFamily={t.fontCN} fontSize="11" fill={t.ink}>{b.label}</text>
              <text x={x + w / 2} y={140 - h - 6} textAnchor="middle"
                fontFamily={t.fontMono} fontSize="10" fontWeight="700" fill={b.hi ? t.accent : t.ink}>{b.v}%</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// Single marginalia entry — used in running screen
function MarginNote({ t, tag, cn, time, state = 'done', children }) {
  const live = state === 'live';
  const queued = state === 'queued';
  const ruleColor = live ? t.accent : (queued ? t.muteSoft : t.ink);
  return (
    <div style={{
      paddingLeft: 12, borderLeft: `2px solid ${ruleColor}`,
      display: 'flex', flexDirection: 'column', gap: 4,
      opacity: queued ? 0.5 : (state === 'done' && !live ? 0.72 : 1),
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.1, fontWeight: 700, color: live ? t.accent : t.ink }}>{tag}</span>
        {live && <LiveDot size={5} color={t.accent}/>}
        <span style={{ flex: 1 }}/>
        <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute }}>{time}</span>
      </div>
      <span style={{ fontFamily: t.fontCN, fontSize: 11, lineHeight: 1.5, color: t.inkSoft }}>{cn}</span>
      {children}
    </div>
  );
}

Object.assign(window, {
  essayTokens, TopBar, IssueFooter, UserAvatar,
  LiveDot, Tag, Btn, Hairline, Sup,
  BilingualHead, Metric, PullQuote, Figure, FigureChart, MarginNote,
  NAV_ITEMS,
});
