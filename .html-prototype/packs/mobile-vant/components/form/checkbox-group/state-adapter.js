(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};

  function includes(list, value) {
    if (!Array.isArray(list)) return false;
    for (var i = 0; i < list.length; i++) {
      if (list[i] === value) return true;
    }
    return false;
  }

  adapters['form.checkbox-group'] = {
    render: function (root, state) {
      state = state || {};
      var group = root.querySelector('[data-mv-key="checkbox-group"]');
      if (!group) return;

      if (Array.isArray(state.options) && state.options.length) {
        group.innerHTML = '';
        for (var i = 0; i < state.options.length; i++) {
          var option = state.options[i];
          var row = document.createElement('div');
          row.className = 'mv-checkbox-group__item';
          row.setAttribute('data-mv-key', option.key);
          row.setAttribute('role', 'checkbox');
          row.setAttribute('aria-checked', 'false');
          var label = document.createElement('span');
          label.className = 'mv-checkbox-group__label';
          label.textContent = option.label || option.key;
          var icon = document.createElement('span');
          icon.className = 'mv-checkbox-group__icon';
          icon.setAttribute('aria-hidden', 'true');
          row.appendChild(label);
          row.appendChild(icon);
          group.appendChild(row);
        }
      }

      var rows = group.querySelectorAll('.mv-checkbox-group__item');
      for (var j = 0; j < rows.length; j++) {
        var checked = includes(state.value, rows[j].getAttribute('data-mv-key'));
        rows[j].classList.toggle('mv-checkbox-group__item--checked', checked);
        rows[j].setAttribute('aria-checked', checked ? 'true' : 'false');
      }
    }
  };
})();
