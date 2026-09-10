/* Select local state projection: invoked by final prototype Adapter; does not persist business state or bind interaction events. */
(function () {
  'use strict';

  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};

  /* Normalize Select local state so render layer only handles stable fields. */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    return { open: !!state.open, value: typeof state.value === 'string' ? state.value : '' };
  }

  /* Project local Select state to visible menu, text, and ARIA output. */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value);
    var trigger = root.querySelector('.ui-select-trigger');
    var output = root.querySelector('.ui-select-value');
    root.classList.toggle('is-open', state.open);
    if (trigger) trigger.setAttribute('aria-expanded', String(state.open));
    if (output) output.textContent = state.value || 'Please select';
    root.querySelectorAll('[role="option"]').forEach(function (option) {
      option.setAttribute('aria-selected', String(!!state.value && option.textContent.trim() === state.value));
    });
  }

  adapters['form.select'] = { normalize: normalize, render: render };
})();
