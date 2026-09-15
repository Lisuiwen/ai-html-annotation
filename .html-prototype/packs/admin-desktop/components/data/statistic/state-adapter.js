/* Statistic local state projection: displays business-provided values and trends without computing metrics. */
(function () {
  'use strict'; var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* Normalize statistic display state. */
  function normalize(value) { var state = value && typeof value === 'object' ? value : {}; return { value: typeof state.value === 'string' || typeof state.value === 'number' ? String(state.value) : '', trend: ['none', 'up', 'down'].indexOf(state.trend) !== -1 ? state.trend : 'none', status: ['default', 'success', 'warning', 'error'].indexOf(state.status) !== -1 ? state.status : 'default' }; }
  /* Sync value and trend semantics. */
  function render(root, value) { if (!root) return; var state = normalize(value); root.dataset.status = state.status; var output = root.querySelector('.ui-statistic-value'); var trend = root.querySelector('.ui-statistic-trend'); if (output) output.textContent = state.value; if (trend) { trend.hidden = state.trend === 'none'; trend.textContent = state.trend === 'up' ? '↑' : '↓'; trend.dataset.trend = state.trend; } }
  adapters['data.statistic'] = { normalize: normalize, render: render };
})();