/* Data Table 局部状态投影：表格、空态和加载态均由同一业务字段驱动。 */
(function () {
  'use strict';

  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};

  /* 限制组件可渲染的数据状态，未知值安全回退为 data。 */
  function normalize(value) {
    var status = value && typeof value === 'object' ? value.status : value;
    return ['data', 'empty', 'loading'].indexOf(status) !== -1 ? status : 'data';
  }

  /* 通过 hidden 单向渲染表格生命周期状态，并通知连线重新测量。 */
  function render(root, value) {
    if (!root) return;
    var status = normalize(value);
    var table = root.querySelector('.ui-table-data');
    var empty = root.querySelector('.ui-table-state:not([aria-label])');
    var loading = root.querySelector('.ui-table-state[aria-label="正在加载"]');
    if (table) table.hidden = status !== 'data';
    if (empty) empty.hidden = status !== 'empty';
    if (loading) loading.hidden = status !== 'loading';
    window.dispatchEvent(new CustomEvent('ui:layout-change'));
  }

  adapters['data.data-table'] = { normalize: normalize, render: render };
})();
