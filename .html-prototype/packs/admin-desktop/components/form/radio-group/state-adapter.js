/* Radio group local state projection: syncs native control selection and disabled attributes only. */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* Normalize selection state; component does not perform business validation. */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    return { value: typeof state.value === 'string' ? state.value : '', disabled: Array.isArray(state.disabled) ? state.disabled : [], status: state.status === 'error' ? 'error' : 'default' };
  }
  /* Sync native input state and group-level error markers. */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value);
    root.classList.toggle('has-error', state.status === 'error');
    root.querySelectorAll('input').forEach(function (input) {
      input.checked = input.value === state.value;
      input.disabled = state.disabled.indexOf(input.value) !== -1;
    });
  }
  adapters['form.radio-group'] = { normalize: normalize, render: render };
})();