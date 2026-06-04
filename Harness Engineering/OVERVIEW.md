# Atlas Report Agent · Harness Engineering 总览

> 模型是引擎，Harness 是整辆车。本文档是 ETCLOVG 七层框架的单页权威总览，
> 汇总各层已落地能力、核心实现、验证状态与剩余待办。逐层细节见各层文档。

**版本**：v3.1.0 · **更新**：2026-06-04 · **状态**：七层全部闭环

---

## 1. 什么是 Harness Engineering

Harness（线束）= 围绕模型构建的「外壳」工程。模型权重不变，但通过优化
**调用方式、上下文构造、输出验证、流程编排、工具接入、可观测性与治理**，
显著提升最终报告的质量、稳定性与可维护性。

**核心原则**
- 每项建设必须有明确的**输出质量影响路径**，不做为工程而工程
- 优先客户端可实现方案；后端依赖项标注延后
- 受 Vercel Hobby **12 函数上限**约束：新能力优先折叠进既有函数，不新增
- 全程**优雅降级**：任何增强失败都回退到基础路径，绝不阻断出报告

---

## 2. ETCLOVG 七层 · 完成度总表

| 层 | 全称 | 核心问题 | 优先级 | 完成度 | 状态 |
|----|------|---------|--------|--------|------|
| C | Context | 模型看到什么？ | P0 | ~90% | 完成 |
| E | Execution | 怎么跑、参数怎么配？ | P1 | ~85% | 完成 |
| V | Verification | 输出怎么验证？ | P2 | ~80% | 完成 |
| L | Lifecycle | 任务怎么拆解编排？ | P3 | ~90% | 完成 |
| T | Tooling | 能用什么工具？ | P4 | ~92% | 完成（stdio 待桌面端） |
| O | Observability | 能观察到什么？ | P5 | ~85% | 完成 |
| G | Governance | 谁能做什么、花多少？ | P6 | ~92% | 完成 |
| M | Memory | 模型记得你什么？ | 附加 | ~85% | 完成（localStorage） |

---

## 3. 报告生成全链路（七层如何协同）

一次「自主研究 + 大纲先行」的完整生成，七层串起来是这样：

```
用户输入 topic
   │
[G] 角色校验 can('generate') + 每日次数软限制 + 成本粗估展示
   │
[T] 自主研究（开关）：模型决策轮 → web_search / fetch_url / MCP 工具 → 资料回填
   │   （per-provider 分级：MiMo 单轮，DeepSeek/OpenAI 多轮）
   │
[L] 大纲先行（开关）：streamOutline → 用户确认/编辑章节 → 锁定结构
   │
[C] 组装 system prompt：三区架构（角色/原则/约束 + 动态注入 + <context> 资料）
   │
[E] 按模型/模式注入参数：temperature / top_p / frequency_penalty
   │
[T] 调用模型（个人 key 直连 or 团队 key 经 /api/generate 加密代理）→ 流式生成
   │   （L 分节并行可选：各章独立请求并发，结果拼合）
   │
[V] 结构校验 + 截断检测 → 截断则自动续写一次 → warnings 写入 meta
   │
[O] 记录元数据：model/provider/mode/耗时/章节/tokens/研究轨迹/prompt 版本
   │
报告入库（localStorage + 云端 /api/reports）
   │
[V] 用户好/差评 → [O] 汇入统计面板 + prompt 版本好评率 A/B
   │
[G] 导出 can('export')；分享链接仅含报告 ID（无 key）
```

---

## 4. 逐层详解

### C · Context（P0 · ~90%）
**目标**：用结构化上下文锁定报告的格式、深度与可溯源性。
**已落地**：三区域 system prompt 架构 —
- 区一：`BASE_SYSTEM_PROMPT`（角色定义 / 写作原则 / 约束 / 可视化规则 / 质量自查层，XML 分块）
- 区二：模板章节结构注入（`<structure>`，锁定章节框架与字数分配）
- 区三：动态上下文 `<context>`（生成日期 + Jina 抓取的网页正文 + Tavily 搜索结果 + 自主研究资料）
- Toolbar 注入语言/语气/风格/章节数
**验证**：随报告生成实跑（线上）。

### E · Execution（P1 · ~85%）
**目标**：同 prompt 下用参数把质量拉满。
**已落地**：生成模式预设 + 按模型自动调参 + 用户参数模板。

| 模式 | temperature | top_p | frequency_penalty |
|------|------------|-------|------------------|
| 严谨 | 0.25 | 0.85 | 0.20 |
| 均衡（默认） | 0.45 | 0.90 | 0.10 |
| 探索 | 0.75 | 0.95 | 0.00 |

### V · Verification（P2 · ~80%）
**目标**：输出 ≠ 正确，补一道质检门。
**已落地**：`validateReport()` 五项检查（开头合法 / 章节数 / 字数下限 / 代码块闭合 / 截断检测）→ `meta.warnings`；截断自动续写一次；报告页 warning banner；用户好/差评（`report.rating`）。

### L · Lifecycle（P3 · ~90%）
**目标**：从单轮生成升级为多轮编排。
**已落地**：大纲先行（`streamOutline` + 可编辑大纲）→ 分节并行（各章独立并发请求拼合，3–5x 提速）→ 节点式工作流（Research→Outline→Draft→Final）→ 章节级 AI 精修。

### T · Tooling（P4 · ~92%）
**目标**：从「写作」升级为「研究」。
**已落地**：
- Jina Reader 抓取数据源 URL 正文注入
- Tavily 实时搜索（`/api/search`）+ 工作流自动研究
- **模型自主研究（agentic tool use）**：模型自行决定调 `web_search`/`fetch_url`，客户端循环，per-provider 分级，全程降级
- **远程 HTTP MCP**：发现并调用 MCP server 工具，命名空间合并进研究循环；折叠进 `api/search.js` 零新增函数
- **OAuth 2.1 MCP**：discovery → 动态客户端注册 → PKCE 授权跳转 → 回调换 token → mcpProxy 带 token
**验证**：MCP 协议（JSON/SSE/session 4 模式）对本地 mock 实测通过；OAuth discovery/DCR/PKCE/token 对 mock 实测通过。
**待办/受限**：stdio 本地 MCP 需桌面客户端；OAuth 真实 provider 跳转回调未在 CI 验证。

### O · Observability（P5 · ~85%）
**目标**：没有度量就没有改进。
**已落地**：
- 报告元数据：`model / provider / generationMode / durationMs / sectionCount / tokens / research（工具轨迹）/ promptHash`
- 报告库「STATS · 数据概览」面板：总览（数/字数/均值/均耗时/研究启用）、按模型、评分分布、生成模式、**prompt 版本好评率 A/B**
**验证**：headless 浏览器注入样本实测，聚合数值逐项算对、好评率正确。

### M · Memory（附加层 · ~85%）
**目标**：从历史学习并主动反哺下一次生成（ETCLOVG 未含，按业务补充）。
**已落地**（全 localStorage，注入 `<user_memory>`）：
- 写作画像：偏好/避免项（手动 + 差评原因自动累积），历史归纳只读视图（好评加权）
- 实体记忆：领域关键词命中 → 注入重点对象
- 评分反哺闭环：差评一键原因 → avoid 注入；生成页显示模型+模式历史好评率
- 增量更新：报告页「↻ 基于此更新」用旧结构+主题组装更新 prompt
**验证**：`buildMemoryBlock`/`deriveProfileStats` node 实测；端到端需线上走查。

### G · Governance（P6 · ~92%）
**目标**：谁能做什么、花多少、风险怎么控。
**已落地**：
- **角色客户端强制**（此前 `usePermission().can()` 是死代码）：viewer 不能生成/导出，editor 不能改模型/管数据源；服务端路由亦强制
- 生成前**成本粗估**（各 provider 近似单价，标注非账单级）
- **每日生成次数软限制**（默认 30 次，confirm 警告）
- **分享链接安全**：仅 `?r=<报告ID>`，不含 key（实测）
**验证**：headless 浏览器分别注入 viewer/editor 角色实测，按钮禁用/提示正确、无崩溃。

---

## 5. 版本里程碑

| 版本 | 内容 |
|------|------|
| v2.2–2.4 | C 三区上下文 · E 生成模式与调参 · V 校验/截断/评分/重试 |
| v2.5–2.6 | L 大纲先行 → 分节并行 → 节点工作流 → 章节精修 |
| backend | Supabase 鉴权 · 报告云同步 · 加密服务端密钥 · QStash 后台任务 |
| v2.7 | T 模型自主研究（Tool Use） |
| v2.8 | T 远程 HTTP MCP 集成 |
| v2.9 | O 元数据扩展 + 报告库统计面板 |
| v3.0 | G 角色强制 + 成本粗估 + 每日软限制 · O-C prompt 版本追踪 · G editor 细粒度门 |
| v3.1 | T OAuth 2.1 MCP |

---

## 6. 验证方法论（诚实边界）

**能在本环境验证的（已做）**
- 构建通过（每次改动）
- 本地 headless 浏览器（chromium）驱动**构建产物**，注入登录态/角色/样本数据，实测 UI 与聚合数值（统计面板、角色门、图表渲染、导出弹窗）
- 纯逻辑用本地 mock server / node 单测：图表 SVG 合法性、MCP 协议 4 模式、OAuth discovery/DCR/PKCE/token、成本数学

**受架构限制、本环境无法验证的（需线上 + 真实凭据）**
- PDF 光栅化成品（jspdf/html2canvas 走 CDN，被出口白名单挡）
- 研究 / MCP 实跑（需真模型 key + 不受限外网）
- OAuth 真实 provider 的浏览器跳转授权 + 回调

> 沙箱出口受网络策略白名单限制，线上站点与外部 host 均不可达；故上述项必须在线上由真实账号走查。

---

## 7. 架构约束与剩余待办

**硬约束**
- Vercel Hobby **12 Serverless 函数上限** → 新后端能力折叠进既有函数
- 纯 Web + Serverless → stdio 类 MCP 无法运行（需桌面端）
- 开发沙箱出口白名单 → 端到端线上验证只能由用户侧完成

**剩余待办（低优先级）**
- T · stdio 本地 MCP —— Atlas 改 Electron/Tauri 桌面端后落地（文档已留 TODO 触发点）
- T · OAuth MCP 真实环境验证；不支持动态注册的 provider 需预注册 client_id
- O · prompt 版本追踪现为基础设施，待样本积累后做更细 A/B
- G · 成本预估接入各模型实时定价
- 装饰性卡片 SVG 的 `<circle> NaN` 控制台报错（不影响功能，预存在）

---

## 8. 文档索引

| 文件 | 层 | 优先级 |
|------|----|--------|
| [README.md](README.md) | 框架入口 + 收口总览 | — |
| [C-Context.md](C-Context.md) | Context | P0 |
| [E-Execution.md](E-Execution.md) | Execution | P1 |
| [V-Verification.md](V-Verification.md) | Verification | P2 |
| [L-Lifecycle.md](L-Lifecycle.md) | Lifecycle | P3 |
| [T-Tooling.md](T-Tooling.md) | Tooling | P4 |
| [O-Observability.md](O-Observability.md) | Observability | P5 |
| [G-Governance.md](G-Governance.md) | Governance | P6 |
| Harness架构图.png | 架构图 | — |
