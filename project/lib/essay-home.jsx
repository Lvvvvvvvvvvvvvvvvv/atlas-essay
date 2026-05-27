// Home — magazine cover + working prompt input. The first thing users see.

const SAMPLE_PROMPTS = [
  '梳理 2025 年 Q1 国内咖啡赛道的融资动态，重点说说 Manner、库迪和挪瓦的新动向，给一份 2000 字的内部分析。',
  '用过去三个季度的销售数据，分析华南区不同品类的增长情况，输出 1,500 字的内部分析报告。',
  '帮我写一份关于"远程办公对一线城市租房市场影响"的研究报告，要有数据支撑。',
  '把这周团队的进展整理成一份周报，重点突出新启动的客户合作项目。',
];

const STARTERS = [
  {
    num: 'I.',
    en: 'Industry Scan',
    cn: '调研一个我没听过的赛道',
    sub: '我先扫一圈公开报道、社群讨论和融资数据，输出洞察。',
    minutes: '8-12 min',
    tag: 'RESEARCH',
    prompt: '帮我调研「家用清洁机器人」这个赛道：玩家、价格带、用户怎么说，给出一份内部速记。',
  },
  {
    num: 'II.',
    en: 'Data Analysis',
    cn: '把这堆数据读懂',
    sub: '上传或连接表格，我做清洗、聚类和洞察，附图。',
    minutes: '5-8 min',
    tag: 'DATA',
    prompt: '附件是过去四个季度的门店销售数据，请按城市等级分群分析增长情况，输出 1,200 字。',
  },
  {
    num: 'III.',
    en: 'Weekly Brief',
    cn: '给老板写一份 10 分钟读完的周报',
    sub: '我会自动整理上周日程、文档和项目进展。',
    minutes: '2-4 min',
    tag: 'INTERNAL',
    prompt: '帮我写上周的工作周报，重点说三件事：客户 A 的合作进展、上线的两个功能、本周遇到的问题。',
  },
  {
    num: 'IV.',
    en: 'Competitor Teardown',
    cn: '拆一拆这个对手',
    sub: '产品、定价、增长、舆情，四个角度做对比。',
    minutes: '10-15 min',
    tag: 'RESEARCH',
    prompt: '把 Notion AI 和 ChatGPT for Teams 拆一下对比，从产品功能、定价、用户口碑、增长四方面，输出 2,000 字。',
  },
];

function Home({ t, prompt, setPrompt, onStart, density = 'editorial' }) {
  const editorial = density === 'editorial';
  const headSize = editorial ? 'xxl' : 'xl';

  return (
    <div style={{
      flex: 1, background: t.paper, color: t.ink,
      display: 'grid', gridTemplateColumns: '64px 1fr', minHeight: 0, overflow: 'auto',
    }}>
      {/* Left thin rail — vertical metadata */}
      <div style={{
        borderRight: `1px solid ${t.ink}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
        padding: '28px 0', minHeight: 0,
      }}>
        <span style={{
          fontFamily: t.fontMono, fontSize: 10, letterSpacing: 2,
          writingMode: 'vertical-rl', transform: 'rotate(180deg)',
          color: t.ink,
        }}>VOL. 04 · № 241</span>
        <span style={{
          fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.8, color: t.mute,
          writingMode: 'vertical-rl', transform: 'rotate(180deg)',
        }}>报告智能体 · ATLAS</span>
      </div>

      {/* Cover area */}
      <div style={{
        padding: editorial ? '48px 72px 32px' : '32px 56px 28px',
        display: 'flex', flexDirection: 'column', gap: editorial ? 36 : 24, minHeight: 0,
      }}>
        {/* Kicker row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Tag t={t} accent>◆ THE COVER STORY · 封面故事</Tag>
          <span style={{ flex: 1, height: 1, background: t.ink }}/>
          <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, letterSpacing: 1.2 }}>5月21日 · THU</span>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <BilingualHead t={t} size={headSize}
            en="Tell Atlas what to write."
            cn={<>今天写点什么<span style={{ color: t.accent }}>报告</span>？</>}
          />
          <div style={{
            fontFamily: t.fontSerif, fontStyle: 'italic', fontWeight: 400,
            fontSize: editorial ? 26 : 22, lineHeight: 1.35, color: t.mute,
            letterSpacing: -0.3, maxWidth: 720,
          }}>
            An essay engine. Drop a brief, get back a piece you can actually file.
          </div>
        </div>

        {/* Prompt input */}
        <PromptComposer t={t} prompt={prompt} setPrompt={setPrompt} onStart={onStart}/>

        {/* Editor's note callout */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 18, padding: '12px 16px',
          border: `1px solid ${t.ink}`, background: t.cardOn,
        }}>
          <Tag t={t} accent>EDITOR'S NOTE · 编者按</Tag>
          <span style={{ fontFamily: t.fontCN, fontSize: 13, lineHeight: 1.55, color: t.inkSoft, flex: 1 }}>
            这一期，我学会了更好地引用脚注。写完后告诉我“再细一些”，我会重写。
          </span>
          <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, whiteSpace: 'nowrap' }}>— ATLAS v0.41</span>
        </div>

        {/* Starters grid */}
        <div>
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14,
            borderTop: `1px solid ${t.ink}`, paddingTop: 12,
          }}>
            <span style={{ fontFamily: t.fontDisplay, fontWeight: 800, fontSize: 12, letterSpacing: 1.6, textTransform: 'uppercase' }}>
              Or pick a starter
            </span>
            <span style={{ fontFamily: t.fontCN, fontSize: 12, color: t.mute }}>从模板开始</span>
            <span style={{ flex: 1, height: 1, background: t.rule }}/>
            <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>0{STARTERS.length} entries</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
            borderTop: `1px solid ${t.rule}`, borderLeft: `1px solid ${t.rule}`,
          }}>
            {STARTERS.map((s, i) => (
              <button key={s.num}
                type="button"
                onClick={() => setPrompt(s.prompt)}
                style={{
                  borderRight: `1px solid ${t.rule}`, borderBottom: `1px solid ${t.rule}`,
                  background: t.paper, padding: '18px 22px', textAlign: 'left',
                  display: 'flex', flexDirection: 'column', gap: 6, cursor: 'pointer',
                  fontFamily: t.fontBody, color: t.ink,
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = t.faint}
                onMouseLeave={e => e.currentTarget.style.background = t.paper}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{
                    fontFamily: t.fontSerif, fontStyle: 'italic', fontWeight: 600,
                    fontSize: 22, color: t.accent, letterSpacing: -0.5, lineHeight: 1,
                  }}>{s.num}</span>
                  <Tag t={t}>{s.tag}</Tag>
                </div>
                <div style={{ fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  {s.en}
                </div>
                <div style={{ fontFamily: t.fontCN, fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>{s.cn}</div>
                <div style={{ fontFamily: t.fontCN, fontSize: 12, color: t.mute, lineHeight: 1.5 }}>{s.sub}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1 }}>{s.minutes}</span>
                  <span style={{ flex: 1 }}/>
                  <span style={{ fontFamily: t.fontMono, fontSize: 11, color: t.ink }}>↗</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PromptComposer({ t, prompt, setPrompt, onStart }) {
  const charCount = prompt.length;
  const placeholder = '比如，"梳理一下 2025 年 Q1 咖啡赛道的融资动态…"';
  const taRef = React.useRef(null);

  // auto-grow
  React.useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = 'auto';
      taRef.current.style.height = Math.max(96, taRef.current.scrollHeight) + 'px';
    }
  }, [prompt]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && prompt.trim()) {
      e.preventDefault();
      onStart();
    }
  };

  return (
    <div style={{
      border: `1.5px solid ${t.ink}`, background: t.cardOn,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        padding: '10px 14px', borderBottom: `1px solid ${t.rule}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Tag t={t} filled>PROMPT</Tag>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, letterSpacing: 0.5 }}>describe the report</span>
        <span style={{ flex: 1 }}/>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>{charCount} / 4000</span>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute }}>⌘ ↩ to send</span>
      </div>
      <textarea
        ref={taRef}
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          padding: '18px 22px', minHeight: 96, fontFamily: t.fontCN, fontSize: 16,
          lineHeight: 1.55, color: t.ink, background: 'transparent',
          border: 'none', outline: 'none', resize: 'none', width: '100%', boxSizing: 'border-box',
        }}
      />
      <div style={{
        padding: '12px 14px', borderTop: `1px solid ${t.rule}`,
        display: 'flex', alignItems: 'center', gap: 8, background: t.paperAlt,
        flexWrap: 'wrap',
      }}>
        <Tag t={t}>＋ 数据源 (3)</Tag>
        <Tag t={t}>＋ 附件</Tag>
        <Tag t={t}>语气 · 分析</Tag>
        <Tag t={t}>长度 · 2,500 字</Tag>
        <span style={{ flex: 1 }}/>
        <Btn t={t} size="sm"
          onClick={() => setPrompt(SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)])}>
          ✦ Surprise me
        </Btn>
        <Btn t={t} primary accent size="md" onClick={onStart} disabled={!prompt.trim()}>
          Start writing ↗
        </Btn>
      </div>
    </div>
  );
}

Object.assign(window, { Home, PromptComposer, SAMPLE_PROMPTS, STARTERS });
