(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};

  adapters['navigation.tab-bar'] = {
    render: function (root, state) {
      state = state || {};
      var bar = root.querySelector('[data-mv-key="tab-bar"]');
      if (!bar) return;

      if (Array.isArray(state.items) && state.items.length) {
        bar.innerHTML = '';
        for (var i = 0; i < state.items.length; i++) {
          var item = state.items[i];
          var button = document.createElement('button');
          button.type = 'button';
          button.className = 'mv-tab-bar__item';
          button.setAttribute('data-mv-key', item.key);
          button.setAttribute('role', 'tab');
          var icon = document.createElement('span');
          icon.className = 'mv-tab-bar__icon';
          icon.setAttribute('aria-hidden', 'true');
          icon.textContent = item.icon || '•';
          var label = document.createElement('span');
          label.className = 'mv-tab-bar__label';
          label.textContent = item.label || item.key;
          button.appendChild(icon);
          button.appendChild(label);
          bar.appendChild(button);
        }
      }

      var buttons = bar.querySelectorAll('.mv-tab-bar__item');
      for (var j = 0; j < buttons.length; j++) {
        var isActive = buttons[j].getAttribute('data-mv-key') === state.active;
        buttons[j].classList.toggle('mv-tab-bar__item--active', isActive);
        buttons[j].setAttribute('aria-selected', isActive ? 'true' : 'false');
      }
    }
  };
})();
