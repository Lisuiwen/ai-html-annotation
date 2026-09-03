---
id: data._echarts-core
category: data
visibility: internal
requires: []
states:
  confirmed: []
  provisional: []
---

# ECharts Core

图表 leaf 共用的 ECharts 实例池与 setOption 入口。只能通过公开 chart 组件依赖加载，不得由 Pattern 或 Preset 直接选择。

## 运行时依赖

生成原型时需 copy：

- `assets/echarts.min.js`（来自 skill vendor）
- `prototype/chart-bridge.js`、`prototype/chart-presets.js`（来自 skill runtime）

## 状态 Adapter

`state-adapter.js` 暴露 `window.PrototypeChartCore`，提供 `render(root, option)` 与 `destroy(root)`；不读取 `PrototypeViewers`。
