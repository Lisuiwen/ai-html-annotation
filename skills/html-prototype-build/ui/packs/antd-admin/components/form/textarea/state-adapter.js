/* 多行文本局部状态投影：只同步值、禁用与错误样式，不处理输入事件。 */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* 归一化文本域状态，未知状态回退默认展示。 */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    return {
      value: typeof state.value === 'string' ? state.value : '',
      disabled: !!state.disabled,
      status: state.status === 'error' ? 'error' : 'default'
    };
  }
  /* 同步文本域的值、禁用属性及字段级错误标记。 */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value);
    var textarea = root.querySelector('.ui-textarea');
    root.classList.toggle('has-error', state.status === 'error');
    if (textarea) {
      textarea.value = state.value;
      textarea.disabled = state.disabled;
    }
  }
  adapters['form.textarea'] = { normalize: normalize, render: render };
})();
