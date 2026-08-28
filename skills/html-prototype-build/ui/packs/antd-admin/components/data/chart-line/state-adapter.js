/* Line Chart 局部状态投影：只切换既有序列与空态。 */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* 归一化趋势图状态，未知序列不参与渲染。 */
  function normalize(value) { var state = value && typeof value === 'object' ? value : {}; var visible = Array.isArray(state.visibleSeries) ? state.visibleSeries.filter(function (key) { return ['primary', 'success'].indexOf(key) !== -1; }) : ['primary', 'success']; return { status: state.status === 'empty' ? 'empty' : 'data', visibleSeries: visible }; }
  /* 同步序列显隐、图例按下态和文字摘要。 */
  function render(root, value) { if (!root) return; var state = normalize(value); root.dataset.status = state.status; root.querySelectorAll('[data-series-key]').forEach(function (item) { var visible = state.visibleSeries.indexOf(item.dataset.seriesKey) !== -1; item.hidden = !visible; if (item.matches('button')) item.setAttribute('aria-pressed', String(visible)); }); var summary = root.querySelector('.ui-chart-summary'); if (summary) summary.textContent = state.status === 'empty' ? '暂无趋势数据' : '当前显示：' + state.visibleSeries.map(function (key) { return key === 'primary' ? '本期' : '上期'; }).join('、'); }
  adapters['data.chart-line'] = { normalize: normalize, render: render };
})();
