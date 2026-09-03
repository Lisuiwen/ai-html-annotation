/* Tabs 局部状态投影：由最终原型 Adapter 调用，不自行注册点击事件。 */
(function () {
  'use strict';

  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};

  /* 归一化选中的 Tab ID；缺省时沿用第一个声明的 Tab。 */
  function normalize(root, value) {
    var tabs = root ? root.querySelectorAll('[role="tab"]') : [];
    var fallback = tabs.length ? tabs[0].id : '';
    return typeof value === 'string' && value ? value : fallback;
  }

  /* 同步 Tab 的选中语义与关联 Panel 的 hidden 输出。 */
  function render(root, value) {
    if (!root) return;
    var selectedId = normalize(root, value);
    root.querySelectorAll('[role="tab"]').forEach(function (tab) {
      tab.setAttribute('aria-selected', String(tab.id === selectedId));
    });
    root.querySelectorAll('[role="tabpanel"]').forEach(function (panel) {
      var active = panel.getAttribute('aria-labelledby') === selectedId;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
  }

  adapters['navigation.tabs'] = { normalize: normalize, render: render };
})();
