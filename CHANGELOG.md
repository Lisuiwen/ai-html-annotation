# Changelog

All notable changes to AI HTML Annotation will be documented in this file.
此处记录 AI HTML Annotation 的所有重要变更。

## v0.3.1 — 2026-09-10

### Changed / 变更

- Localized Viewer, Author Tools, and the minimal example UI copy to English (`lang="en"`): scenario switching, note rails, Direct Edit, and Mark labels, hints, toasts, and error messages.
- 将 Viewer、Author Tools 与最小示例的界面文案本地化为英文（`lang="en"`）：场景切换、说明栏、Direct Edit 与 Mark 的标签、提示、Toast 与错误消息。
- The minimal example annotations and scenario labels now use English copy, staying synchronized with the Skill template.
- 最小示例的说明与场景标签现使用英文文案，并与 Skill 模板保持同步。

### Fixed / 修复

- Synced the Viewer contract test with the localized runtime error messages.
- 同步 Viewer 契约测试与本地化后的运行时错误消息。

### Install / update / 安装 / 更新

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

## v0.3.0 — 2026-09-09

### Added / 新增

- Final prototype deliveries now use a self-contained named parent directory with `AGENTS.md`, the runnable HTML, supporting files, and scenario screenshots.
- 最终原型交付现使用自包含、带命名的上级目录，内含 `AGENTS.md`、可运行 HTML、配套文件与场景截图。
- A concise Coding Agent handoff template directs implementation work to product annotations and screenshots, with anchor-scoped HTML lookup only when necessary.
- 新增简明 Coding Agent 交接模板，将实现工作导向产品说明与截图，仅在必要时按锚点定位 HTML。

### Changed / 变更

- The delivery contract and checklist now require copying the handoff template into every final prototype package.
- 交付契约与复检清单现要求将交接模板复制到每个最终原型包中。
- The minimal example includes the same handoff file and verifies it stays synchronized with the Skill template.
- 最小示例包含同一交接文件，并校验其与 Skill 模板保持同步。

### Install / update / 安装 / 更新

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

## v0.2.1 — 2026-09-08

### Fixed / 修复

- macOS shortcut compatibility across Author Tools: shared `author/core/platform.js` for `⌘` vs `Ctrl` labels and modifier detection.
- Author Tools 全量支持 macOS 快捷键：共用 `author/core/platform.js` 处理 `⌘` 与 `Ctrl` 的标签及修饰键识别。
- Notes Editor multiline save now accepts `⌘ + Enter` (and `Control + Enter`) on macOS, not only `Ctrl + Enter`.
- Notes Editor 多行保存现支持 macOS 的 `⌘ + Enter`（及 `Control + Enter`），不再仅限于 `Ctrl + Enter`。

### Changed / 变更

- Direct Edit and Mark empty-state hints show `⌘` on macOS instead of always `Ctrl`.
- Direct Edit 与 Mark 的空态提示在 macOS 上显示 `⌘`，不再一律显示 `Ctrl`。
- Root README and Skill references document macOS shortcuts for Edit, Mark, and Notes Editor.
- 根 README 与 Skill references 记录了 Edit、Mark 与 Notes Editor 的 macOS 快捷键。

### Install / update / 安装 / 更新

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

## v0.2.0 — 2026-09-08

### Added / 新增

- **Author Tools** shell with `Edit` and `Mark` tabs in one panel.
- **Author Tools** 外壳，同一面板内提供 `Edit` 与 `Mark` 两个 Tab。
- **Direct Edit** for in-browser style and copy changes that save back to `prototype.html` through the localhost authoring server.
- **Direct Edit**：在浏览器内修改样式与文案，并通过 localhost 作者服务保存回 `prototype.html`。
- **Mark** review pins with macOS `⌘`+click support and `Copy all → For AI` export.
- **Mark** 评审 pin，支持 macOS `⌘`+点击与 `Copy all → For AI` 导出。
- Claude Code plugin marketplace entry (`.claude-plugin/marketplace.json`).
- Claude Code 插件市场入口（`.claude-plugin/marketplace.json`）。
- `skills.sh` and Claude Code install paths in the root README.
- 根 README 中的 `skills.sh` 与 Claude Code 安装路径。
- GitHub Pages landing page (`index.html`).
- GitHub Pages 落地页（`index.html`）。
- Chinese README (`README.zh-CN.md`) and delivery checklist reference.
- 中文 README（`README.zh-CN.md`）与交付复检清单引用。
- Runtime unit and contract tests across `client/`, `author/`, `server/`, and `cli/`.
- 覆盖 `client/`、`author/`、`server/`、`cli/` 的运行时单元与契约测试。

### Changed / 变更

- Runtime reorganized by execution boundary: `client/`, `author/`, `server/`, `cli/`.
- 运行时按执行边界重组：`client/`、`author/`、`server/`、`cli/`。
- `PrototypeViewers` state model v2 with split `display-mode.js`, `state.js`, `model.js`, and `viewer.js`.
- `PrototypeViewers` 状态模型 v2，拆分为 `display-mode.js`、`state.js`、`model.js` 与 `viewer.js`。
- Authoring server moved to `runtime/server/index.mjs`; screenshot CLI to `runtime/cli/screenshot.mjs`.
- 作者服务迁移至 `runtime/server/index.mjs`；截图 CLI 迁移至 `runtime/cli/screenshot.mjs`。
- IDE config (`.env`) moved to the Skill root (`skills/html-prototype-build/.env`).
- IDE 配置（`.env`）迁移至 Skill 根目录（`skills/html-prototype-build/.env`）。
- Skill references split by task (local authoring, review mark, screenshots, delivery).
- Skill references 按任务拆分（本地作者服务、评审打点、截图、交付）。
- Viewer action area: fixed scene switch / add note / author tools order; solid primary scene buttons.
- Viewer 操作区：固定场景切换 / 新增说明 / 作者工具顺序；场景按钮改为实心主色。
- Root README demo GIFs updated for Viewer and Author Tools (Direct Edit + Mark).
- 根 README 的演示 GIF 已更新，覆盖 Viewer 与 Author Tools（Direct Edit + Mark）。

### Fixed / 修复

- Direct Edit source writes hardened with atomic patches and selector validation.
- 加固 Direct Edit 的源码写入：原子补丁与选择器校验。
- Notes Editor toolbar pinned to the left of the action area.
- Notes Editor 工具栏固定至操作区最左侧。
- Example snapshot anchors aligned with DOM ids.
- 示例快照锚点与 DOM id 对齐。

### Migration / 迁移

- Update local Skill copies or reinstall:
- 更新本地 Skill 副本或重新安装：

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

- Replace old runtime paths:
- 替换旧的运行时路径：
  - `runtime/serve.mjs` → `runtime/server/index.mjs`
  - `runtime/shoot.mjs` → `runtime/cli/screenshot.mjs`
  - `runtime/html-mark.js` → `runtime/author/tools/mark/`

## v0.1.0 — Initial public release / 首个公开发布

AI HTML Annotation introduces a native-HTML workflow for building, reviewing, annotating, and iterating UI prototypes with coding agents.
AI HTML Annotation 引入了一种原生 HTML 工作流，与编码 Agent 一起构建、评审、标注并迭代 UI 原型。

### Highlights / 亮点

- Reusable UI packs for stable HTML prototype generation.
- 可复用的 UI 包，用于稳定生成 HTML 原型。
- DOM-bound product annotations with grouped notes and SVG connectors.
- 绑定 DOM 的产品说明：分组笔记与 SVG 连线。
- Review pins that export selectors, element HTML snapshots, and AI-ready feedback context.
- 评审 pin，可导出选择器、元素 HTML 快照与 AI 就绪的反馈上下文。
- Local Inspector workflow for locking a live element and jumping back to source.
- 本地 Inspector 工作流：锁定线上元素并跳回源码。
- Explicit prototype state handling through `PrototypeViewers`.
- 通过 `PrototypeViewers` 显式处理原型状态。
- Scenario-based clean screenshots for create, edit, empty, linked, and other declared UI states.
- 基于场景的纯净截图，覆盖创建、编辑、空态、联动及其他已声明的 UI 状态。
- Local authoring tools kept separate from the final HTML deliverable.
- 本地作者工具与最终 HTML 交付物相互隔离。
- Agent Skill packaging under `skills/html-prototype-build/`.
- Agent Skill 打包于 `skills/html-prototype-build/` 下。
- Zero npm runtime dependencies.
- 零 npm 运行时依赖。

### Install the Agent Skill / 安装 Agent Skill

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

### Status / 状态

This is an experimental 0.x release. APIs, file layout, and authoring workflows may change while the project evolves.
这是一个实验性 0.x 版本。随着项目演进，API、文件布局与作者工作流可能发生变化。
