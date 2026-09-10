/* Timeline local state projection: syncs node states and trailing pending item only. */
(function () {
  'use strict'; var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* Normalize timeline state. */
  function normalize(value) { var state = value && typeof value === 'object' ? value : {}; return { items: Array.isArray(state.items) ? state.items : [], pending: !!state.pending }; }
  /* Map each node status color and pending display. */
  function render(root, value) { if (!root) return; var state = normalize(value); root.querySelectorAll('.ui-timeline-item').forEach(function (item, index) { var source = state.items[index] || {}; item.dataset.status = ['success', 'warning', 'error', 'info'].indexOf(source.status) !== -1 ? source.status : 'info'; }); var pending = root.querySelector('.ui-timeline-pending'); if (pending) pending.hidden = !state.pending; }
  adapters['data.timeline'] = { normalize: normalize, render: render };
})();