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

