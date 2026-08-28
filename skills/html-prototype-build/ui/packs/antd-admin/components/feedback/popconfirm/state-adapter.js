/* Popconfirm 局部状态投影：控制可见性与确认中的禁用状态。 */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* 归一化确认浮层状态。 */
  function normalize(value) { var state = value && typeof value === 'object' ? value : {}; return { open: !!state.open, status: ['default', 'danger', 'loading'].indexOf(state.status) !== -1 ? state.status : 'default' }; }
  /* 同步触发器、浮层和确认按钮语义。 */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value); var trigger = root.querySelector('.ui-popconfirm-trigger'); var panel = root.querySelector('.ui-popconfirm-panel'); var confirm = root.querySelector('.ui-popconfirm-confirm');
    root.classList.toggle('is-danger', state.status === 'danger'); if (trigger) trigger.setAttribute('aria-expanded', String(state.open)); if (panel) panel.hidden = !state.open; if (confirm) { confirm.disabled = state.status === 'loading'; confirm.textContent = state.status === 'loading' ? '处理中' : '确定'; }
  }
  adapters['feedback.popconfirm'] = { normalize: normalize, render: render };
})();