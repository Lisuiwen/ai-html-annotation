/* Toast local state projection: visibility and message controlled by final prototype; timing policy is not part of UI pack. */
(function () {
  'use strict';

  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};

  /* Normalize Toast visibility and text. */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    return { visible: !!state.visible, message: typeof state.message === 'string' ? state.message : '' };
  }

  /* Render current Toast state to existing live region. */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value);
    root.replaceChildren();
    if (!state.visible || !state.message) return;
    var toast = document.createElement('div');
    toast.className = 'ui-toast';
    toast.textContent = state.message;
    root.appendChild(toast);
  }

  adapters['feedback.toast'] = { normalize: normalize, render: render };
})();
