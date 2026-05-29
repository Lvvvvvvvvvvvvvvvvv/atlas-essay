# Atlas Report Agent · 版本更新日志

> 版本命名规则：`v主版本.次版本.补丁`
> - **主版本**（x.0.0）：架构级重构或颠覆性改动，如 v2.0.0 → v3.0.0
> - **次版本**（x.x.0）：新增完整功能模块，如 v2.1.0 → v2.2.0
> - **补丁**（x.x.x）：小更新、Bug 修复、细节优化、文字调整，如 v2.1.0 → v2.1.1

---

## v2.1.0 · 2026-05-29

### 工程化 & 部署

- **Vite 工程化迁移**：将单文件 Babel CDN 应用重构为标准 Vite + React 工程
  - `src/App.jsx` — 所有 JSX 由 Vite 预编译，移除运行时 Babel 依赖
  - `src/main.jsx` — React 18 入口，`ReactDOM.createRoot`
  - `src/styles/globals.css` — CSS 从内联 `<style>` 块独立提取
  - `vite.config.js` — 使用 `vite-plugin-singlefile` 输出单文件 `dist/index.html`
- **GitHub Actions CI/CD**：推送 `main` 后自动 `npm run build` → 部署 `dist/` 到 `gh-pages`
- **文档同步到 Pages**：workflow 新增 `cp -r docs dist/`，文档随 app 一起部署

### 新增功能

- **AI 动态轮播**：左侧边栏每日从 Hacker News 抓取 AI/LLM 新闻，每 5 秒轮播，标题自动翻译为中文（Google Translate）
- **多格式导出**：导出支持 JSON / Markdown / PDF / DOCX / Notion / 分享链接
- **批量导出模式**：多选报告时可选「合并为一份」或「分别导出」（JSON / MD 格式）

### 设置优化

- **模型删除**：内置模型支持移除（隐藏）并可恢复；自定义模型支持永久删除
- **权限矩阵**：点击单元格即时切换权限，无需保存，实时写入 localStorage
- **清除数据**：改用页面内确认 UI（不再弹出浏览器原生 `window.confirm`），删除后无需刷新
- **max_tokens 保护**：硬性上限 131072，防止 API 400 错误

### 文档

- 新增 `docs/功能清单.md`：13 个模块完整功能说明，含 localStorage 键索引
- 新增 `docs/操作手册.md`：按模块分章的中文操作手册，含 FAQ、快捷键速查表
- 新增 `docs/CHANGELOG.md`：本文件，版本管理日志

---

## v2.0.0 · 2026-05-29

> 本版本为功能集中迭代版，多项设置与导出功能重构。

### 新增功能

- **设置中心重构**：
  - 导出标签支持 PDF / DOCX / MD / Notion / 分享链接，取代原「JSON 备份」
  - 权限管理标签：可视化权限矩阵，按角色（admin / editor / viewer）配置各功能开关
- **报告库无刷新同步**：删除报告后通过 `window.dispatchEvent('atlas-reports-updated')` 实时更新列表，无需整页刷新
- **演示模式**：未配置 API Key 时自动进入演示模式，输出示例报告，顶部橙色标签提示

### Bug 修复

- 修复导出下载文件名包含非法字符导致浏览器截断的问题
- 修复切换角色后部分权限校验未及时刷新的问题

---

## v1.2.0 · 2026-05-29

### 新增功能

- **今日待办 Ticker**：左侧边栏支持 Apple Shortcuts 导入今日任务，底部轮播显示
- **模板系统**：支持选择预设报告模板（行业分析 / 竞品对比 / SWOT 等），自动填充 Prompt

### 优化

- 待办 URL 格式简化为纯文本换行分隔，降低配置门槛

---

## v1.1.0 · 2026-05-29

### 新增功能

- **Rubber Hose 宠物**：左下角动态卡通宠物，支持 idle / walk / run / dance 动画状态
- **宠物互动**：点击/拖拽触发不同动画，宠物跟随鼠标漫游

---

## v1.0.0 · 2026-05-27

> 首次公开版本。

### 核心功能

- **报告生成**：输入主题，调用 AI 模型流式输出 Markdown 报告
- **多模型支持**：内置 GPT-4o / Claude 3.5 Sonnet / Gemini / DeepSeek 等 8 个主流模型，支持自定义模型
- **报告库**：保存、收藏、搜索、筛选历史报告，全部存储于 localStorage
- **数据源管理**：配置参考网址，生成时附加到 Prompt 上下文
- **权限角色**：admin / editor / viewer 三级角色，控制功能可见性
- **暗色模式 & 主题色**：支持亮 / 暗切换，可自定义主题颜色
- **GitHub Pages 部署**：单文件 HTML 通过 `deploy.sh` 一键部署

---

## 版本规划（Roadmap）

| 版本 | 预计功能 | 状态 |
|------|----------|------|
| v2.2.0 | 报告模块拆分进一步细化（components 独立文件） | 计划中 |
| v2.3.0 | 多语言支持（英文界面） | 计划中 |
| v3.0.0 | 后端 API + 云端存储（告别 localStorage 限制） | 探索中 |
