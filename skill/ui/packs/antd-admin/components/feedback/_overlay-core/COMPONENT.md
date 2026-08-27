---
id: feedback._overlay-core
category: feedback
visibility: internal
requires: []
states:
  confirmed: []
  provisional: [open, closed]
---

# Overlay Core

Modal 与 Drawer 共用的私有浮层定位、结构和开关行为。只能通过公开组件依赖加载，不得由 Pattern 或 Preset 直接选择。

## 状态 Adapter

`state-adapter.js` 暴露 `window.PrototypeUiAdapters['feedback._overlay-core']`，局部 state 为 `{ open: boolean }`。最终原型负责把业务场景映射到浮层开关并处理焦点；组件 Adapter 仅在产品区内投影 `hidden`、ARIA、尺寸和视觉 class。
