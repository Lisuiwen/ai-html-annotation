---
id: data.chart-bar
category: data
requires: []
optional: [data.card]
states:
  confirmed: [data, categories, series]
  provisional: [empty, loading, visibleSeries, layout]
---

# data.chart-bar

类目数值对比展示，ECharts 渲染。`layout: horizontal` 可做排名条；图例显隐不改变数据。
