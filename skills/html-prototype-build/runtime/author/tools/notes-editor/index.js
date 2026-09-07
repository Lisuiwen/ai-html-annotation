/* 正式标注作者编辑器：支持显式原位编辑、卡片增删与可预览的目标重新绑定。 */
(function () {
  'use strict';

  if (window.PrototypeNotesEditor) return;

  var data = window.PrototypeNotesViewer && window.PrototypeNotesViewer.getData();
  var revision = JSON.stringify(data);
  var saving = false;
  var pickCardId = '';
  var pickTooltip = null;

  /* 读取统一协调器中的活动场景。 */
  function getActiveScenario() {
    if (window.PrototypeViewers && typeof window.PrototypeViewers.getActiveScenario === 'function') {
      return window.PrototypeViewers.getActiveScenario() || '';
    }
    return '';
  }

  /* 刷新标注数据时保留运行时活动场景，避免 snapshot 的默认值导致编辑后回跳。 */
  function renderData() {
    var activeScenario = getActiveScenario();
    window.PrototypeNotesViewer.setData(data);
    if (!activeScenario) return;
    if (window.PrototypeViewers && typeof window.PrototypeViewers.activateScenario === 'function') {
      if (window.PrototypeViewers.getActiveScenario() !== activeScenario) {
        window.PrototypeViewers.activateScenario(activeScenario);
      }
    }
  }

  /* 注入只在作者环境出现的编辑控件样式。 */
  function installStyles() {
    var style = document.createElement('style');
    style.textContent = [
      '.pn-notes{display:flex;flex-direction:column;min-height:0;height:100%;overflow:hidden}',
      '.pn-head{flex:0 0 auto}',
      '.pn-cards{flex:1 1 auto;min-height:0;overflow-y:auto}',
      '.pn-author-toolbar{display:flex;align-items:center}',
      '.pn-tool-icon{display:grid;place-items:center;width:32px;height:32px;padding:0;border:0;border-radius:50%;background:var(--ui-primary,#1677ff);color:#fff;box-shadow:none;cursor:pointer;font:500 20px/1 system-ui,sans-serif}',
      '.pn-tool-icon:hover{filter:brightness(.94)}',
      '.pn-editable{cursor:text}.pn-editable:hover{outline:1px dashed #ff8d6b;outline-offset:2px}',
      '.pn-card{position:relative}',
      '.pn-card-title{padding-right:84px;padding-left:22px}',
      '.pn-card-drag-handle{position:absolute;left:4px;top:10px;z-index:2;display:grid;place-items:center;width:22px;height:22px;color:var(--ui-text-secondary,#595959);cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}',
      '.pn-card-drag-handle svg{pointer-events:none}',
      '.pn-card-drag-handle:active,.pn-card.pn-card-dragging .pn-card-drag-handle{cursor:grabbing}',
      '.pn-card.pn-card-dragging{opacity:.45}',
      '.pn-card.pn-card-drop-before{box-shadow:inset 0 2px 0 var(--ui-primary,#1677ff)}',
      '.pn-card.pn-card-drop-after{box-shadow:inset 0 -2px 0 var(--ui-primary,#1677ff)}',
      'body.pn-card-sorting{cursor:grabbing;user-select:none;-webkit-user-select:none}',
      '.pn-card-actions{position:absolute;top:8px;right:8px;display:flex;gap:4px}',
      '.pn-card-icon{display:grid;place-items:center;width:24px;height:24px;padding:0;background:var(--ui-bg,#fff);color:var(--ui-text-secondary,#595959);cursor:pointer}',
      '.pn-card-icon:hover{color:#ff8d6b}',
      '.pn-confirm-pop{position:absolute;top:36px;right:8px;z-index:10025;min-width:160px;padding:10px 12px;border:1px solid var(--ui-border,#d9d9d9);border-radius:8px;background:#fff;box-shadow:0 6px 20px rgba(0,0,0,.16);font-size:12px;color:var(--ui-text,#262626)}',
      '.pn-confirm-pop.pn-confirm-pop--fixed{position:fixed;z-index:2147483000}',
      '.pn-confirm-pop p{margin:0 0 8px;word-break:break-all}',
      '.pn-confirm-pop-actions{display:flex;justify-content:flex-end;gap:6px}',
      '.pn-confirm-pop-actions button{padding:4px 10px;border:1px solid var(--ui-border,#d9d9d9);border-radius:6px;background:#fff;color:#262626;cursor:pointer}',
      '.pn-confirm-pop-actions button.pn-danger{background:#b42318;border-color:#b42318;color:#fff}',
      '.pn-picking,.pn-picking *{cursor:crosshair!important}',
      '.pn-pick-preview{outline:2px dashed #ff8d6b!important;outline-offset:2px}',
      '.pn-pick-layer{position:fixed;inset:0;z-index:2147483646;width:100%;height:100%;overflow:visible;pointer-events:none}',
      '.pn-pick-tooltip{position:fixed;z-index:2147483647;max-width:480px;padding:10px 14px;border:1px solid rgba(255,255,255,.18);border-radius:10px;background:rgba(22,22,28,.88);color:#e0e0e0;font:12px/18px system-ui,-apple-system,sans-serif;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);pointer-events:none;opacity:0;transform:translateY(4px);transition:opacity .15s,transform .15s}',
      '.pn-pick-tooltip.pn-pick-tooltip-visible{opacity:1;transform:translateY(0)}',
      '.pn-pick-tooltip .pn-pick-tag{display:inline-block;padding:1px 6px;border-radius:4px;background:rgba(255,141,107,.2);color:#ff8d6b;font-weight:600;margin-right:6px}',
      '.pn-pick-tooltip .pn-pick-path{color:#a0a0a0;word-break:break-all}',
      '.pn-pick-tooltip .pn-pick-token{color:#e07bff;font-family:monospace;margin-top:4px}',
      '.pn-pick-tooltip .pn-pick-hint{color:#666;margin-top:6px;font-size:11px}'
    ].join('');
    document.head.appendChild(style);
  }

  function bindIconSvg() {
    return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="1.6" fill="currentColor"/><path d="M8 0v3M8 13v3M0 8h3M13 8h3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
  }

  function deleteIconSvg() {
    return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 4h10M6.5 4V2.8A.8.8 0 0 1 7.3 2h1.4a.8.8 0 0 1 .8.8V4M4.5 4l.6 8.2A1 1 0 0 0 6.1 13h3.8a1 1 0 0 0 1-.8L11.5 4M6.5 6.5v4M9.5 6.5v4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function dragHandleSvg() {
    return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="5" cy="4" r="1.2" fill="currentColor"/><circle cx="11" cy="4" r="1.2" fill="currentColor"/><circle cx="5" cy="8" r="1.2" fill="currentColor"/><circle cx="11" cy="8" r="1.2" fill="currentColor"/><circle cx="5" cy="12" r="1.2" fill="currentColor"/><circle cx="11" cy="12" r="1.2" fill="currentColor"/></svg>';
  }

  function editIconSvg() {
    return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="m3 11.8.5-2.5 6.8-6.8a1 1 0 0 1 1.4 0l1.8 1.8a1 1 0 0 1 0 1.4l-6.8 6.8-2.5.5a1 1 0 0 1-1.2-1.2ZM9.5 3.3l3.2 3.2M3.8 9.6l2.6 2.6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  async function save() {
    if (saving) return;
    saving = true;
    try {
      var response = await fetch('/__prototype-author/notes', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(await response.text());
      revision = JSON.stringify(data);
    } catch (error) {
      console.error('[prototype-author] 保存标注失败。', error);
    } finally {
      saving = false;
    }
  }

  function startEdit(element, getter, setter, multiline) {
    if (element.querySelector('input,textarea')) return;
    var control = document.createElement(multiline ? 'textarea' : 'input');
    control.value = getter() || '';
    control.style.width = '100%';
    control.style.minHeight = multiline ? '72px' : '';
    element.textContent = '';
    element.appendChild(control);
    control.focus();
    control.select();

    function commit() {
      setter(control.value);
      renderData();
      enhance();
      save();
    }

    control.addEventListener('blur', commit, { once: true });
    control.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        renderData();
        enhance();
      } else if (event.key === 'Enter' && (!multiline || event.ctrlKey)) {
        event.preventDefault();
        control.blur();
      }
    });
  }

  /* 新增空白卡片；数据规则由 NotesEditorModel 统一维护。 */
  function addCard() {
    var appState = window.PrototypeViewers && typeof window.PrototypeViewers.getState === 'function'
      ? window.PrototypeViewers.getState()
      : {};
    data.cards.push(window.PrototypeNotesEditorModel.createCard(data.cards, appState));
    renderData();
    enhance();
    save();
  }

  function closeConfirm() {
    var pop = document.querySelector('.pn-confirm-pop');
    if (pop) pop.remove();
  }

  function requestDelete(card, article, icon) {
    closeConfirm();
    var pop = document.createElement('div');
    pop.className = 'pn-confirm-pop pn-confirm-pop--fixed';
    pop.innerHTML = '<p>删除「' + (card.title || '未命名说明') + '」？</p><div class="pn-confirm-pop-actions"><button type="button" class="pn-cancel">取消</button><button type="button" class="pn-danger">删除</button></div>';
    pop.querySelector('.pn-cancel').addEventListener('click', closeConfirm);
    pop.querySelector('.pn-danger').addEventListener('click', function () {
      closeConfirm();
      data.cards = window.PrototypeNotesEditorModel.removeCard(data.cards, card.id);
      renderData();
      enhance();
      save();
    });
    document.body.appendChild(pop);
    var rect = icon.getBoundingClientRect();
    var gap = 6;
    var top = rect.bottom + gap;
    var left = rect.right - pop.offsetWidth;
    if (left < 8) left = 8;
    if (left + pop.offsetWidth > window.innerWidth - 8) left = window.innerWidth - pop.offsetWidth - 8;
    if (top + pop.offsetHeight > window.innerHeight - 8) top = rect.top - pop.offsetHeight - gap;
    pop.style.top = Math.max(8, top) + 'px';
    pop.style.left = left + 'px';
  }

  function resolvePickTarget(el) {
    var cur = el;
    while (cur && cur.nodeType === 1 && cur !== document.body && cur !== document.documentElement) {
      if (window.PrototypeAuthorChrome && window.PrototypeAuthorChrome.isOverlay(cur)) return null;
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
    return el && el.nodeType === 1 ? el : null;
  }

  function isPickBlocked(el) {
    if (!el || !el.closest) return true;
    if (el.closest('.pn-notes,.pn-author-toolbar,.mm-ui,.mm-pin,.mm-note-pop,.pn-pick-tooltip')) return true;
    if (window.PrototypeAuthorChrome && window.PrototypeAuthorChrome.isOverlay(el)) return true;
    return false;
  }

  function getPickTooltip() {
    if (pickTooltip) return pickTooltip;
    pickTooltip = document.createElement('div');
    pickTooltip.className = 'pn-pick-tooltip';
    pickTooltip.setAttribute('aria-hidden', 'true');
    document.body.appendChild(pickTooltip);
    return pickTooltip;
  }

  function hidePickTooltip() {
    if (pickTooltip) pickTooltip.classList.remove('pn-pick-tooltip-visible');
  }

  function showPickTooltip(event, el) {
    var tip = getPickTooltip();
    var tag = el.tagName.toLowerCase();
    var cls = el.className && typeof el.className === 'string' ? el.className.split(' ').filter(Boolean)[0] : '';
    var token = el.getAttribute('data-insp-target');
    tip.innerHTML = [
      '<span class="pn-pick-tag">&lt;' + tag + '&gt;</span>',
      cls ? '<span class="pn-pick-tag">' + cls + '</span>' : '',
      '<div class="pn-pick-path">' + window.AuthorToolsSelector.cssPath(el) + '</div>',
      token ? '<div class="pn-pick-token">' + token + '</div>' : '',
      '<div class="pn-pick-hint">Click to bind</div>'
    ].join('');
    var x = event.clientX + 16;
    var y = event.clientY + 16;
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
    tip.classList.add('pn-pick-tooltip-visible');
    var rect = tip.getBoundingClientRect();
    if (x + rect.width > window.innerWidth) x = event.clientX - rect.width - 16;
    if (y + rect.height > window.innerHeight) y = event.clientY - rect.height - 16;
    tip.style.left = Math.max(8, x) + 'px';
    tip.style.top = Math.max(8, y) + 'px';
  }

  function startPick(cardId) {
    stopPick();
    pickCardId = cardId;
    if (window.PrototypeAuthor) window.PrototypeAuthor.activate('notes-target');
    document.body.classList.add('pn-picking');
    if (window.PrototypeNotesViewer) {
      window.PrototypeNotesViewer.setPickCardId(cardId);
      window.PrototypeNotesViewer.draw();
    }
    var origin = pickOrigin();
    var x = origin ? origin.x : window.innerWidth / 2;
    var y = origin ? origin.y : window.innerHeight / 2;
    drawPickLine(x, y, x, y);
  }

  function pickOrigin() {
    var card = document.querySelector('.pn-card[data-note-id="' + cssEscape(pickCardId) + '"]');
    if (!card) return null;
    var rect = card.getBoundingClientRect();
    return { x: rect.left, y: rect.top + rect.height / 2 };
  }

  function stopPick() {
    pickCardId = '';
    document.body.classList.remove('pn-picking');
    document.querySelectorAll('.pn-pick-preview').forEach(function (element) {
      element.classList.remove('pn-pick-preview');
    });
    hidePickTooltip();
    clearPickLine();
    if (window.PrototypeNotesViewer) {
      window.PrototypeNotesViewer.clearPickCardId();
      window.PrototypeNotesViewer.clearHighlights();
      window.PrototypeNotesViewer.draw();
    }
  }

  function getPickLayer() {
    var layer = document.querySelector('.pn-pick-layer');
    if (layer) return layer;
    layer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    layer.setAttribute('class', 'pn-pick-layer');
    document.body.appendChild(layer);
    return layer;
  }

  function drawPickLine(x1, y1, x2, y2) {
    var layer = getPickLayer();
    layer.innerHTML = '';
    var mx = x1 + (x2 - x1) / 2;
    var card = document.querySelector('.pn-card[data-note-id="' + cssEscape(pickCardId) + '"]');
    var index = card ? Array.from(document.querySelectorAll('.pn-card')).indexOf(card) + 1 : 0;
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    line.setAttribute('d', 'M ' + x1 + ' ' + y1 + ' C ' + mx + ' ' + y1 + ', ' + mx + ' ' + y2 + ', ' + x2 + ' ' + y2);
    line.setAttribute('class', 'pn-line');
    layer.appendChild(line);
    var badge = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    badge.setAttribute('cx', mx);
    badge.setAttribute('cy', (y1 + y2) / 2);
    badge.setAttribute('r', '10');
    badge.setAttribute('class', 'pn-line-badge');
    layer.appendChild(badge);
    var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', mx);
    text.setAttribute('y', (y1 + y2) / 2);
    text.setAttribute('class', 'pn-line-text');
    text.textContent = String(index);
    layer.appendChild(text);
  }

  function clearPickLine() {
    var layer = document.querySelector('.pn-pick-layer');
    if (layer) layer.remove();
  }

  /* Notes 绑定目标描述统一复用 author/core/selector.js。 */
  function targetFor(element) {
    return window.AuthorToolsSelector.noteTarget(element);
  }

  function handlePick(event) {
    if (!pickCardId) return;
    if (isPickBlocked(event.target)) return;
    var target = resolvePickTarget(event.target);
    if (!target || isPickBlocked(target)) return;
    event.preventDefault();
    event.stopPropagation();
    var card = data.cards.find(function (item) { return item.id === pickCardId; });
    if (card) card.target = targetFor(target);
    stopPick();
    renderData();
    enhance();
    save();
  }

  function handlePickPreview(event) {
    document.querySelectorAll('.pn-pick-preview').forEach(function (element) {
      element.classList.remove('pn-pick-preview');
    });
    if (!pickCardId) {
      hidePickTooltip();
      return;
    }
    var origin = pickOrigin();
    if (origin) drawPickLine(origin.x, origin.y, event.clientX, event.clientY);
    if (isPickBlocked(event.target)) {
      hidePickTooltip();
      return;
    }
    var target = resolvePickTarget(event.target);
    if (!target) {
      hidePickTooltip();
      return;
    }
    target.classList.add('pn-pick-preview');
    showPickTooltip(event, target);
  }

  function handlePickKeydown(event) {
    if (pickCardId && event.key === 'Escape') {
      event.preventDefault();
      stopPick();
      if (window.PrototypeAuthor) window.PrototypeAuthor.activate('');
    }
  }

  /* 按当前可见卡片的新顺序写回 data.cards，隐藏组卡片保持原相对位置。 */
  function applyVisibleOrder(visibleIds) {
    data.cards = window.PrototypeNotesEditorModel.applyVisibleOrder(data.cards, visibleIds);
    renderData();
    enhance();
    save();
  }

  var sortState = null;

  function clearDropMarkers() {
    document.querySelectorAll('.pn-card-drop-before,.pn-card-drop-after').forEach(function (el) {
      el.classList.remove('pn-card-drop-before', 'pn-card-drop-after');
    });
  }

  function resolveDropTarget(clientY) {
    if (!sortState) return null;
    var cards = Array.prototype.slice.call(document.querySelectorAll('.pn-card'));
    var target = null;
    var placeAfter = false;
    cards.forEach(function (card) {
      if (card.dataset.noteId === sortState.fromId) return;
      var rect = card.getBoundingClientRect();
      if (clientY < rect.top || clientY > rect.bottom) return;
      target = card;
      placeAfter = clientY > rect.top + rect.height / 2;
    });
    return target ? { card: target, placeAfter: placeAfter } : null;
  }

  function onSortPointerMove(event) {
    if (!sortState || event.pointerId !== sortState.pointerId) return;
    if (!sortState.active && Math.hypot(event.clientX - sortState.x, event.clientY - sortState.y) > 4) {
      sortState.active = true;
      sortState.article.classList.add('pn-card-dragging');
      document.body.classList.add('pn-card-sorting');
    }
    if (!sortState.active) return;
    clearDropMarkers();
    var drop = resolveDropTarget(event.clientY);
    if (!drop) return;
    drop.card.classList.add(drop.placeAfter ? 'pn-card-drop-after' : 'pn-card-drop-before');
    sortState.dropId = drop.card.dataset.noteId;
    sortState.placeAfter = drop.placeAfter;
  }

  function onSortPointerUp(event) {
    if (!sortState || event.pointerId !== sortState.pointerId) return;
    var fromId = sortState.fromId;
    var dropId = sortState.dropId;
    var placeAfter = sortState.placeAfter;
    var wasActive = sortState.active;
    sortState.article.classList.remove('pn-card-dragging');
    document.body.classList.remove('pn-card-sorting');
    clearDropMarkers();
    document.removeEventListener('pointermove', onSortPointerMove, true);
    document.removeEventListener('pointerup', onSortPointerUp, true);
    document.removeEventListener('pointercancel', onSortPointerUp, true);
    sortState = null;
    if (!wasActive || !dropId || dropId === fromId) return;
    var visibleIds = Array.prototype.map.call(document.querySelectorAll('.pn-card'), function (card) {
      return card.dataset.noteId;
    });
    var reordered = window.PrototypeNotesEditorModel.reorderVisibleIds(visibleIds, fromId, dropId, placeAfter);
    if (reordered.indexOf(fromId) < 0 || reordered.indexOf(dropId) < 0) return;
    applyVisibleOrder(reordered);
  }

  function bindCardDrag(article) {
    var handle = article.querySelector('.pn-card-drag-handle');
    if (!handle || handle.dataset.pnDragBound) return;
    handle.dataset.pnDragBound = 'true';
    handle.addEventListener('pointerdown', function (event) {
      if (event.button !== undefined && event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      if (handle.setPointerCapture) handle.setPointerCapture(event.pointerId);
      sortState = {
        pointerId: event.pointerId,
        fromId: article.dataset.noteId,
        article: article,
        x: event.clientX,
        y: event.clientY,
        active: false,
        dropId: '',
        placeAfter: false
      };
      document.addEventListener('pointermove', onSortPointerMove, true);
      document.addEventListener('pointerup', onSortPointerUp, true);
      document.addEventListener('pointercancel', onSortPointerUp, true);
    });
  }

  function enhance() {
    if (!data) return;
    var head = document.querySelector('.pn-head');
    if (head) {
      bindEditable(head.querySelector('strong'), function () { return data.header.title; }, function (value) { data.header.title = value; }, false);
      bindEditable(head.querySelector('span'), function () { return data.header.subtitle; }, function (value) { data.header.subtitle = value; }, false);
    }
    document.querySelectorAll('.pn-card').forEach(function (article) {
      var card = data.cards.find(function (item) { return item.id === article.dataset.noteId; });
      if (!card) return;
      if (!article.querySelector('.pn-card-drag-handle')) {
        var dragHandle = document.createElement('div');
        dragHandle.className = 'pn-card-drag-handle';
        dragHandle.title = '拖动排序';
        dragHandle.setAttribute('aria-label', '拖动排序');
        dragHandle.innerHTML = dragHandleSvg();
        article.querySelector('.pn-card-title').prepend(dragHandle);
        bindCardDrag(article);
      }
      if (article.querySelector('.pn-card-actions')) return;
      bindEditable(article.querySelector('.pn-title-text'), function () { return card.title; }, function (value) { card.title = value; }, false);
      bindEditable(article.querySelector('p'), function () { return card.body; }, function (value) { card.body = value; }, true);
      var actions = document.createElement('div');
      actions.className = 'pn-card-actions';
      var edit = document.createElement('div');
      edit.className = 'pn-card-icon';
      edit.type = 'button';
      edit.title = '编辑说明';
      edit.setAttribute('aria-label', '编辑说明');
      edit.innerHTML = editIconSvg();
      edit.addEventListener('click', function () {
        startEdit(article.querySelector('p'), function () { return card.body; }, function (value) { card.body = value; }, true);
      });
      var bind = document.createElement('div');
      bind.className = 'pn-card-icon';
      bind.type = 'button';
      bind.title = card.target && (card.target.anchor || card.target.selector) ? '重新绑定目标' : '绑定目标';
      bind.setAttribute('aria-label', bind.title);
      bind.innerHTML = bindIconSvg();
      bind.addEventListener('click', function () { startPick(card.id); });
      var remove = document.createElement('div');
      remove.className = 'pn-card-icon';
      remove.type = 'button';
      remove.title = '删除说明';
      remove.setAttribute('aria-label', '删除说明');
      remove.innerHTML = deleteIconSvg();
      remove.addEventListener('click', function () { requestDelete(card, article, remove); });
      actions.appendChild(edit);
      actions.appendChild(bind);
      actions.appendChild(remove);
      article.appendChild(actions);
    });
    buildToolbar();
  }

  function bindEditable(element, getter, setter, multiline) {
    if (!element || element.dataset.pnEditableBound) return;
    element.dataset.pnEditableBound = 'true';
    element.classList.add('pn-editable');
    element.addEventListener('dblclick', function () { startEdit(element, getter, setter, multiline); });
  }

  function buildToolbar() {
    var actions = document.querySelector('.pn-panel-actions');
    if (!actions) return null;
    var existing = document.querySelector('.pn-author-toolbar');
    if (existing && existing.parentElement === actions) return existing;
    if (existing) existing.remove();
    var toolbar = document.createElement('div');
    toolbar.className = 'pn-author-toolbar';
    toolbar.innerHTML = '<div class="pn-tool-icon pn-add-card" role="button" tabindex="0" title="新增说明" aria-label="新增说明">+</div>';
    var add = toolbar.querySelector('.pn-add-card');
    add.addEventListener('click', addCard);
    add.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      addCard();
    });
    var before = actions.querySelector('.pn-toggle') || null;
    actions.insertBefore(toolbar, before);
    return toolbar;
  }

  function init() {
    if (!data) {
      console.error('[prototype-author] Viewer 尚未初始化，无法启动标注编辑器。');
      return;
    }
    if (!window.AuthorToolsSelector) {
      console.error('[prototype-author] 缺少 AuthorToolsSelector，无法启动标注编辑器。');
      return;
    }
    if (!window.PrototypeNotesEditorModel) {
      console.error('[prototype-author] 缺少 PrototypeNotesEditorModel，无法启动标注编辑器。');
      return;
    }
    installStyles();
    buildToolbar();
    enhance();
    document.addEventListener('click', handlePick, true);
    document.addEventListener('mousemove', handlePickPreview, true);
    document.addEventListener('keydown', handlePickKeydown, true);
    new MutationObserver(enhance).observe(document.querySelector('.pn-notes'), { childList: true, subtree: true });
    if (window.PrototypeAuthor) window.PrototypeAuthor.register('notes-target', stopPick);
    window.addEventListener('beforeunload', function (event) {
      if (!saving && JSON.stringify(data) === revision) return;
      event.preventDefault();
      event.returnValue = '';
    });
  }

  function cssEscape(value) {
    return window.CSS && CSS.escape ? CSS.escape(String(value)) : String(value).replace(/["\\]/g, '\\$&');
  }

  window.PrototypeNotesEditor = { init: init, save: save };
  init();
})();
