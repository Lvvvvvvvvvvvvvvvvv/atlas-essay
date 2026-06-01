# E · Execution（执行层）· P1

> 同一个 prompt，参数不同，输出质量可以差一倍。

**优先级：P1** — 调参成本极低，对报告生成场景收益立竿见影。

---

## 开发状态

| 方案 | 状态 | 完成版本 |
|------|------|---------|
| 生成模式预设（方案 A） | **已完成** | v2.5.0 |
| 按模型自动优化（方案 B） | **已完成** | v2.6.0 |

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

---

## 实现记录（v2.6.0）

**完成日期**：2026-06-01

### 核心改动

**`MODEL_PARAM_PRESETS` 常量：**

每个内置模型在三种生成模式下的厂商推荐参数：

| 模型 | 模式 | temperature | top_p | frequency_penalty |
|------|------|------------|-------|------------------|
| Opus 4.7 | 严谨/均衡/探索 | 0.20/0.40/0.70 | 0.85/0.90/0.95 | 0.20/0.10/0.00 |
| Sonnet 4.6 | 严谨/均衡/探索 | 0.25/0.45/0.75 | 0.85/0.90/0.95 | 0.20/0.10/0.00 |
| Haiku 4.5 | 严谨/均衡/探索 | 0.20/0.40/0.65 | 0.85/0.90/0.95 | 0.25/0.15/0.00 |
| MiMo V2.5 Pro | 严谨/均衡/探索 | 0.15/0.30/0.55 | 0.80/0.85/0.90 | 0.25/0.15/0.05 |

**切换模型自动应用预设：**
- `selectModel(id)` 切换模型时，若当前模式为内置模式（非自定义），自动查找 `MODEL_PARAM_PRESETS[newModelId][currentMode]` 并更新三个参数
- 无需用户手动重新选择模式

**切换模式使用模型专属参数：**
- `setGenerationMode(id)` 优先用 `getModelPreset(selectedId, modeId)` 获取当前模型的对应参数，找不到则回退到 `GENERATION_MODES` 通用默认值

**GenerationModePopover 参数值更新：**
- 每个模式显示的 `temp / top_p / fp` 值已更新为当前选中模型的实际预设值（而非全局默认）

**per-model 参数模板：**
- `useModelStore` 新增 `modelParamTemplates` 状态（`{ [modelId]: [{id, name, temperature, topP, frequencyPenalty}] }`），localStorage 持久化（key: `atlas_model_param_templates`）
- `addModelTemplate(modelId, name, temp, tp, fp)` / `removeModelTemplate(modelId, tplId)` CRUD
- `setGenerationMode` 支持 `tpl_xxx` 格式 ID，自动应用对应模板参数
- `GenerationModePopover`：当前模型有模板时，内置模式下方新增「自定义模板」分区，可点击切换
- **Settings 模型标签页**：「参数模板」区块，显示当前模型的已保存模板列表（点击切换、删除），「＋ 保存当前参数为模板」按钮含名称输入

### 核心代码位置

- `src/App.jsx` — `MODEL_PARAM_PRESETS` 常量（四个模型三种模式的参数映射）
- `src/App.jsx` — `getModelPreset(modelId, modeId)` 辅助函数
- `src/App.jsx` — `useModelStore()` 新增 `modelParamTemplates` / `addModelTemplate` / `removeModelTemplate`，更新 `selectModel` / `setGenerationMode`
- `src/App.jsx` — `GenerationModePopover` 新增模型专属参数显示 + 用户模板分区
- `src/App.jsx` — `SettingsModal` 新增「参数模板」区块（模板列表 + 保存表单）

---

## 实现难度

- 方案 A（生成模式预设）：已完成
- 方案 B（按模型自动优化）：已完成
