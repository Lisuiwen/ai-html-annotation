/* Data Table 局部状态投影：表格生命周期和可选行选择均由同一业务字段驱动。 */
(function () {
  'use strict';

  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};

  /* 限制组件可渲染的数据状态，并规范可选行选择集合。 */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : null;
    var status = state ? state.status : value;
    var selection = state && state.selection && typeof state.selection === 'object' ? state.selection : null;
    return {
      status: ['data', 'empty', 'loading'].indexOf(status) !== -1 ? status : 'data',
      selection: selection ? {
        selectedKeys: Array.isArray(selection.selectedKeys) ? selection.selectedKeys.map(String) : [],
        allSelected: !!selection.allSelected,
        indeterminate: !!selection.indeterminate
      } : null
    };
  }

  /* 通过 hidden 渲染生命周期，并投影已有选择列的选中语义。 */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value);
    var status = state.status;
    var table = root.querySelector('.ui-table-data');
    var empty = root.querySelector('.ui-table-state:not([aria-label])');
    var loading = root.querySelector('.ui-table-state[aria-label="正在加载"]');
    if (table) table.hidden = status !== 'data';
    if (empty) empty.hidden = status !== 'empty';
    if (loading) loading.hidden = status !== 'loading';
    root.classList.toggle('has-selection', !!state.selection);
    root.querySelectorAll('[data-selection-key]').forEach(function (input) {
      var key = input.getAttribute('data-selection-key');
      input.checked = !!state.selection && state.selection.selectedKeys.indexOf(key) !== -1;
    });
    var selectAll = root.querySelector('[data-selection-all]');
    if (selectAll) {
      selectAll.checked = !!state.selection && state.selection.allSelected;
      selectAll.indeterminate = !!state.selection && state.selection.indeterminate;
    }
    window.dispatchEvent(new CustomEvent('ui:layout-change'));
  }

  adapters['data.data-table'] = { normalize: normalize, render: render };
})();
