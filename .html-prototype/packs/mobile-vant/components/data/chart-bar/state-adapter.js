/* Bar Chart local state projection. */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  var core = window.PrototypeChartCore;

  /** Normalize bar chart state. */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    var series = Array.isArray(state.series) ? state.series : null;
    var visible = Array.isArray(state.visibleSeries) ? state.visibleSeries.slice() : null;
    if (series && visible) {
      var keys = series.map(function (item) { return item.key; });
      visible = visible.filter(function (key) { return keys.indexOf(key) !== -1; });
    }
    return {
      status: core.normalizeChartstate(state.status, true),
      categories: Array.isArray(state.categories) ? state.categories : undefined,
      series: series || undefined,
      visibleSeries: visible || undefined,
      layout: state.layout === 'horizontal' ? 'horizontal' : undefined
    };
  }

  /** Render bar chart. */
  function render(root, value) {
    if (!root || !core) return;
    core.renderLeaf(root, normalize(value), {
      preset: 'bar',
      emptyText: 'No comparison data',
      summary: function (state) {
        var series = state.series || [
          { key: 'primary', name: 'Planned' },
          { key: 'warning', name: 'Completed' }
        ];
        var visible = state.visibleSeries || series.map(function (item) { return item.key; });
        return 'Grouped comparison: ' + series.filter(function (item) {
          return visible.indexOf(item.key) !== -1;
        }).map(function (item) { return item.name; }).join('、');
      }
    });
  }

  adapters['data.chart-bar'] = { normalize: normalize, render: render };
})();
