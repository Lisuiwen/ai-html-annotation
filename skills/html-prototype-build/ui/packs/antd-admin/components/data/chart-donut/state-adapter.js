/* Donut Chart 局部状态投影：只切换既有扇区、图例和中心摘要。 */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  var keys = ['primary', 'success', 'warning'];
  /* 归一化环图状态，并保证选中项属于可见项。 */
  function normalize(value) { var state = value && typeof value === 'object' ? value : {}; var visible = Array.isArray(state.visibleKeys) ? state.visibleKeys.filter(function (key) { return keys.indexOf(key) !== -1; }) : keys.slice(); var selected = typeof state.selectedKey === 'string' && visible.indexOf(state.selectedKey) !== -1 ? state.selectedKey : (visible[0] || null); return { status: state.status === 'empty' ? 'empty' : 'data', visibleKeys: visible, selectedKey: selected }; }
  /* 同步扇区按下态、中心标签和文字摘要。 */
  function render(root, value) { if (!root) return; var state = normalize(value); root.dataset.status = state.status; root.querySelectorAll('[data-series-key]').forEach(function (item) { var key = item.dataset.seriesKey; var visible = state.visibleKeys.indexOf(key) !== -1; var selected = key === state.selectedKey; item.hidden = !visible; item.setAttribute('aria-pressed', String(selected)); item.classList.toggle('is-selected', selected); }); var slice = state.selectedKey && root.querySelector('.ui-chart-donut-slice[data-series-key="' + state.selectedKey + '"]'); var label = slice ? slice.dataset.label : '—'; var valueText = slice ? slice.dataset.value : '—'; var center = root.querySelector('.ui-chart-center-value'); var summary = root.querySelector('.ui-chart-summary'); if (center) center.textContent = label; if (summary) summary.textContent = state.status === 'empty' ? '暂无构成数据' : '已选中：' + label + ' ' + valueText; }
  adapters['data.chart-donut'] = { normalize: normalize, render: render };
})();
