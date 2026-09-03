/* 单日期局部状态投影：仅渲染已给定值和可见状态，不处理日历计算。 */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* 归一化单日期状态，未知状态回退默认展示。 */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    var status = ['default', 'error', 'disabled'].indexOf(state.status) !== -1 ? state.status : 'default';
    return {
      open: !!state.open,
      value: typeof state.value === 'string' ? state.value : '',
      status: status
    };
  }
  /* 同步触发器的值、展开、错误和禁用语义。 */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value);
    var trigger = root.querySelector('.ui-date-picker-trigger');
    var output = root.querySelector('.ui-date-picker-value');
    root.classList.toggle('is-open', state.open);
    root.classList.toggle('has-error', state.status === 'error');
    if (trigger) {
      trigger.disabled = state.status === 'disabled';
      trigger.setAttribute('aria-expanded', String(state.open));
    }
    if (output) output.textContent = state.value || '请选择日期';
  }
  adapters['form.date-picker'] = { normalize: normalize, render: render };
})();
