# 06 · Research 增强（Tavily）

> 用 Tavily 搜索 API 替代手动贴 URL，实现关键词 → 自动联网搜索 → 内容注入上下文。

---

## 开发状态

| 子项 | 状态 |
|------|------|
| `api/search.js` 接口 | ✅ 完成 |
| 前端搜索 Tab（UrlContextPopover） | ✅ 完成 |
| 结果注入 prompt context | ✅ 完成 |

---

## 架构

```
前端（搜索 Tab）
  → POST /api/search { query, maxResults }
    → Tavily API（服务端持有 key）
    → 返回 { results: [{title, url, content, score}] }
  → 用户选择结果 → 加入 searchContexts
  → 生成时合并进 <context> block（无需 Jina 二次抓取）
```

---

## 环境变量

| 变量 | 来源 |
|------|------|
| `TAVILY_API_KEY` | app.tavily.com → API Keys |

---

## 核心代码

- `api/search.js` — POST /api/search，调 Tavily API
- `src/App.jsx` — UrlContextPopover 新增"搜索"Tab
- `src/App.jsx` — streamReport 的 context block 合并 searchContexts
