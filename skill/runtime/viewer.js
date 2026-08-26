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

/* 原型正式标注只读 Viewer：从唯一 snapshot 数据源创建右栏、分组卡片和 SVG 连线。 */
(function () {
  'use strict';

  if (window.PrototypeNotesViewer) return;

  var state = {
    data: null,
    activeGroup: 'base',
    page: null,
    preview: null,
    notes: null,
    cards: null,
    actions: null,
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
      '.pn-page{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.22fr);height:100vh;overflow:hidden}',
      '.pn-page.pn-collapsed{grid-template-columns:minmax(0,1fr) 0}',
      '.pn-preview{position:relative;min-width:0;overflow:auto;border-right:1px solid var(--ui-border,#d9d9d9)}',
      '.pn-notes{position:relative;z-index:75;min-width:0;overflow:auto;padding:16px;background:var(--ui-bg-soft,#f5f5f5);color:var(--ui-text,#262626)}',
      '.pn-collapsed .pn-notes{overflow:visible;padding:0;visibility:hidden}',
      '.pn-head{padding-bottom:12px;margin-bottom:16px;border-bottom:1px solid var(--ui-border,#d9d9d9)}',
      '.pn-head strong{display:block;font-size:16px}',
      '.pn-head span,.pn-card p{color:var(--ui-text-secondary,#595959);font-size:12px;line-height:18px}',
      '.pn-card p{margin:4px 0 0}',
      '.pn-cards{display:grid;align-content:start;align-items:start;grid-auto-rows:max-content;gap:12px}',
      '.pn-card{padding:12px;border:1px solid var(--ui-border,#d9d9d9);border-radius:var(--ui-radius-container,8px);background:var(--ui-bg,#fff)}',
      '.pn-card.pn-highlighted{border-color:var(--ui-primary,#1677ff);box-shadow:0 0 0 2px var(--ui-border-subtle,#e6f4ff)}',
      '.pn-card-title{display:flex;gap:8px;align-items:center;font-weight:600}',
      '.pn-index{display:inline-grid;place-items:center;flex:0 0 22px;height:22px;color:var(--ui-text-on-primary,#fff);border-radius:50%;background:var(--ui-primary,#1677ff);font-size:12px}',
      '.pn-target-highlighted{box-shadow:0 0 0 2px var(--ui-primary,#1677ff)!important}',
      '.pn-connections{position:fixed;inset:0;z-index:80;width:100%;height:100%;pointer-events:none}',
      '.pn-line{fill:none;stroke:var(--ui-primary,#1677ff);stroke-width:2;opacity:.55}.pn-line.pn-highlighted{opacity:1;stroke-width:3}',
      '.pn-line-badge{fill:var(--ui-primary,#1677ff)}',
      '.pn-line-text{fill:var(--ui-text-on-primary,#fff);font-size:11px;font-weight:600;text-anchor:middle;dominant-baseline:central}',
      '.pn-panel-actions{position:fixed;right:16px;bottom:16px;z-index:90;display:flex;align-items:center;gap:8px}',
      '.pn-toggle{display:grid;place-items:center;width:32px;height:32px;padding:0;border:1px solid var(--ui-border,#d9d9d9);border-radius:50%;background:var(--ui-bg,#fff);color:var(--ui-text-secondary,#595959);box-shadow:0 4px 12px rgba(0,0,0,.12)}',
      '.pn-page.pn-collapsed~.pn-connections{display:none}',
      '.pn-mobile-toggle{display:none}',
      '[data-ui-interactive]{position:relative}',
      '[data-ui-interactive]::after{position:absolute;top:2px;right:2px;z-index:5;width:14px;height:14px;content:"";background:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3E%3Ccircle cx=%278%27 cy=%278%27 r=%278%27 fill=%27%23ff8d6b%27/%3E%3Cpath d=%27M10 1.6 3.4 9.8h4L6 14.4 12.6 6H8.4z%27 fill=%27%23fff%27/%3E%3C/svg%3E") center/contain no-repeat;pointer-events:none}',
      '@media(max-width:768px){body{overflow:auto}.pn-page{display:block;height:auto;min-height:100vh}.pn-preview{min-height:100vh;border:0}.pn-notes{display:none;min-height:100vh}.pn-page.pn-notes-visible .pn-preview{display:none}.pn-page.pn-notes-visible .pn-notes{display:block}.pn-connections,.pn-toggle{display:none}.pn-mobile-toggle{position:fixed;right:16px;bottom:16px;z-index:130;display:inline-flex;padding:8px 12px;border:0;border-radius:6px;background:var(--ui-primary,#1677ff);color:#fff}}'
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
    state.notes.setAttribute('aria-label', '功能说明');
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
    document.body.insertBefore(state.actions, viewerScript);
    buildControls(viewerScript);
  }

  /* 创建桌面收起按钮和移动端整页切换按钮。 */
  function buildControls(beforeNode) {
    var toggle = document.createElement('button');
    toggle.className = 'pn-toggle';
    toggle.type = 'button';
    toggle.title = '隐藏说明';
    toggle.setAttribute('aria-expanded', 'true');
    toggle.textContent = '››';
    toggle.addEventListener('click', function () {
      var collapsed = state.page.classList.toggle('pn-collapsed');
      toggle.title = collapsed ? '显示说明' : '隐藏说明';
      toggle.setAttribute('aria-expanded', String(!collapsed));
      toggle.textContent = collapsed ? '‹‹' : '››';
      scheduleDraw();
    });
    state.actions.appendChild(toggle);

    var mobile = document.createElement('button');
    mobile.className = 'pn-mobile-toggle';
    mobile.type = 'button';
    mobile.textContent = '查看说明';
    mobile.setAttribute('aria-pressed', 'false');
    mobile.addEventListener('click', function () {
      var visible = state.page.classList.toggle('pn-notes-visible');
      mobile.textContent = visible ? '查看界面' : '查看说明';
      mobile.setAttribute('aria-pressed', String(visible));
    });
    document.body.insertBefore(mobile, beforeNode);
  }

  /* 根据当前组渲染公共卡片和状态卡片；目标数据仅用于连线，不在卡片内重复展示。 */
  function render() {
    var data = state.data;
    if (state.actions.parentElement) state.actions.remove();
    state.notes.innerHTML = '';
    var head = document.createElement('div');
    head.className = 'pn-head';
    head.innerHTML = '<strong></strong><span></span>';
    head.querySelector('strong').textContent = data.header && data.header.title || '功能说明';
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
      article.querySelector('.pn-title-text').textContent = card.title || '未命名说明';
      article.querySelector('p').textContent = card.body || '';
      bindHighlight(article, card.id);
      state.cards.appendChild(article);
    });
    state.notes.appendChild(state.cards);
    document.body.appendChild(state.actions);
    scheduleDraw();
  }

  /* 返回当前应显示的卡片：公共卡片始终显示，其他卡片只显示当前组。 */
  function visibleCards() {
    var cards = Array.isArray(state.data.cards) ? state.data.cards : [];
    return cards.filter(function (card) {
      return (card.group || 'common') === 'common' || card.group === state.activeGroup;
    });
  }

  /* 安全解析卡片 selector；非法或失效 selector 均视为未绑定。 */
  function resolveTarget(card) {
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

  /* 切换当前状态组并重新渲染公共卡片与组内卡片。 */
  function setGroup(group) {
    state.activeGroup = group || 'base';
    render();
  }

  /* 更新内存数据，供作者编辑器保存成功后立即刷新 Viewer。 */
  function setData(data) {
    state.data = data;
    state.activeGroup = data.activeGroup || state.activeGroup || 'base';
    render();
  }

  /* 转义属性选择器中的卡片 ID。 */
  function cssEscape(value) {
    return window.CSS && CSS.escape ? CSS.escape(String(value)) : String(value).replace(/["\\]/g, '\\$&');
  }

  /* 从 URL 读取 ?state= 指定的初始标注组；缺省返回空字符串。 */
  function readUrlState() {
    try {
      return new URLSearchParams(window.location.search).get('state') || '';
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

  /* 按 URL 折叠参数同步右栏，并进入纯页面态（与 author-chrome.js / Inspector 共用 pa-product-only）。 */
  function applyUrlCollapsed() {
    if (!readUrlCollapsed()) return;
    state.page.classList.add('pn-collapsed');
    if (window.PrototypeAuthorChrome) window.PrototypeAuthorChrome.enable();
    var toggle = state.actions.querySelector('.pn-toggle');
    if (toggle) {
      toggle.title = '显示说明';
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

  /* 初始化只读 Viewer，并建立跨原型组件的状态切换契约。 */
  function init() {
    var data = window.__PROTOTYPE_NOTES__;
    if (!data || !Array.isArray(data.cards)) {
      console.error('[prototype-notes] 缺少有效的 window.__PROTOTYPE_NOTES__ 数据。');
      return;
    }
    state.data = data;
    state.activeGroup = readUrlState() || data.activeGroup || 'base';
    installStyles();
    buildShell();
    applyUrlCollapsed();
    render();
    state.preview.addEventListener('scroll', function () { requestAnimationFrame(draw); });
    state.notes.addEventListener('scroll', function () { requestAnimationFrame(draw); });
    window.addEventListener('resize', scheduleDraw);
    window.addEventListener('ui:layout-change', scheduleDraw);
    window.addEventListener('ui:layer-change', function (event) {
      setGroup(event.detail && event.detail.page);
    });
    window.addEventListener('load', scheduleDraw, { once: true });
    window.setTimeout(scheduleDraw, 300);
  }

  window.PrototypeNotesViewer = {
    init: init,
    draw: draw,
    clearHighlights: clearHighlights,
    setGroup: setGroup,
    setData: setData,
    setPickCardId: setPickCardId,
    clearPickCardId: clearPickCardId,
    getData: function () { return state.data; },
    getActiveGroup: function () { return state.activeGroup; }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
