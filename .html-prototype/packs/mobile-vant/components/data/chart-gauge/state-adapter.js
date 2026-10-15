/* Gauge local state projection. */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  var core = window.PrototypeChartCore;

  /** Normalize gauge chart state. */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    var num = Number(state.value);
    return {
      status: core.normalizeChartstate(state.status, false),
      value: Number.isFinite(num) ? num : undefined,
      min: typeof state.min === 'number' ? state.min : undefined,
      max: typeof state.max === 'number' ? state.max : undefined,
      unit: typeof state.unit === 'string' ? state.unit : undefined,
      thresholds: Array.isArray(state.thresholds) ? state.thresholds : undefined
    };
  }

  /** Render gauge chart. */
  function render(root, value) {
    if (!root || !core) return;
    var state = normalize(value);
    core.renderLeaf(root, state, {
      preset: 'gauge',
      emptyText: 'No metric data',
      summary: function (s) {
        var unit = typeof s.unit === 'string' ? s.unit : '%';
        var val = typeof s.value === 'number' ? s.value : 72;
        return 'Current completion rate ' + val + unit;
      }
    });
  }

  adapters['data.chart-gauge'] = { normalize: normalize, render: render };
})();
