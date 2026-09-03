/* Donut Chart 局部状态投影。 */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  var core = window.PrototypeChartCore;

  /** 归一化环图状态。 */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    var items = Array.isArray(state.items) ? state.items : null;
    var visible = Array.isArray(state.visibleKeys) ? state.visibleKeys.slice() : null;
    if (items && visible) {
      var keys = items.map(function (item) { return item.key; });
      visible = visible.filter(function (key) { return keys.indexOf(key) !== -1; });
    }
    return {
      status: core.normalizeChartStatus(state.status, true),
      items: items || undefined,
      visibleKeys: visible || undefined,
      radius: Array.isArray(state.radius) && state.radius.length === 2 ? state.radius : undefined
    };
  }

  /** 渲染环图。 */
  function render(root, value) {
    if (!root || !core) return;
    core.renderLeaf(root, normalize(value), {
      preset: 'donut',
      emptyText: '暂无构成数据',
      summary: function (state) {
        var items = state.items || [
          { key: 'primary', name: '线上' },
          { key: 'success', name: '线下' },
          { key: 'warning', name: '转介绍' }
        ];
        var visible = state.visibleKeys || items.map(function (item) { return item.key; });
        return '构成：' + items.filter(function (item) {
          return visible.indexOf(item.key) !== -1;
        }).map(function (item) { return item.name; }).join('、');
      }
    });
  }

  adapters['data.chart-donut'] = { normalize: normalize, render: render };
})();
