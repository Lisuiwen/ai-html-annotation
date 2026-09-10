---
id: feedback._overlay-core
category: feedback
visibility: internal
requires: []
states:
  confirmed: []
  provisional: [open, closed]
---

# Overlay Core

Private overlay positioning, structure, and open/close behavior shared by Modal and Drawer. May be loaded only through public component dependencies; Patterns and Presets must not select it directly.

## State Adapter

`state-adapter.js` exposes `window.PrototypeUiAdapters['feedback._overlay-core']`; local state is `{ open: boolean }`. The final prototype maps business scenarios to overlay open/close and handles focus; the component Adapter only projects `hidden`, ARIA, dimensions, and visual classes within the product area.
