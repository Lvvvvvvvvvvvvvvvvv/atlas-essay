# 04 · Tasks（任务持久化）

> 关掉 Tab 也能继续生成。报告任务跑在服务器上，回来直接看结果。

---

## 开发状态

| 子项 | 状态 | 完成版本 |
|------|------|---------|
| Supabase tasks 表 | **进行中** | — |
| api/tasks — 创建 + 列表 | **进行中** | — |
| api/tasks/worker — QStash 回调执行生成 | **进行中** | — |
| 前端：任务状态轮询 UI | **进行中** | — |

---

## 工作流

```
用户点「生成」
  → POST /api/tasks（创建 DB 记录，状态 queued）
  → 发送任务到 QStash 队列
  → 前端开始轮询 GET /api/tasks/:id

QStash（异步）
  → POST /api/tasks/worker（验证签名）
  → 调用模型 API 生成报告（使用服务端 Key）
  → 保存结果到 reports 表 + 更新 tasks 状态 → done

用户回来（无论隔多久）
  → 轮询发现 status=done → 加载报告
```

---

## 新增环境变量

| 变量 | 来源 |
|------|------|
| `QSTASH_TOKEN` | console.upstash.com → QStash → API Keys |
| `QSTASH_CURRENT_SIGNING_KEY` | 同上 |
| `QSTASH_NEXT_SIGNING_KEY` | 同上 |

---

## 模式说明

| 模式 | 触发条件 | 行为 |
|------|---------|------|
| 流式直连 | 有 API Key（客户端或服务端） + 保持在页面 | 实时流式输出（现有行为） |
| 后台任务 | 有服务端 Key + 点击「后台生成」 | 进队列，关 Tab 继续跑 |

---

## 核心代码位置

- `api/tasks/index.js` — POST 创建任务 / GET 列表
- `api/tasks/[id].js` — GET 单任务状态
- `api/tasks/worker.js` — QStash 回调（生成 + 保存）
- `src/App.jsx` — 后台任务入口按钮 + 轮询 UI
