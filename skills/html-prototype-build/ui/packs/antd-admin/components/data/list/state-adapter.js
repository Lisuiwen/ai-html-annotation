/* List 局部状态投影：在数据、空态和加载态间切换。 */
(function () {
  'use strict'; var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* 限定列表生命周期状态。 */
  function normalize(value) { var state = value && typeof value === 'object' ? value : {}; return { status: ['data', 'empty', 'loading'].indexOf(state.status) !== -1 ? state.status : 'data', size: state.size === 'compact' ? 'compact' : 'default' }; }
  /* 切换列表数据、空态和加载占位区域。 */
  function render(root, value) { if (!root) return; var state = normalize(value); root.dataset.size = state.size; root.querySelectorAll('[data-ui-list-state]').forEach(function (section) { section.hidden = section.dataset.uiListState !== state.status; }); }
  adapters['data.list'] = { normalize: normalize, render: render };
})();