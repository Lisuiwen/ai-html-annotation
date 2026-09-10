/* Mark 业务：Pin、Note、localStorage、For AI。UI 挂在 Author Tools Drawer 内。 */
(function () {
  'use strict';

  if (window.AuthorToolsMarkTool) return;

  var annotations = [];
  var nextId = 1;
  var activePinId = null;
  var lastHlEl = null;
  var notePop = null;
  var noteOutsideHandler = null;
  var noteOutsideTimer = 0;
  var container = null;
  var context = null;
  var active = false;
  var restored = false;

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function clickModifierLabel() {
    return window.AuthorToolsPlatform ? window.AuthorToolsPlatform.clickModifierLabel() : 'Ctrl';
  }

  function textOf(el) {
    return (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  }

  function describeElement(el) {
    var picker = window.AuthorToolsPicker;
    var target = picker ? picker.resolveTarget(el) : el;
    if (!target) return { label: 'unknown', selector: '', text: '', target: null };
    var selector = picker.stableSelector(target);
    var path = picker.cssPath(target);
    if (target.getAttribute && target.getAttribute('data-mm-label')) {
      return { label: target.getAttribute('data-mm-label'), selector: selector, path: path, text: textOf(target), target: target };
    }
    if (target.id) return { label: '#' + target.id, selector: selector, path: path, text: textOf(target), target: target };
    if (target.getAttribute && target.getAttribute('aria-label')) {
      return { label: target.getAttribute('aria-label'), selector: selector, path: path, text: textOf(target), target: target };
    }
    var tag = target.tagName.toLowerCase();
    return { label: tag, selector: selector, path: path, text: textOf(target), target: target };
  }

  function getContext() {
    var url = location.pathname + (location.hash || '');
    var title = document.title || '';
    return title ? title + ' (' + url + ')' : url;
  }

  function persist() {
    window.AuthorToolsMarkStorage.save(annotations);
  }

  function toast(msg) {
    if (context && context.toast) context.toast(msg);
  }

  function closeNotePop() {
    if (noteOutsideTimer) {
      clearTimeout(noteOutsideTimer);
      noteOutsideTimer = 0;
    }
    if (noteOutsideHandler) {
      document.removeEventListener('mousedown', noteOutsideHandler, true);
      noteOutsideHandler = null;
    }
    if (notePop) {
      notePop.remove();
      notePop = null;
    }
    if (activePinId !== null) {
      var current = annotations.find(function (item) { return item.id === activePinId; });
      if (current && current.pinEl) current.pinEl.classList.remove('mm-pin-active');
      if (container) container.querySelectorAll('.mm-item.active').forEach(function (item) { item.classList.remove('active'); });
      activePinId = null;
    }
  }

  function openNotePop(ann) {
    closeNotePop();
    activePinId = ann.id;
    if (ann.pinEl) ann.pinEl.classList.add('mm-pin-active');
    if (container) {
      container.querySelectorAll('.mm-item').forEach(function (item) {
        item.classList.toggle('active', parseInt(item.dataset.id, 10) === ann.id);
      });
    }
    notePop = document.createElement('div');
    notePop.className = 'mm-note-pop mm-ui';
    notePop.innerHTML =
      '<div class="mm-note-pop-head"><span><b>#' + ann.id + '</b> · ' + esc(ann.label) + '</span>' +
      '<span class="mm-np-text">' + (ann.text ? esc(ann.text) : '') + '</span></div>' +
      '<textarea placeholder="What needs to change here? (optional)"></textarea>' +
      '<div class="mm-note-pop-hint"><span><kbd>↵</kbd> Save · <kbd>⇧↵</kbd> New line · <kbd>Esc</kbd> Close</span>' +
      '<span>' + (ann.note ? 'Editing' : 'New') + '</span></div>';
    document.body.appendChild(notePop);

    var pinRect = ann.pinEl.getBoundingClientRect();
    var popW = notePop.offsetWidth;
    var popH = notePop.offsetHeight;
    var popX = pinRect.right + 10 + window.scrollX;
    var popY = pinRect.top + window.scrollY;
    if (popX + popW > window.scrollX + window.innerWidth - 8) popX = pinRect.left - popW - 10 + window.scrollX;
    if (popX < window.scrollX + 8) popX = window.scrollX + 8;
    if (popY + popH > window.scrollY + window.innerHeight - 8) popY = window.scrollY + window.innerHeight - popH - 8;
    if (popY < window.scrollY + 8) popY = window.scrollY + 8;
    notePop.style.left = popX + 'px';
    notePop.style.top = popY + 'px';

    var ta = notePop.querySelector('textarea');
    ta.value = ann.note || '';
    ta.focus();
    ta.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        ann.note = ta.value.trim();
        closeNotePop();
        render();
        persist();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        closeNotePop();
      }
    });

    function outsideHandler(event) {
      if (!notePop) {
        document.removeEventListener('mousedown', outsideHandler, true);
        return;
      }
      if (notePop.contains(event.target)) return;
      if (event.target.closest && event.target.closest('.mm-pin')) return;
      var val = ta.value.trim();
      if (val !== (ann.note || '')) {
        ann.note = val;
        render();
        persist();
      }
      closeNotePop();
    }
    noteOutsideTimer = setTimeout(function () {
      noteOutsideTimer = 0;
      noteOutsideHandler = outsideHandler;
      document.addEventListener('mousedown', noteOutsideHandler, true);
    }, 0);
  }

  function pinHandlers() {
    return {
      onRemove: removeAnn,
      onOpen: openNotePop
    };
  }

  function createFromSelect(el, event) {
    var desc = describeElement(el);
    if (!desc.target) return false;
    var ann = {
      id: nextId++,
      ctx: getContext(),
      label: desc.label,
      selector: desc.selector,
      path: desc.path,
      text: desc.text,
      html: desc.target.outerHTML ? desc.target.outerHTML.replace(/\s+/g, ' ').slice(0, 200) : '',
      note: '',
      pinEl: null,
      targetEl: desc.target,
      pageX: event ? event.pageX : 0,
      pageY: event ? event.pageY : 0
    };
    if (desc.target.getBoundingClientRect && event) {
      var rect = desc.target.getBoundingClientRect();
      ann.relX = rect.width ? (event.clientX - rect.left) / rect.width : 0.5;
      ann.relY = rect.height ? (event.clientY - rect.top) / rect.height : 0.5;
    }
    window.AuthorToolsMarkPins.build(ann, pinHandlers());
    annotations.push(ann);
    render();
    persist();
    openNotePop(ann);
    return true;
  }

  function removeAnn(id) {
    if (activePinId === id) closeNotePop();
    var found = annotations.find(function (item) { return item.id === id; });
    if (found && found.pinEl) found.pinEl.remove();
    annotations = annotations.filter(function (item) { return item.id !== id; });
    annotations.forEach(function (item, index) {
      var n = index + 1;
      if (item.pinEl && item.pinEl.firstChild) item.pinEl.firstChild.nodeValue = String(n);
      if (item.pinEl) item.pinEl.dataset.id = n;
      item.id = n;
    });
    nextId = annotations.length + 1;
    render();
    persist();
  }

  function clearAll() {
    if (!annotations.length) return;
    closeNotePop();
    var clearedCount = annotations.length;
    annotations.forEach(function (item) { if (item.pinEl) item.pinEl.remove(); });
    annotations = [];
    nextId = 1;
    render();
    persist();
    toast('Cleared ' + clearedCount + ' annotation' + (clearedCount > 1 ? 's' : ''));
  }

  function render() {
    if (!container) return;
    var list = container.querySelector('#mm-list');
    if (!list) return;
    if (!annotations.length) {
      list.innerHTML = '<div class="mm-empty">Hold <kbd>' + esc(clickModifierLabel()) + '</kbd> and click a page element to drop a pin.<br><kbd>M</kbd> opens this tab · <kbd>⌫</kbd> deletes the last one</div>';
      return;
    }
    list.innerHTML = annotations.map(function (ann, index) {
      var hasNote = !!ann.note;
      return '<div class="mm-item ' + (hasNote ? 'has-note' : '') + '" data-id="' + ann.id + '">' +
        '<div class="mm-item-num">' + (index + 1) + '</div>' +
        '<div class="mm-item-body">' +
        (hasNote ? '<div class="mm-item-note">' + esc(ann.note) + '</div>' : '<div class="mm-item-note-empty">No feedback yet · click to add</div>') +
        '<div class="mm-item-meta"><b>' + esc(ann.label) + '</b>' + (ann.text ? ' · ' + esc(ann.text).slice(0, 50) : '') + '</div>' +
        '</div>' +
        '<button class="mm-item-del" data-del="' + ann.id + '" title="Delete">×</button>' +
        '</div>';
    }).join('');
    list.querySelectorAll('.mm-item').forEach(function (item) {
      var id = parseInt(item.dataset.id, 10);
      var ann = annotations.find(function (entry) { return entry.id === id; });
      if (!ann) return;
      item.addEventListener('click', function (event) {
        if (event.target.matches('[data-del]')) return;
        if (ann.pinEl) ann.pinEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(function () { openNotePop(ann); }, 80);
      });
      item.addEventListener('mouseenter', function () {
        if (ann.pinEl) ann.pinEl.classList.add('mm-pin-hl');
        if (ann.targetEl && document.body.contains(ann.targetEl)) {
          lastHlEl = ann.targetEl;
          ann.targetEl.classList.add('mm-target-hl');
        }
      });
      item.addEventListener('mouseleave', function () {
        if (ann.pinEl) ann.pinEl.classList.remove('mm-pin-hl');
        if (lastHlEl) {
          lastHlEl.classList.remove('mm-target-hl');
          lastHlEl = null;
        }
      });
    });
    list.querySelectorAll('[data-del]').forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        event.stopPropagation();
        removeAnn(parseInt(btn.dataset.del, 10));
      });
    });
  }

  function copyAll() {
    if (!annotations.length) {
      toast('No annotations yet — hold ' + clickModifierLabel() + ' and click to drop a pin.');
      return;
    }
    var fmt = container.querySelector('#mm-fmt').value;
    var ctx = getContext();
    var txt = '';
    if (fmt === 'md') {
      txt = '# Annotations — ' + ctx + '\n\n' + annotations.map(function (ann, i) {
        return '**' + (i + 1) + '.** ' + (ann.note || '_(no note)_') + '\n   <sub>' + ann.label +
          (ann.text ? ' · "' + ann.text + '"' : '') + ' · `' + ann.selector + '`</sub>';
      }).join('\n\n');
    } else if (fmt === 'json') {
      txt = JSON.stringify({
        context: ctx,
        annotations: annotations.map(function (ann, i) {
          return { id: i + 1, note: ann.note, label: ann.label, text: ann.text, selector: ann.selector, path: ann.path || '', html: ann.html || '' };
        })
      }, null, 2);
    } else if (fmt === 'ai') {
      txt = 'Apply the following ' + annotations.length + ' review annotation' +
        (annotations.length > 1 ? 's' : '') + ' to this page: ' + ctx + '\n' +
        'Each item has the reviewer\'s note, the exact CSS selector of the annotated element, ' +
        'and an HTML snapshot of that element at review time (for disambiguation if the DOM has changed). ' +
        'Make the requested changes.\n\n' +
        annotations.map(function (ann, i) {
          return (i + 1) + '. ' + (ann.note || '(no written note — the reviewer flagged this element for attention)') + '\n' +
            '   selector: ' + (ann.path || ann.selector) + '\n' +
            (ann.html ? '   element: ' + ann.html + '\n' : '') +
            '   label: ' + ann.label + (ann.text ? ' · "' + ann.text + '"' : '');
        }).join('\n\n');
    } else {
      txt = annotations.map(function (ann, i) {
        return (i + 1) + '. [' + ann.label + (ann.text ? ' "' + ann.text + '"' : '') + ']' + (ann.note ? ': ' + ann.note : '');
      }).join('\n') + '\n\n@ ' + ctx;
    }
    navigator.clipboard.writeText(txt).then(function () {
      toast('✓ Copied ' + annotations.length + ' annotation' + (annotations.length > 1 ? 's' : '') + ' (' + fmt.toUpperCase() + ')');
    }).catch(function () {
      toast('Copy failed — check clipboard permissions.');
    });
  }

  function restore() {
    if (restored) return;
    restored = true;
    var stored = window.AuthorToolsMarkStorage.load();
    stored.forEach(function (item) {
      var target = null;
      var candidates = [];
      if (item.selector) candidates.push(item.selector);
      if (item.path && item.path !== item.selector) candidates.push(item.path);
      for (var i = 0; i < candidates.length && !target; i++) {
        try { target = document.querySelector(candidates[i]); } catch (_) { /* 过期 selector/path。 */ }
      }
      var ann = {
        id: item.id,
        ctx: getContext(),
        label: item.label,
        selector: item.selector,
        path: item.path,
        text: item.text,
        html: item.html,
        note: item.note || '',
        relX: item.relX,
        relY: item.relY,
        pageX: item.pageX,
        pageY: item.pageY,
        targetEl: target,
        pinEl: null
      };
      annotations.push(ann);
      window.AuthorToolsMarkPins.build(ann, pinHandlers());
    });
    nextId = annotations.reduce(function (max, item) { return Math.max(max, item.id); }, 0) + 1;
    render();
    if (annotations.length) toast('Restored ' + annotations.length + ' annotation' + (annotations.length > 1 ? 's' : '') + ' from the previous session');
  }

  function handleKey(event) {
    if (!active) return;
    var inField = event.target.matches && event.target.matches('input, textarea, [contenteditable="true"]');
    if (event.key === 'Escape' && notePop) {
      event.preventDefault();
      event.stopPropagation();
      closeNotePop();
      return;
    }
    if (event.key === 'Backspace' && !inField && annotations.length) {
      event.preventDefault();
      removeAnn(annotations[annotations.length - 1].id);
    }
  }

  function activate() {
    active = true;
    document.body.classList.add('mm-on');
    if (window.AuthorToolsPicker) {
      window.AuthorToolsPicker.activate({
        owner: 'mark',
        hoverClass: 'mm-hover-hl',
        selectedClass: 'mm-target-hl',
        persistSelection: false,
        onSelect: createFromSelect
      });
    }
  }

  function deactivate() {
    active = false;
    document.body.classList.remove('mm-on');
    closeNotePop();
    if (window.AuthorToolsPicker) window.AuthorToolsPicker.release('mark');
  }

  window.AuthorToolsMarkTool = {
    mount: function (el, ctx) {
      container = el;
      context = ctx;
      container.innerHTML =
        '<div class="mm-list mm-ui" id="mm-list"></div>' +
        '<div class="mm-panel-foot mm-ui">' +
        '  <select class="mm-fmt-select" id="mm-fmt">' +
        '    <option value="md">Markdown</option>' +
        '    <option value="txt">Plain text</option>' +
        '    <option value="json">JSON</option>' +
        '    <option value="ai">For AI</option>' +
        '  </select>' +
        '  <button type="button" class="mm-btn" id="mm-clear">Clear</button>' +
        '  <button type="button" class="mm-btn primary" id="mm-copy">Copy all</button>' +
        '</div>';
      container.querySelector('#mm-clear').addEventListener('click', clearAll);
      container.querySelector('#mm-copy').addEventListener('click', copyAll);
      document.addEventListener('keydown', handleKey);
      window.addEventListener('resize', function () {
        window.AuthorToolsMarkPins.scheduleReposition(annotations);
      });
      if (window.ResizeObserver) {
        new ResizeObserver(function () {
          window.AuthorToolsMarkPins.scheduleReposition(annotations);
        }).observe(document.documentElement);
      }
      restore();
    },
    activate: activate,
    deactivate: deactivate,
    destroy: deactivate,
    isDirty: function () { return false; }
  };
})();
