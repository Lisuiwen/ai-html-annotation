/* 空态局部状态投影：仅切换可见性和已声明文案变体。 */
(function () {
  'use strict'; var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* 归一化空态状态。 */
  function normalize(value) { var state = value && typeof value === 'object' ? value : {}; return { visible: state.visible !== false, variant: state.variant === 'search-empty' ? 'search-empty' : 'empty' }; }
  /* 同步空态展示文本。 */
  function render(root, value) { if (!root) return; var state = normalize(value); root.hidden = !state.visible; var text = root.querySelector('.ui-empty-text'); if (text) text.textContent = state.variant === 'search-empty' ? '未找到匹配结果' : '暂无数据'; }
  adapters['data.empty'] = { normalize: normalize, render: render };
})();