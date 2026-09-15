/* Empty state local state projection: toggles visibility and declared copy variants only. */
(function () {
  'use strict'; var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* Normalize empty state. */
  function normalize(value) { var state = value && typeof value === 'object' ? value : {}; return { visible: state.visible !== false, variant: state.variant === 'search-empty' ? 'search-empty' : 'empty' }; }
  /* Sync empty state display text. */
  function render(root, value) { if (!root) return; var state = normalize(value); root.hidden = !state.visible; var text = root.querySelector('.ui-empty-text'); if (text) text.textContent = state.variant === 'search-empty' ? 'No matching results' : 'No data'; }
  adapters['data.empty'] = { normalize: normalize, render: render };
})();