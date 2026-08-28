/* 复选组局部状态投影：只同步原生控件选中与禁用属性。 */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* 归一化选择状态，保持组件不承担业务校验。 */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    return { values: Array.isArray(state.values) ? state.values : [], disabled: Array.isArray(state.disabled) ? state.disabled : [], status: state.status === 'error' ? 'error' : 'default' };
  }
  /* 同步原生输入框状态及组级错误标记。 */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value);
    root.classList.toggle('has-error', state.status === 'error');
    root.querySelectorAll('input').forEach(function (input) {
      input.checked = state.values.indexOf(input.value) !== -1;
      input.disabled = state.disabled.indexOf(input.value) !== -1;
    });
  }
  adapters['form.checkbox-group'] = { normalize: normalize, render: render };
})();