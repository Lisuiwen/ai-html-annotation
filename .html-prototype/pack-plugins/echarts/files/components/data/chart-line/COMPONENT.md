---
id: data.chart-line
category: data
requires: []
optional: [data.card]
states:
  confirmed: [data, categories, series]
  provisional: [empty, loading, visibleSeries, variant]
---

# data.chart-line

Trend display for time or ordered categories, rendered with ECharts. Legend visibility only toggles visibility of provided series; it does not compute business metrics.
