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
| 添加右侧说明、SVG 连线或交互闪电 | [产品说明标注](references/product-annotations.md) | snapshot + Viewer |
| 启动作者环境、编辑说明或跳转源码 | [本地作者服务](references/local-authoring.md) | `serve.mjs`、Editor、Inspector |
| 给现有 HTML 加评审 pin、导出 For AI | [评审打点](references/review-mark.md) | `prepare-mark.mjs`、html-mark |
| 按页面状态批量截图 | [分组截图](references/screenshots.md) | `shoot.mjs`、screenshots |
| 清理作者层、整理最终文件 | [交付与迭代](references/delivery.md) | 评审稿或正式交付稿 |

所有生成和修改任务同时读取 [共享生成契约](references/generation-contract.md)。视觉任务先通过 [UI 包目录](ui/catalog.md) 选择 foundation 和组件 provider，再按所选包的 `PACK.md` 读取资源；UI 包共同遵守 [UI 包契约](ui/contract.md)。所有运行时脚本位于本 Skill 的 `runtime/`，不依赖宿主仓库的其他目录。

## 核心边界

- 产品说明标注是正式文档：右侧说明卡片 + SVG 连线，数据来自 snapshot。
- html-mark 是临时评审层：浮动 pin + 玻璃便签，数据保存在 localStorage。
- 作者服务只提供本地编辑和源码定位，不进入源 HTML 或正式交付物。
- 截图只消费 URL state 与正式标注数据，不负责生成业务状态。
- 系统名、菜单、字段、状态和业务数据必须来自用户材料；信息不明确时先询问，禁止猜测。

## 默认闭环

1. 按 UI 生成入口产出或修改原型。
2. 用户需要产品说明时，再按产品说明标注入口生成三文件。
3. 只有用户明确需要评审稿时才按评审打点入口注入 html-mark；正式交付默认不包含评审层。
4. 需要浏览器编辑或 Inspector 时启动本地作者服务。
5. 需要视觉验收时按分组截图入口生成截图。
6. 最终按交付入口区分评审稿与正式交付稿。