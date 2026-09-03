/* Overlay 局部状态投影：只控制目标浮层，不持有页面或场景 state。 */
(function () {
  'use strict';

  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};

  /* 归一化 Overlay 的开关字段。 */
  function normalize(value) {
    return { open: !!(value && typeof value === 'object' ? value.open : value) };
  }

  /* 在产品区边界内渲染浮层可见性、尺寸和 ARIA 输出。 */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value);
    var host = root.closest('.ui-preview, .ui-overlay-host') || document.body;
    root.hidden = !state.open;
    root.classList.toggle('is-open', state.open);
    root.setAttribute('aria-hidden', String(!state.open));
    if (!state.open) {
      root.style.removeProperty('top');
      root.style.removeProperty('height');
      return;
    }
    root.style.top = host.scrollTop + 'px';
    root.style.height = host.clientHeight + 'px';
  }

  adapters['feedback._overlay-core'] = { normalize: normalize, render: render };
})();
