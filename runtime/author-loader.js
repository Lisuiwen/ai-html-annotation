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

  /* 让 Mark 原有悬浮开关支持拖拽定位，并在刷新后恢复视口内位置。 */
  function makeMarkToggleDraggable(toggle) {
    var storageKey = 'prototype-author:mark-toggle-position';
    var start = null;
    var dragged = false;

    /* 把坐标限制在当前视口内，并覆盖 html-mark 默认的右上角定位。 */
    function place(left, top) {
      var maxLeft = Math.max(0, window.innerWidth - toggle.offsetWidth);
      var maxTop = Math.max(0, window.innerHeight - toggle.offsetHeight);
      toggle.style.left = Math.min(Math.max(0, left), maxLeft) + 'px';
      toggle.style.top = Math.min(Math.max(0, top), maxTop) + 'px';
      toggle.style.right = 'auto';
      toggle.style.bottom = 'auto';
    }

    /* 从独立稳定 key 恢复位置；无效数据继续沿用 Mark 默认位置。 */
    function restore() {
      try {
        var saved = JSON.parse(localStorage.getItem(storageKey));
        if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) place(saved.left, saved.top);
      } catch (_) {
        /* localStorage 不可用时仍保留本次会话拖拽能力。 */
      }
    }

    toggle.style.touchAction = 'none';
    toggle.addEventListener('pointerdown', function (event) {
      if (event.button !== undefined && event.button !== 0) return;
      var rect = toggle.getBoundingClientRect();
      start = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
      dragged = false;
      toggle.setPointerCapture(event.pointerId);
    });
    toggle.addEventListener('pointermove', function (event) {
      if (!start || event.pointerId !== start.pointerId) return;
      var dx = event.clientX - start.x;
      var dy = event.clientY - start.y;
      if (!dragged && Math.hypot(dx, dy) <= 4) return;
      dragged = true;
      place(start.left + dx, start.top + dy);
    });
    toggle.addEventListener('pointerup', function (event) {
      if (!start || event.pointerId !== start.pointerId) return;
      if (dragged) {
        event.preventDefault();
        var rect = toggle.getBoundingClientRect();
        try {
          localStorage.setItem(storageKey, JSON.stringify({ left: rect.left, top: rect.top }));
        } catch (_) {
          /* localStorage 不可用时不阻断 Mark。 */
        }
        window.setTimeout(function () { dragged = false; }, 0);
      }
      start = null;
    });
    toggle.addEventListener('pointercancel', function () { start = null; });
    toggle.addEventListener('click', function (event) {
      if (!dragged) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      dragged = false;
    }, true);
    window.addEventListener('resize', function () {
      if (toggle.style.left) place(toggle.getBoundingClientRect().left, toggle.getBoundingClientRect().top);
    });
    restore();
  }

  /* 初始化当前已实现的插件；chrome 已由 viewer 内联时可跳过网络加载。 */
  async function init() {
    try {
      if (!window.PrototypeAuthorChrome) await load('/__prototype-author/author-chrome.js');
      await load('/__prototype-author/editor.js');
      await load('/__prototype-author/html-mark.js');
      await load('/__prototype-author/inspector.js');
      var markToggle = document.querySelector('.mm-toggle');
      if (markToggle) {
        makeMarkToggleDraggable(markToggle);
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
