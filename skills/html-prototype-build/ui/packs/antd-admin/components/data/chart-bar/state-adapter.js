/* Bar Chart 局部状态投影：只切换既有系列与空态。 */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* 归一化柱状图展示状态。 */
  function normalize(value) { var state = value && typeof value === 'object' ? value : {}; var visible = Array.isArray(state.visibleSeries) ? state.visibleSeries.filter(function (key) { return ['primary', 'warning'].indexOf(key) !== -1; }) : ['primary', 'warning']; return { status: state.status === 'empty' ? 'empty' : 'data', visibleSeries: visible }; }
  /* 同步图例、既有柱组和可访问摘要。 */
  function render(root, value) { if (!root) return; var state = normalize(value); root.dataset.status = state.status; root.querySelectorAll('.ui-chart-legend-button, .ui-chart-series').forEach(function (item) { var visible = state.visibleSeries.indexOf(item.dataset.seriesKey) !== -1; item.hidden = !visible; if (item.matches('button')) item.setAttribute('aria-pressed', String(visible)); }); var summary = root.querySelector('.ui-chart-summary'); if (summary) summary.textContent = state.status === 'empty' ? '暂无对比数据' : '分组对比：' + state.visibleSeries.map(function (key) { return key === 'primary' ? '计划' : '完成'; }).join('、'); }
  adapters['data.chart-bar'] = { normalize: normalize, render: render };
})();
