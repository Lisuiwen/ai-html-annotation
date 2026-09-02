/* ECharts 桥接：init/dispose/resize/theme/registerMap；不持有业务 state。 */
(function () {
  'use strict';

  var bridge = window.PrototypeChartBridge = window.PrototypeChartBridge || {};
  var pools = new WeakMap();
  var mapLoaded = Object.create(null);
  var mapPending = Object.create(null);
  var themeCache = null;

  /** 单次读取 documentElement 上多个 CSS 变量。 */
  function readTokens(names, fallbacks) {
    var style = getComputedStyle(document.documentElement);
    return names.map(function (name, index) {
      var value = style.getPropertyValue(name).trim();
      return value || fallbacks[index];
    });
  }

  /** 汇总 antd-admin token → ECharts 色板与轴样式。 */
  function getThemeFromTokens() {
    if (themeCache) return themeCache;
    var values = readTokens(
      ['--ui-primary', '--ui-success', '--ui-warning', '--ui-error', '--ui-info', '--ui-font', '--ui-text-secondary', '--ui-border', '--ui-border-soft'],
      ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#1677ff', 'sans-serif', 'rgba(0,0,0,0.65)', '#d9d9d9', '#f0f0f0']
    );
    themeCache = {
      color: values.slice(0, 5),
      textStyle: { fontFamily: values[5], color: values[6] },
      axisLine: values[7],
      splitLine: values[8]
    };
    return themeCache;
  }

  /** 解析图表挂载节点：优先 .ui-chart-canvas。 */
  function resolveCanvas(root) {
    if (!root) return null;
    return root.querySelector('.ui-chart-canvas') || root;
  }

  /** 释放已有实例与 resize 监听。 */
  function dispose(root) {
    var entry = pools.get(root);
    if (!entry) return;
    if (entry.observer) entry.observer.disconnect();
    if (entry.resizeHandler) window.removeEventListener('resize', entry.resizeHandler);
    if (entry.instance && !entry.instance.isDisposed()) entry.instance.dispose();
    pools.delete(root);
  }

  /** 确保 root 上存在有效 ECharts 实例。 */
  function ensureInstance(root) {
    if (!root || !window.echarts) return null;
    var entry = pools.get(root);
    if (entry && entry.instance && !entry.instance.isDisposed()) return entry.instance;
    dispose(root);
    var canvas = resolveCanvas(root);
    if (!canvas) return null;
    var instance = window.echarts.init(canvas, null, { renderer: 'canvas' });
    entry = { instance: instance };
    if (typeof ResizeObserver !== 'undefined') {
      entry.observer = new ResizeObserver(function () {
        if (!instance.isDisposed()) instance.resize();
      });
      entry.observer.observe(canvas);
    } else {
      entry.resizeHandler = function () {
        if (!instance.isDisposed()) instance.resize();
      };
      window.addEventListener('resize', entry.resizeHandler);
    }
    pools.set(root, entry);
    return instance;
  }

  /** lazy init 后 setOption。 */
  function setOption(root, option, config) {
    if (!root || !option) return;
    var instance = ensureInstance(root);
    if (!instance) return;
    instance.setOption(option, { notMerge: !!(config && config.notMerge) });
  }

  /** 注册 geo 地图（内部）。 */
  function registerMap(name, geoJson) {
    if (!window.echarts || !name || !geoJson) return;
    window.echarts.registerMap(name, geoJson);
    mapLoaded[name] = true;
  }

  /** 读取 script 预注册的 geo（file:// 下 fetch json 会被拦截）。 */
  function loadFromRegistry(mapId) {
    var registry = window.PrototypeMapRegistry;
    if (!registry || !registry[mapId]) return null;
    registerMap(mapId, registry[mapId]);
    return registry[mapId];
  }

  /** 优先 registry，否则 fetch assets/maps/*.json；in-flight 去重。 */
  function loadMapJson(mapId) {
    var id = String(mapId || 'china');
    if (mapLoaded[id]) return Promise.resolve(true);
    if (mapPending[id]) return mapPending[id];
    var cached = loadFromRegistry(id);
    if (cached) return Promise.resolve(cached);
    mapPending[id] = fetch('./assets/maps/' + id + '.json')
      .then(function (response) {
        if (!response.ok) throw new Error('map load failed: ' + id);
        return response.json();
      })
      .then(function (geoJson) {
        registerMap(id, geoJson);
        return geoJson;
      })
      .finally(function () {
        delete mapPending[id];
      });
    return mapPending[id];
  }

  bridge.getThemeFromTokens = getThemeFromTokens;
  bridge.dispose = dispose;
  bridge.setOption = setOption;
  bridge.loadMapJson = loadMapJson;
})();
