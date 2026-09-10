# HTML Prototype Build

[English](README.md)

面向 AI Agent 的 HTML 产品原型 Skill：用 UI 包生成页面，在真实 DOM 上维护正式说明、发起评审、跳转源码，并按场景输出交付截图。

安装方式、产品演示与仓库级功能介绍见[仓库 README](../../README.md)。本文件负责 Skill 怎么用；具体命令与逐步操作仍在 `references/`。

## 适合谁用

- **和 Agent 协作**：把需求、截图或现有页面交给 Agent，让它按本 Skill 生成或修改原型。
- **自己验收与迭代**：用作者服务启动 skill 生成的原型，在浏览器里查看说明、切换场景、打评审意见、直接改样式或文案，而不必每次从头描述页面结构。
- **整理交付物**：区分「正式原型文件」和「作者会话工具」，输出干净的多状态页面截图。

不适合当作通用前端脚手架或生产代码生成器；它的目标是**可评审、可说明、可截图的原型交付**。

## 你会得到什么

一次完整任务通常包含三类产物：

| 产物 | 作用 |
| ---- | ---- |
| 可运行的 HTML 原型 | 原生页面，可双击预览，也可经本地作者服务打开 |
| `notes.snapshot.js` | 正式说明、场景状态与截图清单的唯一数据源 |
| 按场景生成的 PNG | 纯页面截图，不含右侧说明、连线和作者工具 |

正式原型只保留语义 DOM、稳定锚点与只读 Viewer；Mark、Direct Edit、Notes Editor、Inspector 和本地作者服务都属于**作者层**，不会写进交付 HTML。

## 典型怎么用

不必记命令，按意图分工即可：

1. **新建或大改页面**
   在 Cursor、Claude Code、Codex 等客户端启用本 Skill，用自然语言描述需求或附上材料，让 Agent 生成 `prototype.html` 与 `prototype/`。约束与任务分流见 [SKILL.md](SKILL.md)。
2. **在页面上继续工作**
   需要改样式、改说明、打评审 pin、从元素跳回源码时，通过本地作者服务在浏览器里操作。Direct Edit 与 Mark 同在 Author Tools 面板；能力说明见 [本地作者服务](references/local-authoring.md)、[评审打点](references/review-mark.md)。
3. **按场景出图或交付**
   需要批量纯页面截图或整理最终文件时，见 [场景截图](references/screenshots.md) 与 [交付与迭代](references/delivery.md)。

仓库内 [`examples/minimal-notes-system`](../../examples/minimal-notes-system) 提供可对照的最小样例。

## 能力一览

```text
原生 HTML 原型
   │
   ├── Viewer：右侧正式说明、场景切换、SVG 连线
   ├── Direct Edit / Mark：直接改页面样式或打评审 pin，导出给 AI 的 selector 与元素快照
   ├── Notes Editor：编辑正式说明卡片
   ├── Inspector：从页面元素跳转到本机 IDE 源码
   └── Screenshot：按 snapshot 场景输出纯页面 PNG
```

同一套业务状态既支撑页面说明与场景切换，也支撑多状态截图，避免「效果图」和「可执行页面」两套口径。

## 环境与可选配置

- 需要 **Node.js 18+**；Skill 自带运行时与脚本不依赖额外 npm 包。
- 批量截图需要本机 **Microsoft Edge 或 Google Chrome**。
- 若使用 Inspector 跳转源码，可在本目录参考 [.env.example](.env.example) 配置本机 IDE；该文件仅用于个人环境，不要提交。

## 文档去哪看

| 你想了解… | 去看 |
| -------- | ---- |
| 让 Agent 做什么、有哪些硬约束 | [SKILL.md](SKILL.md) |
| 某类任务的操作说明（含命令） | [references/](references/) 下对应入口 |
| UI 包怎么选 | [ui/catalog.md](ui/catalog.md) |
| 仓库安装与功能介绍 | [仓库 README](../../README.md) |

本文件只说明 Skill 的用途与协作方式；具体命令、逐步操作和 Agent 契约都在上述文档中按任务拆分维护。
