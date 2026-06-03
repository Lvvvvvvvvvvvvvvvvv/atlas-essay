# T · Tooling（工具层）· P4

> 给模型配工具，是从「写作」到「研究」的质的跃升。

**优先级：P4** — 天花板最高，但纯客户端架构受限，需分阶段推进。

---

## 开发状态

| 阶段 | 状态 | 完成版本 |
|------|------|---------|
| 阶段一：数据源内容注入（Jina Reader） | **已完成** | v2.4.x |
| 阶段一+：实时搜索（Tavily） | **已完成** | v2.5.x |
| 阶段二：模型 Tool Use（自主研究） | **已完成** | v2.7.0 |
| 阶段三：MCP 集成（远程 HTTP） | **已完成** | v2.8.0 |
| 阶段三+：stdio MCP | 待桌面客户端 | — |

---

## 当前状态

- ✅ 数据源 URL：`fetchUrlContents()` 经 Jina Reader（`r.jina.ai`）抓取正文，截 2000 字注入 `<context>`
- ✅ 实时搜索：`/api/search`（Tavily）后端代理 + 前端搜索面板，结果可手动加入上下文
- ✅ 工作流自动研究：WorkflowView 第一步自动搜 topic
- ✅ **模型自主研究（Tool Use）**：开启「自主研究模式」后，模型在生成前自行决定调用 `web_search` / `fetch_url`
- ⬜ 结构化数据获取 / 代码执行：未做（需后端）

---

## 实现记录（v2.7.0 · 模型 Tool Use）

**完成日期**：2026-06-03

### 架构：客户端 Agentic 循环（零新增 serverless 函数）

受 Vercel Hobby 12 函数上限约束，工具循环放在前端执行，工具复用既有设施：
- `web_search` → 现成 `/api/search`（Tavily）
- `fetch_url` → 现成客户端 `fetchUrlContents()`（Jina）

### 流程

```
开启「自主研究模式」+ Live 模式 → 输入 topic
  ↓
[决策轮] 非流式调模型（带 tools 定义）
  ├─ 返回 tool_calls → 前端执行 → 结果回填 messages → 再决策（多轮）
  └─ 无 tool_calls → 结束研究
  ↓
[终轮] 研究资料注入 <context> → 流式生成报告（复用 streamReport）
```

### Per-provider 能力分级

| Provider | 策略 | 原因 |
|----------|------|------|
| DeepSeek / OpenAI / Anthropic | 多轮循环（≤3 轮） | 原生支持多轮 tool 历史 |
| **MiMo（小米）** | **单轮** | 上游 [Issue #44](https://github.com/XiaomiMiMo/MiMo/issues/44)：多轮 tool 历史报 400 |
| 其他/未知 | 单轮，失败即跳过 | 保守降级 |

**降级原则**：任何环节出错（模型不支持 tools、循环超时、工具失败）→ 静默跳过研究，直接走普通生成，绝不阻断出报告。

### 核心代码位置

- `src/App.jsx` — `RESEARCH_TOOLS`（工具 schema）
- `src/App.jsx` — `resolveModelCall()` / `executeResearchTool()` / `runAgenticResearch()`
- `src/App.jsx` — `streamReport()` 新增 `gatheredContext` 注入
- `src/App.jsx` — `Running` 组件：研究阶段（Phase 0）+ 工具轨迹 marginalia
- `src/App.jsx` — `SettingsModal`：「自主研究模式」开关（默认关，localStorage 持久化）
- `api/generate.js` — 透传 `tools`/`tool_choice`，支持 `stream:false` 返回 JSON

---

## Gap 分析

| 能力 | 当前 | 理想 | 架构限制 |
|------|------|------|---------|
| 网页内容读取 | URL 文本（无效） | 模型实际读取页面内容 | CORS，需代理 |
| 实时搜索 | 无 | 模型主动搜索补充材料 | 需后端或第三方 API |
| 结构化数据 | 无 | 读取表格、数据库 | 需后端 |
| 代码执行 | 无 | 执行分析脚本 | 需后端 |

---

## 方案

### 阶段一：数据源内容注入（客户端可行）

用 [Jina Reader API](https://r.jina.ai/) 在生成前抓取数据源 URL 内容，提取正文摘要注入 prompt：

```
GET https://r.jina.ai/{url}
→ 返回 Markdown 格式的页面正文
→ 截取前 2000 字符注入 system prompt 的 context 区域
```

无需后端，纯客户端可实现，免费 tier 足够个人使用。

### 阶段二：模型 Tool Use（需后端或 MCP）`需后端`

通过 OpenAI function calling / Anthropic tool use，给模型定义工具：

```json
tools: [
  { name: "web_search", description: "搜索实时信息" },
  { name: "fetch_url", description: "读取指定 URL 内容" }
]
```

模型决定何时调用，结果回注上下文，实现真正的 agentic 研究。

### 阶段三：MCP 集成（v3.0）`需后端`

接入 MCP（Model Context Protocol）服务，统一管理工具注册和调用。

#### 传输方式与架构约束（重要）

MCP 有两类传输，当前「纯 Web 应用 + Vercel Serverless」架构只能落地其中一种：

| 传输 | 说明 | 当前架构 | 原因 |
|------|------|---------|------|
| 远程 HTTP（HTTP+SSE / Streamable HTTP） | 远程 MCP 服务器 | ✅ 可做（需后端代理） | 折叠进 `api/search.js` 按 action 分发，无状态模式每次 re-initialize |
| stdio（本地子进程，最常见） | 客户端 spawn 本地进程，走 stdin/stdout 管道 | ❌ 做不了 | 浏览器沙箱不能 spawn 进程；Vercel 函数即使能 spawn 也是云端一次性容器（机器不对 + 活不下来） |

> stdio 的前提是「客户端能在用户本机拉起常驻子进程」。Web 应用客户端被劈成浏览器（沙箱）+ 云函数（异地、一次性），没有任何一半是用户本机常驻进程，故不支持。

#### TODO（待办 · 做桌面客户端时执行）

**一旦 Atlas 改为原生桌面应用（Electron / Tauri），即可解锁 stdio MCP。** 届时需注意：

1. MCP 客户端逻辑必须放在**主进程 / 原生层**（Electron main / Tauri Rust 侧），**不能**放渲染层 webview —— webview 与浏览器同为沙箱，照样不能 spawn 进程
2. 需让 MCP server 运行时可用：bundle 一个 node/python，或让用户配置可执行路径
3. 部分 agentic 工具执行逻辑需从云端下沉到本地主进程
4. 这是「Claude Desktop / Cursor / Cline 跑 stdio MCP」的同款做法

> 提醒：当本仓库出现桌面客户端（Electron/Tauri）相关工作时，回到此处落地 stdio MCP 支持。

#### 实现记录（v2.8.0 · 远程 HTTP MCP）

**完成日期**：2026-06-03

**架构：客户端发现 + 后端无状态代理（零新增 serverless 函数）**
- 函数预算仍卡 12/12 → MCP 代理折叠进 `api/search.js`，按 `action` 字段分发（`search` 走 Tavily，`mcp` 走 JSON-RPC 转发）
- 后端 `mcpOperation()`：单次函数调用内完成 `initialize → notifications/initialized → tools/list|tools/call` 完整握手（无状态）；兼容 `application/json` 与 `text/event-stream`(SSE) 两种响应
- 前端 `discoverMcpTools()`：生成前拉取各 server 的 `tools/list`，转成 OpenAI function-calling schema 并命名空间化（`mcp_{si}_{name}`），与内置 `web_search`/`fetch_url` 合并喂给模型
- 前端 `executeMcpTool()`：模型选了 MCP 工具 → 经代理调 `tools/call` → 提取 `content[].text` 回填
- 复用 v2.7.0 的 `runAgenticResearch` 循环、per-provider 分级与降级兜底

**配置**：Settings → 模型 →「MCP 服务器」（名称 + URL + 可选 Bearer Token，存 localStorage `atlas_mcp_servers`）

**核心代码位置**
- `api/search.js` — `mcpPost()` / `mcpOperation()` / `handleMcp()` + action 分发
- `src/App.jsx` — `getMcpServers()` / `mcpProxy()` / `discoverMcpTools()` / `executeMcpTool()`
- `src/App.jsx` — `McpServersConfig` 组件（Settings UI）

**边界**：仅远程 HTTP；强会话 server 可能不兼容（无状态代理每次重新握手）；任何 MCP 调用失败 → 静默跳过该工具，不阻断出报告。

---

## 实现难度

- 阶段一（Jina 注入）：低
- 阶段二（Tool Use）：高（需重构调用流程 + 后端代理）
- 阶段三（MCP）：很高
