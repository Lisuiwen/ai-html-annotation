# AI HTML Annotation vs 截图、Figma、手写 HTML

[English](comparison.md)

面向编程 Agent 的 Skill：在原生 HTML 原型上做真实 DOM 标注 — 不是设计画布，也不是生产 UI 组件库。

用下面的表选择评审方式。Viewer、Mark、Inspector 的演示见[仓库 README](../README.zh-CN.md)。

## 对比

| 方式 | 输入 | 怎么评审 | Agent 拿到什么上下文 | 交付物 | 最适合的阶段 |
| --- | --- | --- | --- | --- | --- |
| <span id="screenshot-chat">截图 + 聊天批注</span> | 界面 PNG/JPEG | 写在聊天或文档里（“往左移一点”） | 只有像素，没有 DOM；Agent 只能猜结构，一改就容易漂 | 图片 + 聊天记录 | 只需快速看一眼、不需要能定位到元素时 |
| <span id="figma">Figma（设计源稿）</span> | Figma 文件 / 画板 | 在 Figma 里评论、检查 | 设计源稿（布局、标注、资产），不是可执行 DOM 或 HTML 快照 | Figma 文件 | 出 HTML 之前（或并行）做视觉稿 |
| <span id="bare-html">手写 / AI 裸 HTML</span> | 没有 UI pack、也没有标注运行时的 HTML | 打开文件或浏览器；意见仍在聊天里，除非你另做一套说明 | 只有 HTML 源码 — 没有 DOM 绑定说明、Mark 导出或 pack Token | HTML 文件 | 一次性页面，不需要评审 pin 和 pack 一致性时 |
| <span id="prod-library">生产组件库（不是本产品）</span> | 应用里的共享组件 | 代码评审、Storybook 或正在跑的应用 | 真实组件 API 与生产源码 | 生产代码 | 原型已经对齐之后 — **本产品不是那个组件库** |
| <span id="ai-html-annotation">AI HTML Annotation</span> | UI 材料 + 可选 UI pack（`admin-desktop` / `mobile-vant`，用 `install-pack`） | 在真实 DOM 上：Viewer 放正式说明；作者会话里用 Mark 打点 | selector + 元素 HTML 快照（`Copy all → For AI`）；说明在 `notes.snapshot.js` | 原生 HTML + 说明 + 可选纯净场景 PNG；带 `AGENTS.md` 的目录 | 需要可打开的 HTML 原型、DOM 绑定评审、以及可交给 Agent 的上下文时 |

作者层工具 — Mark、Direct Edit、Inspector 和本地作者服务 — 只在作者会话中加载。正式 HTML 只保留只读 Viewer 与语义 DOM。按场景截图不含作者层界面。

## 适合 / 不适合

**适合**：需要尽快把 UI 材料落成可打开的 HTML；需要在真实页面上评审，并把意见准确交给 AI；需要改结构、文案和状态，同时保留可复现截图。常见页面：后台、配置页、以及经常改的交互原型。

**不适合**当作生产组件库、Figma 替代品、第三方设计系统实现，或通用前端脚手架 / 生产代码生成器。如果生产 UI 套件已经定稿、你要的是应用代码，用那套套件，不要用本 Skill。

官方 pack（`admin-desktop`、`mobile-vant`）是原型用的视觉模拟，用 `install-pack` 下载，不打进 Skill。详见 [UI packs](ui-packs.zh-CN.md)（计划中）。

## 接下来

- 安装与第一次运行 → [quickstart](quickstart.zh-CN.md)（计划中）
- 截图 + 聊天这条链路在哪里断 → [痛点与场景](pain-points-and-scenarios.zh-CN.md)（计划中）
- 短问答 → [FAQ](faq.zh-CN.md)
- 作者层 vs 交付 → [workflows](workflows.zh-CN.md)（计划中）
