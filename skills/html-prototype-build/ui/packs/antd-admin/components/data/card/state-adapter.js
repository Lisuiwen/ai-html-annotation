/* Card 局部状态投影：切换边框变体和加载区，不管理内容。 */
(function () {
  'use strict'; var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* 归一化卡片状态。 */
  function normalize(value) { var state = value && typeof value === 'object' ? value : {}; return { loading: !!state.loading, bordered: state.bordered !== false }; }
  /* 同步卡片变体和内容可见性。 */
  function render(root, value) { if (!root) return; var state = normalize(value); root.classList.toggle('is-borderless', !state.bordered); var body = root.querySelector('.ui-card-body'); var loading = root.querySelector('.ui-card-loading'); if (body) body.hidden = state.loading; if (loading) loading.hidden = !state.loading; }
  adapters['data.card'] = { normalize: normalize, render: render };
})();