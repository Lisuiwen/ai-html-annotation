/* mobile-vant pack state adapters, copied from the resolved pack closure.
   Each adapter projects passed local state onto a [data-mv-key] root only;
   it never accesses PrototypeViewers, persists state, or registers global handlers. */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};

  /* action.button */
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
      for (var i = 0; i < TYPES.length; i++) toggleClass(node, 'mv-button--' + TYPES[i], TYPES[i] === type);
      var size = SIZES.indexOf(state.size) >= 0 ? state.size : 'normal';
      for (var j = 0; j < SIZES.length; j++) toggleClass(node, 'mv-button--' + SIZES[j], SIZES[j] === size);
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

  /* navigation.tab-bar */
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

  /* form.field */
  adapters['form.field'] = {
    render: function (root, state) {
      state = state || {};
      var field = root.querySelector('[data-mv-key="field"]');
      if (!field) return;
      var labelNode = field.querySelector('[data-mv-key="label"]');
      if (labelNode) {
        var required = field.querySelector('.mv-field__required');
        if (required) required.style.display = state.required ? '' : 'none';
        var text = labelNode.childNodes;
        for (var i = 0; i < text.length; i++) {
          if (text[i].nodeType === 3) text[i].textContent = state.label || '';
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
      if (error) error.textContent = state.error || '';
      field.classList.toggle('mv-field--error', !!state.error);
      field.classList.toggle('mv-field--disabled', !!state.disabled);
    }
  };

  /* form.switch */
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

  /* feedback.dialog */
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

  /* feedback.toast */
  var GLYPHS = { text: '', success: '✓', fail: '✕', loading: '' };
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
