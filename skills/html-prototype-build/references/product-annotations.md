# 产品说明标注

## 适用范围

所有原型都通过本入口维护 Viewer；功能说明、右侧标注、SVG 连线、交互意图、待确认项和业务操作闪电均在此定义。

产品说明标注属于正式原型文档，不等同于 Author Tools Mark 的临时评审 pin。

## 必读资源

1. [generation-contract.md](generation-contract.md) 中的「状态与场景」「标注」「浮层」和「交付文件」章节——文件结构、runtime 复制、锚点、闪电与浮层规则均以该文件为准。
2. `../addons/annotations/ADDON.md` 与 `../addons/annotations/ui-annotations.html`。
3. 若标注 Modal 或 Drawer，从当前包的 manifest 选择 `feedback.modal` 或 `feedback.drawer` 并完整展开依赖。

## 标注要点

本入口只补充标注层工作流；与契约重复的细节不再展开。

- `prototype/notes.snapshot.js` 是唯一标注数据源，赋给 `window.__PROTOTYPE_NOTES__`。
- 标注显示条件读取 `PrototypeViewers` state；`PrototypeNotesModel` 只负责场景元数据与 `when` 匹配，不创建独立业务状态。
- 卡片用 `when` 匹配组合状态；无 `when` 的卡片始终显示。
- `target.anchor` 优先引用元素已有稳定 id；无合适 id 时才使用 `data-prototype-note-target` + `target.selector`。
- 原型必须支持 `?scene=<id>` 与 `?collapsed=1`。

## 后续路径

- 浏览器直接编辑、编辑卡片或重新绑定目标：[local-authoring.md](local-authoring.md)。
- 页面评审意见：[review-mark.md](review-mark.md)。
- 按场景截图：[screenshots.md](screenshots.md)。
- 交付前核对：[delivery-checklist.md](delivery-checklist.md)。
