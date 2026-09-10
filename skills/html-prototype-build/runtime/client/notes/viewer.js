/* Read-only formal prototype annotation viewer: builds right rail, cards, and SVG connectors from the single snapshot source. */
(function () {
  'use strict';

  if (window.PrototypeNotesViewer) return;

  var state = {
    data: null,
    page: null,
    preview: null,
    notes: null,
    cards: null,
    actions: null,
    actionsStart: null,
    svg: null,
    connections: [],
    drawTimer: 0,
    pickCardId: ''
  };

  /* Inject isolated Viewer styles; prototype need not ship notes-panel CSS upfront. */
  function installStyles() {
    var style = document.createElement('style');
    style.id = 'prototype-notes-viewer-style';
    style.textContent = [
      'body{overflow:hidden}',
      '.pn-page{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.22fr);height:100vh;overflow:hidden;min-height:0}',
      '.pn-page.pn-collapsed{grid-template-columns:minmax(0,1fr) 0}',
      '.pn-preview{position:relative;min-width:0;overflow:auto;border-right:1px solid var(--ui-border,#d9d9d9)}',
      '.pn-notes{position:relative;z-index:75;min-width:0;min-height:0;height:100%;overflow:hidden;padding:16px;background:var(--ui-bg-soft,#f5f5f5);color:var(--ui-text,#262626);display:flex;flex-direction:column;font-size:16px}',
      '.pn-collapsed .pn-notes{overflow:visible;padding:0;min-width:0}',
      '.pn-collapsed .pn-head,.pn-collapsed .pn-cards{display:none}',
      '.pn-head{flex:0 0 auto;padding-bottom:12px;margin-bottom:12px;border-bottom:1px solid var(--ui-border,#d9d9d9)}',
      '.pn-head strong{display:block;font-size:18px}',
      '.pn-head span,.pn-card p{color:var(--ui-text-secondary,#595959);font-size:14px;line-height:22px}',
      '.pn-card p{margin:4px 0 0}',
      '.pn-cards{flex:1 1 auto;min-height:0;overflow-y:auto;display:grid;align-content:start;align-items:start;grid-auto-rows:max-content;gap:12px;padding-bottom:4px}',
      '.pn-card{padding:12px;border:1px solid var(--ui-border,#d9d9d9);border-radius:var(--ui-radius-container,8px);background:var(--ui-bg,#fff)}',
      '.pn-card.pn-highlighted{border-color:var(--ui-primary,#1677ff);box-shadow:0 0 0 2px var(--ui-border-subtle,#e6f4ff)}',
      '.pn-card-title{display:flex;gap:8px;align-items:center;font-weight:600}',
      '.pn-index{display:inline-grid;place-items:center;flex:0 0 24px;height:24px;color:var(--ui-text-on-primary,#fff);border-radius:50%;background:var(--ui-primary,#1677ff);font-size:14px}',
      '.pn-target-highlighted{box-shadow:0 0 0 2px var(--ui-primary,#1677ff)!important}',
      '.pn-connections{position:fixed;inset:0;z-index:80;width:100%;height:100%;pointer-events:none}',
      '.pn-line{fill:none;stroke:var(--ui-primary,#1677ff);stroke-width:2;opacity:.55}.pn-line.pn-highlighted{opacity:1;stroke-width:3}',
      '.pn-line-badge{fill:var(--ui-primary,#1677ff)}',
      '.pn-line-text{fill:var(--ui-text-on-primary,#fff);font-size:12px;font-weight:600;text-anchor:middle;dominant-baseline:central}',
      '.pn-panel-actions{flex:0 0 auto;position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 0 0;margin-top:8px;border-top:1px solid var(--ui-border,#d9d9d9);background:var(--ui-bg-soft,#f5f5f5)}',
      '.pn-panel-actions-start{display:flex;align-items:center;gap:8px;flex:0 1 auto;min-width:0}',
      '.pn-panel-actions-start>.pn-scene-switch,.pn-panel-actions-start>.pn-author-toolbar,.pn-panel-actions-start>.at-launch{flex:0 0 auto}',
      '.pn-toggle{display:grid;place-items:center;flex:0 0 auto;width:32px;height:32px;padding:0;border:1px solid var(--ui-border,#d9d9d9);border-radius:50%;background:var(--ui-bg,#fff);color:var(--ui-text-secondary,#595959);box-shadow:0 4px 12px rgba(0,0,0,.12);cursor:pointer}',
      '.pn-scene-switch{display:inline-flex;align-items:center;gap:6px;min-width:32px;height:32px;padding:0 10px;border:1px solid var(--ui-primary,#1677ff);border-radius:16px;background:var(--ui-primary,#1677ff);color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.12);font-size:14px;line-height:1;cursor:pointer}',
      '.pn-scene-switch:hover{filter:brightness(.94)}',
      '.pn-scene-switch-icon{flex:0 0 auto;display:block}',
      '.pn-scene-switch-label{white-space:nowrap}',
      /* When the right rail is collapsed, keep only the expand button; hide scenario switch and author add button too. */
      '.pn-page.pn-collapsed .pn-panel-actions{position:fixed;right:16px;bottom:16px;z-index:90;margin-top:0;padding:0;border-top:0;background:transparent}',
      '.pn-page.pn-collapsed .pn-panel-actions .pn-scene-switch,.pn-page.pn-collapsed .pn-panel-actions .pn-author-toolbar,.pn-page.pn-collapsed .pn-panel-actions #at-launch{display:none!important}',
      '.pn-page.pn-collapsed~.pn-connections{display:none}',
      '.pn-mobile-toggle{display:none}',
      '[data-ui-interactive]{position:relative}',
      '[data-ui-interactive]::after{position:absolute;top:2px;right:2px;z-index:5;width:14px;height:14px;content:"";background:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3E%3Ccircle cx=%278%27 cy=%278%27 r=%278%27 fill=%27%23ff8d6b%27/%3E%3Cpath d=%27M10 1.6 3.4 9.8h4L6 14.4 12.6 6H8.4z%27 fill=%27%23fff%27/%3E%3C/svg%3E") center/contain no-repeat;pointer-events:none}',
      '@media(max-width:768px){body{overflow:auto}.pn-page{display:block;height:auto;min-height:100vh}.pn-preview{min-height:100vh;border:0}.pn-notes{display:none;min-height:100vh}.pn-page.pn-notes-visible .pn-preview{display:none}.pn-page.pn-notes-visible .pn-notes{display:block}.pn-connections,.pn-toggle,.pn-scene-switch{display:none}.pn-mobile-toggle{position:fixed;right:16px;bottom:16px;z-index:130;display:inline-flex;padding:8px 12px;border:0;border-radius:6px;background:var(--ui-primary,#1677ff);color:#fff}}'
    ].join('');
    document.head.appendChild(style);
  }

  /* Build Viewer shell and move all prototype nodes before scripts into the left preview pane. */
  function buildShell() {
    var viewerScript = document.currentScript || document.querySelector('[data-prototype-notes-viewer]');
    var movable = [];
    for (var i = 0; i < document.body.childNodes.length; i++) {
      var node = document.body.childNodes[i];
      if (
        node !== viewerScript
        && !(node.nodeType === 1 && node.matches('script[src*="notes.snapshot"],script[src*="__prototype-author"]'))
      ) movable.push(node);
    }

    state.page = document.createElement('div');
    state.page.className = 'pn-page';
    state.preview = document.createElement('div');
    state.preview.className = 'pn-preview';
    state.notes = document.createElement('aside');
    state.notes.className = 'pn-notes';
    state.notes.setAttribute('aria-label', 'Function notes');
    state.cards = document.createElement('div');
    state.cards.className = 'pn-cards';
    state.actions = document.createElement('div');
    state.actions.className = 'pn-panel-actions';
    state.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    state.svg.setAttribute('class', 'pn-connections');
    state.svg.setAttribute('aria-hidden', 'true');

    movable.forEach(function (node) { state.preview.appendChild(node); });
    state.page.appendChild(state.preview);
    state.page.appendChild(state.notes);
    document.body.insertBefore(state.page, viewerScript);
    document.body.insertBefore(state.svg, viewerScript);
    state.notes.appendChild(state.actions);
    buildControls(viewerScript);
  }

  /* Read scenario ids in snapshot declaration order. */
  function listScenarioIds() {
    return window.PrototypeNotesModel.listScenarioIds(state.data && state.data.scenarios);
  }

  /* Cycle to the next scenario in declaration order. */
  function cycleScenario() {
    var ids = listScenarioIds();
    if (ids.length < 2) return;
    var current = window.PrototypeViewers.getActiveScenario();
    var index = ids.indexOf(current);
    var next = index === -1 ? ids[0] : ids[(index + 1) % ids.length];
    window.PrototypeViewers.activateScenario(next);
  }

  /* Read optional scenario label for the scenario switch button. */
  function scenarioLabel(id) {
    return window.PrototypeNotesModel.scenarioLabel(state.data && state.data.scenarios, id);
  }

  var sceneSwitchIcon =
    '<svg class="pn-scene-switch-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">' +
    '<path d="M6 4L2 8l4 4M10 12l4-4-4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  /* Left action area: scenario switch, add note, and author-tool entry keep a fixed order. */
  function ensureActionsStart() {
    if (!state.actions) return null;
    if (!state.actionsStart || !state.actions.contains(state.actionsStart)) {
      state.actionsStart = state.actions.querySelector('.pn-panel-actions-start');
    }
    if (!state.actionsStart) {
      state.actionsStart = document.createElement('div');
      state.actionsStart.className = 'pn-panel-actions-start';
      var toggle = state.actions.querySelector('.pn-toggle');
      if (toggle) state.actions.insertBefore(state.actionsStart, toggle);
      else state.actions.appendChild(state.actionsStart);
    }
    return state.actionsStart;
  }

  /* Search within the actions subtree so nodes are found when render temporarily detaches them. */
  function findActionsChild(selector) {
    if (!state.actions) return null;
    return state.actions.querySelector(selector);
  }

  function syncPanelActions() {
    var start = ensureActionsStart();
    if (!start) return;
    var ordered = [
      findActionsChild('.pn-scene-switch'),
      findActionsChild('.pn-author-toolbar'),
      findActionsChild('#at-launch')
    ].filter(Boolean);
    ordered.forEach(function (el, index) {
      if (start.children[index] !== el) start.insertBefore(el, start.children[index] || null);
    });
  }

  /* Sync scenario switch label; after redraw it stays first in the left action area. */
  function ensureSceneSwitch() {
    var start = ensureActionsStart();
    if (!start || !state.actions) return;
    var ids = listScenarioIds();
    var btn = findActionsChild('.pn-scene-switch');
    if (ids.length < 2) {
      if (btn) btn.remove();
      syncPanelActions();
      return;
    }
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'pn-scene-switch';
      btn.type = 'button';
      btn.title = 'Switch scenario';
      btn.setAttribute('aria-label', 'Switch scenario');
      btn.innerHTML = sceneSwitchIcon + '<span class="pn-scene-switch-label"></span>';
      btn.addEventListener('click', cycleScenario);
      start.insertBefore(btn, start.firstChild);
    } else if (btn.parentElement !== start) {
      start.insertBefore(btn, start.firstChild);
    }
    var active = window.PrototypeViewers.getActiveScenario() || ids[0];
    var label = scenarioLabel(active);
    var labelEl = btn.querySelector('.pn-scene-switch-label');
    if (!labelEl) {
      btn.innerHTML = sceneSwitchIcon + '<span class="pn-scene-switch-label"></span>';
      labelEl = btn.querySelector('.pn-scene-switch-label');
    }
    labelEl.textContent = label;
    btn.title = 'Switch scenario (current: ' + label + ')';
    syncPanelActions();
  }

  /* Create desktop collapse button and mobile full-page toggle button. */
  function buildControls(beforeNode) {
    ensureActionsStart();
    var toggle = document.createElement('button');
    toggle.className = 'pn-toggle';
    toggle.type = 'button';
    toggle.title = 'Hide notes';
    toggle.setAttribute('aria-expanded', 'true');
    toggle.textContent = '››';
    toggle.addEventListener('click', function () {
      var collapsed = state.page.classList.toggle('pn-collapsed');
      toggle.title = collapsed ? 'Show notes' : 'Hide notes';
      toggle.setAttribute('aria-expanded', String(!collapsed));
      toggle.textContent = collapsed ? '‹‹' : '››';
      scheduleDraw();
    });
    state.actions.appendChild(toggle);
    ensureSceneSwitch();

    var mobile = document.createElement('button');
    mobile.className = 'pn-mobile-toggle';
    mobile.type = 'button';
    mobile.textContent = 'View notes';
    mobile.setAttribute('aria-pressed', 'false');
    mobile.addEventListener('click', function () {
      var visible = state.page.classList.toggle('pn-notes-visible');
      mobile.textContent = visible ? 'View page' : 'View notes';
      mobile.setAttribute('aria-pressed', String(visible));
    });
    document.body.insertBefore(mobile, beforeNode);
  }

  /* Render visible note cards; target data is for connectors only, not repeated in the card. */
  function render() {
    var data = state.data;
    try {
      if (state.actions.parentElement) state.actions.remove();
      state.notes.querySelectorAll('.pn-head, .pn-cards').forEach(function (el) { el.remove(); });
      var head = document.createElement('div');
      head.className = 'pn-head';
      head.innerHTML = '<strong></strong><span></span>';
      head.querySelector('strong').textContent = data.header && data.header.title || 'Function notes';
      head.querySelector('span').textContent = data.header && data.header.subtitle || '';
      state.notes.appendChild(head);

      state.cards = document.createElement('div');
      state.cards.className = 'pn-cards';
      visibleCards().forEach(function (card, index) {
        var article = document.createElement('article');
        article.className = 'pn-card';
        article.dataset.noteId = card.id;
        article.innerHTML = '<div class="pn-card-title"><span class="pn-index"></span><span class="pn-title-text"></span></div><p></p>';
        article.querySelector('.pn-index').textContent = String(index + 1);
        article.querySelector('.pn-title-text').textContent = card.title || 'Untitled note';
        article.querySelector('p').textContent = card.body || '';
        bindHighlight(article, card.id);
        state.cards.appendChild(article);
      });
      state.notes.appendChild(state.cards);
      ensureSceneSwitch();
    } finally {
      if (state.actions && state.actions.parentElement !== state.notes) state.notes.appendChild(state.actions);
      syncPanelActions();
    }
    if (typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('prototype-notes:rendered'));
    }
    scheduleDraw();
  }

  /* Return cards to show: cards without when always show; others match combined state. */
  function visibleCards() {
    return window.PrototypeNotesModel.visibleCards(
      state.data && state.data.cards,
      window.PrototypeViewers.getState()
    );
  }

  /* Modal/Drawer connector anchor: inner panel defines semantics; overlay id is for the adapter only. */
  function resolveNoteAnchor(el) {
    if (!el || !el.classList) return el;
    if (el.classList.contains('ui-overlay')) {
      var panel = el.querySelector(':scope > .ui-modal, :scope > .ui-drawer');
      if (panel) return panel;
    }
    return el;
  }

  /* Resolve stable id anchor or selector fallback; invalid, stale, or out-of-preview targets count as unbound. */
  function resolveTarget(card) {
    var anchor = card && card.target && card.target.anchor;
    if (anchor) {
      var anchored = document.getElementById(anchor);
      anchored = resolveNoteAnchor(anchored);
      return anchored && state.preview.contains(anchored) ? anchored : null;
    }
    var selector = card && card.target && card.target.selector;
    if (!selector) return null;
    try {
      return state.preview.querySelector(selector);
    } catch (_) {
      return null;
    }
  }

  /* Whether a connector anchor lies inside the scroll container visible rect. */
  function isAnchorVisible(container, x, y) {
    var rect = container.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  /* Draw Bézier connectors and stable indices for currently visible cards. */
  function draw() {
    clearHighlights();
    state.svg.innerHTML = '';
    state.connections = [];
    if (window.innerWidth <= 768 || state.page.classList.contains('pn-collapsed')) return;
    visibleCards().forEach(function (card, index) {
      /* During rebinding: editor preview line owns the active card; other cards draw normally. */
      if (state.pickCardId && card.id === state.pickCardId) return;
      var target = resolveTarget(card);
      var note = state.cards.querySelector('[data-note-id="' + cssEscape(card.id) + '"]');
      if (!target || !note || target.offsetParent === null || note.offsetParent === null) return;
      var tr = target.getBoundingClientRect();
      var nr = note.getBoundingClientRect();
      var x1 = tr.right;
      var y1 = tr.top + tr.height / 2;
      var x2 = nr.left;
      var y2 = nr.top + nr.height / 2;
      if (!isAnchorVisible(state.preview, x1, y1) || !isAnchorVisible(state.notes, x2, y2)) return;
      var mx = x1 + (x2 - x1) / 2;
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M ' + x1 + ' ' + y1 + ' C ' + mx + ' ' + y1 + ', ' + mx + ' ' + y2 + ', ' + x2 + ' ' + y2);
      path.setAttribute('class', 'pn-line');
      state.svg.appendChild(path);
      var badge = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      badge.setAttribute('cx', mx);
      badge.setAttribute('cy', (y1 + y2) / 2);
      badge.setAttribute('r', '10');
      badge.setAttribute('class', 'pn-line-badge');
      state.svg.appendChild(badge);
      var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', mx);
      text.setAttribute('y', (y1 + y2) / 2);
      text.setAttribute('class', 'pn-line-text');
      text.textContent = String(index + 1);
      state.svg.appendChild(text);
      bindHighlight(target, card.id);
      state.connections.push({ id: card.id, target: target, note: note, path: path });
    });
  }

  /* Clear hover state from the previous draw to avoid leftover blue boxes after rebind or redraw. */
  function clearHighlights() {
    state.preview.querySelectorAll('.pn-target-highlighted').forEach(function (target) {
      target.classList.remove('pn-target-highlighted');
    });
    state.notes.querySelectorAll('.pn-card.pn-highlighted').forEach(function (note) {
      note.classList.remove('pn-highlighted');
    });
  }

  /* Coalesce high-frequency redraws from scroll, resize, and DOM changes. */
  function scheduleDraw() {
    window.clearTimeout(state.drawTimer);
    state.drawTimer = window.setTimeout(draw, 50);
  }

  /* Bind one hover link between a target or card. */
  function bindHighlight(element, id) {
    if (element.dataset.pnHighlightBound === id) return;
    element.dataset.pnHighlightBound = id;
    element.addEventListener('mouseenter', function () { highlight(id, true); });
    element.addEventListener('mouseleave', function () { highlight(id, false); });
  }

  /* Sync highlight across target, note card, and matching path. */
  function highlight(id, on) {
    state.connections.forEach(function (item) {
      if (item.id !== id) return;
      item.target.classList.toggle('pn-target-highlighted', on);
      item.note.classList.toggle('pn-highlighted', on);
      item.path.classList.toggle('pn-highlighted', on);
    });
  }

  /* Update note data; annotation groups are expressed via combined state, so only re-render cards here. */
  function setData(data) {
    state.data = data;
    render();
  }

  /* Escape card id for attribute selectors. */
  function cssEscape(value) {
    return window.CSS && CSS.escape ? CSS.escape(String(value)) : String(value).replace(/["\\]/g, '\\$&');
  }

  /* Read a URL param; return empty string on parse failure or missing param. */
  function readUrlParam(name) {
    try {
      return new URLSearchParams(window.location.search).get(name) || '';
    } catch (_) {
      return '';
    }
  }

  /* Read ?collapsed=1 from URL so headless capture defaults to a collapsed right rail. */
  function readUrlCollapsed() {
    try {
      return new URLSearchParams(window.location.search).get('collapsed') === '1';
    } catch (_) {
      return false;
    }
  }

  /* Sync right-rail collapse from URL; product-only capture uses ?product-only=1 instead. */
  function applyUrlCollapsed() {
    if (!readUrlCollapsed()) return;
    state.page.classList.add('pn-collapsed');
    var toggle = state.actions.querySelector('.pn-toggle');
    if (toggle) {
      toggle.title = 'Show notes';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '‹‹';
    }
  }

  /* Mark the card being rebound; draw skips its formal connector. */
  function setPickCardId(id) {
    state.pickCardId = id || '';
  }

  /* Clear rebind marker and restore all formal connectors. */
  function clearPickCardId() {
    state.pickCardId = '';
  }

  /* Register snapshot scenarios with the unified coordinator; object and array shapes both supported. */
  function registerSnapshotScenarios(data) {
    var definitions = data && data.scenarios;
    if (Array.isArray(definitions)) {
      definitions.forEach(function (scenario) {
        if (scenario && scenario.id) window.PrototypeViewers.registerScenario(scenario.id, scenario);
      });
      return;
    }
    if (!definitions || Object.prototype.toString.call(definitions) !== '[object Object]') return;
    Object.keys(definitions).forEach(function (id) {
      window.PrototypeViewers.registerScenario(id, definitions[id]);
    });
  }

  /* Read snapshot top-level state as initial unified state. */
  function snapshotInitialState(data) {
    var initial = data && data.state;
    return initial && Object.prototype.toString.call(initial) === '[object Object]' ? initial : {};
  }

  /* Restore deep link via ?scene=<id>; without scene, fall back to snapshot.activeScenario, else default state. */
  function activateInitialState(data) {
    var scene = readUrlParam('scene');
    window.PrototypeViewers.setState(snapshotInitialState(data), { baseline: true, scene: '' });
    if (scene) {
      window.PrototypeViewers.activateScenario(scene);
      return;
    }
    if (data.activeScenario) window.PrototypeViewers.activateScenario(data.activeScenario);
  }

  /* Initialize read-only Viewer and register notes as a read-only unified-state consumer. */
  function init() {
    if (state.page) return;
    if (!window.PrototypeViewers) {
      console.error('[prototype-notes] missing PrototypeViewers state core; load client/core/state.js first.');
      return;
    }
    if (!window.PrototypeNotesModel) {
      console.error('[prototype-notes] missing PrototypeNotesModel; load client/notes/model.js first.');
      return;
    }
    var data = window.__PROTOTYPE_NOTES__;
    if (!data || !Array.isArray(data.cards)) {
      console.error('[prototype-notes] missing valid window.__PROTOTYPE_NOTES__ data.');
      return;
    }
    state.data = data;
    installStyles();
    buildShell();
    applyUrlCollapsed();
    registerSnapshotScenarios(data);
    window.PrototypeViewers.registerViewer('notes', { render: render });
    activateInitialState(data);
    state.preview.addEventListener('scroll', function () { requestAnimationFrame(draw); });
    state.notes.addEventListener('scroll', function () { requestAnimationFrame(draw); });
    window.addEventListener('resize', scheduleDraw);
    window.addEventListener('ui:layout-change', scheduleDraw);
    window.addEventListener('load', scheduleDraw, { once: true });
    window.setTimeout(scheduleDraw, 300);
  }

  window.PrototypeNotesViewer = {
    init: init,
    draw: draw,
    clearHighlights: clearHighlights,
    setData: setData,
    setPickCardId: setPickCardId,
    clearPickCardId: clearPickCardId,
    syncPanelActions: syncPanelActions,
    ensureActionsStart: ensureActionsStart,
    getData: function () { return state.data; }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
