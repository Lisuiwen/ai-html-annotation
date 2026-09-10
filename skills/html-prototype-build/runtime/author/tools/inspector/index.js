/* Prototype source inspector: Alt+Shift hover DOM → glass tooltip → click to jump to IDE source. */
(function () {
  'use strict';

  if (window.__PROTOTYPE_INSPECTOR_LOADED__) return;
  window.__PROTOTYPE_INSPECTOR_LOADED__ = true;

  var active = false;
  var hoveredEl = null;
  var tooltip = null;

  /* Build a unique CSS selector, reusing html-mark cssPath logic. */
  function cssPath(el) {
    if (!el || el.nodeType !== 1) return '';
    var parts = [];
    var cur = el;
    while (cur && cur.nodeType === 1 && cur !== document.body && cur !== document.documentElement) {
      if (cur.id) {
        parts.unshift('#' + (window.CSS && CSS.escape ? CSS.escape(cur.id) : cur.id));
        return parts.join(' > ');
      }
      var sel = cur.tagName.toLowerCase();
      var parent = cur.parentElement;
      if (parent) {
        var sameTag = Array.prototype.filter.call(parent.children, function (c) {
          return c.tagName === cur.tagName;
        });
        if (sameTag.length > 1) sel += ':nth-of-type(' + (sameTag.indexOf(cur) + 1) + ')';
      }
      parts.unshift(sel);
      cur = parent;
    }
    return parts.length ? 'body > ' + parts.join(' > ') : '';
  }

  /* Inject styles that protect our own UI without affecting the prototype page. */
  function installStyles() {
    var style = document.createElement('style');
    style.id = 'prototype-inspector-style';
    style.textContent = [
      /* No crosshair cursor — avoids confusion with Mark Ctrl+click pin mode; use purple dashed outline instead. */
      '.pi-inspecting { cursor: default; }',
      '.pi-hover { outline: 2px dashed #e07bff !important; outline-offset: 2px; }',
      '.pi-tooltip { position: fixed; z-index: 2147483645; max-width: 480px; padding: 10px 14px; border: 1px solid rgba(255,255,255,.18); border-radius: 10px; background: rgba(22,22,28,.88); color: #e0e0e0; font: 12px/18px system-ui, -apple-system, sans-serif; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); pointer-events: none; opacity: 0; transform: translateY(4px); transition: opacity .15s, transform .15s; }',
      '.pi-tooltip.pi-visible { opacity: 1; transform: translateY(0); }',
      '.pi-tooltip .pi-tag { display: inline-block; padding: 1px 6px; border-radius: 4px; background: rgba(224,123,255,.2); color: #e07bff; font-weight: 600; margin-right: 6px; }',
      '.pi-tooltip .pi-path { color: #a0a0a0; word-break: break-all; }',
      '.pi-tooltip .pi-file { color: #8be; margin-top: 4px; }',
      '.pi-tooltip .pi-hint { color: #666; margin-top: 6px; font-size: 11px; }',
      '.pi-tooltip .pi-target { color: #ff8d6b; font-family: monospace; }'
    ].join('');
    document.head.appendChild(style);
  }

  /* Create singleton tooltip overlay. */
  function getTooltip() {
    if (tooltip) return tooltip;
    tooltip = document.createElement('div');
    tooltip.className = 'pi-tooltip';
    tooltip.setAttribute('aria-hidden', 'true');
    document.body.appendChild(tooltip);
    return tooltip;
  }

  /* Update tooltip position and content. */
  function showTooltip(event, el) {
    var tip = getTooltip();
    var tag = el.tagName.toLowerCase();
    var cls = el.className && typeof el.className === 'string' ? el.className.slice(0, 40) : '';
    var path = cssPath(el);
    var targetId = el.getAttribute('data-insp-target');
    var filePath = el.getAttribute('data-insp-path') || 'prototype.html';

    tip.innerHTML = [
      '<span class="pi-tag">&lt;' + tag + '&gt;</span>',
      cls ? '<span class="pi-tag">' + cls + '</span>' : '',
      '<div class="pi-path">' + path + '</div>',
      '<div class="pi-file">' + filePath + '</div>',
      targetId ? '<div class="pi-target">' + targetId + '</div>' : '',
      '<div class="pi-hint">Click to open in IDE</div>'
    ].join('');

    /* Follow the mouse while keeping the tooltip inside the viewport. */
    var x = event.clientX + 16;
    var y = event.clientY + 16;
    var rect = tip.getBoundingClientRect();
    if (x + rect.width > window.innerWidth) x = event.clientX - rect.width - 16;
    if (y + rect.height > window.innerHeight) y = event.clientY - rect.height - 16;
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
    tip.classList.add('pi-visible');
  }

  /* Hide tooltip and remove highlight. */
  function hideTooltip() {
    if (tooltip) tooltip.classList.remove('pi-visible');
    if (hoveredEl) {
      hoveredEl.classList.remove('pi-hover');
      hoveredEl = null;
    }
  }

  /* Check whether Alt+Shift is held. */
  function isHotkey(event) {
    return event.altKey && event.shiftKey && !event.metaKey && !event.ctrlKey;
  }

  /* Enable inspection only on product-area elements outside author overlays. */
  function isInspectable(el) {
    if (!el || el === document.body || el === document.documentElement) return false;
    if (window.PrototypeAuthorChrome && window.PrototypeAuthorChrome.isOverlay(el)) return false;
    if (window.PrototypeAuthorChrome && window.PrototypeAuthorChrome.isProductOnly()) return false;
    if (el.matches && el.matches('input, textarea, [contenteditable="true"]')) return false;
    return true;
  }

  /* Mouse move: show hover preview. */
  function handleMouseMove(event) {
    if (!active) return;
    var el = event.target;
    if (!isInspectable(el)) {
      hideTooltip();
      return;
    }
    if (el === hoveredEl) {
      showTooltip(event, el);
      return;
    }
    if (hoveredEl) hoveredEl.classList.remove('pi-hover');
    hoveredEl = el;
    hoveredEl.classList.add('pi-hover');
    showTooltip(event, el);
  }

  /* Click: send request to server to open IDE. */
  function handleClick(event) {
    if (!active) return;
    var el = event.target;
    if (!isInspectable(el)) return;
    event.preventDefault();
    event.stopPropagation();

    var targetId = el.getAttribute('data-insp-target');
    var filePath = el.getAttribute('data-insp-path') || 'prototype.html';

    var params = new URLSearchParams();
    params.set('file', filePath);
    if (targetId) params.set('target', targetId);

    fetch('/__prototype-author/inspector/open?' + params.toString())
      .then(function (res) {
        if (!res.ok) return res.text().then(function (msg) { throw new Error(msg); });
        return res.text();
      })
      .then(function (msg) {
        console.log('[prototype-inspector] ' + msg);
      })
      .catch(function (err) {
        console.error('[prototype-inspector] Navigation failed: ' + err.message);
      });

    deactivate();
  }

  /* Key down: detect Alt+Shift to enter inspect mode; disabled in product-only screenshot mode. */
  function handleKeyDown(event) {
    if (window.PrototypeAuthorChrome && window.PrototypeAuthorChrome.isProductOnly()) return;
    if (isHotkey(event) && !active) activate();
  }

  /* Key up: exit inspect mode. */
  function handleKeyUp(event) {
    if (active && !isHotkey(event)) {
      deactivate();
    }
  }

  /* Enter inspect mode and tell other plugins to deactivate. */
  function activate() {
    if (active) return;
    active = true;
    if (window.PrototypeAuthor) window.PrototypeAuthor.activate('inspector');
    document.body.classList.add('pi-inspecting');
    console.log('[prototype-inspector] Inspect mode on; Alt+Shift+Click to jump to source.');
  }

  /* Exit inspect mode and clean up UI. */
  function deactivate() {
    if (!active) return;
    active = false;
    hideTooltip();
    document.body.classList.remove('pi-inspecting');
    if (window.PrototypeAuthor && window.PrototypeAuthor.getMode() === 'inspector') {
      window.PrototypeAuthor.activate('');
    }
  }

  /* Init: register with prototype-author and listen for global keyboard events. */
  function init() {
    installStyles();
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);
    if (window.PrototypeAuthor) window.PrototypeAuthor.register('inspector', deactivate);
    console.log('[prototype-inspector] Ready; Alt+Shift for inspect mode.');
  }

  init();
})();