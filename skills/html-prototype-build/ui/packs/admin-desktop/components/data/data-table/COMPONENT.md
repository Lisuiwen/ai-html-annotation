---
id: data.data-table
category: data
requires: []
optional: [action.button, data.tag]
states:
  confirmed: [data]
  provisional: [hover, empty, loading, row-selection]
---

# Data Table

表格及其数据、空态、加载态和可选的行选择。数据、空态和加载态属于同一组件生命周期，不拆成独立组件；列、数据和状态触发条件必须来自当前需求。

## 状态 Adapter

`state-adapter.js` 暴露 `window.PrototypeUiAdapters['data.data-table']`，局部 state 为 `{ status: 'data' | 'empty' | 'loading', selection?: { selectedKeys: string[], allSelected: boolean, indeterminate: boolean } }`，也兼容直接传入 status。最终原型负责提交业务状态；组件 Adapter 仅切换可见区域、投影既有选择列并通知连线重绘。

<!-- ponytail: 当前选择能力仅投影页面给定的选中集合；跨页选择、全选计算、批量操作和事件绑定须由业务状态 Adapter 实现。 -->

