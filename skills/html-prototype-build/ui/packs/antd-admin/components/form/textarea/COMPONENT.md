---
id: form.textarea
category: form
requires: []
optional: [form.field]
states:
  confirmed: [default, disabled]
  provisional: [focus, error]
---

# form.textarea

多行文本输入控件。字段名必须使用关联的 `label` 表达，placeholder 只放输入提示。

## 状态 Adapter

`state-adapter.js` 暴露 `window.PrototypeUiAdapters['form.textarea']`，局部 state 为 `{ value: string, disabled?: boolean, status?: 'default'|'error' }`。最终原型负责把业务字段映射到该 state；组件 Adapter 仅同步值、禁用与错误样式。
