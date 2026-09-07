import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

{
const sourceUrl = new URL('../../skills/html-prototype-build/runtime/chart-bridge.js', import.meta.url);
async function boot() {
  const source = await readFile(sourceUrl, 'utf8');
  let initCount = 0;
  let disposed = 0;
  const calls = [];
  const instance = { isDisposed: () => false, setOption: (...args) => calls.push(args), resize() {}, dispose: () => { disposed++; } };
  const window = { echarts: { init: () => { initCount++; return instance; }, registerMap() {} }, addEventListener() {}, removeEventListener() {} };
  window.window = window;
  const document = { documentElement: {} };
  const getComputedStyle = () => ({
    getPropertyValue(name) {
      const values = { '--ui-primary': '#111111', '--ui-success': '#222222', '--ui-warning': '#333333', '--ui-error': '#444444', '--ui-info': '#555555', '--ui-font': 'Inter', '--ui-text-secondary': '#666666', '--ui-border': '#777777', '--ui-border-soft': '#888888' };
      return values[name] || '';
    }
  });
  const fetch = async () => ({ ok: true, json: async () => ({}) });
  vm.runInNewContext(source, { window, document, getComputedStyle, WeakMap, fetch, console }, { filename: 'chart-bridge.js' });
  return { window, calls, get initCount() { return initCount; }, get disposed() { return disposed; } };
}
test('ChartBridge 从 token 构造主题并缓存', async () => {
  const env = await boot();
  const first = env.window.PrototypeChartBridge.getThemeFromTokens();
  const second = env.window.PrototypeChartBridge.getThemeFromTokens();
  assert.equal(first, second);
  assert.deepEqual(Array.from(first.color), ['#111111', '#222222', '#333333', '#444444', '#555555']);
  assert.equal(first.textStyle.fontFamily, 'Inter');
});
test('ChartBridge lazy init、setOption、dispose', async () => {
  const env = await boot();
  const canvas = {};
  const root = { querySelector: () => canvas };
  env.window.PrototypeChartBridge.setOption(root, { series: [] });
  env.window.PrototypeChartBridge.setOption(root, { series: [1] }, { notMerge: true });
  assert.equal(env.initCount, 1);
  assert.equal(env.calls.length, 2);
  assert.equal(env.calls[1][1].notMerge, true);
  env.window.PrototypeChartBridge.dispose(root);
  assert.equal(env.disposed, 1);
});
}

{
const sourceUrl = new URL('../../skills/html-prototype-build/runtime/chart-presets.js', import.meta.url);
async function boot() {
  const source = await readFile(sourceUrl, 'utf8');
  const window = { PrototypeChartBridge: { getThemeFromTokens: () => ({ color: ['#1', '#2', '#3', '#4', '#5'], textStyle: { fontFamily: 'sans-serif', color: '#666' }, axisLine: '#aaa', splitLine: '#eee' }) } };
  window.window = window;
  vm.runInNewContext(source, { window }, { filename: 'chart-presets.js' });
  return window.PrototypeChartPresets;
}
test('line preset 支持 area 与 visibleSeries', async () => {
  const presets = await boot();
  const option = presets.line({ variant: 'area', categories: ['A', 'B'], visibleSeries: ['x'], series: [{ key: 'x', name: 'X', data: [1, 2] }, { key: 'y', name: 'Y', data: [3, 4] }] });
  assert.deepEqual(Array.from(option.xAxis.data), ['A', 'B']);
  assert.equal(Object.keys(option.series[0].areaStyle).length, 0);
  assert.equal(option.series[0].show, true);
  assert.equal(option.series[1].show, false);
});
test('bar preset 支持 horizontal', async () => {
  const presets = await boot();
  const option = presets.bar({ layout: 'horizontal', categories: ['A'] });
  assert.equal(option.xAxis.type, 'value');
  assert.equal(option.yAxis.type, 'category');
});
test('donut/map preset 生成对应 ECharts series', async () => {
  const presets = await boot();
  const donut = presets.donut({ items: [{ key: 'a', name: 'A', value: 1 }], visibleKeys: ['a'] });
  assert.equal(donut.series[0].type, 'pie');
  assert.equal(donut.series[0].data[0].name, 'A');
  const map = presets.map({ mapId: 'china-test', data: [{ name: 'X', value: 2 }] });
  assert.equal(map.series[0].type, 'map');
  assert.equal(map.series[0].map, 'china-test');
});
}
