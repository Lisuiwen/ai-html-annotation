# 按协作闭环看能力地图

[English](features.md)

工具在[根 README](../README.zh-CN.md) 那条环上的位置：生成 → Viewer → Mark / Copy for AI → Direct Edit → Inspector → scenarios。

两条能力线：

- **A.** `html-prototype-build` 原型协作闭环（本页，以及[工作流](workflows.zh-CN.md)）。
- **B.** UI pack 的安装 / 自定义 / 维护（[UI packs](ui-packs.zh-CN.md)）。

这条环为什么存在：[痛点与场景](pain-points-and-scenarios.zh-CN.md)。默认样例：[`examples/minimal-notes-system`](../examples/minimal-notes-system)。

## 作者层 vs 正式交付物

| | 正式交付物 | 作者层（仅 localhost 会话） |
| --- | --- | --- |
| 交付什么 | 语义 DOM、稳定锚点、只读 Viewer、Client Runtime、`notes.snapshot.js`、可选纯净场景 PNG、`AGENTS.md` | Mark、Direct Edit、Notes editor、Inspector、`runtime/server/index.mjs` |
| 数据在哪 | snapshot + 源 HTML | Mark：页面作用域 `localStorage`。Direct Edit：经服务端把样式 / 文案写回源码。Inspector token：仅当前会话 |
| 场景 PNG 里 | 产品页面 | 隐藏（`collapsed=1&product-only=1`） |

不要把 Mark 的 pin 当成正式说明。不要把作者层 bootstrap 写进交付 HTML。细节：[交付](../skills/html-prototype-build/references/delivery.md)。

## Viewer

正式产品说明绑在真实 DOM 上 — 不是贴在截图上的便利贴。

- 数据：`prototype/notes.snapshot.js`（`header`、`cards`、`when`、`scenarios`）。
- 界面：右侧栏、场景切换、连到锚点的 SVG。
- 交互状态和浮层规则跟生成契约走；Client Runtime 负责渲染。`file://` 下双击打开只是只读预览。

参考：[产品标注](../skills/html-prototype-build/references/product-annotations.md)、[生成契约](../skills/html-prototype-build/references/generation-contract.md)。

## Mark

Author Tools 面板里的临时评审 pin（和 Direct Edit 同面板、另一 tab）。

- 按住 `Ctrl`（macOS：`⌘`）点击打点。`Copy all → For AI` 导出 selector、元素 HTML 快照和评审意见。
- pin 从不写入 snapshot 或源 HTML。交付前不需要“从文件里剥掉 Mark”。
- DOM 大改之后清掉失效 pin，再打一遍。

参考：[评审打点](../skills/html-prototype-build/references/review-mark.md)。

## Direct Edit

同一 Author Tools 面板的 `edit` tab：在页面上改样式和纯文本。

- 按住 `Ctrl` / `⌘`，在浏览器里预览，保存后经 `/__prototype-author/edit` 写回 `prototype.html`。
- 工具只在作者会话中加载。保存后的 CSS / 文案成为源码的一部分；编辑器界面不会。

参考：[本地作者服务](../skills/html-prototype-build/references/local-authoring.md)。

## Inspector

锁定页面上的元素，在本机 IDE 打开源码。

- 按住 `Alt + Shift`，悬停看选择器，单击跳转。IDE 名称在 skill 根目录 `.env`（见 [`.env.example`](../skills/html-prototype-build/.env.example)）；不要提交 `.env`。
- 注入的 `data-insp-target` 只用于本会话的行号映射。不要把它导出成 For-AI selector。

参考：[本地作者服务](../skills/html-prototype-build/references/local-authoring.md)。

## UI packs

可安装的视觉系统：共享 Token、组件、Pattern、Preset。本仓库官方 pack：`admin-desktop`（桌面后台）和 `mobile-vant`（手机宽度 H5）。它们在 `.html-prototype/packs/`，**不**打进 `html-prototype-build`。终端用户用 `install-pack.mjs` 下载。

Pack 是原型用的视觉模拟，不是生产设计系统，也不是第三方组件库实现。

参考：[UI packs](ui-packs.zh-CN.md)、[pack 安装](../skills/html-prototype-build/references/pack-install.md)、[目录](../skills/html-prototype-build/ui/catalog.md)。

## Scenarios 与 PrototypeViewers

`PrototypeViewers`（Client Runtime 的 `state.js`）是产品状态的唯一来源。UI pack 的 adapter 只投影组件局部状态，不持有业务状态。

- `notes.snapshot.js` 声明 `state`、`activeScenario` 和 `scenarios`。
- `?scene=<id>` 激活场景。截图 CLI 遍历 `snapshot.scenarios` 并隐藏作者层。

参考：[截图](../skills/html-prototype-build/references/screenshots.md)、[生成契约](../skills/html-prototype-build/references/generation-contract.md)。

## 交付物

一次典型的 `html-prototype-build` 任务会得到：

- 带原生 HTML、配套文件和 `AGENTS.md` 的命名目录（后续 Coding Agent 应读说明和截图，不要搬原型实现）。
- 作为后续修改基准的 snapshot 说明和 `scenarios`。
- 可选的按声明状态批量 PNG，不含右侧说明、连线和作者工具。

作者层界面不进这个包。清单：[交付检查](../skills/html-prototype-build/references/delivery-checklist.md)。

## 接下来

- 环上的岗位 → [痛点与场景](pain-points-and-scenarios.zh-CN.md)
- 按顺序的步骤 → [工作流](workflows.zh-CN.md)
- 第一次运行 → [quickstart](quickstart.zh-CN.md)
