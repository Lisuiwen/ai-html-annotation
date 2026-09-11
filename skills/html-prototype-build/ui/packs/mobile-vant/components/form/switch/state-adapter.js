(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};

  adapters['form.switch'] = {
    render: function (root, state) {
      state = state || {};
      var node = root.querySelector('[data-mv-key="switch"]');
      if (!node) return;

      var checked = !!state.checked;
      node.classList.toggle('mv-switch--on', checked);
      node.setAttribute('aria-checked', checked ? 'true' : 'false');
      node.classList.toggle('mv-switch--loading', !!state.loading);
      node.disabled = !!state.disabled;
    }
  };
})();
