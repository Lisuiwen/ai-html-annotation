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

Category value comparison rendered with ECharts. `layout: horizontal` supports ranking bars; legend visibility does not change the data.
