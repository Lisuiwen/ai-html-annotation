(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};

  adapters['form.radio-group'] = {
    render: function (root, state) {
      state = state || {};
      var group = root.querySelector('[data-mv-key="radio-group"]');
      if (!group) return;

      if (Array.isArray(state.options) && state.options.length) {
        group.innerHTML = '';
        for (var i = 0; i < state.options.length; i++) {
          var option = state.options[i];
          var row = document.createElement('div');
          row.className = 'mv-radio-group__item';
          row.setAttribute('data-mv-key', option.key);
          row.setAttribute('role', 'radio');
          row.setAttribute('aria-checked', 'false');
          var label = document.createElement('span');
          label.className = 'mv-radio-group__label';
          label.textContent = option.label || option.key;
          var icon = document.createElement('span');
          icon.className = 'mv-radio-group__icon';
          icon.setAttribute('aria-hidden', 'true');
          row.appendChild(label);
          row.appendChild(icon);
          group.appendChild(row);
        }
      }

      var rows = group.querySelectorAll('.mv-radio-group__item');
      for (var j = 0; j < rows.length; j++) {
        var checked = rows[j].getAttribute('data-mv-key') === state.value;
        rows[j].classList.toggle('mv-radio-group__item--checked', checked);
        rows[j].setAttribute('aria-checked', checked ? 'true' : 'false');
      }
    }
  };
})();
