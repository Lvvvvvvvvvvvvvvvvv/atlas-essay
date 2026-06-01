# 01 · Auth（用户账户）

> 其他一切模块的基础。用户登录后才能访问团队报告、云同步、服务端 Key。

---

## 开发状态

| 子项 | 状态 | 完成版本 |
|------|------|---------|
| Supabase 项目配置 | **进行中** | — |
| 前端 Auth Client + useAuth hook | **进行中** | — |
| 登录 / 注册 UI | **进行中** | — |
| AuthGate（未登录拦截） | **进行中** | — |
| 团队创建 + 邀请 | 待启动 | — |
| 角色权限联动（admin/editor/viewer） | 待启动 | — |

---

## 用户流程

```
首次访问
  → 未登录 → LoginModal 覆盖全屏
       ├── 邮箱 + 密码登录
       ├── Magic Link（无密码，发邮件）
       └── 受邀链接（点击邮件直接进入）
  → 已登录 → 进入主 App

登录后
  → 无团队 → 引导创建团队（或等待邀请）
  → 有团队 → 正常使用
```

---

## 技术实现

### 前端
- `src/lib/supabase.js` — Supabase 客户端（anon key）
- `src/hooks/useAuth.js` — session 状态管理，暴露 `user / team / role / signIn / signOut`
- `src/components/AuthGate.jsx` — 未登录时渲染 LoginModal，已登录渲染 children
- `src/components/LoginModal.jsx` — 登录 / 注册 / Magic Link UI

### 服务端
- `api/_lib/supabase.js` — service role client（只在服务端用）
- `api/_lib/auth.js` — `requireAuth(req)` 中间件，验证 JWT，返回 user

### 数据库表
- `profiles` — 用户 display_name / avatar
- `teams` — 团队信息
- `team_members` — user ↔ team + role

### RLS（行级权限）
- `reports`：只能读写自己团队的记录
- `tasks`：只能读写自己的任务
- `profiles`：只能读写自己的 profile

---

## Supabase 配置步骤（用户操作）

1. 登录 [supabase.com](https://supabase.com) → New Project
2. 记录 `Project URL` 和 `anon key`（Settings → API）
3. 记录 `service_role key`（同页，不要泄露）
4. SQL Editor 中执行 `Architecture.md` 里的建表 SQL
5. Authentication → Email → 开启 Magic Link（可选）
6. 将三个值填入 Vercel 环境变量

---

## 核心代码位置

- `src/lib/supabase.js`
- `src/hooks/useAuth.js`
- `src/components/AuthGate.jsx`
- `src/components/LoginModal.jsx`
- `api/_lib/supabase.js`
- `api/_lib/auth.js`
