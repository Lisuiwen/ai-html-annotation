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

构成占比展示，ECharts 环/饼图。`radius` 控制环图与实心饼图。
