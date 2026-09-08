/* 作者工具模式协调器：统一注册/切换选择型工具，避免多个工具同时接管页面。 */
(function () {
  'use strict';

  if (window.PrototypeAuthor) return;

  var active = '';
  var plugins = [];

  /* 注册作者插件及其停用方法。 */
  function register(name, deactivate) {
    plugins.push({ name: name, deactivate: deactivate });
  }

  /* 切换模式前停用其他插件，并广播统一 mode-change 事件。 */
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
