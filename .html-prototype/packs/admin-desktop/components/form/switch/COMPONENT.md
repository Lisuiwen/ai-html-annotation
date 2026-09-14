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

Boolean toggle control. Uses `role="switch"` and `aria-checked` for switch semantics; Adapter does not bind clicks or business validation.

## State Adapter

`state-adapter.js` exposes `window.PrototypeUiAdapters['form.switch']`; local state is `{ checked: boolean, disabled?: boolean, loading?: boolean }`. The final prototype maps business fields to this state; the component Adapter only syncs checked, disabled, and loading styles.
