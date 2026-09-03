/* Statistic 局部状态投影：展示业务提供的数值和趋势，不计算指标。 */
(function () {
  'use strict'; var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* 归一化指标展示状态。 */
  function normalize(value) { var state = value && typeof value === 'object' ? value : {}; return { value: typeof state.value === 'string' || typeof state.value === 'number' ? String(state.value) : '', trend: ['none', 'up', 'down'].indexOf(state.trend) !== -1 ? state.trend : 'none', status: ['default', 'success', 'warning', 'error'].indexOf(state.status) !== -1 ? state.status : 'default' }; }
  /* 同步数值和趋势语义。 */
  function render(root, value) { if (!root) return; var state = normalize(value); root.dataset.status = state.status; var output = root.querySelector('.ui-statistic-value'); var trend = root.querySelector('.ui-statistic-trend'); if (output) output.textContent = state.value; if (trend) { trend.hidden = state.trend === 'none'; trend.textContent = state.trend === 'up' ? '↑' : '↓'; trend.dataset.trend = state.trend; } }
  adapters['data.statistic'] = { normalize: normalize, render: render };
})();