/* Line Chart 局部状态投影。 */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  var core = window.PrototypeChartCore;

  /** 归一化折线图状态；demo 默认值由 preset 提供。 */
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

  /** 渲染折线图。 */
  function render(root, value) {
    if (!root || !core) return;
    core.renderLeaf(root, normalize(value), {
      preset: 'line',
      emptyText: '暂无趋势数据',
      summary: function (state) {
        var series = state.series || [
          { key: 'primary', name: '本期' },
          { key: 'success', name: '上期' }
        ];
        var visible = state.visibleSeries || series.map(function (item) { return item.key; });
        return '当前显示：' + series.filter(function (item) {
          return visible.indexOf(item.key) !== -1;
        }).map(function (item) { return item.name; }).join('、');
      }
    });
  }

  adapters['data.chart-line'] = { normalize: normalize, render: render };
})();
