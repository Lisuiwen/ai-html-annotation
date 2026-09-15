---
id: data.chart-funnel
category: data
requires: []
optional: [data.card]
states:
  confirmed: [data, steps]
  provisional: [empty]
---

# data.chart-funnel

Approval flow, task-stage drop-off, and conversion using an ECharts funnel chart. `steps` are ordered top to bottom.
