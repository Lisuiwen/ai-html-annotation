# Changelog

All notable changes to AI HTML Annotation are documented here.

## v0.5.2 — 2026-10-12

### English

#### Removed

- The standalone sketch server is gone. Open the sketch board from Author Tools; the author server serves `/sketch/`.

#### Changed

- The author page shows a Stop button that shuts the local server down immediately. Closing the last tab waits 3 minutes. With no requests for 2 hours, the process exits on its own. Starting the server again while the same page is already running reuses that process.
- Pack install registry pins `ref: v0.5.2`.

#### Install / update

Re-install or update the skill copy so the author server and sketch board pick up this release:

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill ui-pack-maintain
node <skill-root>/scripts/install-pack.mjs --list-remote
node <skill-root>/scripts/install-pack.mjs --pack=admin-desktop
```

### 中文

#### 移除

- 去掉草图板的独立服务。从 Author Tools 打开草图板，由作者服务提供 `/sketch/`。

#### 变更

- 作者页面提供「停止」按钮，立即关掉本机服务。关掉最后一个标签后等待 3 分钟。连续 2 小时没有任何请求时，进程自行退出。同一页面已经在运行时，再次启动会复用该进程。
- 安装 registry 固定 `ref: v0.5.2`。

#### 安装 / 更新

请重新安装或更新本地 Skill 副本，作者服务和草图板才会用到本版：

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill ui-pack-maintain
node <skill-root>/scripts/install-pack.mjs --list-remote
node <skill-root>/scripts/install-pack.mjs --pack=admin-desktop
```

## v0.5.1 — 2026-10-12

### English

#### Changed

- The sketch board lives in `runtime/author/sketch/` with the other authoring tools. It is not copied into a prototype delivery. Open it from Author Tools, or with `node <skill-root>/runtime/author/sketch/serve.mjs` (replacing `node <skill-root>/sketch/serve.mjs` from v0.5.0).
- Drag palette components onto the canvas. Resize handles appear only on the selected stamp.
- Click text on a selected stamp to edit that sentence inline, including radio and checkbox captions. Edits stay on the stamp only and are not written back to the UI pack.
- A floating toolbar holds draw tools, then undo, send back, bring forward, delete, and leave. Shortcut hints appear when you hover those buttons.
- Pack install registry pins `ref: v0.5.1`.

#### Fixed

- Layer shortcuts and underlay handling after the sketch board boot guard.

#### Install / update

Re-install or update the skill copy so Author Tools and the sketch board pick up this release:

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill ui-pack-maintain
node <skill-root>/scripts/install-pack.mjs --list-remote
node <skill-root>/scripts/install-pack.mjs --pack=admin-desktop
```

### 中文

#### 变更

- 草图板放到 `runtime/author/sketch/`，和其他作者工具放在一起，不进入原型交付目录。可从 Author Tools 打开，或运行 `node <skill-root>/runtime/author/sketch/serve.mjs`（取代 v0.5.0 的 `node <skill-root>/sketch/serve.mjs`）。
- 组件面板支持拖到画布上。只有选中的图章才显示拉伸锚点。
- 选中图章后，可点击命中的文字就地改字，含单选、复选说明；改动只留在当前图章，不会写回 UI pack。
- 画布上方悬浮工具栏：绘图工具，以及撤销、后移、前移、删除、退出；悬停按钮时显示快捷键提示。
- 安装 registry 固定 `ref: v0.5.1`。

#### 修复

- 草图板启动守卫之后，层级快捷键与底图处理恢复正常。

#### 安装 / 更新

请重新安装或更新本地 Skill 副本，Author Tools 与草图板才会用到本版：

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill ui-pack-maintain
node <skill-root>/scripts/install-pack.mjs --list-remote
node <skill-root>/scripts/install-pack.mjs --pack=admin-desktop
```

## v0.5.0 — 2026-10-11

### English

#### Added

- Module sketch board: a free canvas for a rough reference screenshot. It ships inside `html-prototype-build` and opens from Author Tools, or on its own with `node <skill-root>/sketch/serve.mjs`. Place atoms from an installed UI pack, draw boxes for a phone frame, and copy the canvas to the clipboard. The button does not save a file.
- UI packs declare placeable atoms in `components[<id>].atoms` and mark them with `data-pack-atom` in `component.html`. `ui-pack-maintain` owns the field rules; `validate-pack.mjs` checks them. `admin-desktop` is v6 (40 atoms) and `mobile-vant` is v2 (12 atoms).

#### Changed

- The sketch static server exposes only the board and installed UI packs, and it accepts only `127.0.0.1` and `localhost` hosts. Pack files resolve from the project, then `~/.html-prototype/packs/`.
- `resolve-pack.mjs` reads its schema allowlist from inside `html-prototype-build`, so it runs when that skill is installed on its own.
- Pack install registry pins `ref: v0.5.0`.
- Sketch board sidebar is 340px wide so Underlay, Copy image, and Clear sit on one row.

#### Install / update

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill ui-pack-maintain
node <skill-root>/scripts/install-pack.mjs --list-remote
node <skill-root>/scripts/install-pack.mjs --pack=admin-desktop
```

### 中文

#### 新增

- 模块草图板：用来摆一张粗参考图的自由画布。随 `html-prototype-build` 提供，可从 Author Tools 打开，或单独运行 `node <skill-root>/sketch/serve.mjs`。从已安装的 UI pack 放置原子、画手机外框，并把画布复制到剪贴板。按钮不会保存文件。
- UI pack 在 `components[<id>].atoms` 声明可放置原子，并在 `component.html` 用 `data-pack-atom` 标记。字段规则由 `ui-pack-maintain` 维护，`validate-pack.mjs` 负责检查。`admin-desktop` 为 v6（40 个原子），`mobile-vant` 为 v2（12 个原子）。

#### 变更

- 草图静态服务只暴露画板和已安装的 UI pack，且只接受 `127.0.0.1` 与 `localhost`。Pack 文件先从项目目录解析，再从 `~/.html-prototype/packs/` 解析。
- `resolve-pack.mjs` 从 `html-prototype-build` 内部读取 schema 允许列表，因此只安装该 skill 时也能运行。
- 安装 registry 固定 `ref: v0.5.0`。
- 草图板侧栏加宽到 340px，Underlay、Copy image 和 Clear 排在同一行。

#### 安装 / 更新

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill ui-pack-maintain
node <skill-root>/scripts/install-pack.mjs --list-remote
node <skill-root>/scripts/install-pack.mjs --pack=admin-desktop
```

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

