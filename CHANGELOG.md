# Changelog

All notable changes to AI HTML Annotation are documented here.

## v0.4.1 — 2026-09-15

### English

#### Changed

- Official UI packs moved to `.html-prototype/packs/`; `html-prototype-build` shrinks to 50 skill files.
- Pack install registry pins `ref: v0.4.1`; `install-pack.mjs` downloads from the tagged layout and falls back to `master` when the tag tarball is missing.
- `admin-desktop` v5 is self-contained (ECharts vendor + chart runtime live inside the pack).
- `resolve-pack.mjs` outputs `deliver[]` as `{ from, to }` pairs from `manifest.delivery`.

#### Added

- Pack install/discovery e2e tests with fixture packs and a local mock registry server.

#### Install / update

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill ui-pack-maintain
node <skill-root>/scripts/install-pack.mjs --list-remote
node <skill-root>/scripts/install-pack.mjs --pack=admin-desktop
```

### 中文

#### 变更

- 官方 UI pack 迁至 `.html-prototype/packs/`；`html-prototype-build` 缩减至 50 个 skill 文件。
- 安装 registry 固定 `ref: v0.4.1`；`install-pack.mjs` 优先从 tag 下载，tag 缺失时回退 `master`。
- `admin-desktop` v5 自包含（ECharts vendor 与 chart runtime 在 pack 内）。
- `resolve-pack.mjs` 通过 `manifest.delivery` 输出 `deliver[]`（`{ from, to }`）。

#### 新增

- 基于 fixture pack 与本地 mock registry 的 pack 安装/发现端到端测试。

#### 安装 / 更新

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill ui-pack-maintain
node <skill-root>/scripts/install-pack.mjs --list-remote
node <skill-root>/scripts/install-pack.mjs --pack=admin-desktop
```

## v0.4.0 — 2026-09-14

### English

#### Added

- New `mobile-vant` UI pack for phone-width H5 prototypes: foundation, 12 components, form/list/device-frame Patterns, and mobile-form/mobile-list Presets.
- New `ui-pack-maintain` Agent Skill with a self-contained pack contract, validator, resolver, and semantic-review workflow for creating or repairing UI Packs.
- New `examples/mobile-work-order` walkthrough: mobile work-order list and create flow with scenario screenshots and English annotations.



#### Changed

- Registered `mobile-vant` alongside `admin-desktop` in the UI pack catalog; `device-frame` pattern wraps mobile previews with desktop phone chrome.
- Localized all `mobile-vant` component placeholders and the mobile work-order example to English (`lang="en"`).
- Merged bilingual release notes into a single `CHANGELOG.md`; removed `CHANGELOG.zh-CN.md`.



#### Fixed

- Mobile work-order overlays now respect `[hidden]` inside the product preview; dialog and toast no longer leak into unrelated scenarios.
- UI pack adapter calls in the mobile example now pass component roots correctly so scenario state projects to the DOM.



#### Install / update

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill ui-pack-maintain
```



### 中文



#### 新增

- 新增 `mobile-vant` 移动端 UI 包：Foundation、12 个组件、表单/列表/设备外框 Pattern，以及 mobile-form / mobile-list Preset。
- 新增 `ui-pack-maintain` Agent Skill：自包含 Pack 契约、校验器、解析器与语义审查流程，用于创建或维护 UI Pack。
- 新增 `examples/mobile-work-order` 可对照样例：移动端工单列表与新建流程，含场景截图与英文说明。



#### 变更

- 在 UI 包目录中注册 `mobile-vant`，与 `admin-desktop` 并列；`device-frame` Pattern 为桌面预览提供手机外框。
- 将 `mobile-vant` 组件占位文案与移动端案例界面统一为英文（`lang="en"`）。
- 中英文更新说明合并至单一 `CHANGELOG.md`，删除 `CHANGELOG.zh-CN.md`。



#### 修复

- 移动端案例的弹窗与 Toast 在产品预览区内正确受 `[hidden]` 控制，不再污染其他场景截图。
- 修正移动端案例中 UI Pack adapter 的根节点传参，场景状态可正确投影到 DOM。



#### 安装 / 更新

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill ui-pack-maintain
```



## v0.3.2 — 2026-09-10



### English



#### Changed

- Completed English localization for Skill references, UI pack contracts, component templates, runtime messages, and validation scripts.
- Chinese README pairs remain for navigation; release notes lived in `CHANGELOG.md` (English) and `CHANGELOG.zh-CN.md` (中文) until v0.4.0.



#### Fixed

- Repaired corrupted mixed-language strings introduced during bulk translation (manifest keywords, README links, addon example, validate scripts, and test descriptions).
- Added a `ponytail:` glossary to `SKILL.md` and replaced ambiguous “Case” wording with “project materials”.



#### Install / update

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```



### 中文



#### 变更

- 完成 Skill 参考资料、UI 包契约、组件模板、运行时消息与校验脚本的英文本地化。
- 导航仍保留中文 README 配对；发布说明分别位于 `CHANGELOG.md`（英文）与 `CHANGELOG.zh-CN.md`（中文），直至 v0.4.0 合并。



#### 修复

- 修复批量翻译过程中产生的中英混杂乱码（manifest 关键词、README 链接、addon 示例、校验脚本与测试描述）。
- 在 `SKILL.md` 中补充 `ponytail:` 术语说明，并将易混淆的 “Case” 统一改为 “project materials”。



#### 安装 / 更新

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```



## v0.3.1 — 2026-09-10



### English



#### Changed

- Localized Viewer, Author Tools, and the minimal example UI to English (`lang="en"`), including scenario switching, the notes rail, Direct Edit, and Mark labels, hints, toasts, and error messages.
- Minimal example annotations and scenario labels now match the Skill template.



#### Fixed

- Synced the Viewer contract test with localized runtime error messages.



#### Install / update

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```



### 中文



#### 变更

- 将 Viewer、Author Tools 与最小示例界面本地化为英文（`lang="en"`），涵盖场景切换、说明栏、Direct Edit 与 Mark 的标签、提示、Toast 及错误消息。
- 最小示例的说明与场景标签已与 Skill 模板对齐。



#### 修复

- 同步 Viewer 契约测试与本地化后的运行时错误消息。



#### 安装 / 更新

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```



## v0.3.0 — 2026-09-09



### English



#### Added

- Final prototype deliveries now use a self-contained named parent directory with `AGENTS.md`, runnable HTML, supporting files, and scenario screenshots.
- A concise Coding Agent handoff template directs implementation work to product annotations and screenshots, with anchor-scoped HTML lookup only when necessary.



#### Changed

- The delivery contract and checklist require copying the handoff template into every final prototype package.
- The minimal example includes the same handoff file and verifies it stays synchronized with the Skill template.



#### Install / update

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```



### 中文



#### 新增

- 最终原型交付采用自包含的命名上级目录，内含 `AGENTS.md`、可运行 HTML、配套文件与场景截图。
- 新增简明 Coding Agent 交接模板，将实现工作导向产品说明与截图，仅在必要时按锚点定位 HTML。



#### 变更

- 交付契约与复检清单要求将交接模板复制到每个最终原型包。
- 最小示例包含同一交接文件，并校验其与 Skill 模板保持同步。



#### 安装 / 更新

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```



## v0.2.1 — 2026-09-08



### English



#### Fixed

- macOS shortcut compatibility across Author Tools via shared `author/core/platform.js` for `⌘` vs `Ctrl` labels and modifier detection.
- Notes Editor multiline save accepts `⌘ + Enter` (and `Control + Enter`) on macOS, not only `Ctrl + Enter`.



#### Changed

- Direct Edit and Mark empty-state hints show `⌘` on macOS instead of always `Ctrl`.
- Root README and Skill references document macOS shortcuts for Edit, Mark, and Notes Editor.



#### Install / update

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```



### 中文



#### 修复

- Author Tools 在 macOS 上通过共用 `author/core/platform.js` 统一 `⌘` 与 `Ctrl` 标签及修饰键识别。
- Notes Editor 多行保存支持 `⌘ + Enter`（及 `Control + Enter`），不再仅限 `Ctrl + Enter`。



#### 变更

- Direct Edit 与 Mark 的空态提示在 macOS 上显示 `⌘`。
- 根 README 与 Skill references 记录了 Edit、Mark 与 Notes Editor 的 macOS 快捷键。



#### 安装 / 更新

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```



## v0.2.0 — 2026-09-08



### English



#### Added

- Author Tools shell with `Edit` and `Mark` tabs.
- Direct Edit for in-browser style and copy changes saved through the localhost authoring server.
- Mark review pins with macOS `⌘`+click and `Copy all → For AI` export.
- Claude Code plugin marketplace entry.
- `skills.sh` and Claude Code install paths.
- GitHub Pages landing page.
- Chinese README pair.
- Runtime unit and contract tests across `client/`, `author/`, `server/`, and `cli/`.



#### Changed

- Runtime reorganized by execution boundary.
- `PrototypeViewers` state model v2 split across `display-mode.js`, `state.js`, `model.js`, and `viewer.js`.
- Authoring server and screenshot CLI moved to dedicated paths.
- IDE config moved to Skill-root `.env`.
- Skill references split by task.
- Viewer action area and README demo GIFs updated.



#### Fixed

- Direct Edit source writes hardened.
- Notes Editor toolbar pinned left.
- Example snapshot anchors aligned with DOM ids.



#### Migration

- Update local Skill copies or reinstall, and replace legacy runtime paths (`serve.mjs` → `server/index.mjs`, `shoot.mjs` → `cli/screenshot.mjs`, `html-mark.js` → `author/tools/mark/`).

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```



### 中文



#### 新增

- Author Tools 外壳（Edit / Mark 双 Tab）。
- Direct Edit 浏览器内改样式与文案，并经 localhost 作者服务写回。
- Mark 评审 pin（macOS `⌘`+点击与 `Copy all → For AI`）。
- Claude Code 插件市场入口。
- `skills.sh` 与 Claude Code 安装路径。
- GitHub Pages 落地页。
- 中文 README 配对。
- 覆盖 `client/`、`author/`、`server/`、`cli/` 的运行时单元与契约测试。



#### 变更

- 运行时按执行边界重组。
- `PrototypeViewers` v2 拆分为 `display-mode.js`、`state.js`、`model.js`、`viewer.js`。
- 作者服务与截图 CLI 迁至专用路径。
- IDE 配置迁至 Skill 根目录 `.env`。
- Skill references 按任务拆分。
- Viewer 操作区与 README 演示 GIF 已更新。



#### 修复

- 加固 Direct Edit 源码写入。
- Notes Editor 工具栏固定至左侧。
- 示例快照锚点与 DOM id 对齐。



#### 迁移

- 更新本地 Skill 副本或重新安装，并替换旧运行时路径（`serve.mjs` → `server/index.mjs`，`shoot.mjs` → `cli/screenshot.mjs`，`html-mark.js` → `author/tools/mark/`）。

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```



## v0.1.0 — Initial public release



### English

AI HTML Annotation introduces a native-HTML workflow for building, reviewing, annotating, and iterating UI prototypes with coding agents.

#### Highlights

- Reusable UI packs.
- DOM-bound product annotations with SVG connectors.
- Review pins exporting selectors and element snapshots.
- Local Inspector workflow.
- Explicit `PrototypeViewers` state.
- Scenario-based clean screenshots.
- Agent Skill packaging under `skills/html-prototype-build/`.
- Zero npm runtime dependencies.



#### Install the Agent Skill

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```



#### Status

- Experimental 0.x — APIs, file layout, and authoring workflows may change as the project evolves.



### 中文

AI HTML Annotation 引入原生 HTML 工作流，与编码 Agent 协作构建、评审、标注并迭代 UI 原型。

#### 亮点

- 可复用 UI 包。
- 带 SVG 连线的 DOM 绑定产品说明。
- 导出选择器与元素快照的评审 pin。
- 本地 Inspector 工作流。
- 显式 `PrototypeViewers` 状态。
- 基于场景的纯净截图。
- `skills/html-prototype-build/` 下的 Agent Skill 打包。
- 零 npm 运行时依赖。



#### 安装 Agent Skill

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```



#### 状态

- 实验性 0.x — API、文件布局与作者工作流可能随项目演进调整。

