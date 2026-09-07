# HTML Prototype Build 使用手册

用于操作已有 HTML 原型：直接编辑页面、编辑正式说明、发起页面评审、生成场景截图和整理交付稿。项目价值、演示和适用范围见[仓库 README](../../README.md)。

## 开始前

- 需要 Node.js 18+；运行时和脚本只依赖 Node 内建模块。
- 批量截图需要本机 Microsoft Edge 或 Google Chrome。
- 下文的 `<skill-root>` 指本目录 `skills/html-prototype-build`。

若需要新建或重建页面，请让 Agent 按 [SKILL.md](SKILL.md) 选择 UI 包并生成原型；本手册从已有 `prototype.html` 开始。

## Runtime 结构

```text
runtime/
├─ client/    正式原型浏览器运行时
├─ author/    浏览器作者工具：Direct Edit / Mark / Notes Editor / Inspector
├─ server/    本地作者服务与源码写回
└─ cli/       独立命令行工具
```

正式原型只复制需要的 `client/` 运行时；`author/` 与 `server/` 只在本地作者服务会话中动态加载，不写入源 HTML。Client Runtime 内部继续分工：`core/display-mode.js` 负责纯页面展示策略，`core/state.js` 负责统一状态与场景，`notes/model.js` 负责场景元数据和 `when` 纯匹配，`notes/viewer.js` 只负责正式说明 DOM 与连线渲染。

## 本地作者服务

启动：

```bash
node <skill-root>/runtime/server/index.mjs <prototype.html> --snapshot=prototype/notes.snapshot.js
```

打开终端返回的 `http://127.0.0.1:4178/...`。未传 `--snapshot` 时仍可使用 Direct Edit、Mark 与 Inspector，但不能保存正式说明卡片。

IDE 跳转配置放在 `<skill-root>/runtime/server/.env`，模板为 `runtime/server/.env.example`。

### 页面内作者工具

| 目标 | 页面操作 |
|---|---|
| Direct Edit | 打开原型工具 → Edit，按住 `Ctrl`（macOS 为 `⌘`）点击页面元素；修改后保存写回源 HTML。 |
| Mark 评审 | 打开原型工具 → Mark，或按 `M`；按住 `Ctrl`（macOS 为 `⌘`）点击元素添加 pin。 |
| 编辑正式说明 | 双击说明标题、正文或页头文案；标题/页头 `Enter` 保存，正文 `Ctrl + Enter` 保存，`Esc` 取消。 |
| 管理正式说明 | 使用 `+`、编辑、目标绑定、删除和拖拽排序。 |
| Inspector | 按住 `Alt + Shift` 悬停并点击目标，跳转 IDE 源码位置。 |
| 切换页面场景 | 使用右侧场景按钮，或 `?scene=<场景-id>`。 |

## 评审打点

Mark 已集成进 Author Tools，通过本地作者服务动态加载。

1. 启动作者服务并打开页面。
2. 切到 Mark Tab（或按 `M`）。
3. 按住 `Ctrl` / `⌘` 点击目标元素添加 pin。
4. 在 Mark 面板中定位、删除、清空，或使用 `Copy all → For AI` 导出意见、selector 和 HTML 快照。

Mark 数据只保存在当前页面 pathname 对应的浏览器 localStorage；不会修改 `prototype.html` 或 snapshot，因此交付前无需执行额外“移除 Mark 注入”步骤。

## 场景截图

```bash
node <skill-root>/runtime/cli/screenshot.mjs <prototype.html> --snapshot=prototype/notes.snapshot.js
```

工具按 `snapshot.scenarios` 生成 `screenshots/<scene-id>.png`，截图 URL 自动带 `collapsed=1&product-only=1`，隐藏说明和作者 UI。

## 原型与交付物

```text
prototype.html
prototype/
├─ prototype.css
├─ prototype.js
├─ notes.snapshot.js
├─ display-mode.js
├─ state.js
├─ model.js
└─ viewer.js
screenshots/
assets/                 # 按需
```

- `notes.snapshot.js` 是正式说明唯一数据源，`scenarios` 是多状态截图唯一依据。
- `prototype/display-mode.js`、`prototype/state.js`、`prototype/model.js`、`prototype/viewer.js` 分别从 `runtime/client/core/display-mode.js`、`runtime/client/core/state.js`、`runtime/client/notes/model.js`、`runtime/client/notes/viewer.js` 原样复制，并按该顺序加载。
- Chart 运行时从 `runtime/client/charts/` 按需复制。

## 交付检查

- 正式说明只通过作者服务写入 snapshot。
- Mark pin 只在浏览器 localStorage，不写入 snapshot 或源 HTML。
- Author Bootstrap、Direct Edit、Notes Editor、Inspector 和源码定位 token 不得进入正式原型文件。
- 最终截图不应包含右侧说明、SVG 连线、Mark 或作者工具。
- 作者服务仅监听 `127.0.0.1`；原型中不要放真实凭据或生产数据。

## 按任务查看详情

- [UI 生成](references/ui-generation.md)
- [产品说明标注](references/product-annotations.md)
- [本地作者服务](references/local-authoring.md)
- [评审打点](references/review-mark.md)
- [场景截图](references/screenshots.md)
- [交付与迭代](references/delivery.md)
