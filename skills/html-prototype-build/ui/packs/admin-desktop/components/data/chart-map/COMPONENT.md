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

区域任务量、网点分布与省市区统计。`mapId` 对应 `assets/maps/<id>.json`；生成时须同时交付 `assets/maps/<id>.js`（写入 `window.PrototypeMapRegistry`，`file://` 下 fetch json 会被拦截）；ponytail：v1 仅省级 china mock。
