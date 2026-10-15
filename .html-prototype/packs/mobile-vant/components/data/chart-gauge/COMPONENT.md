---
id: data.chart-gauge
category: data
requires: []
states:
  confirmed: [data, value]
  provisional: [empty, min, max, unit, thresholds]
---

# data.chart-gauge

Single-value metrics such as SLA, completion rate, and quota usage, rendered with an ECharts gauge.
