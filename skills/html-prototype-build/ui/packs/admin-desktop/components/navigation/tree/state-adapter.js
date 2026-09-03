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

  /* 同步普通层级列表的展开按钮、子列表可见性与按钮文案。 */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value);
    root.querySelectorAll('.ui-tree-node[id]').forEach(function (node) {
      var toggle = node.querySelector('.ui-tree-toggle');
      var children = node.querySelector('.ui-tree-children');
      var open = Object.prototype.hasOwnProperty.call(state.expanded, node.id) ? state.expanded[node.id] : !toggle || toggle.getAttribute('aria-expanded') !== 'false';
      if (toggle) {
        toggle.textContent = open ? '⌄' : '›';
        toggle.setAttribute('aria-label', open ? '折叠分组' : '展开分组');
        toggle.setAttribute('aria-expanded', String(open));
      }
      if (children) children.hidden = !open;
    });
  }

  adapters['navigation.tree'] = { normalize: normalize, render: render };
})();
