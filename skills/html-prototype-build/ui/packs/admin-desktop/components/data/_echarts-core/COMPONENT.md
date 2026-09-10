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

Shared ECharts instance pool and setOption entry for chart leaf components. May be loaded only through public chart component dependencies; Patterns and Presets must not select it directly.

## Runtime dependencies

When generating a prototype, copy:

- `assets/echarts.min.js` (from the skill vendor)
- `prototype/bridge.js` and `prototype/presets.js` (from `runtime/client/charts/`)

## State Adapter

`state-adapter.js` exposes `window.PrototypeChartCore`, providing `render(root, option)` and `destroy(root)`; it does not read `PrototypeViewers`.
