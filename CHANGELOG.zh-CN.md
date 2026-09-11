# 更新日志

此处记录 AI HTML Annotation 的所有重要变更。

[English](CHANGELOG.md)

## v0.3.2 — 2026-09-10

### 变更

- 完成 Skill 参考资料、UI 包契约、组件模板、运行时消息与校验脚本的英文本地化。
- 导航仍保留中文 README 配对；`CHANGELOG.md` 提供英文发布说明。

### 修复

- 修复批量翻译过程中产生的中英混杂乱码（manifest 关键词、README 链接、addon 示例、校验脚本与测试描述）。
- 在 `SKILL.md` 中补充 `ponytail:` 术语说明，并将易混淆的 “Case” 统一改为 “project materials”。

### 安装 / 更新

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

## v0.3.1 — 2026-09-10

### 变更

- 将 Viewer、Author Tools 与最小示例界面本地化为英文（`lang="en"`），涵盖场景切换、说明栏、Direct Edit 与 Mark 的标签、提示、Toast 及错误消息。
- 最小示例的说明与场景标签已与 Skill 模板对齐。

### 修复

- 同步 Viewer 契约测试与本地化后的运行时错误消息。

### 安装 / 更新

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

## v0.3.0 — 2026-09-09

### 新增

- 最终原型交付采用自包含的命名上级目录，内含 `AGENTS.md`、可运行 HTML、配套文件与场景截图。
- 新增简明 Coding Agent 交接模板，将实现工作导向产品说明与截图，仅在必要时按锚点定位 HTML。

### 变更

- 交付契约与复检清单要求将交接模板复制到每个最终原型包。
- 最小示例包含同一交接文件，并校验其与 Skill 模板保持同步。

### 安装 / 更新

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

## v0.2.1 — 2026-09-08

### 修复

- Author Tools 在 macOS 上通过共用 `author/core/platform.js` 统一 `⌘` 与 `Ctrl` 标签及修饰键识别。
- Notes Editor 多行保存支持 `⌘ + Enter`（及 `Control + Enter`），不再仅限 `Ctrl + Enter`。

### 变更

- Direct Edit 与 Mark 的空态提示在 macOS 上显示 `⌘`。
- 根 README 与 Skill references 记录了 Edit、Mark 与 Notes Editor 的 macOS 快捷键。

### 安装 / 更新

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

## v0.2.0 — 2026-09-08

### 新增

- Author Tools 外壳（Edit / Mark 双 Tab）。
- Direct Edit 浏览器内改样式与文案，并经 localhost 作者服务写回。
- Mark 评审 pin（macOS `⌘`+点击与 `Copy all → For AI`）。
- Claude Code 插件市场入口。
- `skills.sh` 与 Claude Code 安装路径。
- GitHub Pages 落地页。
- 中文 README 配对。
- 覆盖 `client/`、`author/`、`server/`、`cli/` 的运行时单元与契约测试。

### 变更

- 运行时按执行边界重组。
- `PrototypeViewers` v2 拆分为 `display-mode.js`、`state.js`、`model.js`、`viewer.js`。
- 作者服务与截图 CLI 迁至专用路径。
- IDE 配置迁至 Skill 根目录 `.env`。
- Skill references 按任务拆分。
- Viewer 操作区与 README 演示 GIF 已更新。

### 修复

- 加固 Direct Edit 源码写入。
- Notes Editor 工具栏固定至左侧。
- 示例快照锚点与 DOM id 对齐。

### 迁移

- 更新本地 Skill 副本或重新安装，并替换旧运行时路径（`serve.mjs` → `server/index.mjs`，`shoot.mjs` → `cli/screenshot.mjs`，`html-mark.js` → `author/tools/mark/`）。

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

## v0.1.0 — 首次公开发布

AI HTML Annotation 引入原生 HTML 工作流，与编码 Agent 协作构建、评审、标注并迭代 UI 原型。

### 亮点

- 可复用 UI 包。
- 带 SVG 连线的 DOM 绑定产品说明。
- 导出选择器与元素快照的评审 pin。
- 本地 Inspector 工作流。
- 显式 `PrototypeViewers` 状态。
- 基于场景的纯净截图。
- `skills/html-prototype-build/` 下的 Agent Skill 打包。
- 零 npm 运行时依赖。

### 安装 Agent Skill

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

### 状态

- 实验性 0.x — API、文件布局与作者工作流可能随项目演进调整。
