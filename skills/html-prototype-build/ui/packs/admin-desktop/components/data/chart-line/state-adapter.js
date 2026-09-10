/* Line Chart local state projection. */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  var core = window.PrototypeChartCore;

  /** Normalize line chart state; demo defaults provided by preset. */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    var series = Array.isArray(state.series) ? state.series : null;
    var visible = Array.isArray(state.visibleSeries) ? state.visibleSeries.slice() : null;
    if (series && visible) {
      var keys = series.map(function (item) { return item.key; });
      visible = visible.filter(function (key) { return keys.indexOf(key) !== -1; });
    }
    return {
      status: core.normalizeChartStatus(state.status, true),
      categories: Array.isArray(state.categories) ? state.categories : undefined,
      series: series || undefined,
      visibleSeries: visible || undefined,
      variant: state.variant === 'area' ? 'area' : undefined
    };
  }

  /** Render line chart. */
  function render(root, value) {
    if (!root || !core) return;
    core.renderLeaf(root, normalize(value), {
      preset: 'line',
      emptyText: 'No trend data',
      summary: function (state) {
        var series = state.series || [
          { key: 'primary', name: 'Current period' },
          { key: 'success', name: 'Previous period' }
        ];
        var visible = state.visibleSeries || series.map(function (item) { return item.key; });
        return 'Currently showing: ' + series.filter(function (item) {
          return visible.indexOf(item.key) !== -1;
        }).map(function (item) { return item.name; }).join('、');
      }
    });
  }

  adapters['data.chart-line'] = { normalize: normalize, render: render };
})();
