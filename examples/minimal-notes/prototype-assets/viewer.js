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

/* 原型统一状态协调器：JS state 是唯一状态源，业务 DOM 与各 Viewer 都只消费提交后的状态。 */
(function () {
  'use strict';

  if (window.PrototypeViewers) return;

  var currentState = {};
  var scenarioBaseState = {};
  var activeScenario = '';
  var stateAdapters = {};
  var viewers = {};
  var scenarios = {};
  var hasCommitted = false;
  var isCommitting = false;
  var pendingCommit = null;

  /* 判断普通对象，避免把数组和 DOM 对象当作可递归状态处理。 */
  function isPlainObject(value) {
    return !!value && Object.prototype.toString.call(value) === '[object Object]';
  }

  /* 深复制公开状态，防止 Adapter、Viewer 或调用方绕过 setState 直接改写唯一状态源。 */
  function cloneValue(value) {
    if (Array.isArray(value)) return value.map(cloneValue);
    if (!isPlainObject(value)) return value;
    var copy = {};
    Object.keys(value).forEach(function (key) { copy[key] = cloneValue(value[key]); });
    return copy;
  }

  /* 递归合并状态片段；数组按完整值替换，避免多次 patch 后残留旧组合项。 */
  function mergeState(base, patch) {
    var result = isPlainObject(base) ? cloneValue(base) : {};
    if (!isPlainObject(patch)) return result;
    Object.keys(patch).forEach(function (key) {
      result[key] = isPlainObject(patch[key]) && isPlainObject(result[key])
        ? mergeState(result[key], patch[key])
        : cloneValue(patch[key]);
    });
    return result;
  }

  /* 依注册顺序归一化各命名空间，保证业务状态具有稳定结构。 */
  function normalizeState(nextState) {
    var normalized = isPlainObject(nextState) ? cloneValue(nextState) : {};
    Object.keys(stateAdapters).forEach(function (name) {
      var adapter = stateAdapters[name];
      if (!adapter || typeof adapter.normalize !== 'function') return;
      try {
        var normalizedValue = adapter.normalize(cloneValue(normalized[name]), cloneValue(normalized));
        if (normalizedValue !== undefined) normalized[name] = normalizedValue;
      } catch (error) {
        console.error('[prototype-viewers] 状态归一化失败：' + name, error);
      }
    });
    return normalized;
  }

  /* 可选同步场景到 URL；默认不改历史，避免普通状态 patch 污染浏览记录。 */
  function syncSceneUrl(scene, historyMode) {
    if (!historyMode || !window.history || !window.URL) return;
    try {
      var url = new URL(window.location.href);
      if (scene) url.searchParams.set('scene', scene);
      else url.searchParams.delete('scene');
      if (historyMode === 'push') window.history.pushState(null, '', url.toString());
      else if (historyMode === 'replace') window.history.replaceState(null, '', url.toString());
    } catch (_) {
      /* file:// 或旧浏览器不支持 URL 更新时，状态提交本身仍应成功。 */
    }
  }

  /* 执行一次原子提交，严格保持 normalize → adapter apply → viewer render 顺序。 */
  function commit(nextState, options) {
    var opts = options || {};
    if (isCommitting) {
      pendingCommit = { state: cloneValue(nextState), options: opts };
      return getState();
    }
    isCommitting = true;
    currentState = normalizeState(nextState);
    if (opts.baseline) scenarioBaseState = cloneValue(currentState);
    if (Object.prototype.hasOwnProperty.call(opts, 'scene')) activeScenario = opts.scene || '';
    Object.keys(stateAdapters).forEach(function (name) {
      var adapter = stateAdapters[name];
      if (!adapter || typeof adapter.apply !== 'function') return;
      try {
        adapter.apply(cloneValue(currentState[name]), cloneValue(currentState));
      } catch (error) {
        console.error('[prototype-viewers] 状态应用失败：' + name, error);
      }
    });
    Object.keys(viewers).forEach(function (name) {
      var viewer = viewers[name];
      if (!viewer || typeof viewer.render !== 'function') return;
      try {
        viewer.render(cloneValue(currentState));
      } catch (error) {
        console.error('[prototype-viewers] Viewer 渲染失败：' + name, error);
      }
    });
    hasCommitted = true;
    syncSceneUrl(activeScenario, opts.history);
    isCommitting = false;
    if (pendingCommit) {
      var queued = pendingCommit;
      pendingCommit = null;
      return commit(queued.state, queued.options);
    }
    return getState();
  }

  /* 注册一个顶层状态命名空间 Adapter；初始化后注册会立即纳入完整提交流程。 */
  function registerState(name, adapter) {
    if (!name) throw new Error('[prototype-viewers] registerState 缺少 name。');
    stateAdapters[name] = typeof adapter === 'function' ? { apply: adapter } : (adapter || {});
    if (hasCommitted) commit(currentState, { scene: activeScenario });
    return function () { delete stateAdapters[name]; };
  }

  /* 注册状态消费者；初始化后注册立即收到当前完整状态。 */
  function registerViewer(name, viewer) {
    if (!name) throw new Error('[prototype-viewers] registerViewer 缺少 name。');
    viewers[name] = typeof viewer === 'function' ? { render: viewer } : (viewer || {});
    if (hasCommitted && typeof viewers[name].render === 'function') {
      try {
        viewers[name].render(getState());
      } catch (error) {
        console.error('[prototype-viewers] Viewer 初次渲染失败：' + name, error);
      }
    }
    return function () { delete viewers[name]; };
  }

  /* 返回唯一状态源的副本。 */
  function getState() {
    return cloneValue(currentState);
  }

  /* 返回当前激活的显式场景 ID；手动 set/patch 默认会退出场景。 */
  function getActiveScenario() {
    return activeScenario;
  }

  /* 浅复制提交选项，避免内部补默认值时修改调用方对象。 */
  function copyOptions(options) {
    var copy = {};
    Object.keys(options || {}).forEach(function (key) { copy[key] = options[key]; });
    return copy;
  }

  /* 用完整状态替换当前状态。 */
  function setState(nextState, options) {
    var opts = copyOptions(options);
    if (!Object.prototype.hasOwnProperty.call(opts, 'scene')) opts.scene = '';
    return commit(nextState, opts);
  }

  /* 深合并局部状态；数组与原始值按完整值替换。 */
  function patchState(partial, options) {
    var opts = copyOptions(options);
    if (!Object.prototype.hasOwnProperty.call(opts, 'scene')) opts.scene = '';
    return commit(mergeState(currentState, partial), opts);
  }

  /* 注册显式场景；标准结构为 { extends, state }，同时宽容兼容直接状态对象。 */
  function registerScenario(id, configOrState) {
    if (!id) throw new Error('[prototype-viewers] registerScenario 缺少 id。');
    scenarios[id] = cloneValue(configOrState || {});
  }

  /* 递归解析场景继承，并拦截循环 extends。 */
  function resolveScenario(id, chain) {
    var config = scenarios[id];
    if (!config) return null;
    var visited = chain || [];
    if (visited.indexOf(id) !== -1) {
      console.error('[prototype-viewers] 场景继承存在循环：' + visited.concat(id).join(' -> '));
      return null;
    }
    var standard = Object.prototype.hasOwnProperty.call(config, 'state') || Object.prototype.hasOwnProperty.call(config, 'extends');
    var ownState = standard ? config.state || {} : config;
    if (!standard || !config.extends) return cloneValue(ownState);
    var parentState = resolveScenario(config.extends, visited.concat(id));
    return parentState ? mergeState(parentState, ownState) : null;
  }

  /* 激活场景并以 snapshot 默认 state 为基础应用组合，避免从上一场景泄漏状态。 */
  function activateScenario(id, options) {
    var scenarioState = resolveScenario(id, []);
    if (!scenarioState) return false;
    var opts = copyOptions(options);
    opts.scene = id;
    commit(mergeState(scenarioBaseState, scenarioState), opts);
    return true;
  }

  window.PrototypeViewers = {
    registerState: registerState,
    registerViewer: registerViewer,
    getState: getState,
    getActiveScenario: getActiveScenario,
    setState: setState,
    patchState: patchState,
    registerScenario: registerScenario,
    activateScenario: activateScenario
  };
})();

/* 原型正式标注只读 Viewer：从唯一 snapshot 数据源创建右栏、分组卡片和 SVG 连线。 */
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

  /* 按点路径读取组合状态；路径不存在时返回 undefined。 */
  function readStatePath(source, path) {
    return String(path).split('.').reduce(function (value, key) {
      return value == null ? undefined : value[key];
    }, source);
  }

  /* 深比较 when 中的对象和数组值，避免引用地址影响声明式匹配。 */
  function equalStateValue(actual, expected) {
    if (Array.isArray(expected)) {
      if (!Array.isArray(actual) || actual.length !== expected.length) return false;
      return expected.every(function (item, index) { return equalStateValue(actual[index], item); });
    }
    if (expected && Object.prototype.toString.call(expected) === '[object Object]') {
      if (!actual || Object.prototype.toString.call(actual) !== '[object Object]') return false;
      return Object.keys(expected).every(function (key) {
        return equalStateValue(actual[key], expected[key]);
      });
    }
    return actual === expected;
  }

  /* 匹配卡片 when：各条件为 AND；`.includes` 后缀表达数组包含。 */
  function matchesWhen(when, appState) {
    if (!when || Object.prototype.toString.call(when) !== '[object Object]') return true;
    return Object.keys(when).every(function (path) {
      var includesSuffix = '.includes';
      if (path.slice(-includesSuffix.length) === includesSuffix) {
        var collection = readStatePath(appState, path.slice(0, -includesSuffix.length));
        return Array.isArray(collection) && collection.indexOf(when[path]) !== -1;
      }
      return equalStateValue(readStatePath(appState, path), when[path]);
    });
  }

  /* 返回当前应显示的卡片：无 when 的卡片始终显示，有 when 的按组合状态匹配。 */
  function visibleCards() {
    var cards = Array.isArray(state.data.cards) ? state.data.cards : [];
    var appState = window.PrototypeViewers.getState();
    return cards.filter(function (card) {
      return !card.when || matchesWhen(card.when, appState);
    });
  }

  /* 解析稳定 ID 锚点或旧 selector；非法、失效或预览区外目标均视为未绑定。 */
  function resolveTarget(card) {
    var anchor = card && card.target && card.target.anchor;
    if (anchor) {
      var anchored = document.getElementById(anchor);
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
    var data = window.__PROTOTYPE_NOTES__;
    if (!data || !Array.isArray(data.cards)) {
      console.error('[prototype-notes] 缺少有效的 window.__PROTOTYPE_NOTES__ 数据。');
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
    getData: function () { return state.data; }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
