---
id: form.field
category: form
requires: []
optional: [form.input, form.select, form.textarea, form.date-picker, form.switch]
states:
  confirmed: [default]
  provisional: [focus, error]
---

# Field

框内标签与控件的组合容器。根据字段类型选择 `form.input` 或 `form.select`，不得把 label 与 placeholder 合成一句。
