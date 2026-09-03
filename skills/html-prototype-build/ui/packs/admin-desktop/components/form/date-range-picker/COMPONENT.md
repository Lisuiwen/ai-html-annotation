---
id: form.date-range-picker
category: form
requires: []
optional: [form.field]
states:
  confirmed: [default]
  provisional: [open, error, disabled]
---

# form.date-range-picker

日期范围筛选控件。Adapter 只投影已给定日期和状态；日期计算、时区、禁用规则与键盘日历行为由页面处理。
