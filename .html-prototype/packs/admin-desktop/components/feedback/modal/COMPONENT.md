---
id: feedback.modal
category: feedback
requires: [feedback._overlay-core, action.button]
states:
  confirmed: []
  provisional: [open, closed]
---

# Modal

Modal dialog within the product area. Must associate a title and stay within `.ui-preview`; it must not cover the formal notes area on the right.

## State Adapter

Renders `{ open: boolean }` through the `state-adapter.js` provided by `feedback._overlay-core`. The final prototype maps scenario state to this interface and binds business events for open, close, cancel, and confirm actions.

## Annotation anchors

- The `.ui-overlay` `id` is used by the overlay Adapter, `aria-controls`, and `role="dialog"`.
- The inner `.ui-modal` panel must have its own stable `id`, recommended as `{overlayId}Panel` (for example `uiDemoModalPanel`).
- Note card `target.anchor` binds to the inner panel id, not the overlay id (the overlay fills the product area and connectors would land in the wrong place).
