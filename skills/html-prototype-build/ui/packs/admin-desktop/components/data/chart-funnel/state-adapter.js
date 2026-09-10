/* Funnel local state projection. */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  var core = window.PrototypeChartCore;

  /** Normalize funnel chart state. */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    return {
      status: core.normalizeChartStatus(state.status, false),
      steps: Array.isArray(state.steps) ? state.steps : undefined
    };
  }

  /** Render funnel chart. */
  function render(root, value) {
    if (!root || !core) return;
    var state = normalize(value);
    core.renderLeaf(root, state, {
      preset: 'funnel',
      emptyText: 'No funnel data',
      summary: function (s) {
        var steps = s.steps || [{}, {}, {}, {}, {}];
        return steps.length + '  stage flow';
      }
    });
  }

  adapters['data.chart-funnel'] = { normalize: normalize, render: render };
})();
