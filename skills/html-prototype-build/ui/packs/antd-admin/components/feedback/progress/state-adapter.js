/* Progress 局部状态投影：限制百分比并同步进度条 ARIA 属性。 */
(function () {
  'use strict'; var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* 归一化进度状态。 */
  function normalize(value) { var state = value && typeof value === 'object' ? value : {}; var percent = Number(state.percent); return { percent: Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0, status: ['normal', 'active', 'success', 'exception'].indexOf(state.status) !== -1 ? state.status : 'normal' }; }
  /* 同步进度宽度、文字和无障碍数值。 */
  function render(root, value) { if (!root) return; var state = normalize(value); var bar = root.querySelector('.ui-progress-bar'); var text = root.querySelector('.ui-progress-text'); root.dataset.status = state.status; root.setAttribute('aria-valuenow', String(state.percent)); if (bar) bar.style.width = state.percent + '%'; if (text) text.textContent = state.percent + '%'; }
  adapters['feedback.progress'] = { normalize: normalize, render: render };
})();