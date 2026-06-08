-- Atlas Report Agent · Workflow 功能数据库迁移
-- 版本: v3.3.0
-- 执行方式: 在 Supabase Dashboard → SQL Editor 粘贴执行

-- ── workflows 表（工作流定义存储）────────────────────────────────────────────
create table if not exists workflows (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users on delete cascade,
  team_id      uuid references teams on delete cascade,
  name         text not null,
  description  text default '',
  definition   jsonb not null default '{"nodes":[],"edges":[]}',
  is_template  boolean default false,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- 索引
create index if not exists workflows_user_id_idx   on workflows (user_id);
create index if not exists workflows_team_id_idx   on workflows (team_id);
create index if not exists workflows_updated_at_idx on workflows (updated_at desc);

-- ── Row Level Security ───────────────────────────────────────────────────────
alter table workflows enable row level security;

-- 查看：自己的 + 所在团队的
create policy "workflows_select" on workflows for select
  using (
    user_id = auth.uid()
    or team_id in (
      select team_id from team_members where user_id = auth.uid()
    )
  );

-- 创建：已登录用户
create policy "workflows_insert" on workflows for insert
  with check (user_id = auth.uid());

-- 修改：只能改自己的
create policy "workflows_update" on workflows for update
  using (user_id = auth.uid());

-- 删除：只能删自己的
create policy "workflows_delete" on workflows for delete
  using (user_id = auth.uid());

-- ── tasks 表扩展（若 meta 列不存在则添加）───────────────────────────────────
-- tasks 表已存在，type='workflow' 和 meta jsonb 字段已在原 schema 中规划
-- 如果 meta 列不存在，执行以下语句：
-- alter table tasks add column if not exists meta jsonb default '{}';

-- ── 验证 ─────────────────────────────────────────────────────────────────────
-- 执行后应看到 workflows 表出现在 Table Editor 中
-- select count(*) from workflows;  -- 应返回 0
