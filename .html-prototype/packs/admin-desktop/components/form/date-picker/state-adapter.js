/* Single date local state projection: renders given values and visibility only; does not handle calendar computation. */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* Normalize single date state; unknown states fall back to default display. */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    var status = ['default', 'error', 'disabled'].indexOf(state.status) !== -1 ? state.status : 'default';
    return {
      open: !!state.open,
      value: typeof state.value === 'string' ? state.value : '',
      status: status
    };
  }
  /* Sync trigger value, expanded, error, and disabled semantics. */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value);
    var trigger = root.querySelector('.ui-date-picker-trigger');
    var output = root.querySelector('.ui-date-picker-value');
    root.classList.toggle('is-open', state.open);
    root.classList.toggle('has-error', state.status === 'error');
    if (trigger) {
      trigger.disabled = state.status === 'disabled';
      trigger.setAttribute('aria-expanded', String(state.open));
    }
    if (output) output.textContent = state.value || 'Please select date';
  }
  adapters['form.date-picker'] = { normalize: normalize, render: render };
})();
