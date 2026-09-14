---
id: feedback.drawer
category: feedback
requires: [feedback._overlay-core, action.button]
states:
  confirmed: []
  provisional: [open, closed]
---

# Drawer

Product-area right-side drawer. Must stay within `.ui-preview`; width, content, and state follow the current materials.

## State Adapter

Renders `{ open: boolean }` through the `state-adapter.js` provided by `feedback._overlay-core`. The final prototype maps scenario state to this interface and binds business events for open, close, and focus management.

## Annotation anchors

- The `.ui-overlay` `id` is used by the overlay Adapter and `aria-controls`.
- The inner `.ui-drawer` panel must have its own stable `id`, recommended as `{overlayId}Panel` (for example `uiDemoDrawerPanel`).
- Note card `target.anchor` binds to the inner panel id, not the overlay id.
