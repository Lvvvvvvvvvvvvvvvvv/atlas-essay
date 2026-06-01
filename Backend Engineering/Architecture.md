# Backend Architecture

> 从纯客户端工具升级为团队协作平台。前端保持 React，后端全托管，无需自维护服务器。

---

## 技术选型

| 层 | 技术 | 版本 | 用途 |
|---|---|---|---|
| 前端 | React + Vite | 18 / 5 | 不变 |
| 部署 | Vercel | — | 前端静态 + API Routes |
| 数据库 + 认证 | Supabase | PostgreSQL 15 | 用户/报告/任务存储 |
| 后台任务 | Upstash QStash | — | 关 Tab 后台继续生成（Phase 4） |
| 搜索 | Tavily API | — | Research 增强（Phase 6） |

---

## 系统架构

```
浏览器（React）
    │
    ├─ Supabase JS Client（auth session 管理）
    │       └─ auth.users + session JWT
    │
    └─ Vercel API Routes（Node.js 20）
            ├── /api/_lib/supabase.js   ← service role client（服务端）
            ├── /api/_lib/auth.js       ← JWT 验证中间件
            ├── /api/generate/*         ← AI 生成（Key 在服务端）
            ├── /api/reports/*          ← 报告 CRUD
            ├── /api/tasks/*            ← 任务状态（Phase 4）
            ├── /api/teams/*            ← 团队管理
            └── /api/research/*         ← Tavily 搜索（Phase 6）
                    │
                    ├── Supabase DB（PostgreSQL）
                    ├── Model API（Claude 等）
                    ├── Upstash QStash（Phase 4）
                    └── Tavily API（Phase 6）
```

---

## 环境变量

```bash
# Supabase（前端 + 后端都用）
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Supabase（仅服务端 API Routes）
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI 模型（仅服务端，Phase 3）
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# 后台任务（Phase 4）
QSTASH_TOKEN=...
QSTASH_CURRENT_SIGNING_KEY=...
QSTASH_NEXT_SIGNING_KEY=...

# 搜索（Phase 6）
TAVILY_API_KEY=tvly-...
```

---

## 数据库 Schema

```sql
-- 用户 Profile（扩展 auth.users）
create table profiles (
  id          uuid references auth.users primary key,
  display_name text,
  avatar_url  text,
  created_at  timestamptz default now()
);

-- 团队
create table teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_by  uuid references auth.users,
  created_at  timestamptz default now()
);

-- 团队成员（含角色）
create table team_members (
  team_id   uuid references teams on delete cascade,
  user_id   uuid references auth.users on delete cascade,
  role      text check (role in ('admin','editor','viewer')) default 'editor',
  joined_at timestamptz default now(),
  primary key (team_id, user_id)
);

-- 报告（Phase 2：从 localStorage 迁移）
create table reports (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid references teams on delete cascade,
  user_id     uuid references auth.users,
  title       text,
  content     text,
  meta        jsonb,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 生成任务（Phase 4）
create table tasks (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid references teams on delete cascade,
  user_id     uuid references auth.users,
  type        text,   -- 'full' | 'outline' | 'section' | 'workflow'
  status      text default 'queued',  -- queued|running|done|failed
  input       jsonb,
  output      jsonb,
  error       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 加密 API Keys（Phase 3）
create table api_keys (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid references teams on delete cascade,
  provider    text,   -- 'anthropic' | 'openai' | ...
  key_enc     text,   -- AES-256 加密后存储
  created_by  uuid references auth.users,
  created_at  timestamptz default now()
);
```

---

## 开发进度

| # | 模块 | 状态 | 文档 |
|---|------|------|------|
| 1 | 用户账户（Auth） | ✅ 完成 | [01-Auth.md](./01-Auth.md) |
| 2 | 报告云同步 | ✅ 完成 | [02-CloudSync.md](./02-CloudSync.md) |
| 3 | API Key 服务端管理 | ✅ 完成 | [03-APIKey.md](./03-APIKey.md) |
| 4 | 任务持久化（QStash） | ✅ 完成 | [04-Tasks.md](./04-Tasks.md) |
| 5 | 节点式工作流 | 待启动 | [05-Workflow.md](./05-Workflow.md) |
| 6 | Research 增强（Tavily） | ✅ 完成 | [06-Research.md](./06-Research.md) |

---

## Harness Engineering 状态（暂停中）

| 层 | 状态 | 恢复条件 |
|---|------|---------|
| C · Context | ✅ v2.2.x | — |
| E · Execution | ✅ v2.3.x | — |
| V · Verification | ✅ v2.4.x | — |
| L · Lifecycle 阶段一 | ✅ v2.5.0 | — |
| **L · Lifecycle 阶段二** | ⏸ 暂停 | 后端 ①②③ 完成后继续 |
| L · Lifecycle 阶段三 | ⏸ 暂停 | 后端 ④ 完成后继续 |
