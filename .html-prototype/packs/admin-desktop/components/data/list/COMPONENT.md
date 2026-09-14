---
id: data.list
category: data
requires: []
optional: [data.empty, feedback.skeleton, action.button]
states:
  confirmed: [default]
  provisional: [empty, loading, compact]
---

# data.list

Lightweight record stream. Virtual scrolling, infinite loading, and paginated requests are implemented by the page.
