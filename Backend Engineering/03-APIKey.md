# 03 · API Key 服务端管理

> 将模型 API Key 从 localStorage 迁移至服务端加密存储，前端永远看不到明文 Key。

---

## 开发状态

| 子项 | 状态 | 完成版本 |
|------|------|---------|
| Supabase api_keys 表 | **进行中** | — |
| 加密/解密工具（AES-256-GCM） | **进行中** | — |
| api/keys CRUD 路由 | **进行中** | — |
| api/generate 流式代理 | **进行中** | — |
| 前端 Settings 服务端 Key 管理 UI | **进行中** | — |
| streamReport 路由切换（客户端/服务端） | **进行中** | — |

---

## 安全模型

```
用户在 Settings 填入 API Key
  → POST /api/keys（携带 JWT）
  → 服务端 AES-256-GCM 加密
  → 密文存 Supabase api_keys 表
  → 明文丢弃，前端不保存

生成报告时（服务端 Key 模式）
  → POST /api/generate（携带 JWT + 生成参数）
  → 服务端解密 Key
  → 服务端调用模型 API
  → SSE 流式响应代理回前端
```

---

## 新增环境变量

| 变量 | 说明 |
|------|------|
| `API_KEY_ENCRYPTION_SECRET` | 32字节十六进制，用于 AES-256-GCM 加密 Key |

值：`81f8d8ef353372c2f1da828879b15872ee2455604b3aec61e42c281b29984b55`

---

## 数据库表

```sql
create table api_keys (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null,
  provider   text not null,  -- 'anthropic' | 'openai' | 'custom'
  api_url    text,           -- custom endpoint URL
  key_enc    text not null,  -- AES-256-GCM 加密后的 JSON
  label      text,
  created_at timestamptz default now()
);
alter table api_keys enable row level security;
create policy "apikeys_self" on api_keys for all using (user_id = auth.uid());
```

---

## 核心代码位置

- `api/_lib/crypto.js` — encrypt / decrypt
- `api/keys/index.js` — GET（列表，masked）/ POST（保存）
- `api/keys/[id].js` — DELETE
- `api/generate.js` — 流式生成代理
- `src/App.jsx` — Settings 服务端 Key 区块 + streamReport 路由切换
