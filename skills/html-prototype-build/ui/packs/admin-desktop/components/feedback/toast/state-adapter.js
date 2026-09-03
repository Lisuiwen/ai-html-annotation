/* Toast 局部状态投影：可见性与消息由最终原型控制，计时策略不属于 UI pack。 */
(function () {
  'use strict';

  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};

  /* 归一化 Toast 的可见性和文本。 */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    return { visible: !!state.visible, message: typeof state.message === 'string' ? state.message : '' };
  }

  /* 将当前 Toast state 渲染到既有 live region。 */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value);
    root.replaceChildren();
    if (!state.visible || !state.message) return;
    var toast = document.createElement('div');
    toast.className = 'ui-toast';
    toast.textContent = state.message;
    root.appendChild(toast);
  }

  adapters['feedback.toast'] = { normalize: normalize, render: render };
})();
