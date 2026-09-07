/* 作者工具统一入口：只在本地作者服务中按顺序加载 Client Core 与各 Author Tool。 */
(function () {
  'use strict';

  if (window.__PROTOTYPE_AUTHOR_LOADED__) return;
  window.__PROTOTYPE_AUTHOR_LOADED__ = true;

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
      if (!window.PrototypeAuthor) await load('/__prototype-author/author/core/modes.js');
      if (!window.PrototypeAuthorChrome) await load('/__prototype-author/client/core/display-mode.js');
      await load('/__prototype-author/author/tools/notes-editor/index.js');
      await load('/__prototype-author/author/core/picker.js');
      await loadStyle('/__prototype-author/author/shell/index.css');
      await load('/__prototype-author/author/shell/index.js');
      await load('/__prototype-author/author/tools/direct-edit/style-model.js');
      await load('/__prototype-author/author/tools/direct-edit/panel.js');
      await load('/__prototype-author/author/tools/direct-edit/index.js');
      await load('/__prototype-author/author/tools/mark/storage.js');
      await load('/__prototype-author/author/tools/mark/pins.js');
      await load('/__prototype-author/author/tools/mark/index.js');
      await load('/__prototype-author/author/tools/inspector/index.js');
      if (window.AuthorTools && typeof window.AuthorTools.init === 'function') window.AuthorTools.init();
      window.dispatchEvent(new CustomEvent('prototype-author:ready'));
    } catch (error) {
      console.error('[prototype-author] 作者工具加载失败。', error);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
