/* ECharts 核心：renderLeaf 供 chart leaf 复用；不读 PrototypeViewers。 */
(function () {
  'use strict';

  var core = window.PrototypeChartCore = window.PrototypeChartCore || {};

  /** 归一化 chart status，与 data.list 三态口径对齐。 */
  function normalizeChartStatus(status, allowLoading) {
    if (status === 'empty') return 'empty';
    if (allowLoading && status === 'loading') return 'loading';
    return 'data';
  }

  /** 同步壳层 data-status 与 empty/data 区域可见性。 */
  function projectShell(root, status) {
    root.dataset.status = status;
    var emptyEl = root.querySelector('.ui-chart-empty');
    var dataEl = root.querySelector('.ui-chart-data');
    if (emptyEl) emptyEl.hidden = status !== 'empty';
    if (dataEl) dataEl.hidden = status === 'empty';
  }

  /** 投影 ECharts option（复用已有实例）。 */
  function render(root, option) {
    if (!root || !option || !window.PrototypeChartBridge) return;
    window.PrototypeChartBridge.setOption(root, option, { notMerge: true });
  }

  /** 销毁 root 上的图表实例。 */
  function destroy(root) {
    if (!root || !window.PrototypeChartBridge) return;
    window.PrototypeChartBridge.dispose(root);
  }

  /** leaf 通用 render：empty/loading 早退，否则调 preset 并更新 summary。 */
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

  core.normalizeChartStatus = normalizeChartStatus;
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
