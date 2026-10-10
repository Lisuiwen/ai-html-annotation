/* Draw pack sample charts. Presets supply the series when no business state is passed. */

import { packBase as PACK, packId } from './mount.js';

/* Only admin-desktop ships the ECharts bridge these presets drive. */
const PRESET = packId !== 'admin-desktop' ? {} : {
  'data.chart-line': 'line',
  'data.chart-bar': 'bar',
  'data.chart-donut': 'donut',
  'data.chart-mixed': 'mixed',
  'data.chart-gauge': 'gauge',
  'data.chart-funnel': 'funnel',
  'data.chart-heatmap': 'heatmap',
  'data.chart-map': 'map'
};

let runtime = null;

export function isChart(componentId) {
  return Object.hasOwn(PRESET, componentId);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-sketch-src="' + src + '"]');
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.dataset.sketchSrc = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load ' + src));
    document.head.appendChild(script);
  });
}

function ensureRuntime() {
  if (!runtime) {
    runtime = loadScript(PACK + 'vendor/echarts/echarts.min.js')
      .then(() => loadScript(PACK + 'runtime/charts/bridge.js'))
      .then(() => loadScript(PACK + 'runtime/charts/presets.js'))
      .then(() => loadScript(PACK + 'components/data/_echarts-core/state-adapter.js'));
  }
  return runtime;
}

export async function paintChart(stamp, componentId) {
  const preset = PRESET[componentId];
  if (!preset) return;
  await ensureRuntime();
  if (preset === 'map') {
    await loadScript(PACK + 'vendor/echarts/maps/china.js');
    await window.PrototypeChartBridge.loadMapJson('china');
  }
  const root = stamp.querySelector('.ui-chart');
  const core = window.PrototypeChartCore;
  if (!root || !core) return;
  const canvas = root.querySelector('.ui-chart-canvas');
  if (canvas) void canvas.offsetHeight;
  const state = { status: 'data' };
  if (preset === 'map') {
    state.data = [
      { name: 'Guangdong', value: 120 },
      { name: 'Zhejiang', value: 90 },
      { name: 'Jiangsu', value: 85 },
      { name: 'Beijing', value: 70 },
      { name: 'Sichuan', value: 55 }
    ];
  }
  core.renderLeaf(root, state, { preset });
}
