(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};

  adapters['form.field'] = {
    render: function (root, state) {
      state = state || {};
      var field = root.querySelector('[data-mv-key="field"]');
      if (!field) return;

      var labelNode = field.querySelector('[data-mv-key="label"]');
      if (labelNode) {
        var required = field.querySelector('.mv-field__required');
        if (required) {
          required.style.display = state.required ? '' : 'none';
        }
        var text = labelNode.childNodes;
        for (var i = 0; i < text.length; i++) {
          if (text[i].nodeType === 3) {
            text[i].textContent = state.label || '';
          }
        }
      }

      var input = field.querySelector('[data-mv-key="input"]');
      if (input) {
        if (typeof state.value === 'string') input.value = state.value;
        if (typeof state.placeholder === 'string') input.placeholder = state.placeholder;
        if (typeof state.type === 'string') input.type = state.type;
        input.disabled = !!state.disabled;
      }

      var error = field.querySelector('[data-mv-key="error"]');
      if (error) {
        error.textContent = state.error || '';
      }
      field.classList.toggle('mv-field--error', !!state.error);
      field.classList.toggle('mv-field--disabled', !!state.disabled);
    }
  };
})();
