/* Tree 局部状态投影：展开集合由最终原型的业务 state 提供。 */
(function () {
  'use strict';

  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};

  /* 归一化节点 ID 到布尔展开值的映射。 */
  function normalize(value) {
    var source = value && typeof value === 'object' ? value : {};
    var expanded = source.expanded && typeof source.expanded === 'object' ? source.expanded : source;
    var result = {};
    Object.keys(expanded).forEach(function (id) { result[id] = !!expanded[id]; });
    return { expanded: result };
  }

  /* 同步 treeitem 的 aria-expanded 与折叠按钮文字。 */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value);
    root.querySelectorAll('[role="treeitem"][aria-expanded]').forEach(function (node) {
      var open = Object.prototype.hasOwnProperty.call(state.expanded, node.id) ? state.expanded[node.id] : node.getAttribute('aria-expanded') !== 'false';
      var toggle = node.querySelector('.ui-tree-toggle');
      node.setAttribute('aria-expanded', String(open));
      if (toggle) {
        toggle.textContent = open ? '⌄' : '›';
        toggle.setAttribute('aria-label', open ? '折叠分组' : '展开分组');
      }
    });
  }

  adapters['navigation.tree'] = { normalize: normalize, render: render };
})();
