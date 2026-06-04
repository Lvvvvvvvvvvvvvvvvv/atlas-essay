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
| P4 | T · Tooling | ~90% | ✅ Jina 注入 + Tavily 搜索 + 模型自主研究（Tool Use）+ **远程 HTTP MCP 集成**；stdio MCP 待桌面端 |
| P5 | O · Observability | ~80% | ✅ 元数据完整记录 + 报告库统计面板；prompt 版本追踪（方案C）待办 |
| P6 | G · Governance | ~60% | 当前规模不是瓶颈 |

---

## 文档索引

| 文件 | 层 | 优先级 |
|------|----|--------|
| [C-Context.md](C-Context.md) | Context | P0 |
| [E-Execution.md](E-Execution.md) | Execution | P1 |
| [V-Verification.md](V-Verification.md) | Verification | P2 |
| [L-Lifecycle.md](L-Lifecycle.md) | Lifecycle | P3 |
| [T-Tooling.md](T-Tooling.md) | Tooling | P4 |
| [O-Observability.md](O-Observability.md) | Observability | P5 |
| [G-Governance.md](G-Governance.md) | Governance | P6 |

---

## 原则

- 每项建设必须有明确的**输出质量影响路径**，不做为了工程而工程的事
- 优先做客户端可实现的方案，后端依赖的方案标注 `需后端` 延后
- 每层文档包含：当前状态 / Gap 分析 / 具体方案 / 实现难度
