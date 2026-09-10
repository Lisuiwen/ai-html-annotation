/* ECharts core: renderLeaf for chart leaf reuse; does not read PrototypeViewers. */
(function () {
  'use strict';

  var core = window.PrototypeChartCore = window.PrototypeChartCore || {};

  /** Normalize chart status; aligned with data.list three-state contract. */
  function normalizeChartstate(status, allowloading) {
    if (status === 'empty') return 'empty';
    if (allowloading && status === 'loading') return 'loading';
    return 'data';
  }

  /** Sync shell data-status and empty/data region visibility. */
  function projectShell(root, status) {
    root.dataset.status = status;
    var emptyEl = root.querySelector('.ui-chart-empty');
    var dataEl = root.querySelector('.ui-chart-data');
    if (emptyEl) emptyEl.hidden = status !== 'empty';
    if (dataEl) dataEl.hidden = status === 'empty';
  }

  /** Project ECharts option (reuse existing instance). */
  function render(root, option) {
    if (!root || !option || !window.PrototypeChartBridge) return;
    window.PrototypeChartBridge.setOption(root, option, { notMerge: true });
  }

  /** Dispose chart instance on root. */
  function destroy(root) {
    if (!root || !window.PrototypeChartBridge) return;
    window.PrototypeChartBridge.dispose(root);
  }

  /** Leaf generic render: early return for empty/loading, otherwise call preset and update summary. */
  function renderLeaf(root, state, options) {
    if (!root || !options) return;
    projectShell(root, state.status);
    var summary = root.querySelector('.ui-chart-summary');
    if (state.status === 'empty') {
      destroy(root);
      if (summary && options.emptyText) summary.textContent = options.emptyText;
      return;
    }
    if (state.status === 'loading') {
      destroy(root);
      if (summary && options.loadingText) summary.textContent = options.loadingText;
      return;
    }
    var presets = window.PrototypeChartPresets;
    if (!presets) return;
    var build = options.preset ? presets[options.preset] : options.buildOption;
    if (typeof build !== 'function') return;
    render(root, build(state));
    if (summary && options.summary) {
      summary.textContent = typeof options.summary === 'function' ? options.summary(state) : options.summary;
    }
  }

  core.normalizeChartstate = normalizeChartstate;
  core.render = render;
  core.destroy = destroy;
  core.renderLeaf = renderLeaf;
  core.projectShell = projectShell;

  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  adapters['data._echarts-core'] = {
    normalize: function (value) { return value && typeof value === 'object' ? value : {}; },
    render: function (root, value) {
      if (!root || !value) return;
      if (value.destroy) destroy(root);
      else if (value.option) render(root, value.option);
    }
  };
})();
