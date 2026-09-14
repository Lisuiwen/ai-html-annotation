/* Shared author-chrome contract: product-only screenshot mode hides overlays; Inspector/Mark/editor share one rule set. */
(function () {
  'use strict';

  if (window.PrototypeAuthorChrome) return;

  var BODY_CLASS = 'pa-product-only';
  /* Shared with Inspector isOverlay; add new author UI selectors here only. */
  var OVERLAY_SELECTOR = [
    '.at-ui',
    '.mm-ui', '.mm-pin', '.mm-note-pop',
    '.pn-panel-actions', '.pn-toggle', '.pn-mobile-toggle', '.pn-author-toolbar', '.pn-card-actions', '.pn-card-drag-handle',
    '.pn-notes', '.pn-connections', '.pn-pick-layer',
    '.pi-tooltip'
  ].join(',');
  var STYLE_ID = 'prototype-author-chrome-style';

  /* Product-only CSS: hide all author/review overlays and clear Inspector hover plus interaction badges. */
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

  /* Inject product-only styles; idempotent. */
  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = productOnlyCss();
    document.head.appendChild(style);
  }

  /* Read ?product-only=1 so runtime/cli/screenshot.mjs can hide all author overlays during capture. */
  function readFromUrl() {
    try {
      return new URLSearchParams(window.location.search).get('product-only') === '1';
    } catch (_) {
      return false;
    }
  }

  /* Enter product-only mode: hide all author overlays and interaction badges. */
  function enable() {
    installStyles();
    document.body.classList.add(BODY_CLASS);
  }

  /* Whether a node belongs to an author overlay; used by Inspector/Mark picking, etc. */
  function isOverlay(el) {
    if (!el || !el.closest) return false;
    return !!el.closest(OVERLAY_SELECTOR);
  }

  /* Whether product-only mode is active. */
  function isProductOnly() {
    return document.body.classList.contains(BODY_CLASS);
  }

  /* Auto-enter product-only mode when the URL has product-only=1. */
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

  /* Author server and file:// double-click may load before Viewer; install styles and react to URL here. */
  installStyles();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyFromUrl);
  else applyFromUrl();
})();
