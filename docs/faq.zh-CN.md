# 常见问题 — AI HTML Annotation

[English](faq.md)

给正在选评审方式、或第一次安装的人看的短问答。更完整的对比：[HTML 原型标注 vs 截图、Figma、手写 HTML](comparison.zh-CN.md)。

## 1. 这是设计工具，还是给编程 Agent 用的？

**给编程 Agent 用** — 也给和 Agent 一起在 HTML 上评审的人用。它不是设计画布。

这是面向 Claude Code、Codex、Cursor 等编程 Agent 的 Skill：在真实 DOM 上标注并迭代原生 HTML 原型。页面本身就是交付物，不只是一张效果图。见[对比](comparison.zh-CN.md)和[痛点与场景](pain-points-and-scenarios.zh-CN.md)（计划中）。安装见 [quickstart](quickstart.zh-CN.md)（计划中）。

## 2. 和 Figma 是什么关系？

**互补，不是 Figma 替代品。**

Figma 仍是设计源稿。本 Skill 把 UI 材料落成可执行 HTML，说明绑在 DOM 上。Agent 拿到的是 selector 和元素 HTML 快照，不是设计文件。见对比表里的 [Figma 行](comparison.zh-CN.md#figma)。

## 3. Mark / Direct Edit 会污染正式 HTML 交付物吗？

**不会。** 它们是作者层工具，不进入正式页面的加载结构。

正式 HTML 只保留语义 DOM、稳定锚点和只读 Viewer。Mark 的 pin 按页面存在 `localStorage`，用 `Copy all → For AI` 导出 selector 和元素 HTML 快照。Direct Edit 可以通过本地作者服务把样式或文案写回源码，工具本身不会注入交付物。见 [workflows](workflows.zh-CN.md)（计划中）和 [features](features.zh-CN.md)（计划中）。

## 4. 为什么需要 localhost 作者服务？安全吗？

**页面内写作需要它；服务只绑定 `127.0.0.1`。**

Direct Edit、Mark、Notes editor、Inspector 只在该会话中加载。不要对不可信的 HTML 或 snapshot 跑作者服务或截图。Skill 根目录的 `.env` 只用于本机 IDE 选择，不要提交。如何启动见 [quickstart](quickstart.zh-CN.md)（计划中）。

## 5. 官方 pack 和我自己的设计系统 / 第三方 pack 有何区别？

**官方 pack 是原型用的视觉模拟，不是你的生产设计系统。**

`admin-desktop` 和 `mobile-vant` 在仓库里，用 `install-pack` 下载，不打进 `html-prototype-build`。它们不是第三方设计系统的实现。要自己的视觉，去写 pack，不要把官方 pack 当应用组件。见 [UI packs](ui-packs.zh-CN.md)（计划中）和 [自定义 pack](ui-pack-customize.zh-CN.md)（计划中）。

## 6. skills.sh 和 Claude Code 插件该用哪个？

**Cursor、Codex 和其他 Agent Skills 客户端用 skills.sh；一直在 Claude Code 里就用插件。**

两者都从本仓库加载 `html-prototype-build`（pack 作者再加 `ui-pack-maintain`），没有第二份 `SKILL.md`。装完后下载 UI pack。命令见 [quickstart](quickstart.zh-CN.md)（计划中）和 [Skill README](../skills/html-prototype-build/README.zh-CN.md)。

## 7. 0.x 稳定吗？API 会变吗？

**实验性 0.x — API、目录和作者工作流都可能变。**

这就是本项目目前的稳定性说明，没有另外一份兼容承诺。升级前先看 [CHANGELOG.md](../CHANGELOG.md)。

## 8. 为什么截图可以去掉标注层？

**场景截图拍的是产品页面，不是作者层界面。**

`PrototypeViewers` 加上 `scenarios` 显式声明状态（新建、编辑、空态、关联，以及你定义的其他状态）。截图 CLI 会藏掉右侧说明、SVG 连线、Mark 和作者工具。正式 HTML 仍可以带 Viewer；PNG 是纯页面。见 [workflows](workflows.zh-CN.md)（计划中）和对比表里的 [AI HTML Annotation 行](comparison.zh-CN.md#ai-html-annotation)。

## 9. 可以用自己的 UI pack 吗？

**可以。** 安装已下载的 pack，或自己写一个。

自制 pack 放在 `~/.html-prototype/packs/<id>/`，根目录要有 `manifest.json`；id 加命名空间，避免盖住 `admin-desktop` 或 `mobile-vant`。写 pack 用 `ui-pack-maintain` Skill，不是生成业务原型。见 [UI packs](ui-packs.zh-CN.md)（计划中）和 [自定义 pack](ui-pack-customize.zh-CN.md)（计划中）。

## 还是卡住了？

到 [GitHub Issue](https://github.com/Lisuiwen/ai-html-annotation/issues) 或 [Discussion](https://github.com/Lisuiwen/ai-html-annotation/discussions) 说明你做了什么、期望是什么。
