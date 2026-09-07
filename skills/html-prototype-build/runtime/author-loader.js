/* 作者工具统一入口：只在本地作者服务中加载 Shell、Direct Edit、Mark、说明编辑器和 Inspector。 */
(function () {
  'use strict';

  if (window.__PROTOTYPE_AUTHOR_LOADED__) return;
  window.__PROTOTYPE_AUTHOR_LOADED__ = true;

  var modes = {
    active: '',
    plugins: []
  };

  /* 注册作者插件及其停用方法，保证同一时刻只有一个选择型工具接管页面。 */
  function register(name, deactivate) {
    modes.plugins.push({ name: name, deactivate: deactivate });
  }

  /* 切换工具模式前通知其他插件退出，避免 Mark、目标绑定和 Inspector 同时响应点击。 */
  function activate(name) {
    modes.active = name || '';
    modes.plugins.forEach(function (plugin) {
      if (plugin.name !== name && typeof plugin.deactivate === 'function') plugin.deactivate();
    });
    window.dispatchEvent(new CustomEvent('prototype-author:mode-change', { detail: { mode: modes.active } }));
  }

  window.PrototypeAuthor = { register: register, activate: activate, getMode: function () { return modes.active; } };

  function load(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function loadStyle(href) {
    return new Promise(function (resolve, reject) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  async function init() {
    try {
      if (!window.PrototypeAuthorChrome) await load('/__prototype-author/author-chrome.js');
      await load('/__prototype-author/editor.js');
      await load('/__prototype-author/author-tools/picker.js');
      await loadStyle('/__prototype-author/author-tools/shell.css');
      await load('/__prototype-author/author-tools/shell.js');
      await load('/__prototype-author/author-tools/edit/style-model.js');
      await load('/__prototype-author/author-tools/edit/panel.js');
      await load('/__prototype-author/author-tools/edit/index.js');
      await load('/__prototype-author/author-tools/mark/storage.js');
      await load('/__prototype-author/author-tools/mark/pins.js');
      await load('/__prototype-author/author-tools/mark/index.js');
      await load('/__prototype-author/inspector.js');
      if (window.AuthorTools && typeof window.AuthorTools.init === 'function') window.AuthorTools.init();
      window.dispatchEvent(new CustomEvent('prototype-author:ready'));
    } catch (error) {
      console.error('[prototype-author] 作者工具加载失败。', error);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
