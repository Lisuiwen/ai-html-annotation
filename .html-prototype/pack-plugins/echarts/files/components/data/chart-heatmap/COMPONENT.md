---
id: data.chart-heatmap
category: data
requires: []
optional: [data.card]
states:
  confirmed: [data, xCategories, yCategories]
  provisional: [empty, visualMap]
---

# data.chart-heatmap

Two-dimensional matrices such as 7×24 activity, calendar heat, and hour distribution, rendered with an ECharts heatmap.
