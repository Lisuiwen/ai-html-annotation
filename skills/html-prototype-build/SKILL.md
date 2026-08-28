---
name: html-prototype-build
description: 使用可组合 UI 包生成、评审和交付纯 HTML 产品原型，提供正式产品说明、浏览器评审打点、本地作者服务、Inspector 与场景截图。用户提到 /html-prototype-build，或需要在 HTML 原型中进行 UI 重建、功能标注、SVG 连线、html-mark、源码定位、原型截图或交付清理时使用；不用于一般源码定位、普通功能文档或正式前端应用开发。
---

# HTML Prototype Build（生成 + 评审一体化）

## Quick start

1. 根据用户材料确认原型类型与业务事实；信息不足时先询问，不猜测。
2. 生成或大改 UI 时运行 `node <skill-root>/scripts/resolve-pack.mjs --select=<preset、pattern 或 component id>`，只读取输出的最小文件闭包。
3. 生成根目录 `prototype.html`，将页面 CSS、业务 JS、`notes.snapshot.js` 与 `viewer.js` 收进 `prototype/`；业务状态统一交给 `PrototypeViewers`。
4. 完成后运行仓库根目录的 `npm run validate`；仅按任务需要启用截图、作者服务或 html-mark。

## 先判断任务

只读取当前任务对应的入口，不要一次性读取全部 references：

| 用户目标 | 必读入口 | 主要产物或工具 |
|---|---|---|
| 生成、重建或大改 UI | [UI 生成](references/ui-generation.md) | HTML 原型与按需 UI 组件 |
| 理解 Viewer、说明卡片、SVG 连线或交互闪电 | [产品说明标注](references/product-annotations.md) | snapshot + Viewer |
| 启动作者环境、编辑说明或跳转源码 | [本地作者服务](references/local-authoring.md) | `serve.mjs`、Editor、Inspector |
| 给现有 HTML 加评审 pin、导出 For AI | [评审打点](references/review-mark.md) | `prepare-mark.mjs`、html-mark |
| 按页面状态批量截图 | [分组截图](references/screenshots.md) | `shoot.mjs`、screenshots |
| 清理作者层、整理最终文件 | [交付与迭代](references/delivery.md) | 评审稿或正式交付稿 |

生成或大改 UI 时读取 [共享生成契约](references/generation-contract.md)；标注、评审、截图与交付任务按上表对应入口读取，不必全量读取契约。视觉任务先通过 [UI 包目录](ui/catalog.md) 选择 foundation 和组件 provider，再用 `scripts/resolve-pack.mjs` 定位最小组件依赖闭包；UI 包共同遵守 [UI 包契约](ui/contract.md)。`scripts/` 保存 Agent 使用的确定性工具，`runtime/` 保存原型运行时与本地作者工具，两者均不依赖宿主仓库的其他目录。

## 核心边界

- 所有原型必须使用 `runtime/viewer.js`，业务状态统一经 `PrototypeViewers` 提交；禁止自行建立第二套状态源。
- html-mark 仅用于评审打点，数据只进 localStorage，不写入 snapshot。
- 作者服务只做本地编辑与源码定位，不进入源 HTML 或正式交付物。
- 截图只消费 URL scene 与正式标注数据，不生成业务状态。
- 系统名、菜单、字段、状态和业务数据必须来自用户材料；信息不明确时先询问，禁止猜测。

## 默认闭环

1. 选择 UI pack，生成 snapshot + Viewer。
2. 业务状态由 `PrototypeViewers` 管理，UI pack 只提供组件与局部渲染。
3. 截图、作者服务和 html-mark 仅在任务需要时启用。
