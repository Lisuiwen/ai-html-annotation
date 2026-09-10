/* Popconfirm local state projection: controls visibility and disabled state during confirmation. */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* Normalize confirmation panel state. */
  function normalize(value) { var state = value && typeof value === 'object' ? value : {}; return { open: !!state.open, status: ['default', 'danger', 'loading'].indexOf(state.status) !== -1 ? state.status : 'default' }; }
  /* Sync trigger, panel, and confirm button semantics. */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value); var trigger = root.querySelector('.ui-popconfirm-trigger'); var panel = root.querySelector('.ui-popconfirm-panel'); var confirm = root.querySelector('.ui-popconfirm-confirm');
    root.classList.toggle('is-danger', state.status === 'danger'); if (trigger) trigger.setAttribute('aria-expanded', String(state.open)); if (panel) panel.hidden = !state.open; if (confirm) { confirm.disabled = state.status === 'loading'; confirm.textContent = state.status === 'loading' ? 'Processing...' : 'confirm'; }
  }
  adapters['feedback.popconfirm'] = { normalize: normalize, render: render };
})();