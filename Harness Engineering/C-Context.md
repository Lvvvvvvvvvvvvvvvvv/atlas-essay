# C · Context（上下文层）· P0

> 模型能看到什么，决定了它能写出什么。

**优先级：P0** — 对输出质量影响最大，且在纯客户端架构下完全可实现，无需后端。

---

## 当前状态

```
用户输入 topic
    ↓
直接拼接到 prompt（+ 可选数据源 URL 文本）
    ↓
发送给模型
```

- 无 system prompt
- 无结构约束（模型自由发挥格式）
- 数据源以原始 URL 文本附加，模型无法实际访问
- 无 few-shot 示例
- 无 topic 预处理（用户输入什么就发什么）

---

## Gap 分析

| 问题 | 现象 | 影响 |
|------|------|------|
| 无 system prompt | 报告格式、语气、深度随模型默认行为漂移 | 高 |
| 无结构模板 | 不同 topic 产出结构不一致 | 高 |
| 数据源注入无效 | URL 文本不等于内容，模型只能猜测 | 中 |
| 无 topic 扩展 | 用户输入"AI"→模型不知道要写什么维度 | 中 |
| 无语言/风格约束 | 中英混杂、格式随机 | 低 |

---

## 方案框架：三区域 Context 架构

每次生成的完整 context 由三个区域构成，职责分离，独立维护：

```
┌─────────────────────────────────────────┐
│  区域一：System Prompt（固定约束层）      │
│  角色定义 / 输出格式 / 语言风格 / 长度    │
│  — 写死，用户不感知，每次生成不变         │
├─────────────────────────────────────────┤
│  区域二：Template（结构模板层）           │
│  报告章节框架 / 每节写作要求              │
│  — 按模板类型切换，模型按框架填充而非自由写│
├─────────────────────────────────────────┤
│  区域三：Dynamic Context（动态注入层）    │
│  数据源内容摘要 / 生成时间 / 用户 topic  │
│  — 每次生成动态构建                      │
└─────────────────────────────────────────┘
```

### 区域一：System Prompt

约束模型的基础行为，与 topic 无关，每次生成不变。

- 角色定位（你是谁，在做什么）
- 输出格式约束（Markdown 结构、标题层级、禁止行为）
- 语言与风格（中文/英文、客观/分析性语气）
- 质量基线（最少章节数、每节最少字数）

详见：[区域一讨论记录](#区域一开发状态)

### 区域二：Template

将现有模板从「填充 prompt 文本」升级为「注入结构大纲」，模型不再自由发挥格式，而是按指定章节框架逐节填充内容。

- 每个模板定义章节列表 + 每节写作要求
- 通用模板作为无模板时的默认大纲
- 支持用户在生成前预览 / 微调大纲

详见：区域二开发启动后补充

### 区域三：Dynamic Context

每次生成时动态构建，附加在 user message 或 system prompt 末尾：

- 数据源：通过 Jina Reader API 抓取 URL 正文，截取摘要注入
- 生成时间：让模型知道当前日期，避免时效性错误
- Topic 原文：用户输入，可选做预处理扩展

详见：区域三开发启动后补充

---

## 开发状态

| 区域 | 状态 | 完成版本 |
|------|------|---------|
| 区域一：System Prompt | **已完成** | v2.2.0 |
| 区域二：Template | 待启动 | — |
| 区域三：Dynamic Context | 待启动 | — |

---

## 区域一实现记录（v2.2.0）

**完成日期**：2026-05-30

### 架构

每次生成的 system prompt 由两部分拼接：

```
BASE_SYSTEM_PROMPT（常量，静态）
    +
动态注入块（language / style / tone / structure / citations）
    +
<custom>用户追加指令</custom>（可选）
```

### 静态基础层（BASE_SYSTEM_PROMPT）

结构采用 XML 分区，共 5 个区：

| 区块 | 作用 |
|------|------|
| `<role>` | 角色定位：Atlas Report Agent，咨询/分析/研究综合能力 |
| `<principles>` | 金字塔原理、MECE、数据溯源、章节过渡 5 条核心原则 |
| `<constraints>` | 4 条硬性禁止规则（开场白/列表主体/空泛定性/空章节） |
| `<visualization>` | 图表必须插入规则：有量化对比数据→必须有 CHART 块，含 title/unit/source 三个必填字段 |
| `<quality_check>` | 15 条自查清单，分结构/数据/内容/格式四组；新增：标题是否准确概括核心内容 |

### 动态注入层

每次生成时，根据 Toolbar 选择动态构建：

| 变量 | 来源 | 默认值 |
|------|------|-------|
| 语言 (`langInstr`) | LanguagePopover | 简体中文 |
| 风格 (`styleInstr`) | StylePopover | 商业可读 |
| 语气 (`toneCN`) | TonePopover | 分析性 |
| 章节数下限 (`minSections`) | 长度档位自动计算 | 简报3/标准5/深度6/长文8 |
| 每节字数下限 (`minWordsPerSection`) | 同上 | 150/200/300/350 字 |

### UI 改动

**Toolbar 新增 2 个按钮：**
- `LanguagePopover`：简体中文 / English / 繁體中文 + 自定义语言（localStorage 持久化）
- `StylePopover`：商业可读 / 学术严谨 / 咨询框架 / 内部简报

**Settings 新增「提示词」标签页：**
- 只读预览 `BASE_SYSTEM_PROMPT` 全文
- 可编辑「自定义追加指令」（嵌入 `<custom>` 标签）
- 语言管理面板（内置语言展示 + 自定义语言增删）

### 核心代码位置

- `src/App.jsx` — `BASE_SYSTEM_PROMPT` 常量（静态基础层）
- `src/App.jsx` — `BUILTIN_LANGUAGES` / `BUILTIN_STYLES` 常量
- `src/App.jsx` — `useToolbarStore()` 新增 language / style 状态
- `src/App.jsx` — `LanguagePopover` / `StylePopover` 组件
- `src/App.jsx` — `streamReport()` system prompt 组装逻辑
- `src/App.jsx` — `SettingsModal` 新增「提示词」tab + `AddLanguageInline` 组件

---

## 实现难度

- 区域一（System Prompt）：已完成
- 区域二（Template 升级）：中（需重构模板数据结构）
- 区域三（动态注入）：中（Jina API 集成）
