---
id: data.chart-donut
category: data
requires: []
optional: [data.card]
states:
  confirmed: [data, items]
  provisional: [empty, loading, visibleKeys, selectedKey, radius]
---

# data.chart-donut

Composition share display using ECharts ring or pie charts. `radius` controls ring versus solid pie layout.
