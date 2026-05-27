// Shared wireframe primitives — Swiss-modernist low-fi.
// Black/white/gray + single red accent. Mixed CN/EN typography.

const WF = {
  ink: '#0f0f0f',
  paper: '#ffffff',
  rule: '#d4d4d4',
  ruleStrong: '#0f0f0f',
  mute: '#787878',
  muteSoft: '#a5a5a5',
  faint: '#f3f2ee',
  accent: '#e5251d',
  accentSoft: '#fde4e2',
  ink2: '#1f1d1a',
};

// ── Browser-like outer chrome for each screen ─────────────────────────
function WireWindow({ url, children, screenLabel }) {
  return (
    <div
      data-screen-label={screenLabel}
      style={{
        width: '100%', height: '100%',
        background: WF.paper, color: WF.ink,
        fontFamily: "'Hanken Grotesk', 'Noto Sans SC', system-ui, sans-serif",
        fontSize: 13, lineHeight: 1.4,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
      <div style={{
        height: 32, borderBottom: `1px solid ${WF.rule}`,
        display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
        background: '#fbfbf9', flexShrink: 0,
      }}>
        <div style={{display:'flex', gap:6}}>
          <span style={dot()}/><span style={dot()}/><span style={dot()}/>
        </div>
        <div style={{
          flex: 1, height: 18, background: WF.paper, border: `1px solid ${WF.rule}`,
          borderRadius: 3, display:'flex', alignItems:'center', padding:'0 8px',
          fontSize: 10, color: WF.mute, fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: 0.2,
        }}>
          {url || 'report-agent.app/'}
        </div>
        <span style={{fontSize:10, color:WF.mute, fontFamily:"'JetBrains Mono', monospace"}}>·  ·  ·</span>
      </div>
      <div style={{flex:1, minHeight:0, position:'relative'}}>{children}</div>
    </div>
  );
}
function dot() { return { width:9, height:9, borderRadius:9, border:`1px solid ${WF.muteSoft}` }; }

// ── Placeholder block (with optional diagonal lines, label) ──────────
function WireBox({ h = 80, w = '100%', label, hatch = false, strong = false, style = {} }) {
  const bg = hatch
    ? `repeating-linear-gradient(135deg, ${WF.faint} 0 6px, transparent 6px 12px), ${WF.paper}`
    : WF.paper;
  return (
    <div style={{
      width: w, height: h,
      border: `${strong ? 1.5 : 1}px solid ${strong ? WF.ruleStrong : WF.rule}`,
      background: bg,
      display:'flex', alignItems:'center', justifyContent:'center',
      color: WF.mute, fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase',
      fontFamily: "'JetBrains Mono', monospace",
      ...style,
    }}>
      {label}
    </div>
  );
}

// Placeholder text lines (gray bars at line-height)
function WireLines({ lines = 3, widths, gap = 8, color = WF.rule, height = 6 }) {
  const defaultWidths = ['100%', '94%', '88%', '92%', '76%', '90%', '85%'];
  return (
    <div style={{display:'flex', flexDirection:'column', gap}}>
      {Array.from({length: lines}).map((_, i) => (
        <div key={i} style={{
          width: (widths && widths[i]) || defaultWidths[i % defaultWidths.length],
          height, background: color, borderRadius: 1,
        }}/>
      ))}
    </div>
  );
}

// Thin label tag — uppercase mono
function WireTag({ children, color = WF.ink, bg = 'transparent', border = true }) {
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 9, letterSpacing: 0.8, textTransform: 'uppercase',
      padding: '3px 6px', border: border ? `1px solid ${color}` : 'none',
      background: bg, color, display: 'inline-flex', alignItems: 'center', gap: 4,
      lineHeight: 1,
    }}>{children}</span>
  );
}

// Section divider — heavy CN/EN bilingual rule
function WireSectionHead({ en, cn, num, accent = false }) {
  return (
    <div style={{
      display:'flex', alignItems:'baseline', gap:12,
      borderTop: `2px solid ${accent ? WF.accent : WF.ruleStrong}`,
      paddingTop: 8, marginBottom: 12,
    }}>
      {num && (
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize:10,
          color: accent ? WF.accent : WF.ink, letterSpacing: 0.5,
        }}>{num}</span>
      )}
      <span style={{
        fontFamily:"'Archivo', system-ui, sans-serif",
        fontWeight:800, fontSize:11, letterSpacing:1.4, textTransform:'uppercase',
      }}>{en}</span>
      {cn && (
        <span style={{
          fontFamily:"'Noto Sans SC', system-ui, sans-serif",
          fontSize:11, color:WF.mute, letterSpacing:1,
        }}>{cn}</span>
      )}
    </div>
  );
}

// Outlined button (Swiss style — sharp rect, thick border on active)
function WireBtn({ children, primary = false, size = 'md', accent = false, style = {} }) {
  const sizes = {
    sm: { p:'6px 10px', f:10 },
    md: { p:'9px 14px', f:11 },
    lg: { p:'14px 22px', f:13 },
  }[size];
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:6,
      padding: sizes.p, fontSize: sizes.f,
      fontFamily:"'Archivo', system-ui, sans-serif",
      fontWeight: 700, letterSpacing: 1.2, textTransform:'uppercase',
      border: `1.5px solid ${accent ? WF.accent : WF.ink}`,
      background: primary ? (accent ? WF.accent : WF.ink) : WF.paper,
      color: primary ? WF.paper : (accent ? WF.accent : WF.ink),
      cursor:'pointer', userSelect:'none',
      ...style,
    }}>{children}</span>
  );
}

// Red live dot (pulse purely visual — animated only in main app)
function LiveDot({ size = 8 }) {
  return (
    <span style={{
      display:'inline-block', width:size, height:size, background: WF.accent,
      borderRadius: size, flexShrink: 0,
    }}/>
  );
}

// Avatar-style square for user / agent
function WireAvatar({ kind = 'user', size = 28 }) {
  const isAgent = kind === 'agent';
  return (
    <div style={{
      width:size, height:size, flexShrink:0,
      border:`1.5px solid ${WF.ink}`,
      background: isAgent ? WF.ink : WF.paper,
      color: isAgent ? WF.paper : WF.ink,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:"'Archivo', system-ui, sans-serif", fontWeight:800,
      fontSize: size * 0.4, letterSpacing: 0.5,
    }}>{isAgent ? 'A' : 'U'}</div>
  );
}

// CN heading + EN kicker pair
function WireBilingualHead({ en, cn, size = 'lg' }) {
  const sizes = { sm:{en:11,cn:14}, md:{en:12,cn:18}, lg:{en:13,cn:24}, xl:{en:15,cn:36}, xxl:{en:18,cn:64} }[size];
  return (
    <div>
      <div style={{
        fontFamily:"'Archivo', system-ui, sans-serif",
        fontWeight:800, fontSize:sizes.en, letterSpacing:1.4,
        textTransform:'uppercase', marginBottom:6,
      }}>{en}</div>
      <div style={{
        fontFamily:"'Noto Sans SC', system-ui, sans-serif",
        fontWeight:700, fontSize:sizes.cn, lineHeight: 1.15, letterSpacing:1,
        textWrap: 'pretty',
      }}>{cn}</div>
    </div>
  );
}

// Small inline data point — bold number + caption
function WireMetric({ value, en, cn, accent = false }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:4}}>
      <span style={{
        fontFamily:"'Archivo', system-ui, sans-serif",
        fontWeight: 800, fontSize: 32, lineHeight: 1,
        color: accent ? WF.accent : WF.ink, letterSpacing:-1,
      }}>{value}</span>
      <span style={{
        fontFamily:"'JetBrains Mono', monospace",
        fontSize: 9, letterSpacing: 1, textTransform: 'uppercase',
        color: WF.mute,
      }}>{en} · {cn}</span>
    </div>
  );
}

// Vertical rule with title — used for section labels in margins
function WireSideLabel({ children, color = WF.ink }) {
  return (
    <div style={{
      writingMode:'vertical-rl', transform:'rotate(180deg)',
      fontFamily:"'JetBrains Mono', monospace", fontSize:10,
      letterSpacing: 1, textTransform:'uppercase', color,
    }}>{children}</div>
  );
}

Object.assign(window, {
  WF, WireWindow, WireBox, WireLines, WireTag, WireSectionHead, WireBtn,
  LiveDot, WireAvatar, WireBilingualHead, WireMetric, WireSideLabel,
});
