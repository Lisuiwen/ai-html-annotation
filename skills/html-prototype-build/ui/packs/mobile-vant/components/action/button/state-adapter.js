(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};

  var TYPES = ['default', 'primary', 'success', 'danger', 'warning'];
  var SIZES = ['normal', 'small', 'large'];

  function toggleClass(node, className, on) {
    if (on) node.classList.add(className);
    else node.classList.remove(className);
  }

  adapters['action.button'] = {
    render: function (root, state) {
      state = state || {};
      var node = root.querySelector('[data-mv-key="button"]');
      if (!node) return;

      var type = TYPES.indexOf(state.type) >= 0 ? state.type : 'default';
      for (var i = 0; i < TYPES.length; i++) {
        toggleClass(node, 'mv-button--' + TYPES[i], TYPES[i] === type);
      }
      var size = SIZES.indexOf(state.size) >= 0 ? state.size : 'normal';
      for (var j = 0; j < SIZES.length; j++) {
        toggleClass(node, 'mv-button--' + SIZES[j], SIZES[j] === size);
      }

      toggleClass(node, 'mv-button--block', !!state.block);
      toggleClass(node, 'mv-button--round', !!state.round);
      toggleClass(node, 'mv-button--plain', !!state.plain);
      toggleClass(node, 'mv-button--loading', !!state.loading);
      toggleClass(node, 'mv-button--disabled', !!state.disabled);

      if (typeof state.text === 'string') {
        var label = node.querySelector('.mv-button__content');
        if (label) label.textContent = state.text;
      }
      node.disabled = !!state.disabled;
    }
  };
})();
