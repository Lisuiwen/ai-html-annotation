/* Heatmap 局部状态投影。 */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  var core = window.PrototypeChartCore;

  /** 归一化热力图状态。 */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    return {
      status: core.normalizeChartStatus(state.status, false),
      xCategories: Array.isArray(state.xCategories) ? state.xCategories : undefined,
      yCategories: Array.isArray(state.yCategories) ? state.yCategories : undefined,
      data: Array.isArray(state.data) ? state.data : undefined,
      visualMap: state.visualMap && typeof state.visualMap === 'object' ? state.visualMap : undefined
    };
  }

  /** 渲染热力图。 */
  function render(root, value) {
    if (!root || !core) return;
    var state = normalize(value);
    core.renderLeaf(root, state, {
      preset: 'heatmap',
      emptyText: '暂无热力数据',
      summary: function (s) {
        var xs = s.xCategories || ['0', '4', '8', '12', '16', '20'];
        var ys = s.yCategories || ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        return ys.length + '×' + xs.length + ' 活跃分布';
      }
    });
  }

  adapters['data.chart-heatmap'] = { normalize: normalize, render: render };
})();
