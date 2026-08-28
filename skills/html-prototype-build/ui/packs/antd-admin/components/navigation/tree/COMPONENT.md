---
id: navigation.tree
category: navigation
requires: []
states:
  confirmed: [default]
  provisional: [expanded]
---

# Tree

用于表达层级结构。当前以普通列表和原生按钮提供有限展开交互，不声明 ARIA Tree；只有补齐任务确认的方向键、焦点移动和展开收起键盘行为后，才能升级为 `role="tree"` / `treeitem`。

## 状态 Adapter

`state-adapter.js` 暴露 `window.PrototypeUiAdapters['navigation.tree']`，局部 state 为 `{ expanded: { [nodeId]: boolean } }`。最终原型负责触发状态提交，组件 Adapter 仅渲染按钮的 `aria-expanded`、子列表可见性和开关文案。

