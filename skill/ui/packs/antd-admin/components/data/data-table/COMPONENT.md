---
id: data.data-table
category: data
requires: []
optional: [action.button, data.tag]
states:
  confirmed: [data]
  provisional: [hover, empty, loading]
---

# Data Table

表格及其数据、空态和加载态。三种状态属于同一组件生命周期，不拆成独立组件；列、数据和状态触发条件必须来自当前需求。

