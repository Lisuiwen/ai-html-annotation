---
id: feedback.toast
category: feedback
requires: [action.button]
states:
  confirmed: []
  provisional: [visible, dismissed]
---

# Toast

Auto-dismissing neutral feedback. Message content and timing must come from the current interaction; do not invent success or error semantics.

## State Adapter

`state-adapter.js` exposes `window.PrototypeUiAdapters['feedback.toast']`; local state is `{ visible: boolean, message: string }`. Timeout dismiss policy belongs to final prototype business logic; the component Adapter only renders live region content.
