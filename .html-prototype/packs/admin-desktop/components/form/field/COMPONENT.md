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

In-box label and control container. Choose `form.input` or `form.select` by field type; do not merge label and placeholder into one string.
