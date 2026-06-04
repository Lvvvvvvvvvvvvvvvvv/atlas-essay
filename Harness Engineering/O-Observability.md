# O · Observability（可观测性层）· P5

> 没有度量就没有改进。可观测性是优化所有上层的基础。

**优先级：P5** — 不直接影响单次输出，但是持续迭代的前提。

---

## 开发状态

| 方案 | 状态 | 完成版本 |
|------|------|---------|
| A：报告元数据扩展 | **已完成** | v2.9.0 |
| B：报告库统计面板 | **已完成** | v2.9.0 |
| C：prompt 版本效果追踪 | 待办 | — |

## 当前状态

- 报告存储：localStorage + 云端 `/api/reports` 同步完整内容
- ✅ **元数据（方案 A 完成）**：`meta` 含 `model` / `provider` / `generationMode` / `durationMs` / `sectionCount` / `words` / `sources` / `tokens` / `tone` / `warnings` / `retried` / `research`（自主研究轨迹）
- ✅ 用户评分：报告层 `rating`（good/bad，P2-V3）
- ✅ **聚合统计面板（方案 B 完成）**：报告库顶部「STATS · 数据概览」
- ⬜ prompt 版本效果追踪（方案 C，待样本积累后做）

---

## 方案

### 方案 A：报告元数据扩展（成本极低）

在保存报告时，在 report 对象中附加元数据字段：

```json
{
  "id": "...",
  "title": "...",
  "content": "...",
  "meta": {
    "model": "gpt-4o",
    "generationMode": "balanced",
    "durationMs": 12450,
    "tokenEstimate": 3200,
    "promptHash": "a3f2...",
    "wordCount": 1850,
    "sectionCount": 7,
    "userRating": null
  }
}
```

这些数据已经在生成过程中可获得，只需在保存时记录。

### 方案 B：报告统计面板

在报告库页面增加聚合统计：

- 各模型平均生成时长
- 各模型平均报告字数
- 用户评分分布
- 最常用模板 / 生成模式

### 方案 C：prompt 效果追踪

对 system prompt 版本做 hash 标记，记录每个 prompt 版本下的平均评分，用于 A/B 对比不同 prompt 效果。

---

## 实现记录（v2.9.0 · 方案 A + B）

**完成日期**：2026-06-04

**方案 A — 元数据扩展**
- 在 `Running` 的 `doSave` 与 `ParallelDraft` 保存路径补：`provider` / `generationMode` / `durationMs`（`Date.now()-startTime`）/ `sectionCount`
- 旧报告无这些字段，统计端按缺失优雅跳过

**方案 B — 报告库统计面板**
- `LibraryStats` 组件（`src/App.jsx`），报告库顶部可折叠「STATS · 数据概览」，纯客户端从 `savedReports` 的 meta 聚合，零后端
- 含：总览（报告数/总字数/平均字数/平均耗时/研究启用数）、按模型（篇数/平均字数/平均耗时）、评分分布条、生成模式分布

**核心代码位置**
- `src/App.jsx` — `doSave` / `ParallelDraft` meta 字段
- `src/App.jsx` — `LibraryStats` 组件 + `Library` 内渲染

## 待办

### 方案 C：prompt 版本效果追踪
对 system prompt 版本做 hash 标记，记录每版本平均评分做 A/B。当前样本量小、收益低，待报告积累后再做。

## 实现难度

- 方案 A（元数据记录）：低（已完成）
- 方案 B（统计面板）：中（已完成）
- 方案 C（prompt 版本追踪）：中（待办）
