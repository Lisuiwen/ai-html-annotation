---
id: navigation.tree
category: navigation
requires: []
states:
  confirmed: [default]
  provisional: [expanded]
---

# Tree

Express hierarchical structure. Currently uses a plain list and native buttons for limited expand interaction; does not declare ARIA Tree — upgrade to `role="tree"` / `treeitem` only after task-confirmed arrow keys, focus movement, and expand/collapse keyboard behavior.

## State Adapter

`state-adapter.js` exposes `window.PrototypeUiAdapters['navigation.tree']`; local state is `{ expanded: { [nodeId]: boolean } }`. The final prototype triggers state commits; the component Adapter only renders button `aria-expanded`, child list visibility, and toggle copy.
