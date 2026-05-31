# E · Execution（执行层）· P1

> 同一个 prompt，参数不同，输出质量可以差一倍。

**优先级：P1** — 调参成本极低，对报告生成场景收益立竿见影。

---

## 开发状态

| 方案 | 状态 | 完成版本 |
|------|------|---------|
| 生成模式预设（方案 A） | **已完成** | v2.5.0 |
| 按模型自动优化（方案 B） | 待启动 | — |

---

## 实现记录（v2.5.0）

**完成日期**：2026-05-31

### 核心改动

**Toolbar 新增 `◈ 模式` 按钮（GenerationModePopover）：**

| 模式 | temperature | top_p | frequency_penalty | 适用场景 |
|------|------------|-------|------------------|---------|
| 严谨 | 0.25 | 0.85 | 0.20 | 行业报告、技术分析 |
| **均衡（默认）** | 0.45 | 0.90 | 0.10 | 通用报告 |
| 探索 | 0.75 | 0.95 | 0.00 | 头脑风暴、创意写作 |
| 自定义 | — | — | — | 手动调参后自动切换 |

**默认值修正：**

| 参数 | 改动前 | 改动后（均衡模式） |
|------|-------|-----------------|
| temperature | 0.7 | 0.45 |
| top_p | 1.0 | 0.90 |
| frequency_penalty | 0.0 | 0.10 |

**模式联动逻辑：**
- `setGenerationMode(id)` 原子性地更新三个参数（直接调用 raw setState，不触发"自定义"检测）
- `setTemperature` / `setTopP` / `setFrequencyPenalty` 手动调用时自动将模式切换为「自定义」
- 所有状态 localStorage 持久化

**Settings 模型参数标签页：**
- 滑块上方新增模式选择器（严谨 / 均衡 / 探索 / 自定义 chip row）
- 点击 chip 切换模式并同步更新滑块位置
- 「自定义」chip 只显示不可点击

### 核心代码位置

- `src/App.jsx` — `GENERATION_MODES` 常量（三个预设定义）
- `src/App.jsx` — `useModelStore()` 新增 `generationMode` / `setGenerationMode`
- `src/App.jsx` — `GenerationModePopover` 组件（toolbar 按钮）
- `src/App.jsx` — Settings `tab === 'model'` 区块新增模式 chip row

---

## 原始 Gap 分析

| 参数 | 改动前 | 报告生成最优 | 影响 |
|------|-------|------------|------|
| temperature | ~1.0（默认） | 0.3–0.5 | 高：低温输出更连贯、结构更稳定 |
| top_p | 未配置 | 0.9 | 中 |
| frequency_penalty | 未配置 | 0.1–0.3 | 中：减少重复表达 |
| presence_penalty | 未配置 | 0.0–0.1 | 低 |
| max_tokens | 可配置但无场景区分 | 按 topic 复杂度动态 | 低 |

---

## 实现难度

- 方案 A（生成模式预设）：已完成
- 方案 B（按模型自动优化）：中（需维护各模型推荐参数映射表）
