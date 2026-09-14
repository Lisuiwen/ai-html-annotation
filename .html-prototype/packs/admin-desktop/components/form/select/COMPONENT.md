---
id: form.select
category: form
requires: []
states:
  confirmed: [default]
  provisional: [open, selected]
---

# Select

Custom selector for local prototypes. Must maintain ARIA state for trigger, listbox, and option; option content must come from requirement materials.

## State Adapter

`state-adapter.js` exposes `window.PrototypeUiAdapters['form.select']`; local state is `{ open: boolean, value: string }`. The final prototype maps business fields to this state and handles clicks, keyboard, and scenario switching; the component Adapter only outputs menu, text, and ARIA.
