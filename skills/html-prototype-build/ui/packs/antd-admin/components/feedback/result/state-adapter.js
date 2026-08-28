/* Result 局部状态投影：显示业务给定的状态和文案，不处理跳转重试。 */
(function () {
  'use strict'; var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* 归一化结果状态。 */
  function normalize(value) { var state = value && typeof value === 'object' ? value : {}; var status = ['success', 'error', 'warning', 'info'].indexOf(state.status) !== -1 ? state.status : 'info'; return { status: status, title: typeof state.title === 'string' ? state.title : '', subtitle: typeof state.subtitle === 'string' ? state.subtitle : '', actionVisible: state.actionVisible !== false }; }
  /* 投影状态样式、文案和操作区。 */
  function render(root, value) { if (!root) return; var state = normalize(value); root.dataset.status = state.status; var title = root.querySelector('.ui-result-title'); var subtitle = root.querySelector('.ui-result-subtitle'); var action = root.querySelector('.ui-result-action'); if (title) title.textContent = state.title || '操作结果'; if (subtitle) subtitle.textContent = state.subtitle; if (action) action.hidden = !state.actionVisible; }
  adapters['feedback.result'] = { normalize: normalize, render: render };
})();