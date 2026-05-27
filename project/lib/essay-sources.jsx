// Sources — knowledge base / data source management.
// Plus the ExportModal overlay used from the report screen.

const SOURCE_CATEGORIES = [
  { k: 'all',   en: 'All',         cn: '全部',    count: 23 },
  { k: 'db',    en: 'Databases',   cn: '数据库',  count: 4 },
  { k: 'files', en: 'Files & Docs', cn: '文件',   count: 9 },
  { k: 'web',   en: 'Web crawl',   cn: '网络抓取', count: 6 },
  { k: 'api',   en: 'APIs',        cn: 'API',     count: 4 },
];

const SOURCES = [
  {
    name: '乘联会 · 销量月报', en: 'CPCA monthly sales',
    type: 'web', kind: 'WEB · RSS', size: '12.3 MB', docs: 96,
    lastSync: '5月20日 18:02', cadence: 'daily', status: 'ok', quality: 'A',
    note: '官方乘联会数据，按月发布。涵盖乘用车 / 新能源 / 出口三个口径。',
  },
  {
    name: 'IT 桔子 · 一级市场数据库', en: 'IT Juzi · primary market',
    type: 'api', kind: 'API · v3', size: '—', docs: 8400,
    lastSync: '5月21日 09:14', cadence: 'realtime', status: 'ok', quality: 'A',
    note: '融资事件 / 估值 / 投资方关系。仅 Q1-Q2 数据进入此次报告范围。',
  },
  {
    name: '小红书讨论抓取', en: 'Xiaohongshu discussions',
    type: 'web', kind: 'WEB · scraper', size: '4.1 MB', docs: 218,
    lastSync: '5月19日 22:40', cadence: 'weekly', status: 'warn', quality: 'B',
    note: '218 条相关讨论，已自动去重 / 过滤广告。下次抓取建议增加关键词。',
  },
  {
    name: '36 氪报道精选', en: '36Kr articles',
    type: 'web', kind: 'WEB · RSS', size: '8.6 MB', docs: 412,
    lastSync: '5月21日 06:30', cadence: 'daily', status: 'ok', quality: 'A',
  },
  {
    name: '内部销售数据库', en: 'Internal sales DB',
    type: 'db', kind: 'PostgreSQL', size: '1.4 GB', docs: '~ 240k 行',
    lastSync: '5月21日 14:08', cadence: 'realtime', status: 'ok', quality: 'A',
    note: '只读连接。涵盖近 24 个月所有渠道、品类、城市维度的销售数据。',
  },
  {
    name: '客户访谈纪要 (Q1)', en: 'Customer interview transcripts',
    type: 'files', kind: 'FILES · 18 项', size: '3.2 MB', docs: 18,
    lastSync: '5月14日 11:22', cadence: 'manual', status: 'ok', quality: 'A',
    note: '已经过隐私脱敏处理。仅 Atlas 内部可见。',
  },
  {
    name: '团队 Notion 知识库', en: 'Team Notion workspace',
    type: 'api', kind: 'NOTION · workspace', size: '—', docs: 1240,
    lastSync: '5月21日 13:55', cadence: 'realtime', status: 'ok', quality: 'B',
    note: '索引滞后约 15 分钟。',
  },
  {
    name: 'J.D. Power 中国汽车', en: 'J.D. Power China auto',
    type: 'files', kind: 'FILES · PDF', size: '24 MB', docs: 6,
    lastSync: '5月02日 09:10', cadence: 'manual', status: 'stale', quality: 'A',
    note: '上次更新已超过 14 天。建议刷新。',
  },
  {
    name: 'BigQuery · 行为日志', en: 'BigQuery · event log',
    type: 'db', kind: 'BigQuery', size: '83 GB', docs: '~ 84M 事件',
    lastSync: '5月21日 14:08', cadence: 'realtime', status: 'ok', quality: 'A',
  },
  {
    name: '窄门餐眼 · 门店数据', en: 'Zhaimen · stores',
    type: 'api', kind: 'API · v1', size: '—', docs: 4800,
    lastSync: '5月20日 16:40', cadence: 'daily', status: 'ok', quality: 'A',
  },
];

const STATUS_META = {
  ok:    { label: 'IN SYNC',   cn: '同步中',  color: '#2a8c5c' },
  warn:  { label: 'NEEDS ATT', cn: '待处理',  color: '#c2540a' },
  stale: { label: 'STALE',     cn: '已过期',  color: '#9b1c14' },
  off:   { label: 'OFFLINE',   cn: '未连接',  color: '#767368' },
};

const QUALITY_META = {
  A: { label: 'A · 高', color: '#0f0f0f' },
  B: { label: 'B · 中', color: '#767368' },
  C: { label: 'C · 低', color: '#9b1c14' },
};

function Sources({ t }) {
  const [cat, setCat] = React.useState('all');
  const filtered = SOURCES.filter(s => cat === 'all' || s.type === cat);

  // counters
  const total = SOURCES.length;
  const docs = SOURCES.reduce((a, s) => a + (typeof s.docs === 'number' ? s.docs : 0), 0);
  const warn = SOURCES.filter(s => s.status === 'warn' || s.status === 'stale').length;

  return (
    <div style={{
      flex: 1, background: t.paper, color: t.ink,
      display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'auto',
    }}>
      {/* Header */}
      <div style={{
        padding: '32px 36px 20px', borderBottom: `2px solid ${t.ink}`,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32,
      }}>
        <div>
          <Tag t={t} accent>◆ SOURCES · 数据源</Tag>
          <div style={{
            fontFamily: t.fontDisplay, fontWeight: 900,
            fontSize: 56, lineHeight: 0.96, letterSpacing: -1.6, marginTop: 14,
          }}>
            Where the<br/>
            <span style={{ fontFamily: t.fontSerif, fontStyle: 'italic', fontWeight: 500, color: t.accent }}>essays</span> come from.
          </div>
          <div style={{ fontFamily: t.fontCN, fontSize: 15, color: t.mute, marginTop: 10, maxWidth: 480 }}>
            Atlas 接入的数据库、文件库、网络抓取和 API。每次撰写都会自动选择最相关的来源。
          </div>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: 18,
          paddingLeft: 24, borderLeft: `1px solid ${t.rule}`,
        }}>
          <Metric value={total}   en="SOURCES" cn="数据源"   t={t}/>
          <Metric value="14,196" en="DOCS"    cn="文档"     t={t}/>
          <Metric value={warn}   en="ATTN"    cn="待处理"   t={t} accent={warn > 0}/>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{
        padding: '14px 36px', display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: `1px solid ${t.rule}`,
      }}>
        {SOURCE_CATEGORIES.map(c => (
          <button key={c.k}
            type="button"
            onClick={() => setCat(c.k)}
            style={{
              padding: '6px 12px', border: `1px solid ${cat === c.k ? t.ink : t.rule}`,
              background: cat === c.k ? t.ink : 'transparent',
              color: cat === c.k ? t.paper : t.ink,
              fontFamily: t.fontDisplay, fontWeight: 700, fontSize: 10,
              letterSpacing: 1.2, textTransform: 'uppercase', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
            <span>{c.en}</span>
            <span style={{ fontFamily: t.fontCN, opacity: 0.7 }}>{c.cn}</span>
            <span style={{ fontFamily: t.fontMono, fontSize: 9, opacity: 0.7 }}>{c.count}</span>
          </button>
        ))}
        <span style={{ flex: 1 }}/>
        <Btn t={t} size="sm">⟳ SYNC ALL · 全部同步</Btn>
        <Btn t={t} size="sm" primary accent>＋ ADD SOURCE · 添加</Btn>
      </div>

      {/* Table */}
      <div style={{ padding: '0 36px 48px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '48px 1.7fr 110px 1fr 1fr 90px 80px 28px',
          alignItems: 'center', gap: 12,
          padding: '10px 0', borderBottom: `1.5px solid ${t.ink}`,
          fontFamily: t.fontMono, fontSize: 9, letterSpacing: 1.2, color: t.mute, textTransform: 'uppercase',
        }}>
          <span>—</span>
          <span>Source · 名称</span>
          <span>Kind · 类型</span>
          <span>Last sync · 上次同步</span>
          <span>Status · 状态</span>
          <span>Quality</span>
          <span>Docs</span>
          <span/>
        </div>
        {filtered.map((s, i) => (
          <SourceRow key={s.name} src={s} t={t} index={i}/>
        ))}
      </div>
    </div>
  );
}

function SourceRow({ src, t, index }) {
  const [open, setOpen] = React.useState(false);
  const status = STATUS_META[src.status] || STATUS_META.off;
  const quality = QUALITY_META[src.quality] || QUALITY_META.B;
  return (
    <div style={{ borderBottom: `1px solid ${t.rule}` }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'grid',
          gridTemplateColumns: '48px 1.7fr 110px 1fr 1fr 90px 80px 28px',
          alignItems: 'center', gap: 12,
          padding: '14px 0', cursor: 'pointer',
        }}
        onMouseEnter={e => e.currentTarget.style.background = t.faint}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <SourceIcon t={t} kind={src.type}/>
        <div>
          <div style={{ fontFamily: t.fontCN, fontSize: 14, fontWeight: 600 }}>{src.name}</div>
          <div style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, marginTop: 2 }}>{src.en}</div>
        </div>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.ink, letterSpacing: 0.5 }}>{src.kind}</span>
        <span style={{ fontFamily: t.fontMono, fontSize: 11, color: t.ink }}>
          {src.lastSync}
          <span style={{ display: 'block', fontSize: 9, color: t.mute, marginTop: 2 }}>{src.cadence}</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 8, background: status.color }}/>
          <span style={{ fontFamily: t.fontMono, fontSize: 10, color: t.ink, letterSpacing: 1 }}>{status.label}</span>
        </span>
        <span style={{ fontFamily: t.fontMono, fontSize: 10, color: quality.color, letterSpacing: 1, fontWeight: 700 }}>
          {quality.label}
        </span>
        <span style={{ fontFamily: t.fontMono, fontSize: 11, color: t.ink }}>{src.docs}</span>
        <span style={{ fontFamily: t.fontMono, fontSize: 12, color: t.mute, transition: 'transform 0.15s', transform: `rotate(${open ? 90 : 0}deg)` }}>›</span>
      </div>
      {open && (
        <div style={{
          padding: '14px 0 22px 60px', display: 'flex', flexDirection: 'column', gap: 10,
          borderTop: `1px dashed ${t.rule}`, background: t.paperAlt,
        }}>
          {src.note && (
            <div style={{ fontFamily: t.fontCN, fontSize: 13, lineHeight: 1.6, color: t.inkSoft, maxWidth: 720 }}>
              {src.note}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Btn t={t} size="sm">⟳ Sync now</Btn>
            <Btn t={t} size="sm">View 18 references</Btn>
            <Btn t={t} size="sm">Edit access</Btn>
            <Btn t={t} size="sm" accent>Disconnect</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function SourceIcon({ t, kind }) {
  const map = {
    web:   { symbol: '◐', label: 'W' },
    api:   { symbol: '⌖', label: 'A' },
    db:    { symbol: '▦', label: 'D' },
    files: { symbol: '◇', label: 'F' },
  };
  const m = map[kind] || map.files;
  return (
    <div style={{
      width: 32, height: 32, border: `1.5px solid ${t.ink}`, background: t.cardOn,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: t.fontDisplay, fontWeight: 800, fontSize: 14, color: t.ink,
    }}>{m.symbol}</div>
  );
}

// ─── Export modal ─────────────────────────────────────────────────────

const EXPORT_FORMATS = [
  { k: 'pdf',    en: 'PDF',     cn: '便于打印 / 邮件附件', size: '~ 480 KB · 8 页', recommended: true },
  { k: 'docx',   en: 'DOCX',    cn: '继续在 Word 编辑',    size: '~ 320 KB' },
  { k: 'md',     en: 'Markdown', cn: '纯文本，含元数据',    size: '~ 18 KB' },
  { k: 'notion', en: 'NOTION',  cn: '导出到你的 Notion',   size: '页面' },
  { k: 'link',   en: 'LINK',    cn: '生成可分享的网页',    size: '可设置过期 / 密码' },
];

function ExportModal({ t, onClose }) {
  const [format, setFormat] = React.useState('pdf');
  const [includeMarginalia, setIncludeMarginalia] = React.useState(true);
  const [includeCover, setIncludeCover] = React.useState(true);
  const [pageSize, setPageSize] = React.useState('A4');
  const [linkScope, setLinkScope] = React.useState('team');

  const selected = EXPORT_FORMATS.find(f => f.k === format);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(15,15,15,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 40,
    }}
      onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 880, maxHeight: '100%',
          background: t.paper, border: `1.5px solid ${t.ink}`,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
        {/* Header */}
        <div style={{
          padding: '16px 22px', borderBottom: `1.5px solid ${t.ink}`, display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <Tag t={t} accent>◆ EXPORT · 导出 / 分享</Tag>
          <span style={{ fontFamily: t.fontDisplay, fontWeight: 800, fontSize: 16, letterSpacing: 0.5 }}>
            Issue № {REPORT_META.issue}
          </span>
          <span style={{ flex: 1 }}/>
          <button type="button" onClick={onClose} style={{
            border: `1px solid ${t.ink}`, background: t.paper, padding: '4px 9px',
            fontFamily: t.fontMono, fontSize: 11, cursor: 'pointer',
          }}>ESC</button>
        </div>
        {/* Body */}
        <div style={{
          flex: 1, minHeight: 0, display: 'grid',
          gridTemplateColumns: '260px 1fr 240px',
        }}>
          {/* Format list */}
          <div style={{ borderRight: `1px solid ${t.rule}`, padding: '14px 0' }}>
            <div style={{ padding: '0 18px 6px', fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1.4 }}>FORMAT · 格式</div>
            {EXPORT_FORMATS.map(f => (
              <button key={f.k}
                type="button"
                onClick={() => setFormat(f.k)}
                style={{
                  display: 'block', textAlign: 'left', background: format === f.k ? t.faint : 'transparent',
                  borderLeft: format === f.k ? `3px solid ${t.accent}` : `3px solid transparent`,
                  border: 'none', padding: '10px 18px', width: '100%', cursor: 'pointer',
                  fontFamily: t.fontBody,
                }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{
                    fontFamily: t.fontDisplay, fontWeight: 800, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase',
                  }}>{f.en}</span>
                  {f.recommended && <Tag t={t} accent>推荐</Tag>}
                </div>
                <div style={{ fontFamily: t.fontCN, fontSize: 12, color: t.inkSoft, marginTop: 2 }}>{f.cn}</div>
                <div style={{ fontFamily: t.fontMono, fontSize: 10, color: t.mute, marginTop: 2 }}>{f.size}</div>
              </button>
            ))}
          </div>

          {/* Options */}
          <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'auto' }}>
            <div style={{
              fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1.4,
              borderBottom: `1px solid ${t.rule}`, paddingBottom: 6,
            }}>OPTIONS · 选项</div>

            <OptionToggle t={t} label="包含杂志封面 (Cover sheet)" value={includeCover} onChange={setIncludeCover}/>
            <OptionToggle t={t} label="包含边注与流程 (Marginalia + ledger)" value={includeMarginalia} onChange={setIncludeMarginalia}/>

            {format === 'pdf' && (
              <OptionRadio t={t} label="纸张大小" value={pageSize} onChange={setPageSize}
                options={[['A4','A4'],['LET','Letter'],['B5','B5']]}/>
            )}

            {format === 'link' && (
              <>
                <OptionRadio t={t} label="访问范围" value={linkScope} onChange={setLinkScope}
                  options={[['team','团队内'],['link','凡有链接者'],['pwd','需要密码']]}/>
                <OptionToggle t={t} label="允许追问 (let viewers ask follow-ups)" value={true}/>
                <OptionToggle t={t} label="显示阅读热度 (analytics)" value={false}/>
              </>
            )}

            <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: `1px solid ${t.rule}`, display: 'flex', gap: 8 }}>
              <span style={{ flex: 1 }}/>
              <Btn t={t} size="md" onClick={onClose}>取消 · Cancel</Btn>
              <Btn t={t} size="md" primary accent>
                {format === 'link' ? '生成链接 ↗' : `下载 ${selected.en} ↓`}
              </Btn>
            </div>
          </div>

          {/* Preview */}
          <div style={{ background: t.paperAlt, padding: '18px', borderLeft: `1px solid ${t.rule}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute, letterSpacing: 1.4 }}>PREVIEW · 预览</div>
            <div style={{
              flex: 1, background: '#fff', border: `1px solid ${t.ink}`,
              boxShadow: `4px 4px 0 ${t.ink}`,
              padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 6,
              fontFamily: t.fontDisplay,
            }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.4, color: '#0f0f0f' }}>ISSUE № 241</div>
              <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 0.95, letterSpacing: -0.5, color: '#0f0f0f' }}>Cold brew,<br/>hotter capital.</div>
              <div style={{ fontFamily: t.fontCN, fontSize: 9, lineHeight: 1.3, color: '#0f0f0f' }}>2025 Q1 咖啡赛道融资速记</div>
              <div style={{ height: 1, background: '#0f0f0f', margin: '4px 0' }}/>
              <div style={{ background: '#f0eee9', height: 10 }}/>
              <div style={{ background: '#f0eee9', height: 5, width: '70%' }}/>
              <div style={{ background: '#f0eee9', height: 5, width: '90%' }}/>
              <div style={{ background: '#f0eee9', height: 5, width: '60%' }}/>
              {includeMarginalia && <div style={{ fontFamily: 'JetBrains Mono', fontSize: 6, color: '#767368', marginTop: 4 }}>§ marginalia included</div>}
            </div>
            <div style={{ fontFamily: t.fontMono, fontSize: 9, color: t.mute }}>
              {format === 'pdf' && `${pageSize} · 8 页 · ~480 KB`}
              {format === 'docx' && '8 页 · ~320 KB'}
              {format === 'md' && '~ 18 KB · UTF-8'}
              {format === 'notion' && 'atlas-team.notion.so'}
              {format === 'link' && 'atlas.app/r/r-7841 · expires in 30d'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionToggle({ t, label, value, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: onChange ? 'pointer' : 'default' }}>
      <span style={{
        width: 36, height: 20, border: `1.5px solid ${t.ink}`,
        background: value ? t.ink : t.paper, position: 'relative', flexShrink: 0,
      }}>
        <span style={{
          position: 'absolute', top: 1, left: value ? 17 : 1,
          width: 14, height: 14, background: value ? t.paper : t.ink, transition: 'left 0.12s',
        }}/>
      </span>
      <span style={{ fontFamily: t.fontCN, fontSize: 13, color: t.ink, flex: 1 }}>{label}</span>
      <input type="checkbox" checked={value} onChange={onChange ? (e => onChange(e.target.checked)) : undefined}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}/>
    </label>
  );
}

function OptionRadio({ t, label, value, onChange, options }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontFamily: t.fontCN, fontSize: 13, color: t.ink, flex: 1 }}>{label}</span>
      <div style={{ display: 'flex', border: `1.5px solid ${t.ink}` }}>
        {options.map(([k, l], i) => (
          <button key={k}
            type="button"
            onClick={() => onChange(k)}
            style={{
              padding: '5px 10px', border: 'none',
              borderLeft: i === 0 ? 'none' : `1px solid ${t.ink}`,
              background: value === k ? t.ink : t.paper,
              color: value === k ? t.paper : t.ink,
              fontFamily: t.fontMono, fontSize: 10, letterSpacing: 1, cursor: 'pointer',
            }}>{l}</button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Sources, ExportModal, SOURCES, SOURCE_CATEGORIES });
