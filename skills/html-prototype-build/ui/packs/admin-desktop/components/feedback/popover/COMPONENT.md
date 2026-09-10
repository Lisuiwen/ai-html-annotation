---
id: feedback.popover
category: feedback
requires: [action.button]
states:
  confirmed: [closed]
  provisional: [open]
---

# feedback.popover

General popover card. Positioning, click-outside close, and focus management are handled by the final prototype; the content region keeps its DOM, and the Adapter only syncs open state and title.
