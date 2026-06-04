# M · Memory（记忆层）· 附加层

> ETCLOVG 七层未含 Memory——那是该框架的分类法，不代表业务无关。记忆类需求在
> Atlas 这种**任务隔离的报告生成**场景下优先级本就低，且大部分已散落在 C/O/L 层。
> 本层把「让模型记住你」的能力收拢成一个统一、可注入、可治理的形态。

**版本**：v3.2.0 · **完成日期**：2026-06-04 · **存储**：localStorage（不需建表）

---

## 为什么单列一层

记忆类能力此前散落各处：报告库（O，情景记忆）、团队知识库（C，语义记忆）、
追问（L，短期记忆）、Toolbar 持久化（偏好状态）。缺的是一个**统一的、agentic
的记忆**：从历史**学习**并**主动反哺**下一次生成。M 层补上这块。

---

## 架构

- **存储**：全部 localStorage（与模板/语言/Toolbar 一致），无后端、无迁移
- **注入**：所有记忆汇成一个 `<user_memory>` 块，注入 `streamReport` 与
  `streamSection` 的 system prompt（复用既有 context 注入口）
- **降级**：无记忆 → 不注入 → 与未启用时完全一致

```
buildMemoryBlock(topic) →
  <user_memory>
  用户写作偏好：…           ← 画像 notes
  需主动避免（基于历史差评）：… ← 画像 avoid（差评原因自动累积）
  涉及相关主题时重点关注：…    ← 实体记忆（topic 命中关键词）
  </user_memory>
```

---

## 四项能力

### 1. 评分反哺生成（V→M 闭环）
此前好/差评只被「观察」（O），从不「行动」。现在：
- 打**差评** → 弹一键原因（内容太浅/结构混乱/数据不足/语气不符/不够具体/过度营销）→ 写入画像 `avoid` → 下次生成注入「需主动避免」
- 生成页显示当前 **模型+模式的历史好评率**（≥3 篇才显示；绿/灰/红）
- `deriveProfileStats` 归纳偏好时，good 评报告加权

### 2. 跨报告实体记忆
- 新建「领域」= 触发关键词 + 重点对象（如 咖啡 → Manner/库迪/挪瓦）
- 生成时 topic 命中关键词 → 注入「重点关注并尽量覆盖：…」
- 管理入口：设置 → 记忆 → 实体记忆

### 3. 用户写作画像
- `atlas_writing_profile = { notes[], avoid[] }`，手动可编辑，差评自动累积 avoid
- **历史归纳（只读）**：从历史（好评优先）算出常用 模型/模式/语气/语言/风格
- 为支持归纳，报告 `meta` 新增记录 `language / style / length`

### 4. 基于旧报告增量更新
- 报告页「↻ 基于此更新」→ 用旧报告主题 + 章节结构组装「用最新数据更新、保留
  结构、标注新增/变化」的 prompt → 直接生成（实体记忆同时生效）

---

## 核心代码位置

- `src/App.jsx` — `getWritingProfile/saveWritingProfile/addProfileAvoid`、
  `getEntityMemory/saveEntityMemory`、`buildMemoryBlock(topic)`、`deriveProfileStats(reports)`
- `src/App.jsx` — `streamReport` / `streamSection` 注入 `<user_memory>`
- `src/App.jsx` — `MemorySettings` 组件（设置「记忆」Tab）
- `src/App.jsx` — `Report` 差评原因行 + 「基于此更新」；`PromptComposer` 好评率提示

---

## 验证状态

- ✅ `buildMemoryBlock` / `deriveProfileStats`：node + localStorage stub 实测
  （命中/未命中/空记忆注入正确；归纳正确 good 加权、排除差评配置）
- ⏳ 端到端（设置面板编辑 → 生成时真实注入 → 差评闭环）：需线上真模型走查

---

## 边界与待办

- 现为本机存储，跨设备不同步（可后续上云：`atlas_writing_profile` / `atlas_entity_memory` → Supabase）
- 实体「自动从历史报告提取高频专有名词建议」未做（当前手动添加）
- 增量更新目前注入旧报告的「结构+主题」，未注入旧正文全文（避免 token 膨胀）；
  如需逐段对比更新，可后续扩展
