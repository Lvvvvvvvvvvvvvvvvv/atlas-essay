// Root app — route state + Tweaks integration.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "red",
  "theme": "cream",
  "density": "editorial",
  "marginalia": true,
  "headerLarge": true
}/*EDITMODE-END*/;

const FOOTER_CONTEXT = {
  home:    { page: '01', section: 'COVER · 封面' },
  running: { page: '02', section: 'IN PROGRESS · 撰写中' },
  report:  { page: '03', section: 'FEATURE · 正文' },
  library: { page: '04', section: 'ARCHIVE · 报告库' },
  sources: { page: '05', section: 'SOURCES · 数据源' },
};

const SAMPLE_FIRST_PROMPT = '梳理 2025 年 Q1 国内咖啡赛道的融资动态，重点说说 Manner、库迪和挪瓦的新动向，给一份 2000 字的内部分析。';

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const t = essayTokens({ theme: tweaks.theme, accent: tweaks.accent });

  const [route, setRoute] = React.useState('home');
  const [prompt, setPrompt] = React.useState(SAMPLE_FIRST_PROMPT);
  const [showExport, setShowExport] = React.useState(false);
  const [runKey, setRunKey] = React.useState(0); // remounts Running to restart
  const [runDone, setRunDone] = React.useState(false);

  const goRun = () => { setRunKey(k => k + 1); setRunDone(false); setRoute('running'); };

  const footer = FOOTER_CONTEXT[route] || FOOTER_CONTEXT.home;

  // Map tweak accent (named) → hex (already keyed in essayTokens)
  const accentSwatches = [
    { v: 'red',    swatch: '#e5251d', label: 'Red' },
    { v: 'amber',  swatch: '#c2540a', label: 'Amber' },
    { v: 'forest', swatch: '#1f6f44', label: 'Sage' },
    { v: 'cobalt', swatch: '#1d4ed8', label: 'Blue' },
  ];

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: t.paper, color: t.ink,
    }}>
      <TopBar t={t} route={route} setRoute={setRoute}
        runState={route === 'running' && !runDone ? 'running' : 'idle'}/>
      <main style={{ flex: 1, minHeight: 0, display: 'flex', position: 'relative' }}>
        {route === 'home' && (
          <Home t={t} prompt={prompt} setPrompt={setPrompt}
            onStart={goRun} density={tweaks.density}/>
        )}
        {route === 'running' && (
          <Running key={runKey} t={t} prompt={prompt}
            onDone={() => setRoute('report')}
            onTimelineComplete={() => setRunDone(true)}
            marginaliaOn={tweaks.marginalia} density={tweaks.density}/>
        )}
        {route === 'report' && (
          <Report t={t} onExport={() => setShowExport(true)}
            marginaliaOn={tweaks.marginalia} density={tweaks.density}/>
        )}
        {route === 'library' && (
          <Library t={t} onOpen={() => setRoute('report')}/>
        )}
        {route === 'sources' && <Sources t={t}/>}
        {showExport && <ExportModal t={t} onClose={() => setShowExport(false)}/>}
      </main>
      <IssueFooter t={t} page={footer.page} section={footer.section}/>

      <TweaksPanel title="Tweaks · 微调">
        <TweakSection label="Color · 颜色">
          <div style={{ padding: '4px 0' }}>
            <SwatchPicker t={t} label="Accent · 主色"
              value={tweaks.accent}
              options={accentSwatches}
              onChange={v => setTweak('accent', v)}/>
          </div>
          <TweakRadio label="Theme · 主题" value={tweaks.theme}
            options={[
              { value: 'cream', label: 'Cream' },
              { value: 'slate', label: 'Slate' },
            ]}
            onChange={v => setTweak('theme', v)}/>
        </TweakSection>

        <TweakSection label="Density · 密度">
          <TweakRadio label="Type scale" value={tweaks.density}
            options={[
              { value: 'editorial', label: 'Editorial' },
              { value: 'compact',   label: 'Compact' },
            ]}
            onChange={v => setTweak('density', v)}/>
          <TweakToggle label="Marginalia · 边注列" value={tweaks.marginalia}
            onChange={v => setTweak('marginalia', v)}/>
        </TweakSection>

        <TweakSection label="Demo · 跳转">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: '4px 0' }}>
            <DemoBtn onClick={() => setRoute('home')}>① Home 主页</DemoBtn>
            <DemoBtn onClick={goRun}>② Running 运行</DemoBtn>
            <DemoBtn onClick={() => setRoute('report')}>③ Report 报告</DemoBtn>
            <DemoBtn onClick={() => setRoute('library')}>④ Library 库</DemoBtn>
            <DemoBtn onClick={() => setRoute('sources')}>⑤ Sources 数据源</DemoBtn>
            <DemoBtn onClick={() => setShowExport(true)}>⑥ Export 导出</DemoBtn>
          </div>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

// Custom swatch picker (TweakColor wants hex options but I'm keying by name)
function SwatchPicker({ t, label, value, options, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0' }}>
      <div style={{
        fontSize: 11, color: '#555', letterSpacing: 0.3, fontFamily: 'inherit',
      }}>{label}</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {options.map(o => (
          <button key={o.v} type="button" onClick={() => onChange(o.v)}
            title={o.label}
            style={{
              width: 32, height: 32, border: value === o.v ? '2px solid #111' : '1px solid #ccc',
              background: o.swatch, cursor: 'pointer', padding: 0,
              boxShadow: value === o.v ? '0 0 0 2px #fff inset' : 'none',
            }}/>
        ))}
      </div>
    </div>
  );
}

function DemoBtn({ children, onClick }) {
  return (
    <button type="button" onClick={onClick}
      style={{
        padding: '7px 8px', fontSize: 11, fontFamily: 'inherit',
        border: '1px solid #d4d4d4', background: '#fff', color: '#111',
        cursor: 'pointer', textAlign: 'left',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
      onMouseLeave={e => e.currentTarget.style.background = '#fff'}>{children}</button>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
