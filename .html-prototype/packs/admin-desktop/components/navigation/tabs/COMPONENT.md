---
id: navigation.tabs
category: navigation
requires: []
states:
  confirmed: [default]
  provisional: [selected]
---

# Tabs

Switch between parallel content within the same page. Generation must keep Tab and Panel ARIA references consistent.

## State Adapter

`state-adapter.js` exposes `window.PrototypeUiAdapters['navigation.tabs']`; local state is the stable `id` string of the selected Tab. The final prototype handles clicks and submits business state; the component Adapter only syncs `aria-selected`, Panel `hidden`, and visual output.
