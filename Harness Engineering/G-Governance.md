# G · Governance（治理层）· P6

> 谁能做什么，花多少，风险怎么控。

**优先级：P6** — 当前规模下不是瓶颈，但角色强制此前形同虚设，已补齐。

---

## 开发状态

| 方案 | 状态 | 完成版本 |
|------|------|---------|
| G-1：角色强制落地（客户端） | **已完成** | v3.0.0 |
| A：生成前成本粗估 | **已完成** | v3.0.0 |
| B：每日生成次数软限制 | **已完成** | v3.0.0 |
| C：分享链接安全审查 | **已完成（实测安全）** | v3.0.0 |

---

## 当前状态

- **权限角色**：admin / editor / viewer 三级
  - 团队 API 路由（`api/teams/[...path].js`、`api/generate.js`）**服务端强制**（如 viewer 不能用团队密钥、非 admin 不能改成员）
  - 客户端 **v3.0.0 起真正强制**：viewer 不能生成 / 导出（此前 `usePermission().can()` 定义了却没接进 UI，形同虚设）
- **API Key**：个人 / 团队密钥 AES-256-GCM 加密存 Supabase；个人也可直接粘贴存 localStorage
- **成本粗估**：生成前显示 `粗估 ~N tok · ≈$X`（防超支，非账单级）
- **次数软限制**：每日 30 次软上限，超出 confirm 警告
- **分享链接**：仅 `?r=<报告ID>`，**不含任何 key 或敏感信息**（实测）

---

## 实现记录（v3.0.0）

**完成日期**：2026-06-04

**G-1 · 角色强制**
- `usePermission().can(feature)` 此前是死代码 → 接进 UI：
  - `PromptComposer`：viewer `can('generate')` 为假 → 禁用「Start writing」+ ⌘↩，显示「只读成员」提示，隐藏工作流/后台入口
  - `Report`：viewer `can('export')` 为假 → 右栏 SHARE 导出按钮替换为「无导出权限」，浮动导出兜底也隐藏
- 无团队的单人用户 / 角色加载中：`can()` 默认全放行，不受影响
- **验证**：headless 浏览器注入 viewer 角色实测 → Start 按钮 disabled、只读提示出现（截图确认）

**方案 A · 成本粗估**
- `MODEL_PRICING`（mimo/deepseek/openai/anthropic + 默认）近似单价表
- `estimateGeneration(promptChars, targetLength, provider)` → tokens + USD，`PromptComposer` 底部展示，标注「粗估」
- **验证**：node 实测 MiMo $0.003 / OpenAI $0.049（18x 比例合理）

**方案 B · 每日次数软限制**
- `allowDailyGen()`：localStorage 按日记数，达 `DAILY_GEN_LIMIT=30` 时 confirm 警告，接进 `goRun`/`goWorkflow`/`goBackground`

**方案 C · 分享链接安全**
- 审查 `CopyLinkBtn` 与 ExportModal link：链接形如 `<origin>?r=<报告ID>`，报告内容存 localStorage/云端，**链接本身不含 key**。安全。

**核心代码位置**
- `src/App.jsx` — `usePermission`（已被 `PromptComposer`/`Report` 调用）
- `src/App.jsx` — `MODEL_PRICING` / `estimateGeneration` / `allowDailyGen` / `DAILY_GEN_LIMIT`

---

## 待办（低优先级）

- 细粒度 editor 门（`model_config` / `source_manage` / `sync`）目前仍只在矩阵展示，未逐项强制；editor 误操作风险低，按需再补
- 成本预估为粗估，未接入各模型实时定价

## 实现难度

- G-1（角色强制）：低（已完成）
- 方案 A（费用预估）：中（已完成）
- 方案 B（次数限制）：低（已完成）
- 方案 C（安全审查）：低（已完成）
