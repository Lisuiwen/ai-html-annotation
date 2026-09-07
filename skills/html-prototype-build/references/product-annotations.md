# 产品说明标注

## 适用范围

所有原型都通过本入口维护 Viewer；功能说明、右侧标注、SVG 连线、交互意图、待确认项和业务操作闪电均在此定义。

产品说明标注属于正式原型文档，不等同于 Author Tools Mark 的临时评审 pin。

## 必读资源

1. [generation-contract.md](generation-contract.md) 中的「状态与场景」「标注」「浮层」和「交付文件」章节——文件结构、runtime 复制、锚点、闪电与浮层规则均以该文件为准。
2. `../addons/annotations/ADDON.md` 与 `../addons/annotations/ui-annotations.html`。
3. 若标注 Modal 或 Drawer，从当前包的 manifest 选择 `feedback.modal` 或 `feedback.drawer` 并完整展开依赖。

## 标注流程

本入口只说明怎么做；具体格式与禁止项不在此重复：

1. 在 `prototype/notes.snapshot.js` 维护 `header / cards / scenarios`，并让卡片 `when` 对应当前组合状态。
2. 每张卡片按语义单元选择一个稳定目标：优先复用已有 `id`，确实不适合加 id 时再使用 selector 兜底。
3. 用 `?scene=<id>` 检查状态恢复、卡片显示和连线；只读渲染行为统一由 Client Runtime 提供，不在业务页面重复实现。

## 后续路径

- 浏览器直接编辑、编辑卡片或重新绑定目标：[local-authoring.md](local-authoring.md)。
- 页面评审意见：[review-mark.md](review-mark.md)。
- 按场景截图：[screenshots.md](screenshots.md)。
- 交付前核对：[delivery-checklist.md](delivery-checklist.md)。
