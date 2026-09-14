/* Mixed Chart thin leaf: only calls presets.mixed. */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  var core = window.PrototypeChartCore;

  /** Normalize mixed bar-line chart state. */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    return {
      status: core.normalizeChartstate(state.status, false),
      categories: Array.isArray(state.categories) ? state.categories : undefined,
      bars: state.bars && typeof state.bars === 'object' ? state.bars : undefined,
      lines: state.lines && typeof state.lines === 'object' ? state.lines : undefined,
      leftAxisName: typeof state.leftAxisName === 'string' ? state.leftAxisName : undefined,
      rightAxisName: typeof state.rightAxisName === 'string' ? state.rightAxisName : undefined
    };
  }

  /** Render mixed chart. */
  function render(root, value) {
    if (!root || !core) return;
    var state = normalize(value);
    core.renderLeaf(root, state, {
      preset: 'mixed',
      emptyText: 'No mixed chart data',
      summary: function (s) {
        var bars = s.bars || { name: 'Task volume' };
        var lines = s.lines || { name: 'Completion rate' };
        return 'Mixed bar-line: ' + bars.name + ' + ' + lines.name;
      }
    });
  }

  adapters['data.chart-mixed'] = { normalize: normalize, render: render };
})();
