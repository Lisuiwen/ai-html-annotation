/* Skeleton 局部状态投影：切换骨架与既有内容区域。 */
(function () {
  'use strict'; var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* 归一化骨架状态。 */
  function normalize(value) { var state = value && typeof value === 'object' ? value : {}; return { loading: !!state.loading, variant: ['paragraph', 'card', 'detail'].indexOf(state.variant) !== -1 ? state.variant : 'paragraph' }; }
  /* 切换已提供的内容与骨架区域。 */
  function render(root, value) { if (!root) return; var state = normalize(value); root.dataset.variant = state.variant; var content = root.querySelector('.ui-skeleton-content'); var placeholder = root.querySelector('.ui-skeleton-placeholder'); if (content) content.hidden = state.loading; if (placeholder) placeholder.hidden = !state.loading; }
  adapters['feedback.skeleton'] = { normalize: normalize, render: render };
})();