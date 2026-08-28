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

轻量记录流。虚拟滚动、无限加载和分页请求由页面实现。
