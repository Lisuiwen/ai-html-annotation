/* Select 局部状态投影：由最终原型 Adapter 调用，不保存业务状态或绑定交互事件。 */
(function () {
  'use strict';

  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};

  /* 归一化 Select 的局部 state，保证渲染层只处理稳定字段。 */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    return { open: !!state.open, value: typeof state.value === 'string' ? state.value : '' };
  }

  /* 将局部 Select state 投影为可见菜单、文本和 ARIA 输出。 */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value);
    var trigger = root.querySelector('.ui-select-trigger');
    var output = root.querySelector('.ui-select-value');
    root.classList.toggle('is-open', state.open);
    if (trigger) trigger.setAttribute('aria-expanded', String(state.open));
    if (output) output.textContent = state.value || '请选择';
    root.querySelectorAll('[role="option"]').forEach(function (option) {
      option.setAttribute('aria-selected', String(!!state.value && option.textContent.trim() === state.value));
    });
  }

  adapters['form.select'] = { normalize: normalize, render: render };
})();
