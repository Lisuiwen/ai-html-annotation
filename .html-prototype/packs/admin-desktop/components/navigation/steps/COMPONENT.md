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

Current position in a flow. Do not implement free step jumping or clickable navigation without flow rules from materials.
