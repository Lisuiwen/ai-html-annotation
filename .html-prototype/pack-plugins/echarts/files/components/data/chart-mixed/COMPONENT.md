---
id: data.chart-mixed
category: data
requires: []
optional: [data.card]
states:
  confirmed: [data, categories, bars, lines]
  provisional: [empty, leftAxisName, rightAxisName]
---

# data.chart-mixed

Bar-line mixed chart leaf; internally composes bar + line + dual yAxis only, with no duplicated ECharts logic.
