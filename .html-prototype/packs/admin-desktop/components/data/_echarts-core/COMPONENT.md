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

When generating a prototype, copy the files listed in `resolve-pack` `deliver[]` output
(`from` → `to`). Typical targets:

- `assets/echarts.min.js`
- `prototype/bridge.js` and `prototype/presets.js`

## State Adapter

`state-adapter.js` exposes `window.PrototypeChartCore`, providing `render(root, option)` and `destroy(root)`; it does not read `PrototypeViewers`.
