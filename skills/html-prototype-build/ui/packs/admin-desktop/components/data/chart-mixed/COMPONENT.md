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

柱线混合图薄 leaf，内部仅 compose bar + line + 双 yAxis，无重复 ECharts 逻辑。
