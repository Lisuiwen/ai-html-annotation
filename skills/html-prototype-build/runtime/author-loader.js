/* 作者工具统一入口：只在本地作者服务中加载标注编辑器、Mark 和后续 Inspector 插件。 */
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

  /* 顺序加载作者插件，避免各插件重复创建入口或抢占选择状态。 */
  function load(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /* 初始化当前已实现的插件；chrome 已由 viewer 内联时可跳过网络加载。 */
  async function init() {
    try {
      if (!window.PrototypeAuthorChrome) await load('/__prototype-author/author-chrome.js');
      await load('/__prototype-author/editor.js');
      await load('/__prototype-author/html-mark.js');
      await load('/__prototype-author/inspector.js');
      /* Mark shell 自带拖拽；此处只同步 PrototypeAuthor 互斥模式。 */
      var markToggle = document.querySelector('.mm-toggle');
      if (markToggle) {
        markToggle.addEventListener('click', function () {
          if (document.body.classList.contains('mm-on')) window.PrototypeAuthor.activate('mark');
          else if (modes.active === 'mark') window.PrototypeAuthor.activate('');
        });
      }
      window.addEventListener('prototype-author:mode-change', function (event) {
        if (event.detail.mode !== 'mark' && document.body.classList.contains('mm-on') && markToggle) markToggle.click();
      });
      window.dispatchEvent(new CustomEvent('prototype-author:ready'));
    } catch (error) {
      console.error('[prototype-author] 作者工具加载失败。', error);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
