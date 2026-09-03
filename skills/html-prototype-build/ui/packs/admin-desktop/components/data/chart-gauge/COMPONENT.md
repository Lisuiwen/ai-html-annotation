---
id: data.chart-gauge
category: data
requires: []
optional: [data.card]
states:
  confirmed: [data, value]
  provisional: [empty, min, max, unit, thresholds]
---

# data.chart-gauge

SLA、完成率、配额占用等单值指标，ECharts 仪表盘。
