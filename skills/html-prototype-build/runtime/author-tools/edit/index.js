/* Direct Edit 工具：选 DOM、runtime 预览、结构化写回 prototype.html。 */
(function () {
  'use strict';

  var context = null;
  var container = null;
  var session = null;
  var selected = null;

  function metaOf(el) {
    var tag = el.tagName.toLowerCase();
    var id = el.id ? '#' + el.id : '';
    var cls = (el.className && typeof el.className === 'string')
      ? el.className.trim().split(/\s+/).filter(function (name) {
        return name && name !== 'at-hl' && name !== 'at-hover-hl' && name !== 'mm-hover-hl' && name !== 'mm-target-hl';
      }).map(function (name) { return '.' + name; }).join(' ')
      : '';
    return { tag: '<' + tag + '>', id: id, classes: cls };
  }

  function render() {
    if (!container || !window.AuthorToolsEditPanel) return;
    window.AuthorToolsEditPanel.render(container, session, selected ? metaOf(selected) : {});
    bindPanel();
  }

  function bindPanel() {
    if (!container) return;
    container.querySelectorAll('input, select').forEach(function (input) {
      input.addEventListener('input', function () {
        if (!session) return;
        var prop = input.getAttribute('data-prop');
        if (prop === 'text') session.setText(input.value);
        else session.previewStyle(prop, input.value);
        render();
        var focus = container.querySelector('[data-prop="' + prop + '"]' + (input.type === 'color' ? '[type="color"]' : ':not([type="color"])'));
        if (focus) {
          focus.focus();
          if (input.type !== 'color' && focus.setSelectionRange && typeof input.selectionStart === 'number') {
            focus.setSelectionRange(input.selectionStart, input.selectionEnd);
          }
        }
      });
    });
    container.querySelectorAll('[data-reset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!session) return;
        session.resetProperty(btn.getAttribute('data-reset'));
        render();
      });
    });
    container.querySelectorAll('[data-act]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var act = btn.getAttribute('data-act');
        if (act === 'cancel') discard();
        else if (act === 'reset') {
          if (session) session.resetElement();
          render();
        } else if (act === 'save') save();
      });
    });
  }

  function selectElement(el) {
    if (session && session.isDirty() && el !== selected) {
      if (selected) {
        el.classList.remove('at-hl');
        selected.classList.add('at-hl');
      }
      if (context && context.toast) context.toast('请先保存或取消当前修改');
      return;
    }
    selected = el;
    session = window.AuthorToolsStyleModel.createSession(el);
    render();
  }

  function discard() {
    if (session) session.discard();
    render();
  }

  function save() {
    if (!session || !session.isDirty() || !selected) return;
    var selector = window.AuthorToolsPicker.stableSelector(selected);
    if (!selector || (selector.charAt(0) !== '#' && selector.charAt(0) !== '[')) {
      if (context && context.toast) context.toast('该元素缺少稳定 id，无法保存');
      return;
    }
    var patch = session.toPatch();
    fetch('/__prototype-author/edit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ selector: selector, changes: patch })
    }).then(function (res) {
      if (!res.ok) return res.text().then(function (msg) { throw new Error(msg || res.statusText); });
      session = window.AuthorToolsStyleModel.createSession(selected);
      render();
      if (context && context.toast) context.toast('已写入 prototype.html');
    }).catch(function (error) {
      if (context && context.toast) context.toast('保存失败：' + error.message);
    });
  }

  function activate() {
    if (!window.AuthorToolsPicker) return;
    window.AuthorToolsPicker.activate({
      owner: 'edit',
      hoverClass: 'at-hover-hl',
      selectedClass: 'at-hl',
      onSelect: selectElement
    });
  }

  function deactivate() {
    if (window.AuthorToolsPicker) window.AuthorToolsPicker.release('edit');
  }

  window.AuthorToolsEditTool = {
    mount: function (el, ctx) {
      container = el;
      context = ctx;
      render();
    },
    activate: activate,
    deactivate: deactivate,
    destroy: function () {
      deactivate();
      if (session) session.discard();
      session = null;
      selected = null;
    },
    isDirty: function () { return !!(session && session.isDirty()); },
    discard: discard
  };
})();
