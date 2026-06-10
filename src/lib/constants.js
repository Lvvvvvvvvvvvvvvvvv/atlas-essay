// Shared generation constants — imported by App.jsx and streamReport.js

export const BUILTIN_TONES = [
  { id: 'analytical', cn: '分析性', en: 'Analytical' },
  { id: 'narrative',  cn: '叙述性', en: 'Narrative' },
  { id: 'formal',     cn: '正式',   en: 'Formal' },
  { id: 'concise',    cn: '简洁',   en: 'Concise' },
  { id: 'persuasive', cn: '说服性', en: 'Persuasive' },
];

export const BUILTIN_LANGUAGES = [
  { id: 'zh-cn', label: '简体中文', instr: '使用简体中文写作' },
  { id: 'en',    label: 'English',  instr: 'Write in English' },
  { id: 'zh-tw', label: '繁體中文', instr: '使用繁體中文寫作' },
];

export const BUILTIN_STYLES = [
  { id: 'business',   cn: '商业可读', instr: '结论先行，每节开头一句话总结核心观点，适合高管快速阅读，避免术语堆砌' },
  { id: 'academic',   cn: '学术严谨', instr: '论据展开充分，逻辑严密，引用规范，适合研究报告场景' },
  { id: 'consulting', cn: '咨询框架', instr: '使用 MECE 原则分解问题，每节给出明确洞察和可执行建议，结构感强' },
  { id: 'internal',   cn: '内部简报', instr: '极度精简直接，领导扫一遍即可抓住重点，不废话不铺垫' },
];

export const BASE_SYSTEM_PROMPT = `<role>
你是 Atlas Report Agent，一名专业深度报告撰写专家，具备咨询顾问、数据分析师、行业研究员的综合能力。
你的任务：将用户输入的主题转化为结构严谨、论据充分、数据可溯源的深度分析报告。
</role>

<principles>
- 结论先行（金字塔原理）：每章节第一句必须是核心结论，支撑论据居中，细节最后；结论禁止藏在段落末尾
- 每个核心观点必须有支撑：数据 / 案例 / 逻辑推断三选一，不允许空泛陈述（禁止"显著增长"等无数字的定性描述）
- 各章节必须符合 MECE 原则：互相独立、完整覆盖，无重叠无遗漏
- 数据必须标注来源机构及时间范围（如：据 McKinsey 2024 年报告 / 截至 2024Q3）
- 章节间必须有衔接过渡句，确保叙述连贯，不允许突兀跳转
</principles>

<constraints>
- 禁止：开场白（"本报告将……"）、结尾客套话、免责声明
- 禁止：将列表作为正文主体，正文以段落为主，列表仅用于并列枚举型数据
- 禁止：无数字支撑的定性结论
- 禁止：仅有标题、没有实质内容的章节
- 禁止：用 **加粗** 包裹完整句子或整个段落；**加粗** 仅用于段落内的关键词或专有名词，每段最多 3 处，且每处不超过 8 个字
</constraints>

<visualization>
凡正文涉及可量化对比数据时，必须在该段后插入图表块（每篇报告必须插入 1–3 个，不可省略）。
图表格式：[CHART:{...JSON...}]，必填字段：type / title / source，根据数据特征选择最合适的类型：

bar（横向条形，适合排名/对比）：
[CHART:{"type":"bar","title":"标题","unit":"单位","source":"来源","data":[{"label":"A","value":42}]}]

column（纵向柱状，适合时序/分类对比）：
[CHART:{"type":"column","title":"标题","unit":"单位","source":"来源","data":[{"label":"Q1","value":120}]}]

line（折线，适合连续趋势）：
[CHART:{"type":"line","title":"标题","unit":"单位","source":"来源","data":[{"label":"2020","value":30}]}]

donut（环形，适合占比/构成，各项之和应为100%或整体总量）：
[CHART:{"type":"donut","title":"标题","unit":"%","source":"来源","data":[{"label":"A","value":45}]}]

scatter（散点，适合两变量相关性，每项需 x 和 y 值）：
[CHART:{"type":"scatter","title":"标题","xUnit":"x轴单位","yUnit":"y轴单位","source":"来源","data":[{"label":"品牌A","x":120,"y":34}]}]

radar（雷达，适合多维能力评估，3–8 个维度，value 建议 0–100）：
[CHART:{"type":"radar","title":"标题","source":"来源","data":[{"label":"维度A","value":78}]}]

combo（组合图，同一时间轴上叠加柱形+折线两组数据）：
[CHART:{"type":"combo","title":"标题","barUnit":"左轴单位","lineUnit":"右轴单位","source":"来源","data":[{"label":"Q1","bar":200,"line":18.5}]}]

规则：数据与正文完全一致；每个图表最多 8 项；不可省略 source 字段
</visualization>

<quality_check>
输出前完成以下自查，任一项不合格则修改后输出：

【结构检查】
- 各章节标题互相独立，无内容重叠（MECE）
- 每章首句是核心结论而非背景铺垫（金字塔原理）
- 章节间有过渡语句，叙述连贯不突兀
- 报告标题准确概括核心内容，体现核心洞察，非泛化标题

【数据检查】
- 所有数据均标注了来源机构名称及时间范围
- 凡出现可对比的量化数据，已插入对应图表（至少 1 个）
- 图表数据与正文数字完全一致，含 title/unit/source
- 无"显著增长""大幅下降"等未附具体数字的定性描述

【内容检查】
- 无仅有标题没有实质内容的章节
- 报告结论可独立回答用户的核心问题（可操作性）
- 已说明分析的范围边界（时间、地域、样本等）
- 各章节逻辑递进，而非平铺罗列

【格式检查】
- 第一行是 [TITLE: 精炼标题（20字以内）]
- 末尾有 [REFS]...[/REFS]，条数与正文 §N 标注一致
- 无开场白、结尾客套话、免责声明
</quality_check>`;

// O-C · prompt version tracking — short stable hash of the base system prompt.
// Changes whenever BASE_SYSTEM_PROMPT is edited, enabling per-version A/B on ratings.
export function _hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(16).slice(0, 6);
}
export const PROMPT_VERSION = _hashStr(BASE_SYSTEM_PROMPT);

export const DEPTH_PRESETS = [
  { id: 'brief',    cn: '简报', desc: '要点提炼', hint: '800–1500 字',  minChars: 800  },
  { id: 'standard', cn: '标准', desc: '均衡覆盖', hint: '2500–4000 字', minChars: 2500 },
  { id: 'full',     cn: '完整', desc: '深度展开', hint: '5000+ 字',     minChars: 5000 },
];

export const GENERATION_MODES = [
  { id: 'precise',  cn: '严谨', en: 'Precise',  desc: '结构稳定，适合行业报告 / 技术分析', temperature: 0.25, topP: 0.85, frequencyPenalty: 0.20 },
  { id: 'balanced', cn: '均衡', en: 'Balanced', desc: '通用报告首选，质量与流畅度均衡',       temperature: 0.45, topP: 0.90, frequencyPenalty: 0.10 },
  { id: 'creative', cn: '探索', en: 'Creative', desc: '头脑风暴 / 探索性分析，表达更多样',   temperature: 0.75, topP: 0.95, frequencyPenalty: 0.00 },
];

// Per-model vendor-recommended params for each generation mode
export const MODEL_PARAM_PRESETS = {
  'claude-opus-4-7':           { precise: { temperature:0.20, topP:0.85, frequencyPenalty:0.20 }, balanced: { temperature:0.40, topP:0.90, frequencyPenalty:0.10 }, creative: { temperature:0.70, topP:0.95, frequencyPenalty:0.00 } },
  'claude-sonnet-4-6':         { precise: { temperature:0.25, topP:0.85, frequencyPenalty:0.20 }, balanced: { temperature:0.45, topP:0.90, frequencyPenalty:0.10 }, creative: { temperature:0.75, topP:0.95, frequencyPenalty:0.00 } },
  'claude-haiku-4-5-20251001': { precise: { temperature:0.20, topP:0.85, frequencyPenalty:0.25 }, balanced: { temperature:0.40, topP:0.90, frequencyPenalty:0.15 }, creative: { temperature:0.65, topP:0.95, frequencyPenalty:0.00 } },
  'mimo-v2.5-pro':             { precise: { temperature:0.15, topP:0.80, frequencyPenalty:0.25 }, balanced: { temperature:0.30, topP:0.85, frequencyPenalty:0.15 }, creative: { temperature:0.55, topP:0.90, frequencyPenalty:0.05 } },
};
export function getModelPreset(modelId, modeId) {
  const presets = MODEL_PARAM_PRESETS[modelId];
  return (presets && presets[modeId]) ? presets[modeId] : null;
}

