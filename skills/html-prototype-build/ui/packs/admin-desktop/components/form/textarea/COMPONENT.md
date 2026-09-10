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

Multiline text input control. Field name must be expressed through an associated `label`; placeholder is for input hints only.

## State Adapter

`state-adapter.js` exposes `window.PrototypeUiAdapters['form.textarea']`; local state is `{ value: string, disabled?: boolean, status?: 'default'|'error' }`. The final prototype maps business fields to this state; the component Adapter only syncs value, disabled, and error styles.
