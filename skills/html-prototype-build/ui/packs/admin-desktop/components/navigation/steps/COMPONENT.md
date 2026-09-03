---
id: navigation.steps
category: navigation
requires: []
optional: []
states:
  confirmed: [default]
  provisional: [wait, process, finish, error]
---

# navigation.steps

流程当前位置。不得在未提供流程规则时实现自由跳步或可点击导航。
