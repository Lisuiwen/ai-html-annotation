(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};

  var GLYPHS = {
    text: '',
    success: '✓',
    fail: '✕',
    loading: ''
  };

  adapters['feedback.toast'] = {
    render: function (root, state) {
      state = state || {};
      var toast = root.querySelector('[data-mv-key="toast"]');
      if (!toast) return;

      toast.hidden = !state.visible;
      toast.classList.toggle('mv-toast--visible', !!state.visible);

      var type = GLYPHS[state.type] !== undefined ? state.type : 'text';
      var icon = toast.querySelector('[data-mv-key="icon"]');
      if (icon) {
        icon.textContent = GLYPHS[type] || '';
        icon.classList.toggle('mv-toast__icon--spinner', type === 'loading');
      }
      var message = toast.querySelector('[data-mv-key="message"]');
      if (message && typeof state.message === 'string') message.textContent = state.message;
    }
  };
})();
