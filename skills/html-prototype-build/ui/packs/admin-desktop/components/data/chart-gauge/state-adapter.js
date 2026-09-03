/* Gauge 局部状态投影。 */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  var core = window.PrototypeChartCore;

  /** 归一化仪表盘状态。 */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    var num = Number(state.value);
    return {
      status: core.normalizeChartStatus(state.status, false),
      value: Number.isFinite(num) ? num : undefined,
      min: typeof state.min === 'number' ? state.min : undefined,
      max: typeof state.max === 'number' ? state.max : undefined,
      unit: typeof state.unit === 'string' ? state.unit : undefined,
      thresholds: Array.isArray(state.thresholds) ? state.thresholds : undefined
    };
  }

  /** 渲染仪表盘。 */
  function render(root, value) {
    if (!root || !core) return;
    var state = normalize(value);
    core.renderLeaf(root, state, {
      preset: 'gauge',
      emptyText: '暂无指标数据',
      summary: function (s) {
        var unit = typeof s.unit === 'string' ? s.unit : '%';
        var val = typeof s.value === 'number' ? s.value : 72;
        return '当前完成率 ' + val + unit;
      }
    });
  }

  adapters['data.chart-gauge'] = { normalize: normalize, render: render };
})();
