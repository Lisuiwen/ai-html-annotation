---
id: feedback.drawer
category: feedback
requires: [feedback._overlay-core, action.button]
states:
  confirmed: []
  provisional: [open, closed]
---

# Drawer

产品区右侧抽屉。必须限制在 `.ui-preview` 内；宽度、内容和状态以当前材料为准。

## 状态 Adapter

通过依赖 `feedback._overlay-core` 的 `state-adapter.js` 渲染 `{ open: boolean }`。最终原型负责将场景状态映射到该接口，并为打开、关闭及焦点管理绑定业务事件。

## 标注锚点

- `.ui-overlay` 的 `id` 供浮层 Adapter 与 `aria-controls` 使用。
- `.ui-drawer` 内层面板必须有独立稳定 `id`，推荐 `{overlayId}Panel`（如 `uiDemoDrawerPanel`）。
- 说明卡片 `target.anchor` 绑定内层面板 id，不得绑定遮罩层 id。

