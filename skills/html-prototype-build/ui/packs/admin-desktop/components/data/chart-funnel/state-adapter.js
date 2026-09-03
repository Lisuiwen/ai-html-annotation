/* Funnel 局部状态投影。 */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  var core = window.PrototypeChartCore;

  /** 归一化漏斗状态。 */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    return {
      status: core.normalizeChartStatus(state.status, false),
      steps: Array.isArray(state.steps) ? state.steps : undefined
    };
  }

  /** 渲染漏斗图。 */
  function render(root, value) {
    if (!root || !core) return;
    var state = normalize(value);
    core.renderLeaf(root, state, {
      preset: 'funnel',
      emptyText: '暂无漏斗数据',
      summary: function (s) {
        var steps = s.steps || [{}, {}, {}, {}, {}];
        return steps.length + ' 个阶段流转';
      }
    });
  }

  adapters['data.chart-funnel'] = { normalize: normalize, render: render };
})();
