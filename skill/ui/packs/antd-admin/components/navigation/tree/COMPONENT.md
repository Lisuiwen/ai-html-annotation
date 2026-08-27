---
id: navigation.tree
category: navigation
requires: []
states:
  confirmed: [default]
  provisional: [expanded]
---

# Tree

用于表达层级结构。当前只提供有限展开交互；若使用 `role="tree"`，必须补齐任务确认的键盘行为，否则保持静态语义。

## 状态 Adapter

`state-adapter.js` 暴露 `window.PrototypeUiAdapters['navigation.tree']`，局部 state 为 `{ expanded: { [treeitemId]: boolean } }`。最终原型负责触发状态提交，组件 Adapter 仅渲染 `aria-expanded` 和开关文案。

