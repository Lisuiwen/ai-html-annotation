/* Shared author-tool selector: stable selector, DOM path, and Notes target description. */
(function () {
  'use strict';

  if (window.AuthorToolsSelector) return;

  function escapeCss(value) {
    return window.CSS && CSS.escape ? CSS.escape(String(value)) : String(value);
  }

  function quoteAttribute(value) {
    return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function cssPath(el) {
    if (!el || el.nodeType !== 1) return '';
    var parts = [];
    var cur = el;
    while (cur && cur.nodeType === 1 && cur !== document.body && cur !== document.documentElement) {
      if (cur.id) {
        parts.unshift('#' + escapeCss(cur.id));
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

  function stableSelector(el) {
    if (!el || el.nodeType !== 1) return '';
    if (el.id) return '#' + escapeCss(el.id);
    var note = el.getAttribute && el.getAttribute('data-prototype-note-target');
    if (note) return '[data-prototype-note-target="' + quoteAttribute(note) + '"]';
    var mark = el.getAttribute && el.getAttribute('data-mm-label');
    if (mark) return '[data-mm-label="' + quoteAttribute(mark) + '"]';
    return cssPath(el);
  }

  function noteSelector(el) {
    if (!el || el.nodeType !== 1) return '';
    var note = el.getAttribute && el.getAttribute('data-prototype-note-target');
    if (note) return '[data-prototype-note-target="' + quoteAttribute(note) + '"]';
    return cssPath(el);
  }

  function noteTarget(el) {
    if (!el || el.nodeType !== 1) return { selector: '', label: '' };
    var label = (el.getAttribute('aria-label') || el.textContent || el.tagName || '').trim().slice(0, 60);
    if (el.id) return { anchor: el.id, label: label };
    return { selector: noteSelector(el), label: label };
  }

  window.AuthorToolsSelector = {
    cssPath: cssPath,
    stableSelector: stableSelector,
    noteSelector: noteSelector,
    noteTarget: noteTarget
  };
})();
