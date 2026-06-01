# V · Verification（验证层）· P2

> 模型输出不等于正确输出。验证是质量的最后一道门。

**优先级：P2** — 当前完全缺失，纯客户端可实现基础验证，无需后端。

---

## 开发状态

| 层级 | 状态 | 完成版本 |
|------|------|---------|
| 层级一：结构验证 | **已完成** | v2.4.0 |
| 层级二：截断检测 | **已完成** | v2.4.0 |
| 层级三：用户评分 | **已完成** | v2.4.1 |
| 层级四：自动 Retry | **已完成** | v2.4.2 |

---

## 实现记录（v2.4.0）

**完成日期**：2026-06-01

### 核心改动

**`validateReport(text, { effectiveLength, templateSections })` 纯函数，五项检查：**

| # | 检查项 | 规则 |
|---|--------|------|
| 1 | 开头合法 | 去空白后首字符为 `#` |
| 2 | 章节数 | `## ` 数量 ≥ minSections（简报3/标准5/深度6/长文8，有模板取模板章节数） |
| 3 | 字数 | 去空白字符数 ≥ 目标字数 × 70% |
| 4 | 代码块闭合 | ` ``` ` 出现次数为偶数 |
| 5 | 截断检测 | 末尾 150 字符含句末标点 / `[/REFS]` / 标题行之一；否则判定截断（警告置首位） |

**`meta.warnings` 字段：**
- `onDone` 回调中调用验证，结果写入 `meta.warnings: string[] | undefined`
- 无问题时字段为 `undefined`，不写入记录

**Warning banner（报告详情页）：**
- 头部 bar 正下方，有警告时渲染，无则不占空间
- 多条问题以 ` · ` 分隔，截断警告 `unshift` 到列表最前
- 「重新生成」按钮复用当前 topic 重跑
- `×` 按钮关闭（局部 state，不持久化）

### 核心代码位置

- `src/App.jsx` — `validateReport()` 纯函数（`streamReport` 之前）
- `src/App.jsx` — `Running` 组件 `onDone`：调用验证，`meta.warnings` 写入
- `src/App.jsx` — `Report` 组件：`warnDismissed` state + banner JSX

---

## 实现记录（v2.4.1）

**完成日期**：2026-06-01

### 核心改动

**用户评分（`+ 好` / `- 差`）：**
- `useSavedReports` 新增 `setRating(id, rating)` — toggle 逻辑（点同一评分 → 取消）
- 报告 `rating` 字段：`'good' | 'bad' | null`，持久化至 localStorage
- `Report` header bar：收藏按钮右侧新增「+ 好」「- 差」两个按钮，已选中时高亮（绿/红）
- `LibraryCard` 底部 footer：已评分时显示 `+ 好评` / `- 差评` 标签（绿/红边框）

### 核心代码位置

- `src/App.jsx` — `useSavedReports.setRating()`
- `src/App.jsx` — `Report` 组件：`rating` / `onRate` props + 两个评分按钮
- `src/App.jsx` — `Library` 组件：`generatedEntries` 新增 `rating` 字段 + `onRate` prop 传递
- `src/App.jsx` — `LibraryCard`：footer 评分标签

---

## 实现记录（v2.4.2）

**完成日期**：2026-06-01

### 核心改动

**触发条件**：仅截断警告（`meta.warnings` 中含"截断"字样）且未重试过时自动触发，最多 1 次。

**续写 Prompt 模式**：
```
[原始 topic]

【续写指令】上一次生成因 token 限制被截断，请从截断处继续完成报告。
直接续写，不要重复已有内容，保持相同格式和风格。

截断处最后内容：
[原始文本末尾 500 字]

请从这里继续：
```

**执行流程**：
- `onDone` 回调内检测截断 → `retryDoneRef` 防止循环 → 重启计时器 → 发起第二次 `streamReport`
- retry `onChunk` 实时追加到原始文本，流式渲染不中断
- retry `onDone` 合并文本重新 `validateReport`，写入 `meta.retried: true`
- retry 失败（`onError`）→ 保存原始截断文本，不阻断流程

**再次截断时警告文案**：`"… （已自动续写一次，建议增大 Max Tokens 后重跑）"`

**UI**：retry 进行中，model badge 旁显示 `◈ 检测到截断，正在自动补全…`

### 核心代码位置

- `src/App.jsx` — `Running` 组件：`retryDoneRef` / `retryStatus` state
- `src/App.jsx` — `Running` 组件 `onDone` 内 `doSave()` 提取 + retry 分支
- `src/App.jsx` — Running model badge 区域：`retryStatus === 'retrying'` 状态文字

---

## 当前状态

- 输出即终态：模型流式输出完成后直接保存，无任何检查
- 无结构验证（章节是否完整？）
- 无长度验证（是否被截断？）
- 无内容验证（是否偏题？）
- 无用户评分机制

---

## Gap 分析

| 风险 | 发生原因 | 当前处理 |
|------|---------|---------|
| 输出被截断 | max_tokens 不足 | 无，用户自己发现 |
| 结构缺失 | 模型跳过某些章节 | 无 |
| 输出偏题 | topic 歧义或模型漂移 | 无 |
| 低质量输出反复保存 | 无评分过滤 | 无 |

---

## 方案

### 层级一：结构验证（客户端，输出完成后立即执行）

```
检查 Markdown 中 ## 标题数量 ≥ N
检查总字数 ≥ M
检查是否以 "##" 开头（非空白开头）
检查是否包含未结束的代码块（``` 奇数）
```

验证失败 → 显示警告 banner + 提供「重新生成」按钮

### 层级二：截断检测

输出最后 100 字符不包含正常结束标志（句号/换行）→ 判定为截断 → 提示用户增加 max_tokens 后重试

### 层级三：用户反馈

报告卡片增加 👍/👎 评分，存入 localStorage，用于后续分析哪类 topic / 模型质量更稳定

### 层级四：自动 Retry（进阶）

验证失败时，自动附加修复 prompt 重新请求一次：

```
上一次生成的报告结构不完整，缺少以下部分：[X]。
请从「[最后完整章节标题]」继续补全，保持相同格式。
```

---

## 实现难度

- 层级一（结构验证）：低
- 层级二（截断检测）：低
- 层级三（用户评分）：低
- 层级四（自动 Retry）：中
