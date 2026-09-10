/* Mark persistence: still writes to localStorage by page pathname; does not touch prototype.html. */
(function () {
  'use strict';

  var STORE_KEY = 'html-mark:' + location.pathname;

  function serialize(annotations) {
    return annotations.map(function (item) {
      return {
        id: item.id,
        note: item.note,
        label: item.label,
        selector: item.selector,
        path: item.path,
        text: item.text,
        html: item.html,
        relX: item.relX,
        relY: item.relY,
        pageX: item.pageX,
        pageY: item.pageY
      };
    });
  }

  window.AuthorToolsMarkStorage = {
    load: function () {
      try {
        var stored = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
        return Array.isArray(stored) ? stored : [];
      } catch (_) {
        return [];
      }
    },
    save: function (annotations) {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(serialize(annotations)));
      } catch (_) { /* When storage is unavailable, keep in-memory state only. */ }
    }
  };
})();
