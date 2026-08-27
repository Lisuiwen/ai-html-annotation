---
name: ca-prototype
description: 使用可组合 UI 包生成和迭代 HTML 原型，提供正式产品说明、浏览器评审打点、本地作者服务、Inspector、分组截图和交付清理。用户提到 /ca-prototype、原型生成、UI 重建、功能说明、SVG 连线、html-mark、启动原型服务、源码定位、原型截图或原型交付时使用。
---

# CA Prototype（生成 + 评审一体化）

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

所有生成和修改任务同时读取 [共享生成契约](references/generation-contract.md)。视觉任务先通过 [UI 包目录](ui/catalog.md) 选择 foundation 和组件 provider，再按所选包的 `PACK.md` 与 `manifest.json` 定位最小组件依赖闭包；UI 包共同遵守 [UI 包契约](ui/contract.md)。所有运行时脚本位于本 Skill 的 `runtime/`，不依赖宿主仓库的其他目录。

## 核心边界

- Viewer 是所有原型的标准运行时：统一状态协调器、右侧说明卡片和 SVG 连线均由 snapshot 驱动。
- html-mark 是临时评审层：浮动 pin + 玻璃便签，数据保存在 localStorage。
- 作者服务只提供本地编辑和源码定位，不进入源 HTML 或正式交付物。
- 截图只消费 URL state 与正式标注数据，不负责生成业务状态。
- 系统名、菜单、字段、状态和业务数据必须来自用户材料；信息不明确时先询问，禁止猜测。

## 默认闭环

1. 选择 UI pack，生成 snapshot + Viewer。
2. 业务状态由 `PrototypeViewers` 管理，UI pack 只提供组件与局部渲染。
3. 截图、作者服务和 html-mark 仅在任务需要时启用。
