/* Switch local state projection: syncs checked, disabled, and loading styles only; does not handle click events. */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* Normalize switch state; unknown fields fall back to off and enabled. */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    return {
      checked: !!state.checked,
      disabled: !!state.disabled,
      loading: !!state.loading
    };
  }
  /* Sync switch ARIA checked state, disabled, and loading modifier classes. */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value);
    root.classList.toggle('is-checked', state.checked);
    root.classList.toggle('is-loading', state.loading);
    root.setAttribute('aria-checked', String(state.checked));
    root.disabled = state.disabled || state.loading;
  }
  adapters['form.switch'] = { normalize: normalize, render: render };
})();
