---
id: data.chart-map
category: data
requires: []
optional: [data.card]
states:
  confirmed: [data, mapId]
  provisional: [empty, loading, visualMap, roam]
---

# data.chart-map

Regional task volume, outlet distribution, and province/city/district statistics. `mapId` maps to `assets/maps/<id>.json`; generation must also deliver `assets/maps/<id>.js` (writing to `window.PrototypeMapRegistry`, because `file://` blocks JSON fetch); ponytail: v1 provides provincial china mock only.
