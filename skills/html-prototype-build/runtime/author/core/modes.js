/* Author-tool mode coordinator: register/switch selection tools so only one owns the page at a time. */
(function () {
  'use strict';

  if (window.PrototypeAuthor) return;

  var active = '';
  var plugins = [];

  /* Register an author plugin and its deactivate handler. */
  function register(name, deactivate) {
    plugins.push({ name: name, deactivate: deactivate });
  }

  /* Deactivate other plugins before switching mode, and broadcast a unified mode-change event. */
  function activate(name) {
    active = name || '';
    plugins.forEach(function (plugin) {
      if (plugin.name !== name && typeof plugin.deactivate === 'function') plugin.deactivate();
    });
    window.dispatchEvent(new CustomEvent('prototype-author:mode-change', { detail: { mode: active } }));
  }

  window.PrototypeAuthor = {
    register: register,
    activate: activate,
    getMode: function () { return active; }
  };
})();
