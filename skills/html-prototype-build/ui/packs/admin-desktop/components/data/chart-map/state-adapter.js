/* Map 局部状态投影：异步加载 geo 后渲染省级地图。 */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  var core = window.PrototypeChartCore;

  /** 归一化地图状态。 */
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

  /** 异步加载 geo 并渲染 map option。 */
  function render(root, value) {
    if (!root || !core) return;
    var state = normalize(value);
    var bridge = window.PrototypeChartBridge;
    if (state.status === 'empty') {
      core.renderLeaf(root, state, { emptyText: '暂无地图数据' });
      return;
    }
    if (!bridge) return;
    var gen = (root.__chartMapGen || 0) + 1;
    root.__chartMapGen = gen;
    core.projectShell(root, 'loading');
    var summary = root.querySelector('.ui-chart-summary');
    if (summary) summary.textContent = '地图加载中…';
    bridge.loadMapJson(state.mapId || 'china').then(function () {
      if (root.__chartMapGen !== gen || root.dataset.status === 'empty') return;
      core.renderLeaf(root, { status: 'data', mapId: state.mapId, data: state.data, visualMap: state.visualMap, roam: state.roam }, {
        preset: 'map',
        summary: '省级区域统计'
      });
    }).catch(function () {
      if (root.__chartMapGen !== gen) return;
      core.renderLeaf(root, { status: 'empty' }, { emptyText: '地图资源加载失败' });
    });
  }

  adapters['data.chart-map'] = { normalize: normalize, render: render };
})();
