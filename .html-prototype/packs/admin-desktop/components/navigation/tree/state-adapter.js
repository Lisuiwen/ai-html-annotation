/* Tree local state projection: expanded set is provided by the final prototype business state. */
(function () {
  'use strict';

  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};

  /* Normalize node ID to boolean expanded value map. */
  function normalize(value) {
    var source = value && typeof value === 'object' ? value : {};
    var expanded = source.expanded && typeof source.expanded === 'object' ? source.expanded : source;
    var result = {};
    Object.keys(expanded).forEach(function (id) { result[id] = !!expanded[id]; });
    return { expanded: result };
  }

  /* Sync plain hierarchical list expand buttons, child list visibility, and button labels. */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value);
    root.querySelectorAll('.ui-tree-node[id]').forEach(function (node) {
      var toggle = node.querySelector('.ui-tree-toggle');
      var children = node.querySelector('.ui-tree-children');
      var open = Object.prototype.hasOwnProperty.call(state.expanded, node.id) ? state.expanded[node.id] : !toggle || toggle.getAttribute('aria-expanded') !== 'false';
      if (toggle) {
        toggle.textContent = open ? '⌄' : '›';
        toggle.setAttribute('aria-label', open ? 'Collapse group' : 'Expand group');
        toggle.setAttribute('aria-expanded', String(open));
      }
      if (children) children.hidden = !open;
    });
  }

  adapters['navigation.tree'] = { normalize: normalize, render: render };
})();
