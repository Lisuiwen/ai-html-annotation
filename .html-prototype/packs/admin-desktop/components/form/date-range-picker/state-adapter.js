/* Date range local state projection: renders given values and visibility only; does not handle calendar computation. */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* Normalize date range state; unknown states fall back to default display. */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    var status = ['default', 'error', 'disabled'].indexOf(state.status) !== -1 ? state.status : 'default';
    return { open: !!state.open, start: typeof state.start === 'string' ? state.start : '', end: typeof state.end === 'string' ? state.end : '', status: status };
  }
  /* Sync trigger value, expanded, error, and disabled semantics. */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value);
    var trigger = root.querySelector('.ui-date-range-trigger');
    var output = root.querySelector('.ui-date-range-value');
    root.classList.toggle('is-open', state.open);
    root.classList.toggle('has-error', state.status === 'error');
    if (trigger) { trigger.disabled = state.status === 'disabled'; trigger.setAttribute('aria-expanded', String(state.open)); }
    if (output) output.textContent = state.start || state.end ? state.start + ' to ' + state.end : 'Please select date range';
  }
  adapters['form.date-range-picker'] = { normalize: normalize, render: render };
})();