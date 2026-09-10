/* Direct Edit tool: pick DOM, runtime preview, structured write-back to prototype.html. */
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

  function syncPanelAfterInput(input, prop) {
    if (!container || !session) return;
    var dirty = session.isDirty();
    container.querySelectorAll('[data-act="cancel"], [data-act="save"]').forEach(function (btn) {
      btn.disabled = !dirty;
    });

    if (prop && session.rows && session.rows[prop]) {
      var row = session.rows[prop];
      var editRow = input.closest && input.closest('.at-edit-row');
      var source = editRow && editRow.querySelector('.at-src');
      if (source && row.dirty) {
        source.textContent = 'Unsaved';
        source.classList.add('is-dirty');
        source.classList.remove('is-inline', 'is-class');
        source.title = 'Preview only; not written to source yet';
      }
      var wrap = input.closest && input.closest('.at-length-wrap');
      var unit = wrap && wrap.querySelector('.at-unit');
      if (unit) unit.textContent = row.unit || '';
    }

    if (input.type === 'color') {
      var colorText = container.querySelector('[data-prop="' + prop + '"]:not([type="color"])');
      if (colorText && colorText !== input) colorText.value = input.value;
    } else if (prop && /^#[0-9a-f]{6}$/i.test(input.value || '')) {
      var colorInput = container.querySelector('[data-prop="' + prop + '"][type="color"]');
      if (colorInput && colorInput !== input) colorInput.value = input.value;
    }
  }

  function applyPanelInput(input) {
    if (!session) return;
    var prop = input.getAttribute('data-prop');
    if (prop === 'text') session.setText(input.value);
    else session.previewStyle(prop, input.value);
    syncPanelAfterInput(input, prop);
  }

  function bindPanel() {
    if (!container) return;
    container.querySelectorAll('input, select').forEach(function (input) {
      input.addEventListener('input', function () {
        if (input.__atComposing) return;
        applyPanelInput(input);
      });
      input.addEventListener('compositionstart', function () {
        input.__atComposing = true;
      });
      input.addEventListener('compositionend', function () {
        input.__atComposing = false;
        applyPanelInput(input);
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
      if (context && context.toast) context.toast('Save or cancel current edits first');
      return false;
    }
    selected = el;
    session = window.AuthorToolsStyleModel.createSession(el);
    render();
    return true;
  }

  function discard() {
    if (session) session.discard();
    render();
  }

  function save() {
    if (!session || !session.isDirty() || !selected) return;
    var selector = window.AuthorToolsPicker.stableSelector(selected);
    if (!selector || (selector.charAt(0) !== '#' && selector.charAt(0) !== '[')) {
      if (context && context.toast) context.toast('Element lacks a stable id; cannot save');
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
      if (context && context.toast) context.toast('Written to prototype.html');
    }).catch(function (error) {
      if (context && context.toast) context.toast('Save failed: ' + error.message);
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
