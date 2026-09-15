/* Result local state projection: displays business-provided status and copy; does not handle navigation or retry. */
(function () {
  'use strict'; var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* Normalize result state. */
  function normalize(value) { var state = value && typeof value === 'object' ? value : {}; var status = ['success', 'error', 'warning', 'info'].indexOf(state.status) !== -1 ? state.status : 'info'; return { status: status, title: typeof state.title === 'string' ? state.title : '', subtitle: typeof state.subtitle === 'string' ? state.subtitle : '', actionVisible: state.actionVisible !== false }; }
  /* Project status styles, copy, and action area. */
  function render(root, value) { if (!root) return; var state = normalize(value); root.dataset.status = state.status; var title = root.querySelector('.ui-result-title'); var subtitle = root.querySelector('.ui-result-subtitle'); var action = root.querySelector('.ui-result-action'); if (title) title.textContent = state.title || 'Operation result'; if (subtitle) subtitle.textContent = state.subtitle; if (action) action.hidden = !state.actionVisible; }
  adapters['feedback.result'] = { normalize: normalize, render: render };
})();