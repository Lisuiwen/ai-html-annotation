/* Card local state projection: switches border variant and loading area without managing content. */
(function () {
  'use strict'; var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* Normalize card state. */
  function normalize(value) { var state = value && typeof value === 'object' ? value : {}; return { loading: !!state.loading, bordered: state.bordered !== false }; }
  /* Sync card variant and content visibility. */
  function render(root, value) { if (!root) return; var state = normalize(value); root.classList.toggle('is-borderless', !state.bordered); var body = root.querySelector('.ui-card-body'); var loading = root.querySelector('.ui-card-loading'); if (body) body.hidden = state.loading; if (loading) loading.hidden = !state.loading; }
  adapters['data.card'] = { normalize: normalize, render: render };
})();