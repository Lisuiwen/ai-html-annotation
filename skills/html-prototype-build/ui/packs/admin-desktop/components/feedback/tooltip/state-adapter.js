/* Tooltip 局部状态投影：控制可见性与提示文案。 */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* 归一化 Tooltip 的 open 与 text。 */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    return { open: !!state.open, text: typeof state.text === 'string' ? state.text : '' };
  }
  /* 同步触发器描述关系与浮层可见性、文案。 */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value);
    var trigger = root.querySelector('.ui-tooltip-trigger');
    var panel = root.querySelector('.ui-tooltip-panel');
    if (trigger && panel) {
      trigger.setAttribute('aria-describedby', panel.id || 'uiTooltipPanel');
    }
    if (panel) {
      panel.hidden = !state.open;
      panel.textContent = state.text;
    }
  }
  adapters['feedback.tooltip'] = { normalize: normalize, render: render };
})();
