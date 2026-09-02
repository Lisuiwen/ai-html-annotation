/* Popover 局部状态投影：控制可见性与标题；内容区保留 DOM。 */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* 归一化 Popover 的 open 与可选 title。 */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    return {
      open: !!state.open,
      title: typeof state.title === 'string' ? state.title : undefined
    };
  }
  /* 同步触发器、浮层可见性与标题区域。 */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value);
    var trigger = root.querySelector('.ui-popover-trigger');
    var panel = root.querySelector('.ui-popover-panel');
    var title = root.querySelector('.ui-popover-title');
    if (trigger) trigger.setAttribute('aria-expanded', String(state.open));
    if (panel) panel.hidden = !state.open;
    if (title) {
      var hasTitle = typeof state.title === 'string' && state.title.length > 0;
      title.hidden = !hasTitle;
      if (hasTitle) title.textContent = state.title;
    }
  }
  adapters['feedback.popover'] = { normalize: normalize, render: render };
})();
