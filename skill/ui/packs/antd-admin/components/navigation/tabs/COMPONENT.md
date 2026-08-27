---
id: navigation.tabs
category: navigation
requires: []
states:
  confirmed: [default]
  provisional: [selected]
---

# Tabs

用于同一页面内的并列内容切换。生成时必须保持 Tab 与 Panel 的 ARIA 引用一致。

## 状态 Adapter

`state-adapter.js` 暴露 `window.PrototypeUiAdapters['navigation.tabs']`，局部 state 为选中 Tab 的稳定 `id` 字符串。最终原型负责处理点击并提交业务 state；组件 Adapter 仅同步 `aria-selected`、Panel `hidden` 和视觉输出。

