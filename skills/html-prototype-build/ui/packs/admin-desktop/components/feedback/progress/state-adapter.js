/* Progress local state projection: clamps percentage and syncs progress bar ARIA attributes. */
(function () {
  'use strict'; var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* Normalize progress state. */
  function normalize(value) { var state = value && typeof value === 'object' ? value : {}; var percent = Number(state.percent); return { percent: Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0, status: ['normal', 'active', 'success', 'exception'].indexOf(state.status) !== -1 ? state.status : 'normal' }; }
  /* Sync progress width, text, and accessibility values. */
  function render(root, value) { if (!root) return; var state = normalize(value); var bar = root.querySelector('.ui-progress-bar'); var text = root.querySelector('.ui-progress-text'); root.dataset.status = state.status; root.setAttribute('aria-valuenow', String(state.percent)); if (bar) bar.style.width = state.percent + '%'; if (text) text.textContent = state.percent + '%'; }
  adapters['feedback.progress'] = { normalize: normalize, render: render };
})();