# 02 · Cloud Sync（报告云同步）

> 将报告从 localStorage 迁移至 Supabase，实现跨设备访问和团队共享。

---

## 开发状态

| 子项 | 状态 | 完成版本 |
|------|------|---------|
| Supabase reports 表 + RLS | **进行中** | — |
| useSavedReports 双写（localStorage + Supabase） | **进行中** | — |
| 登录时从云端拉取报告合并 | **进行中** | — |
| api/reports CRUD 路由 | **进行中** | — |

---

## 迁移策略

不破坏现有功能，采用**双写渐进迁移**：

```
保存报告
  → 写 localStorage（现有，保持不变）
  → 同时异步写 Supabase（新增，失败不阻断）

读取报告
  → 登录后：Supabase 数据 merge 进 localStorage
  → 未登录：仅读 localStorage（降级兼容）
```

---

## 数据结构映射

| localStorage 字段 | Supabase reports 列 |
|---|---|
| `id` | `id` (uuid) |
| `prompt` | `prompt` |
| `title` | `title` |
| `content` (markdown) | `content` |
| `meta` (json) | `meta` (jsonb) |
| `savedAt` | `created_at` |
| `rating` | `meta.rating` |

---

## 核心改动

- `useSavedReports` — `saveReport` 新增异步上云；`loadReports` 登录后 merge
- `api/reports/index.js` — GET（列表）/ POST（创建）
- `api/reports/[id].js` — GET（详情）/ PATCH（更新）/ DELETE

---

## 核心代码位置

- `src/hooks/useSavedReports.js`（从 App.jsx 抽离或就地修改）
- `api/reports/index.js`
- `api/reports/[id].js`
