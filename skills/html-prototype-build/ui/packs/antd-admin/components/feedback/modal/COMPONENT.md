---
id: feedback.modal
category: feedback
requires: [feedback._overlay-core, action.button]
states:
  confirmed: []
  provisional: [open, closed]
---

# Modal

产品区内的模态对话框。必须关联标题并限制在 `.ui-preview` 内，不得覆盖右侧正式说明区域。

## 状态 Adapter

通过依赖 `feedback._overlay-core` 的 `state-adapter.js` 渲染 `{ open: boolean }`。最终原型负责将场景状态映射到该接口，并为打开、关闭、取消、确认按钮绑定业务事件。

## 标注锚点

- `.ui-overlay` 的 `id` 供浮层 Adapter、`aria-controls` 与 `role="dialog"` 使用。
- `.ui-modal` 内层面板必须有独立稳定 `id`，推荐 `{overlayId}Panel`（如 `uiDemoModalPanel`）。
- 说明卡片 `target.anchor` 绑定内层面板 id，不得绑定遮罩层 id（遮罩铺满产品区，连线会落在错误位置）。

