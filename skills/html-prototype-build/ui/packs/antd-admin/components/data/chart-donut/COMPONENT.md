---
id: data.chart-donut
category: data
requires: []
optional: [data.card]
states:
  confirmed: [data]
  provisional: [empty, visibleKeys, selectedKey]
---

# data.chart-donut

分类占比展示。选择项由外部状态指定；中心汇总只展示已提供的文本，不计算真实比例。
