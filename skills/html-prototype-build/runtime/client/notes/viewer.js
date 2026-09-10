/* 原型正式标注只读 Viewer：从唯一 snapshot 数据源创建右栏、卡片和 SVG 连线。 */
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

  /* 注入隔离的 Viewer 样式，不要求原型预先携带说明栏 CSS。 */
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
      /* 折叠右栏时只保留展开钮；场景切换与作者加号一并隐藏。 */
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

  /* 创建 Viewer 外壳，并把 script 之前的原型节点整体移入左侧预览区。 */
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

  /* 读取 snapshot 中 scenarios 的声明顺序 id 列表。 */
  function listScenarioIds() {
    return window.PrototypeNotesModel.listScenarioIds(state.data && state.data.scenarios);
  }

  /* 按声明顺序循环激活下一场景。 */
  function cycleScenario() {
    var ids = listScenarioIds();
    if (ids.length < 2) return;
    var current = window.PrototypeViewers.getActiveScenario();
    var index = ids.indexOf(current);
    var next = index === -1 ? ids[0] : ids[(index + 1) % ids.length];
    window.PrototypeViewers.activateScenario(next);
  }

  /* 读取场景可选 label，用于场景切换钮展示。 */
  function scenarioLabel(id) {
    return window.PrototypeNotesModel.scenarioLabel(state.data && state.data.scenarios, id);
  }

  var sceneSwitchIcon =
    '<svg class="pn-scene-switch-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">' +
    '<path d="M6 4L2 8l4 4M10 12l4-4-4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  /* 左侧操作区：场景切换、新增说明与作者工具入口保持固定顺序。 */
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

  /* 在 actions 子树内查找，避免 render 暂时 detach 时 document.querySelector/getElementById 找不到节点。 */
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

  /* 同步场景切换钮文案；重绘后仍留在左侧操作区首位。 */
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

  /* 创建桌面收起按钮和移动端整页切换按钮。 */
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

  /* 渲染当前可见说明卡片；目标数据仅用于连线，不在卡片内重复展示。 */
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

  /* 返回当前应显示的卡片：无 when 的卡片始终显示，有 when 的按组合状态匹配。 */
  function visibleCards() {
    return window.PrototypeNotesModel.visibleCards(
      state.data && state.data.cards,
      window.PrototypeViewers.getState()
    );
  }

  /* Modal/Drawer 连线落点：内层面板才有语义边界，遮罩层 id 仅用于 Adapter。 */
  function resolveNoteAnchor(el) {
    if (!el || !el.classList) return el;
    if (el.classList.contains('ui-overlay')) {
      var panel = el.querySelector(':scope > .ui-modal, :scope > .ui-drawer');
      if (panel) return panel;
    }
    return el;
  }

  /* 解析稳定 ID 锚点或 selector 兜底；非法、失效或预览区外目标均视为未绑定。 */
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

  /* 判断连线锚点是否位于对应滚动容器可视矩形内。 */
  function isAnchorVisible(container, x, y) {
    var rect = container.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  /* 绘制当前可见卡片的贝塞尔连线与稳定序号。 */
  function draw() {
    clearHighlights();
    state.svg.innerHTML = '';
    state.connections = [];
    if (window.innerWidth <= 768 || state.page.classList.contains('pn-collapsed')) return;
    visibleCards().forEach(function (card, index) {
      /* 绑定模式中：当前卡片由 editor 预览线接管，其余卡片照常绘制。 */
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

  /* 清理上一轮连线留下的悬停状态，避免重新绑定或重绘后原型目标残留蓝框。 */
  function clearHighlights() {
    state.preview.querySelectorAll('.pn-target-highlighted').forEach(function (target) {
      target.classList.remove('pn-target-highlighted');
    });
    state.notes.querySelectorAll('.pn-card.pn-highlighted').forEach(function (note) {
      note.classList.remove('pn-highlighted');
    });
  }

  /* 合并滚动、尺寸变化和 DOM 变化产生的高频重绘。 */
  function scheduleDraw() {
    window.clearTimeout(state.drawTimer);
    state.drawTimer = window.setTimeout(draw, 50);
  }

  /* 为目标或卡片绑定一次悬停联动。 */
  function bindHighlight(element, id) {
    if (element.dataset.pnHighlightBound === id) return;
    element.dataset.pnHighlightBound = id;
    element.addEventListener('mouseenter', function () { highlight(id, true); });
    element.addEventListener('mouseleave', function () { highlight(id, false); });
  }

  /* 同步高亮目标、说明卡片和对应路径。 */
  function highlight(id, on) {
    state.connections.forEach(function (item) {
      if (item.id !== id) return;
      item.target.classList.toggle('pn-target-highlighted', on);
      item.note.classList.toggle('pn-highlighted', on);
      item.path.classList.toggle('pn-highlighted', on);
    });
  }

  /* 更新说明数据；标注组已统一由组合状态表达，这里只重渲染卡片。 */
  function setData(data) {
    state.data = data;
    render();
  }

  /* 转义属性选择器中的卡片 ID。 */
  function cssEscape(value) {
    return window.CSS && CSS.escape ? CSS.escape(String(value)) : String(value).replace(/["\\]/g, '\\$&');
  }

  /* 从 URL 读取参数；解析失败或参数不存在时返回空字符串。 */
  function readUrlParam(name) {
    try {
      return new URLSearchParams(window.location.search).get(name) || '';
    } catch (_) {
      return '';
    }
  }

  /* 从 URL 读取 ?collapsed=1，供无头截图等场景默认折叠右栏。 */
  function readUrlCollapsed() {
    try {
      return new URLSearchParams(window.location.search).get('collapsed') === '1';
    } catch (_) {
      return false;
    }
  }

  /* 按 URL 折叠参数同步右栏；纯页面截图态改由 ?product-only=1 触发。 */
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

  /* 标记正在重新绑定的卡片，draw 时跳过其正式连线。 */
  function setPickCardId(id) {
    state.pickCardId = id || '';
  }

  /* 清除绑定标记，恢复全部正式连线。 */
  function clearPickCardId() {
    state.pickCardId = '';
  }

  /* 把 snapshot 场景注册到统一协调器；对象和数组两种载入形态均可读取。 */
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

  /* 读取 snapshot 顶层 state 作为初始统一状态。 */
  function snapshotInitialState(data) {
    var initial = data && data.state;
    return initial && Object.prototype.toString.call(initial) === '[object Object]' ? initial : {};
  }

  /* 按 ?scene=<id> 恢复深链；无 scene 时回退 snapshot.activeScenario，否则保持默认状态。 */
  function activateInitialState(data) {
    var scene = readUrlParam('scene');
    window.PrototypeViewers.setState(snapshotInitialState(data), { baseline: true, scene: '' });
    if (scene) {
      window.PrototypeViewers.activateScenario(scene);
      return;
    }
    if (data.activeScenario) window.PrototypeViewers.activateScenario(data.activeScenario);
  }

  /* 初始化只读 Viewer，并把 notes 注册为统一状态的一个只读消费者。 */
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
