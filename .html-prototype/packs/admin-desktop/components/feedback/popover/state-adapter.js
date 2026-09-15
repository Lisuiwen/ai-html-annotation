/* Popover local state projection: controls visibility and title; content area retains DOM. */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* Normalize Popover open and optional title. */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    return {
      open: !!state.open,
      title: typeof state.title === 'string' ? state.title : undefined
    };
  }
  /* Sync trigger, panel visibility, and title area. */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value);
    var trigger = root.querySelector('.ui-popover-trigger');
    var panel = root.querySelector('.ui-popover-panel');
    var title = root.querySelector('.ui-popover-title');
    if (trigger) trigger.setAttribute('aria-expanded', String(state.open));
    if (panel) panel.hidden = !state.open;
    if (title) {
      var hasTitle = typeof state.title === 'string' && state.title.length > 0;
      title.hidden = !hasTitle;
      if (hasTitle) title.textContent = state.title;
    }
  }
  adapters['feedback.popover'] = { normalize: normalize, render: render };
})();
