/* Textarea local state projection: syncs value, disabled, and error styles only; does not handle input events. */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* Normalize textarea state; unknown states fall back to default display. */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    return {
      value: typeof state.value === 'string' ? state.value : '',
      disabled: !!state.disabled,
      status: state.status === 'error' ? 'error' : 'default'
    };
  }
  /* Sync textarea value, disabled attribute, and field-level error markers. */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value);
    var textarea = root.querySelector('.ui-textarea');
    root.classList.toggle('has-error', state.status === 'error');
    if (textarea) {
      textarea.value = state.value;
      textarea.disabled = state.disabled;
    }
  }
  adapters['form.textarea'] = { normalize: normalize, render: render };
})();
