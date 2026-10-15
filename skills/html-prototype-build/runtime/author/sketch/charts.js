/* Draw pack sample charts. Presets supply the series when no business state is passed. */

import { loadManifest, packBase as PACK } from './mount.js';

const CHART_ID = /^data\.chart-([a-z0-9-]+)$/;
let runtime = null;

export function chartPreset(componentId) {
  const match = CHART_ID.exec(componentId || '');
  return match ? match[1] : '';
}

export function isChart(componentId) {
  return chartPreset(componentId) !== '';
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

function runtimeScripts(manifest) {
  const core = manifest.components && manifest.components['data._echarts-core'];
  if (!core) return [];
  return [...(core.vendor || []), ...(core.runtime || []), core.adapter].filter(Boolean);
}

function ensureRuntime() {
  if (!runtime) {
    runtime = loadManifest().then(async (manifest) => {
      for (const source of runtimeScripts(manifest)) await loadScript(PACK + source);
    });
  }
  return runtime;
}

export async function paintChart(stamp, componentId) {
  const preset = chartPreset(componentId);
  if (!preset) return;
  await ensureRuntime();
  if (preset === 'map') {
    const manifest = await loadManifest();
    const assets = manifest.components['data.chart-map'] && manifest.components['data.chart-map'].assets || [];
    const script = assets.find((item) => item.endsWith('.js'));
    if (script) await loadScript(PACK + script);
    await window.PrototypeChartBridge.loadMapJson('china');
  }
  const canvas = stamp.querySelector('[data-chart-canvas]');
  const root = canvas && canvas.closest('[data-status]');
  const core = window.PrototypeChartCore;
  if (!root || !core) return;
  void canvas.offsetHeight;
  core.renderLeaf(root, { status: 'data' }, { preset });
}
