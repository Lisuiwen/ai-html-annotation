---
id: form.switch
category: form
requires: []
optional: [form.field]
states:
  confirmed: [off, on]
  provisional: [disabled, loading]
---

# form.switch

布尔开关控件。使用 `role="switch"` 与 `aria-checked` 表达开关语义；Adapter 不绑定点击或业务校验。

## 状态 Adapter

`state-adapter.js` 暴露 `window.PrototypeUiAdapters['form.switch']`，局部 state 为 `{ checked: boolean, disabled?: boolean, loading?: boolean }`。最终原型负责把业务字段映射到该 state；组件 Adapter 仅同步选中、禁用与加载样式。
