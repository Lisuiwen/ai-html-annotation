(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};

  adapters['feedback.dialog'] = {
    render: function (root, state) {
      state = state || {};
      var dialog = root.querySelector('[data-mv-key="dialog"]');
      if (!dialog) return;

      dialog.hidden = !state.visible;
      dialog.classList.toggle('mv-dialog--visible', !!state.visible);

      var title = dialog.querySelector('[data-mv-key="title"]');
      if (title && typeof state.title === 'string') title.textContent = state.title;
      var message = dialog.querySelector('[data-mv-key="message"]');
      if (message && typeof state.message === 'string') message.textContent = state.message;

      var cancel = dialog.querySelector('[data-mv-key="cancel"]');
      if (cancel) {
        cancel.hidden = !state.showCancel;
        if (typeof state.cancelText === 'string') cancel.textContent = state.cancelText;
      }
      var confirm = dialog.querySelector('[data-mv-key="confirm"]');
      if (confirm && typeof state.confirmText === 'string') confirm.textContent = state.confirmText;
    }
  };
})();
