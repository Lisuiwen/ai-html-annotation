/* 公共 DOM Picker：Ctrl+Click（macOS 为 ⌘+Click）选元素；普通点击不拦截。同一时间只有一个 owner。 */
(function () {
  'use strict';

  if (window.AuthorToolsPicker) return;

  function isMac() {
    return window.AuthorToolsPlatform ? window.AuthorToolsPlatform.isMac() :
      /Mac|iPhone|iPad|iPod/.test(navigator.platform || '') ||
      (navigator.userAgentData && navigator.userAgentData.platform === 'macOS');
  }

  function pickerModifierActive(event) {
    if (window.AuthorToolsPlatform) return window.AuthorToolsPlatform.pickerModifierActive(event);
    if (!event) return false;
    return !!event.ctrlKey;
  }

  function pickerClickModifier(event) {
    if (window.AuthorToolsPlatform) return window.AuthorToolsPlatform.pickerClickModifier(event);
    if (!event) return false;
    return !!event.ctrlKey;
  }

  var NOTES_PANEL_SELECTOR = [
    '.pn-notes', '.pn-panel-actions', '.pn-toggle', '.pn-mobile-toggle',
    '.pn-card', '.pn-head', '.pn-connections'
  ].join(',');

  var state = {
    owner: '',
    onSelect: null,
    hoverClass: 'at-hover-hl',
    selectedClass: 'at-hl',
    selectedEl: null,
    hoverEl: null,
    persistSelection: true,
    armed: false,
    hoverRaf: 0
  };

  /* 判断节点是否属于说明栏或作者 overlay。 */
  function isBlocked(el) {
    if (!el || !el.closest) return true;
    if (el.closest(NOTES_PANEL_SELECTOR)) return true;
    if (el.closest('.at-ui, .at-launch, .mm-ui, .mm-pin, .mm-note-pop, .pi-tooltip')) return true;
    if (window.PrototypeAuthorChrome && window.PrototypeAuthorChrome.isOverlay(el)) return true;
    if (window.PrototypeAuthorChrome && window.PrototypeAuthorChrome.isProductOnly()) return true;
    return false;
  }

  /* 从点击点向上找最近可操作语义单元。 */
  function resolveTarget(el) {
    if (isBlocked(el)) return null;
    var cur = el;
    while (cur && cur.nodeType === 1 && cur !== document.body && cur !== document.documentElement) {
      if (isBlocked(cur)) return null;
      if (cur.getAttribute && cur.getAttribute('data-mm-label')) return cur;
      if (cur.getAttribute && cur.getAttribute('data-prototype-note-target')) return cur;
      if (cur.matches) {
        if (cur.matches('button, [role="button"], a[href], input, select, textarea')) return cur;
        if (cur.matches('h1, h2, h3, h4, h5, h6')) return cur;
        if (cur.matches('td, th')) return cur;
        if (cur.matches('.ui-modal, .ui-drawer') && cur.closest('.ui-overlay')) return cur;
      }
      if (cur.id) return cur;
      if (cur.getAttribute && cur.getAttribute('aria-label')) return cur;
      cur = cur.parentElement;
    }
    return el && el.nodeType === 1 && !isBlocked(el) ? el : null;
  }

  /* Selector 规则统一由 author/core/selector.js 维护；保留 Picker API 兼容既有调用方。 */
  function stableSelector(el) {
    return window.AuthorToolsSelector ? window.AuthorToolsSelector.stableSelector(el) : '';
  }

  function cssPath(el) {
    return window.AuthorToolsSelector ? window.AuthorToolsSelector.cssPath(el) : '';
  }

  function clearHover() {
    if (state.hoverEl) {
      state.hoverEl.classList.remove(state.hoverClass);
      state.hoverEl = null;
    }
  }

  function clearSelected() {
    if (state.selectedEl) {
      state.selectedEl.classList.remove(state.selectedClass);
      state.selectedEl = null;
    }
  }

  function setArmed(on) {
    state.armed = !!on;
    document.body.classList.toggle('at-picker-armed', state.armed && !!state.owner);
    if (!state.armed) clearHover();
  }

  function syncArmed(event) {
    setArmed(!!state.owner && pickerModifierActive(event));
  }

  function handleKeyDown(event) {
    if (!state.owner) return;
    if (event.key === 'Control' || event.key === 'Meta') syncArmed(event);
  }

  function handleKeyUp(event) {
    if (!state.owner) return;
    if (event.key === 'Control' || event.key === 'Meta' || event.key === 'Alt') syncArmed(event);
  }

  function handleBlur() {
    setArmed(false);
  }

  function handleMove(event) {
    if (!state.owner) return;
    syncArmed(event);
    if (!pickerModifierActive(event)) {
      clearHover();
      return;
    }
    var raw = event.target;
    if (state.hoverRaf) return;
    state.hoverRaf = requestAnimationFrame(function () {
      state.hoverRaf = 0;
      if (!state.owner || !state.armed) {
        clearHover();
        return;
      }
      if (isBlocked(raw)) {
        clearHover();
        return;
      }
      var target = resolveTarget(raw);
      if (target === state.hoverEl) return;
      clearHover();
      if (target && target !== document.body) {
        state.hoverEl = target;
        target.classList.add(state.hoverClass);
      }
    });
  }

  function selectFromEvent(event) {
    if (!state.owner) return;
    if (isBlocked(event.target)) return;
    var target = resolveTarget(event.target);
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    clearHover();

    /* 先询问 owner 是否接受本次切换；拒绝时 Picker 内部状态与高亮都保持原样。 */
    if (typeof state.onSelect === 'function' && state.onSelect(target, event) === false) return;

    if (!state.persistSelection) {
      clearSelected();
      return;
    }
    if (state.selectedEl && state.selectedEl !== target) {
      state.selectedEl.classList.remove(state.selectedClass);
    }
    state.selectedEl = target;
    if (state.selectedClass) target.classList.add(state.selectedClass);
  }

  /* 仅在修饰键+Click 时拦截；普通点击保持页面原行为。 */
  function handleClick(event) {
    if (!state.owner) return;
    if (!pickerClickModifier(event)) return;
    selectFromEvent(event);
  }

  /* macOS：Control+左键触发 contextmenu 而非 click。 */
  function handleContextMenu(event) {
    if (!state.owner || !isMac() || !event.ctrlKey) return;
    selectFromEvent(event);
  }

  var listening = false;

  function bind() {
    if (listening) return;
    listening = true;
    document.addEventListener('click', handleClick, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('mousemove', handleMove, true);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleBlur);
  }

  function unbind() {
    if (!listening) return;
    listening = false;
    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('contextmenu', handleContextMenu, true);
    document.removeEventListener('mousemove', handleMove, true);
    document.removeEventListener('keydown', handleKeyDown, true);
    document.removeEventListener('keyup', handleKeyUp, true);
    window.removeEventListener('blur', handleBlur);
  }

  function activate(options) {
    options = options || {};
    if (!options.owner) return;
    if (state.owner && state.owner !== options.owner) release(state.owner);
    state.owner = options.owner;
    state.onSelect = options.onSelect || null;
    state.hoverClass = options.hoverClass || 'at-hover-hl';
    state.selectedClass = options.selectedClass || 'at-hl';
    state.persistSelection = options.persistSelection !== false;
    bind();
  }

  function release(owner) {
    if (owner && state.owner && state.owner !== owner) return;
    clearHover();
    clearSelected();
    setArmed(false);
    state.owner = '';
    state.onSelect = null;
    state.persistSelection = true;
    unbind();
  }

  window.AuthorToolsPicker = {
    activate: activate,
    release: release,
    resolveTarget: resolveTarget,
    stableSelector: stableSelector,
    cssPath: cssPath,
    clearSelected: clearSelected
  };
})();
