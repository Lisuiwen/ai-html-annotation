/* Timeline 局部状态投影：只同步节点状态和末尾待处理项。 */
(function () {
  'use strict'; var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* 归一化时间线状态。 */
  function normalize(value) { var state = value && typeof value === 'object' ? value : {}; return { items: Array.isArray(state.items) ? state.items : [], pending: !!state.pending }; }
  /* 映射每个节点的状态色和待处理展示。 */
  function render(root, value) { if (!root) return; var state = normalize(value); root.querySelectorAll('.ui-timeline-item').forEach(function (item, index) { var source = state.items[index] || {}; item.dataset.status = ['success', 'warning', 'error', 'info'].indexOf(source.status) !== -1 ? source.status : 'info'; }); var pending = root.querySelector('.ui-timeline-pending'); if (pending) pending.hidden = !state.pending; }
  adapters['data.timeline'] = { normalize: normalize, render: render };
})();