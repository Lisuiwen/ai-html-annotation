/* Mixed Chart 薄 leaf：仅调 presets.mixed。 */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  var core = window.PrototypeChartCore;

  /** 归一化柱线混合图状态。 */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    return {
      status: core.normalizeChartStatus(state.status, false),
      categories: Array.isArray(state.categories) ? state.categories : undefined,
      bars: state.bars && typeof state.bars === 'object' ? state.bars : undefined,
      lines: state.lines && typeof state.lines === 'object' ? state.lines : undefined,
      leftAxisName: typeof state.leftAxisName === 'string' ? state.leftAxisName : undefined,
      rightAxisName: typeof state.rightAxisName === 'string' ? state.rightAxisName : undefined
    };
  }

  /** 渲染混合图。 */
  function render(root, value) {
    if (!root || !core) return;
    var state = normalize(value);
    core.renderLeaf(root, state, {
      preset: 'mixed',
      emptyText: '暂无混合图数据',
      summary: function (s) {
        var bars = s.bars || { name: '任务量' };
        var lines = s.lines || { name: '完成率' };
        return '柱线混合：' + bars.name + ' + ' + lines.name;
      }
    });
  }

  adapters['data.chart-mixed'] = { normalize: normalize, render: render };
})();
