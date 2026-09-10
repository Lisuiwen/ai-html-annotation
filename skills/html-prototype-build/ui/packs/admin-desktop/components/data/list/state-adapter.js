/* List local state projection: switches among data, empty, and loading states. */
(function () {
  'use strict'; var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* Restrict list lifecycle states. */
  function normalize(value) { var state = value && typeof value === 'object' ? value : {}; return { status: ['data', 'empty', 'loading'].indexOf(state.status) !== -1 ? state.status : 'data', size: state.size === 'compact' ? 'compact' : 'default' }; }
  /* Switch list data, empty, and loading placeholder areas. */
  function render(root, value) { if (!root) return; var state = normalize(value); root.dataset.size = state.size; root.querySelectorAll('[data-ui-list-state]').forEach(function (section) { section.hidden = section.dataset.uiListState !== state.status; }); }
  adapters['data.list'] = { normalize: normalize, render: render };
})();