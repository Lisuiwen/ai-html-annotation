/* 作者工具 chrome 统一契约：纯页面截图态隐藏 overlay，Inspector/Mark/Editor 共用同一套判定。 */
(function () {
  'use strict';

  if (window.PrototypeAuthorChrome) return;

  var BODY_CLASS = 'pa-product-only';
  /* 与 Inspector isOverlay 共用；新增作者 UI 时只改这一处。 */
  var OVERLAY_SELECTOR = [
    '.mm-ui', '.mm-toggle', '.mm-panel', '.mm-pin', '.mm-note-pop', '.mm-toast', '.mm-target-hl',
    '.pn-panel-actions', '.pn-toggle', '.pn-mobile-toggle', '.pn-author-toolbar', '.pn-card-actions', '.pn-card-drag-handle',
    '.pn-notes', '.pn-connections', '.pn-pick-layer',
    '.pi-tooltip'
  ].join(',');
  var STYLE_ID = 'prototype-author-chrome-style';

  /* 纯页面态 CSS：隐藏全部作者/评审 overlay，并清理 Inspector 悬停与交互闪电。 */
  function productOnlyCss() {
    var scoped = OVERLAY_SELECTOR.split(',').map(function (sel) {
      return 'body.' + BODY_CLASS + ' ' + sel.trim();
    }).join(',');
    return [
      scoped + '{display:none!important}',
      'body.' + BODY_CLASS + ' .pi-hover{outline:none!important}',
      'body.' + BODY_CLASS + ' [data-ui-interactive]::after{display:none!important;content:none!important}'
    ].join('');
  }

  /* 注入纯页面态样式，幂等。 */
  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = productOnlyCss();
    document.head.appendChild(style);
  }

  /* 读取 ?collapsed=1，供 shoot.mjs 与深链纯页面预览共用。 */
  function readFromUrl() {
    try {
      return new URLSearchParams(window.location.search).get('collapsed') === '1';
    } catch (_) {
      return false;
    }
  }

  /* 进入纯页面态：折叠说明 chrome 并隐藏全部作者 overlay。 */
  function enable() {
    installStyles();
    document.body.classList.add(BODY_CLASS);
  }

  /* 判断节点是否属于作者 overlay；Inspector/Mark 拾取等统一调用。 */
  function isOverlay(el) {
    if (!el || !el.closest) return false;
    return !!el.closest(OVERLAY_SELECTOR);
  }

  /* 当前是否处于纯页面态。 */
  function isProductOnly() {
    return document.body.classList.contains(BODY_CLASS);
  }

  /* URL 带 collapsed=1 时自动进入纯页面态。 */
  function applyFromUrl() {
    if (readFromUrl()) enable();
  }

  window.PrototypeAuthorChrome = {
    BODY_CLASS: BODY_CLASS,
    OVERLAY_SELECTOR: OVERLAY_SELECTOR,
    installStyles: installStyles,
    enable: enable,
    applyFromUrl: applyFromUrl,
    isOverlay: isOverlay,
    isProductOnly: isProductOnly
  };

  /* 作者服务与 file:// 双击均可能在 Viewer 之前加载，此处先装样式并响应 URL。 */
  installStyles();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyFromUrl);
  else applyFromUrl();
})();
