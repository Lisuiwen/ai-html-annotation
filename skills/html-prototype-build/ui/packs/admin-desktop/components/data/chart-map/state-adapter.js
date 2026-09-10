/* Map local state projection: asynchronously load geo then render province-level map. */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  var core = window.PrototypeChartCore;

  /** Normalize map state. */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    return {
      status: core.normalizeChartStatus(state.status, true),
      mapId: typeof state.mapId === 'string' ? state.mapId : undefined,
      data: Array.isArray(state.data) ? state.data : undefined,
      visualMap: state.visualMap && typeof state.visualMap === 'object' ? state.visualMap : undefined,
      roam: state.roam ? true : undefined
    };
  }

  /** Asynchronously load geo and render map option. */
  function render(root, value) {
    if (!root || !core) return;
    var state = normalize(value);
    var bridge = window.PrototypeChartBridge;
    if (state.status === 'empty') {
      core.renderLeaf(root, state, { emptyText: 'No map data' });
      return;
    }
    if (!bridge) return;
    var gen = (root.__chartMapGen || 0) + 1;
    root.__chartMapGen = gen;
    core.projectShell(root, 'loading');
    var summary = root.querySelector('.ui-chart-summary');
    if (summary) summary.textContent = 'Loading map…';
    bridge.loadMapJson(state.mapId || 'china').then(function () {
      if (root.__chartMapGen !== gen || root.dataset.status === 'empty') return;
      core.renderLeaf(root, { status: 'data', mapId: state.mapId, data: state.data, visualMap: state.visualMap, roam: state.roam }, {
        preset: 'map',
        summary: 'Province-level regional stats'
      });
    }).catch(function () {
      if (root.__chartMapGen !== gen) return;
      core.renderLeaf(root, { status: 'empty' }, { emptyText: 'Failed to load map resources' });
    });
  }

  adapters['data.chart-map'] = { normalize: normalize, render: render };
})();
