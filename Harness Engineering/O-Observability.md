# O · Observability（可观测性层）· P5

> 没有度量就没有改进。可观测性是优化所有上层的基础。

**优先级：P5** — 不直接影响单次输出，但是持续迭代的前提。

---

## 当前状态

- 报告存储：localStorage 保存完整报告内容
- 无生成元数据（使用了哪个模型？花了多长时间？token 估算？）
- 无用户行为数据（哪些报告被收藏？哪些被删除？）
- 无质量指标（用户对报告满意度？）

---

## 方案

### 方案 A：报告元数据扩展（成本极低）

在保存报告时，在 report 对象中附加元数据字段：

```json
{
  "id": "...",
  "title": "...",
  "content": "...",
  "meta": {
    "model": "gpt-4o",
    "generationMode": "balanced",
    "durationMs": 12450,
    "tokenEstimate": 3200,
    "promptHash": "a3f2...",
    "wordCount": 1850,
    "sectionCount": 7,
    "userRating": null
  }
}
```

这些数据已经在生成过程中可获得，只需在保存时记录。

### 方案 B：报告统计面板

在报告库页面增加聚合统计：

- 各模型平均生成时长
- 各模型平均报告字数
- 用户评分分布
- 最常用模板 / 生成模式

### 方案 C：prompt 效果追踪

对 system prompt 版本做 hash 标记，记录每个 prompt 版本下的平均评分，用于 A/B 对比不同 prompt 效果。

---

## 实现难度

- 方案 A（元数据记录）：低
- 方案 B（统计面板）：中
- 方案 C（prompt 版本追踪）：中
