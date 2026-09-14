/* Overlay local state projection: controls target overlay only; does not hold page or scene state. */
(function () {
  'use strict';

  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};

  /* Normalize Overlay open/close field. */
  function normalize(value) {
    return { open: !!(value && typeof value === 'object' ? value.open : value) };
  }

  /* Render overlay visibility, size, and ARIA output within product area bounds. */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value);
    var host = root.closest('.ui-preview, .ui-overlay-host') || document.body;
    root.hidden = !state.open;
    root.classList.toggle('is-open', state.open);
    root.setAttribute('aria-hidden', String(!state.open));
    if (!state.open) {
      root.style.removeProperty('top');
      root.style.removeProperty('height');
      return;
    }
    root.style.top = host.scrollTop + 'px';
    root.style.height = host.clientHeight + 'px';
  }

  adapters['feedback._overlay-core'] = { normalize: normalize, render: render };
})();
