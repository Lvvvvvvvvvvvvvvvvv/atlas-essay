# L · Lifecycle（生命周期层）· P3

> 单轮生成的天花板很低。多轮编排才能产出真正有深度的报告。

**优先级：P3** — 影响巨大，但需重构交互流程，是下一代质量跃升的核心。

---

## 开发状态

| 阶段 | 状态 | 完成版本 |
|------|------|---------|
| 阶段一：大纲先行模式 | **已完成** | v2.5.0 |
| 阶段二：分节并行生成 | **已完成** | v2.6.0 |
| 阶段三：节点式工作流 | **已完成** | v2.6.1 |
| 阶段四：章节级 AI 精修 | **已完成** | v2.6.2 |

---

## 实现记录（v2.5.0）

**完成日期**：2026-06-01

### 核心改动

**新增 `route: 'outline'` 路由：**
- Settings > 模型 > 「大纲先行模式」开关（默认关闭，localStorage 持久化）
- 触发条件：开关开启 + 无 activeTemplate + Live 模式（有 API Key）
- 已手动锁定模板时跳过大纲步骤，直接生成

**`streamOutline()` 函数：**
- 专用轻量级 API 调用（max_tokens 1500，temperature 0.4）
- 简化系统提示，要求模型输出 `## 标题\n写作要求：...` 格式的大纲

**`parseOutlineFromText()` 解析器：**
- 按 `## ` 切分，提取每章 `{title, req}`
- 边流式输出边解析，实时显示章节卡片

**`OutlineStep` 组件：**
- 大纲流式渲染，每章以可编辑卡片展示（标题 input + 写作要求 textarea）
- 三个操作：「确认，开始生成」→ `setActiveTemplate` + 跳入 Running；「↺ 重新生成」→ 重新请求；「跳过，直接生成」→ 直接跳入 Running

**确认后流程：**
- `handleOutlineConfirm(sections)` 调用 `toolbarStore.setActiveTemplate({ en: 'AI 大纲', sections })`
- 复用现有 C-区域二 的 `<structure>` 注入机制，按确认章节框架生成全文
- TemplateLockBadge 显示「AI 大纲 · N 章节」，用户可手动 × 清除

### 核心代码位置

- `src/App.jsx` — `streamOutline()` 函数（`streamReport` 之前）
- `src/App.jsx` — `parseOutlineFromText()` 辅助函数
- `src/App.jsx` — `OutlineStep` 组件（`Running` 之前）
- `src/App.jsx` — `FOOTER_CONTEXT` 新增 `outline` 条目
- `src/App.jsx` — App 组件：`outlineMode` state、`goRun()` 路由分支、`handleOutlineConfirm()`
- `src/App.jsx` — `SettingsModal`：model tab 新增「生成流程」区块 + toggle

---

## 当前状态

```
用户输入 topic → 单次 API 调用 → 流式输出 → 完成
```

- 单轮、单次、无中间态
- 用户无法在生成过程中介入
- 无法针对长报告做分段处理
- 模型在单次调用中必须「一口气」完成所有内容

---

## Gap 分析

单轮生成的固有局限：

| 局限 | 影响 |
|------|------|
| 上下文窗口压力大 | 报告越长，后半段质量越差（注意力衰减） |
| 无法用户确认方向 | 模型对 topic 的理解可能与用户预期偏差 |
| 无法并行生成 | 所有章节串行，速度慢 |
| 无法针对性深化 | 某一章节写得浅，用户只能重新生成全部 |

---

## 方案

### 阶段一：大纲先行模式（推荐，v2.x 可实现）

```
第 1 轮：生成大纲（快，~5秒）
    ↓
用户确认 / 修改大纲
    ↓
第 2 轮：按确认大纲生成全文
```

优点：用户对方向有掌控感；大纲确认后全文质量更稳定

### 阶段二：分节并行生成（进阶，v2.x 后期）

```
大纲确认后，每个章节作为独立 API 调用并行发出
结果按顺序拼合
```

优点：速度提升 3–5x；每节上下文更聚焦质量更高

### 阶段三：节点式工作流（v3.0 探索）

```
需后端支持
topic → research → outline → draft → review → final
每个节点可暂停、编辑、重跑
```

---

## 实现难度

- 大纲先行：中（需新增 UI 交互状态）
- 分节并行：中高（需处理并发 + 流式拼合）
- 节点式工作流：高（需后端）
