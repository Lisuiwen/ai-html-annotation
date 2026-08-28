/* Descriptions 局部状态投影：只投影布局列数和加载区域。 */
(function () {
  'use strict'; var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* 归一化详情布局状态。 */
  function normalize(value) { var state = value && typeof value === 'object' ? value : {}; return { loading: !!state.loading, columns: state.columns === 1 ? 1 : 2 }; }
  /* 切换详情内容和加载占位。 */
  function render(root, value) { if (!root) return; var state = normalize(value); root.style.setProperty('--ui-descriptions-columns', state.columns); var data = root.querySelector('.ui-descriptions-data'); var loading = root.querySelector('.ui-descriptions-loading'); if (data) data.hidden = state.loading; if (loading) loading.hidden = !state.loading; }
  adapters['data.descriptions'] = { normalize: normalize, render: render };
})();