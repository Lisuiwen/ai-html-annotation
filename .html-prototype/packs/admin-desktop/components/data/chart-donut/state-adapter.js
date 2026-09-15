/* Donut Chart local state projection. */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  var core = window.PrototypeChartCore;

  /** Normalize donut chart state. */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    var items = Array.isArray(state.items) ? state.items : null;
    var visible = Array.isArray(state.visibleKeys) ? state.visibleKeys.slice() : null;
    if (items && visible) {
      var keys = items.map(function (item) { return item.key; });
      visible = visible.filter(function (key) { return keys.indexOf(key) !== -1; });
    }
    return {
      status: core.normalizeChartstate(state.status, true),
      items: items || undefined,
      visibleKeys: visible || undefined,
      radius: Array.isArray(state.radius) && state.radius.length === 2 ? state.radius : undefined
    };
  }

  /** Render donut chart. */
  function render(root, value) {
    if (!root || !core) return;
    core.renderLeaf(root, normalize(value), {
      preset: 'donut',
      emptyText: 'No composition data',
      summary: function (state) {
        var items = state.items || [
          { key: 'primary', name: 'Online' },
          { key: 'success', name: 'Offline' },
          { key: 'warning', name: 'Referral' }
        ];
        var visible = state.visibleKeys || items.map(function (item) { return item.key; });
        return 'Composition: ' + items.filter(function (item) {
          return visible.indexOf(item.key) !== -1;
        }).map(function (item) { return item.name; }).join('、');
      }
    });
  }

  adapters['data.chart-donut'] = { normalize: normalize, render: render };
})();
