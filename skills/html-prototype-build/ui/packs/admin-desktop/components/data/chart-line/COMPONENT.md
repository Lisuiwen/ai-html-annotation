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

时间或顺序类目的趋势展示，ECharts 渲染。图例显隐仅改变已提供序列的可见性，不计算业务指标。
