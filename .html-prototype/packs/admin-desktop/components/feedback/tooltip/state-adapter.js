/* Tooltip local state projection: controls visibility and tooltip text. */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* Normalize Tooltip open and text. */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    return { open: !!state.open, text: typeof state.text === 'string' ? state.text : '' };
  }
  /* Sync trigger description relationship, panel visibility, and copy. */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value);
    var trigger = root.querySelector('.ui-tooltip-trigger');
    var panel = root.querySelector('.ui-tooltip-panel');
    if (trigger && panel) {
      trigger.setAttribute('aria-describedby', panel.id || 'uiTooltipPanel');
    }
    if (panel) {
      panel.hidden = !state.open;
      panel.textContent = state.text;
    }
  }
  adapters['feedback.tooltip'] = { normalize: normalize, render: render };
})();
