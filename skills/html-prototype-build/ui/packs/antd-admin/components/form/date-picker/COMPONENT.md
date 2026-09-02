---
id: form.date-picker
category: form
requires: []
optional: [form.field]
states:
  confirmed: [default]
  provisional: [open, error, disabled]
---

# form.date-picker

单日期筛选控件。Adapter 只投影已给定日期和状态；日期计算、时区、禁用规则与键盘日历行为由页面处理。

## 状态 Adapter

`state-adapter.js` 暴露 `window.PrototypeUiAdapters['form.date-picker']`，局部 state 为 `{ open: boolean, value: string, status?: 'default'|'error'|'disabled' }`。最终原型负责把业务字段映射到该 state；组件 Adapter 仅输出触发器文本、展开、错误与禁用语义。
