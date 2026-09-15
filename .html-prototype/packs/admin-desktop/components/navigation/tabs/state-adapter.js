/* Tabs local state projection: invoked by final prototype Adapter; does not register click handlers itself. */
(function () {
  'use strict';

  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};

  /* Normalize selected Tab ID; default to first declared Tab when missing. */
  function normalize(root, value) {
    var tabs = root ? root.querySelectorAll('[role="tab"]') : [];
    var fallback = tabs.length ? tabs[0].id : '';
    return typeof value === 'string' && value ? value : fallback;
  }

  /* Sync Tab selection semantics and associated Panel hidden output. */
  function render(root, value) {
    if (!root) return;
    var selectedId = normalize(root, value);
    root.querySelectorAll('[role="tab"]').forEach(function (tab) {
      tab.setAttribute('aria-selected', String(tab.id === selectedId));
    });
    root.querySelectorAll('[role="tabpanel"]').forEach(function (panel) {
      var active = panel.getAttribute('aria-labelledby') === selectedId;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
  }

  adapters['navigation.tabs'] = { normalize: normalize, render: render };
})();
