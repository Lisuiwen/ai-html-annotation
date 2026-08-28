/* Steps 局部状态投影：仅反映页面提供的当前步骤和流程状态。 */
(function () {
  'use strict'; var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* 限定步骤状态集合。 */
  function normalize(value) { var state = value && typeof value === 'object' ? value : {}; return { current: Number.isInteger(state.current) ? state.current : 0, items: Array.isArray(state.items) ? state.items : [] }; }
  /* 同步步骤状态与当前步骤辅助语义。 */
  function render(root, value) { if (!root) return; var state = normalize(value); root.querySelectorAll('.ui-step').forEach(function (item, index) { var source = state.items[index] || {}; var status = ['wait', 'process', 'finish', 'error'].indexOf(source.status) !== -1 ? source.status : index === state.current ? 'process' : index < state.current ? 'finish' : 'wait'; item.dataset.status = status; item.toggleAttribute('aria-current', index === state.current); }); }
  adapters['navigation.steps'] = { normalize: normalize, render: render };
})();