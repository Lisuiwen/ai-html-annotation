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

Single-date filter control. The Adapter only projects the given date and status; date calculation, time zones, disabled rules, and keyboard calendar behavior are handled by the page.

## State Adapter

`state-adapter.js` exposes `window.PrototypeUiAdapters['form.date-picker']`; local state is `{ open: boolean, value: string, status?: 'default'|'error'|'disabled' }`. The final prototype maps business fields to this state; the component Adapter only outputs trigger text, expansion, error, and disabled semantics.
