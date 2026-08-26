/* 正式标注作者编辑器：支持显式原位编辑、卡片增删与可预览的目标重新绑定。 */
(function () {
  'use strict';

  if (window.PrototypeNotesEditor) return;

  var data = window.PrototypeNotesViewer && window.PrototypeNotesViewer.getData();
  var revision = JSON.stringify(data);
  var saving = false;
  var pickCardId = '';
  var pickTooltip = null;

  /* 注入只在作者环境出现的编辑控件样式。 */
  function installStyles() {
    var style = document.createElement('style');
    style.textContent = [
      '.pn-notes{display:flex;flex-direction:column}',
      '.pn-head,.pn-cards{flex:0 0 auto}',
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

  /* 返回「重新绑定」定位十字图标的内联 SVG。 */
  function bindIconSvg() {
    return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="1.6" fill="currentColor"/><path d="M8 0v3M8 13v3M0 8h3M13 8h3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
  }

  /* 返回「删除」垃圾桶图标的内联 SVG。 */
  function deleteIconSvg() {
    return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 4h10M6.5 4V2.8A.8.8 0 0 1 7.3 2h1.4a.8.8 0 0 1 .8.8V4M4.5 4l.6 8.2A1 1 0 0 0 6.1 13h3.8a1 1 0 0 0 1-.8L11.5 4M6.5 6.5v4M9.5 6.5v4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  /* 返回「拖动排序」握把图标的内联 SVG。 */
  function dragHandleSvg() {
    return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="5" cy="4" r="1.2" fill="currentColor"/><circle cx="11" cy="4" r="1.2" fill="currentColor"/><circle cx="5" cy="8" r="1.2" fill="currentColor"/><circle cx="11" cy="8" r="1.2" fill="currentColor"/><circle cx="5" cy="12" r="1.2" fill="currentColor"/><circle cx="11" cy="12" r="1.2" fill="currentColor"/></svg>';
  }

  /* 返回「编辑」铅笔图标的内联 SVG。 */
  function editIconSvg() {
    return '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="m3 11.8.5-2.5 6.8-6.8a1 1 0 0 1 1.4 0l1.8 1.8a1 1 0 0 1 0 1.4l-6.8 6.8-2.5.5a1 1 0 0 1-1.2-1.2ZM9.5 3.3l3.2 3.2M3.8 9.6l2.6 2.6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  /* 把当前内存对象序列化为唯一 snapshot 文件并请求本地服务原子写入。 */
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

  /* 找到数据字段并在双击后使用输入控件原位编辑。 */
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

    /* 提交当前字段并刷新只读 Viewer。 */
    function commit() {
      setter(control.value);
      window.PrototypeNotesViewer.setData(data);
      enhance();
      save();
    }

    control.addEventListener('blur', commit, { once: true });
    control.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        window.PrototypeNotesViewer.setData(data);
        enhance();
      } else if (event.key === 'Enter' && (!multiline || event.ctrlKey)) {
        event.preventDefault();
        control.blur();
      }
    });
  }

  /* 生成稳定卡片 ID，避免新增卡片覆盖既有数据。 */
  function createCardId() {
    var index = data.cards.length + 1;
    while (data.cards.some(function (card) { return card.id === 'note-' + index; })) index++;
    return 'note-' + index;
  }

  /* 新增一张归入当前组的空白卡片。 */
  function addCard() {
    var id = createCardId();
    data.cards.push({
      id: id,
      group: window.PrototypeNotesViewer.getActiveGroup() || 'base',
      title: '新说明',
      body: '双击编辑说明内容。',
      target: { selector: '', label: '' }
    });
    window.PrototypeNotesViewer.setData(data);
    enhance();
    save();
  }

  /* 关闭卡片内已打开的气泡确认框。 */
  function closeConfirm() {
    var pop = document.querySelector('.pn-confirm-pop');
    if (pop) pop.remove();
  }

  /* 点击删除图标后弹出气泡确认框，确认后删除卡片。 */
  function requestDelete(card, article, icon) {
    closeConfirm();
    var pop = document.createElement('div');
    pop.className = 'pn-confirm-pop';
    pop.innerHTML = '<p>删除「' + (card.title || '未命名说明') + '」？</p><div class="pn-confirm-pop-actions"><button type="button" class="pn-cancel">取消</button><button type="button" class="pn-danger">删除</button></div>';
    pop.querySelector('.pn-cancel').addEventListener('click', closeConfirm);
    pop.querySelector('.pn-danger').addEventListener('click', function () {
      data.cards = data.cards.filter(function (item) { return item.id !== card.id; });
      article.remove();
      window.PrototypeNotesViewer.setData(data);
      enhance();
      save();
    });
    icon.parentElement.appendChild(pop);
  }

  /* 与 Mark 对齐：从点击点向上找最近可绑定语义单元。 */
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
      }
      if (cur.id) return cur;
      if (cur.getAttribute && cur.getAttribute('aria-label')) return cur;
      cur = cur.parentElement;
    }
    return el && el.nodeType === 1 ? el : null;
  }

  /* 判断拾取模式下不可绑定的区域。 */
  function isPickBlocked(el) {
    if (!el || !el.closest) return true;
    if (el.closest('.pn-notes,.pn-author-toolbar,.mm-ui,.mm-pin,.mm-note-pop,.pn-pick-tooltip')) return true;
    if (window.PrototypeAuthorChrome && window.PrototypeAuthorChrome.isOverlay(el)) return true;
    return false;
  }

  /* 生成绑定预览用的 CSS 路径。 */
  function cssPathForPick(el) {
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
        var sameTag = Array.prototype.filter.call(parent.children, function (child) {
          return child.tagName === cur.tagName;
        });
        if (sameTag.length > 1) sel += ':nth-of-type(' + (sameTag.indexOf(cur) + 1) + ')';
      }
      parts.unshift(sel);
      cur = parent;
    }
    return parts.length ? 'body > ' + parts.join(' > ') : '';
  }

  /* 创建拾取模式玻璃浮层。 */
  function getPickTooltip() {
    if (pickTooltip) return pickTooltip;
    pickTooltip = document.createElement('div');
    pickTooltip.className = 'pn-pick-tooltip';
    pickTooltip.setAttribute('aria-hidden', 'true');
    document.body.appendChild(pickTooltip);
    return pickTooltip;
  }

  /* 隐藏拾取浮层。 */
  function hidePickTooltip() {
    if (pickTooltip) pickTooltip.classList.remove('pn-pick-tooltip-visible');
  }

  /* 在候选目标旁展示标签、路径与 insp token。 */
  function showPickTooltip(event, el) {
    var tip = getPickTooltip();
    var tag = el.tagName.toLowerCase();
    var cls = el.className && typeof el.className === 'string' ? el.className.split(' ').filter(Boolean)[0] : '';
    var token = el.getAttribute('data-insp-target');
    tip.innerHTML = [
      '<span class="pn-pick-tag">&lt;' + tag + '&gt;</span>',
      cls ? '<span class="pn-pick-tag">' + cls + '</span>' : '',
      '<div class="pn-pick-path">' + cssPathForPick(el) + '</div>',
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

  /* 开启一次目标选择：从卡片出发，SVG 线头跟随鼠标，点中 DOM 后绑定。 */
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

  /* 返回当前拾取卡片左侧中点，作为临时连线的固定起点。 */
  function pickOrigin() {
    var card = document.querySelector('.pn-card[data-note-id="' + cssEscape(pickCardId) + '"]');
    if (!card) return null;
    var rect = card.getBoundingClientRect();
    return { x: rect.left, y: rect.top + rect.height / 2 };
  }

  /* 退出目标选择模式，供 Mark 或后续 Inspector 抢占点击模式时调用。 */
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

  /* 创建独立顶层 SVG 预览线，避免受原型 stacking context 或裁切影响。 */
  function getPickLayer() {
    var layer = document.querySelector('.pn-pick-layer');
    if (layer) return layer;
    layer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    layer.setAttribute('class', 'pn-pick-layer');
    document.body.appendChild(layer);
    return layer;
  }

  /* 按正式连线样式绘制从卡片到鼠标的曲线、序号徽标和目标端。 */
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

  /* 清除跟随预览线层。 */
  function clearPickLine() {
    var layer = document.querySelector('.pn-pick-layer');
    if (layer) layer.remove();
  }

  /* 根据元素现有 ID、稳定属性或 DOM 路径生成 selector，不修改原型 HTML。 */
  function selectorFor(element) {
    if (element.id) return '#' + (window.CSS && CSS.escape ? CSS.escape(element.id) : element.id);
    var existing = element.getAttribute('data-prototype-note-target');
    if (existing) return '[data-prototype-note-target="' + existing.replace(/"/g, '\\"') + '"]';
    var parts = [];
    var current = element;
    while (current && current !== document.body && current !== document.documentElement && !current.classList.contains('pn-preview')) {
      var part = current.tagName.toLowerCase();
      var siblings = current.parentElement ? Array.from(current.parentElement.children).filter(function (child) {
        return child.tagName === current.tagName;
      }) : [];
      if (siblings.length > 1) part += ':nth-of-type(' + (siblings.indexOf(current) + 1) + ')';
      parts.unshift(part);
      current = current.parentElement;
    }
    return parts.join(' > ');
  }

  /* 处理目标选择点击，作者工具区域和右侧说明区域不可作为绑定目标。 */
  function handlePick(event) {
    if (!pickCardId) return;
    if (isPickBlocked(event.target)) return;
    var target = resolvePickTarget(event.target);
    if (!target || isPickBlocked(target)) return;
    event.preventDefault();
    event.stopPropagation();
    var card = data.cards.find(function (item) { return item.id === pickCardId; });
    if (card) {
      card.target = {
        selector: selectorFor(target),
        label: (target.getAttribute('aria-label') || target.textContent || target.tagName).trim().slice(0, 60)
      };
    }
    stopPick();
    window.PrototypeNotesViewer.setData(data);
    enhance();
    save();
  }

  /* 在选择模式中高亮候选目标、展示浮层，并让临时连线目标端实时跟随鼠标。 */
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

  /* Esc 取消拾取，不改动原绑定，并清理临时线与候选高亮。 */
  function handlePickKeydown(event) {
    if (pickCardId && event.key === 'Escape') {
      event.preventDefault();
      stopPick();
      if (window.PrototypeAuthor) window.PrototypeAuthor.activate('');
    }
  }

  /* 按当前可见卡片的新顺序写回 data.cards，隐藏组卡片保持原相对位置。 */
  function applyVisibleOrder(visibleIds) {
    var visibleSet = {};
    visibleIds.forEach(function (id) { visibleSet[id] = true; });
    var queue = visibleIds.map(function (id) {
      return data.cards.find(function (card) { return card.id === id; });
    }).filter(Boolean);
    var qi = 0;
    data.cards = data.cards.map(function (card) {
      if (!visibleSet[card.id]) return card;
      return queue[qi++];
    });
    window.PrototypeNotesViewer.setData(data);
    enhance();
    save();
  }

  var sortState = null;

  /* 清除排序过程中的放置指示样式。 */
  function clearDropMarkers() {
    document.querySelectorAll('.pn-card-drop-before,.pn-card-drop-after').forEach(function (el) {
      el.classList.remove('pn-card-drop-before', 'pn-card-drop-after');
    });
  }

  /* 根据指针位置计算应插入到目标卡片前还是后。 */
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

  /* 指针排序：在握把按下后跟随移动，松手写入新顺序。 */
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

  /* 结束指针排序并按落点重排卡片。 */
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
    var visibleIds = [];
    var activeGroup = window.PrototypeNotesViewer.getActiveGroup();
    data.cards.forEach(function (card) {
      if ((card.group || 'common') === 'common' || card.group === activeGroup) visibleIds.push(card.id);
    });
    var fromIdx = visibleIds.indexOf(fromId);
    if (fromIdx < 0 || visibleIds.indexOf(dropId) < 0) return;
    visibleIds.splice(fromIdx, 1);
    var insertAt = visibleIds.indexOf(dropId);
    if (placeAfter) insertAt += 1;
    visibleIds.splice(insertAt, 0, fromId);
    applyVisibleOrder(visibleIds);
  }

  /* 为卡片绑定指针拖拽排序，仅握把可发起。 */
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

  /* 为 Viewer 当前渲染的标题、总体信息和卡片挂接作者操作。 */
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
      bind.title = card.target && card.target.selector ? '重新绑定目标' : '绑定目标';
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

  /* 给一个文本节点绑定一次双击编辑行为。 */
  function bindEditable(element, getter, setter, multiline) {
    if (!element || element.dataset.pnEditableBound) return;
    element.dataset.pnEditableBound = 'true';
    element.classList.add('pn-editable');
    element.addEventListener('dblclick', function () { startEdit(element, getter, setter, multiline); });
  }

  /* 在说明面板底部操作区创建唯一的新增说明按钮。 */
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
    /* 保留普通 div 的键盘可操作性。 */
    add.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      addCard();
    });
    actions.insertBefore(toolbar, actions.firstChild);
    return toolbar;
  }

  /* 初始化编辑器并监听 Viewer 重绘后的 DOM。 */
  function init() {
    if (!data) {
      console.error('[prototype-author] Viewer 尚未初始化，无法启动标注编辑器。');
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

  /* 转义属性选择器中的卡片 ID。 */
  function cssEscape(value) {
    return window.CSS && CSS.escape ? CSS.escape(String(value)) : String(value).replace(/["\\]/g, '\\$&');
  }

  window.PrototypeNotesEditor = { init: init, save: save };
  init();
})();
