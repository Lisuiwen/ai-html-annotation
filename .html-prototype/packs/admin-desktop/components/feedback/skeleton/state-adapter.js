/* Skeleton local state projection: switches between skeleton and existing content area. */
(function () {
  'use strict'; var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* Normalize skeleton state. */
  function normalize(value) { var state = value && typeof value === 'object' ? value : {}; return { loading: !!state.loading, variant: ['paragraph', 'card', 'detail'].indexOf(state.variant) !== -1 ? state.variant : 'paragraph' }; }
  /* Switch between provided content and skeleton area. */
  function render(root, value) { if (!root) return; var state = normalize(value); root.dataset.variant = state.variant; var content = root.querySelector('.ui-skeleton-content'); var placeholder = root.querySelector('.ui-skeleton-placeholder'); if (content) content.hidden = state.loading; if (placeholder) placeholder.hidden = !state.loading; }
  adapters['feedback.skeleton'] = { normalize: normalize, render: render };
})();