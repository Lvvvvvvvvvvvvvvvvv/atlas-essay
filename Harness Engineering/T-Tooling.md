# T · Tooling（工具层）· P4

> 给模型配工具，是从「写作」到「研究」的质的跃升。

**优先级：P4** — 天花板最高，但纯客户端架构受限，需分阶段推进。

---

## 当前状态

- 数据源：用户手动填写 URL，以纯文本附加到 prompt 末尾
- 模型无法实际访问 URL 内容
- 无实时搜索能力
- 无结构化数据获取

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

---

## 实现难度

- 阶段一（Jina 注入）：低
- 阶段二（Tool Use）：高（需重构调用流程 + 后端代理）
- 阶段三（MCP）：很高
