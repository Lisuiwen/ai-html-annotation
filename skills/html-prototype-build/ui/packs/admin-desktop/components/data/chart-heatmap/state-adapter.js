/* Heatmap local state projection. */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  var core = window.PrototypeChartCore;

  /** Normalize heatmap state. */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    return {
      status: core.normalizeChartStatus(state.status, false),
      xCategories: Array.isArray(state.xCategories) ? state.xCategories : undefined,
      yCategories: Array.isArray(state.yCategories) ? state.yCategories : undefined,
      data: Array.isArray(state.data) ? state.data : undefined,
      visualMap: state.visualMap && typeof state.visualMap === 'object' ? state.visualMap : undefined
    };
  }

  /** Render heatmap. */
  function render(root, value) {
    if (!root || !core) return;
    var state = normalize(value);
    core.renderLeaf(root, state, {
      preset: 'heatmap',
      emptyText: 'No heatmap data',
      summary: function (s) {
        var xs = s.xCategories || ['0', '4', '8', '12', '16', '20'];
        var ys = s.yCategories || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return ys.length + '×' + xs.length + ' Activity distribution';
      }
    });
  }

  adapters['data.chart-heatmap'] = { normalize: normalize, render: render };
})();
