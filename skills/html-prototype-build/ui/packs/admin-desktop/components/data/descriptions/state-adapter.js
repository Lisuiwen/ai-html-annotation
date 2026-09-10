/* Descriptions local state projection: projects layout column count and loading area only. */
(function () {
  'use strict'; var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* Normalize description layout state. */
  function normalize(value) { var state = value && typeof value === 'object' ? value : {}; return { loading: !!state.loading, columns: state.columns === 1 ? 1 : 2 }; }
  /* Switch detail content and loading placeholder. */
  function render(root, value) { if (!root) return; var state = normalize(value); root.style.setProperty('--ui-descriptions-columns', state.columns); var data = root.querySelector('.ui-descriptions-data'); var loading = root.querySelector('.ui-descriptions-loading'); if (data) data.hidden = state.loading; if (loading) loading.hidden = !state.loading; }
  adapters['data.descriptions'] = { normalize: normalize, render: render };
})();