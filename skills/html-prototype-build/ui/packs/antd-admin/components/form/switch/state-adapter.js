/* 开关局部状态投影：只同步选中、禁用与加载样式，不处理点击事件。 */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* 归一化开关状态，未知字段回退关闭且可用。 */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    return {
      checked: !!state.checked,
      disabled: !!state.disabled,
      loading: !!state.loading
    };
  }
  /* 同步开关的 ARIA 选中态、禁用与加载修饰类。 */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value);
    root.classList.toggle('is-checked', state.checked);
    root.classList.toggle('is-loading', state.loading);
    root.setAttribute('aria-checked', String(state.checked));
    root.disabled = state.disabled || state.loading;
  }
  adapters['form.switch'] = { normalize: normalize, render: render };
})();
