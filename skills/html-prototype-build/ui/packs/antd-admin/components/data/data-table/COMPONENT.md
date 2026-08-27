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

## 状态 Adapter

`state-adapter.js` 暴露 `window.PrototypeUiAdapters['data.data-table']`，局部 state 为 `{ status: 'data' | 'empty' | 'loading' }`，也兼容直接传入 status。最终原型负责提交业务状态；组件 Adapter 仅切换三个可见区域并通知连线重绘。

