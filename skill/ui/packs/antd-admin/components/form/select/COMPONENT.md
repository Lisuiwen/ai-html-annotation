---
id: form.select
category: form
requires: []
states:
  confirmed: [default]
  provisional: [open, selected]
---

# Select

本地原型用的自定义选择器。必须维护 trigger、listbox、option 的 ARIA 状态；选项内容必须来自需求材料。

## 状态 Adapter

`state-adapter.js` 暴露 `window.PrototypeUiAdapters['form.select']`，局部 state 为 `{ open: boolean, value: string }`。最终原型负责把业务字段映射到该 state，并负责点击、键盘和场景切换；组件 Adapter 仅输出菜单、文本和 ARIA。

