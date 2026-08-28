---
id: form.radio-group
category: form
requires: []
optional: [form.field]
states:
  confirmed: [default]
  provisional: [error, disabled]
---

# form.radio-group

少量互斥选项。使用原生 radio，Adapter 不绑定点击或业务校验。
