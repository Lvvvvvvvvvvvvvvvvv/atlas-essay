# Atlas Report Agent · Harness Engineering

模型之外的工程建设。本目录记录为提升 Atlas Report Agent 输出效果，在模型本身以外可以做的所有工程层面的建设，框架采用 **ETCLOVG** 七层模型。

---

## 什么是 Harness Engineering

Harness（线束）= 围绕模型构建的"外壳"工程。模型权重不变，但通过优化调用方式、上下文构造、输出验证、流程编排等手段，显著提升最终输出的质量、稳定性和可维护性。

> 模型是引擎，Harness 是整辆车。

---

## ETCLOVG 七层框架

| 层 | 全称 | 核心问题 |
|----|------|---------|
| E | Execution | 模型怎么跑？参数怎么配？ |
| T | Tooling | 模型能用什么工具？ |
| C | Context | 模型看到什么？ |
| L | Lifecycle | 任务怎么拆解和编排？ |
| O | Observability | 我们能观察到什么？ |
| V | Verification | 输出怎么验证？ |
| G | Governance | 谁能做什么？成本怎么控？ |

---

## Atlas Report Agent 优先级排序

基于对**报告输出质量**的影响程度评估：

| 优先级 | 层 | 当前完成度 | 状态 |
|--------|----|-----------|---------|
| P0 | C · Context | ~90% | ✅ 三区上下文架构 |
| P1 | E · Execution | ~85% | ✅ 按模型自动调参 + 用户参数模板 |
| P2 | V · Verification | ~80% | ✅ 结构校验 / 截断检测 / 评分 / 自动重试 |
| P3 | L · Lifecycle | ~90% | ✅ 大纲先行 → 分节并行 → 节点工作流 → 章节精修 |
| P4 | T · Tooling | ~92% | ✅ Jina 注入 + Tavily 搜索 + 模型自主研究（Tool Use）+ 远程 HTTP MCP（含 OAuth 2.1）；stdio MCP 待桌面端 |
| P5 | O · Observability | ~85% | ✅ 元数据完整 + 报告库统计面板 + prompt 版本追踪 |
| P6 | G · Governance | ~92% | ✅ 角色客户端强制 + 成本粗估 + 每日软限制 + 分享链接安全 |
| 附加 | M · Memory | ~85% | ✅ 写作画像 + 实体记忆 + 评分反哺 + 增量更新（`<user_memory>` 注入） |

**七层框架已全部闭环，并补充 M·Memory 附加层。** 剩余均为低优先级深化或受架构限制项（见各层文档待办）。

---

## 收口总览（v3.1.0）

### 各层关键能力一览

| 层 | 落地能力 |
|----|---------|
| **C** | system prompt 三区架构（角色/原则/约束 + 动态注入 + 数据源上下文） |
| **E** | 按模型自动调参、用户参数模板、temperature/top_p 等暴露 |
| **V** | 结构校验、截断检测 + 自动续写、好坏评分 |
| **L** | 大纲先行、分节并行、节点式工作流、章节级 AI 精修 |
| **T** | Jina 抓取、Tavily 搜索、模型自主研究（agentic tool use, per-provider 分级）、远程 HTTP MCP（免鉴权/静态 token/OAuth 2.1） |
| **O** | 报告元数据（模型/耗时/模式/章节/研究轨迹/prompt 版本）、报告库统计面板、prompt 版本好评率 A/B |
| **G** | admin/editor/viewer 客户端强制、生成成本粗估、每日次数软限制、分享链接安全审查 |

### 验证方式说明
- **可运行验证**：构建 + 本地 headless 浏览器（注入登录态/角色/样本数据）驱动构建产物，逐项实测 UI 与聚合数值；纯逻辑（图表 SVG、MCP 协议、OAuth discovery/PKCE/token、成本数学）以本地 mock server / node 单测验证。
- **受限未验证（需线上 + 真实凭据）**：PDF 光栅化成品（jspdf/html2canvas 走 CDN）、研究/MCP 实跑（需真模型 key + 外网）、OAuth 真实 provider 跳转回调。详见各层文档「验证状态」。

### 已知待办（低优先级）
- **T** · stdio 本地 MCP — 需 Atlas 改为 Electron/Tauri 桌面端
- **T** · OAuth MCP 真实环境验证 + 不支持 DCR 的 provider 预注册
- **G** · 成本预估接入各模型实时定价
- 装饰性卡片 SVG 的 `<circle> NaN` 控制台报错（不影响功能，预存在）

---

## 文档索引

| 文件 | 层 | 优先级 |
|------|----|--------|
| **[OVERVIEW.md](OVERVIEW.md)** | **单页总览（推荐先读）** | — |
| [C-Context.md](C-Context.md) | Context | P0 |
| [E-Execution.md](E-Execution.md) | Execution | P1 |
| [V-Verification.md](V-Verification.md) | Verification | P2 |
| [L-Lifecycle.md](L-Lifecycle.md) | Lifecycle | P3 |
| [T-Tooling.md](T-Tooling.md) | Tooling | P4 |
| [O-Observability.md](O-Observability.md) | Observability | P5 |
| [G-Governance.md](G-Governance.md) | Governance | P6 |
| [M-Memory.md](M-Memory.md) | Memory | 附加 |

---

## 原则

- 每项建设必须有明确的**输出质量影响路径**，不做为了工程而工程的事
- 优先做客户端可实现的方案，后端依赖的方案标注 `需后端` 延后
- 每层文档包含：当前状态 / Gap 分析 / 具体方案 / 实现难度
