import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

async function bootBridge() {
  const source = await readFile(new URL('../../../../skills/html-prototype-build/runtime/client/charts/bridge.js', import.meta.url), 'utf8');
  let initCount = 0; let disposed = 0; const calls = [];
  const instance = { isDisposed: () => false, setOption: (...args) => calls.push(args), resize() {}, dispose: () => { disposed++; } };
  const window = { echarts: { init: () => { initCount++; return instance; }, registerMap() {} }, addEventListener() {}, removeEventListener() {} }; window.window = window;
  const document = { documentElement: {} };
  const getComputedStyle = () => ({ getPropertyValue(name) { return ({ '--ui-primary': '#111111', '--ui-success': '#222222', '--ui-warning': '#333333', '--ui-error': '#444444', '--ui-info': '#555555', '--ui-font': 'Inter', '--ui-text-secondary': '#666666', '--ui-border': '#777777', '--ui-border-soft': '#888888' })[name] || ''; } });
  vm.runInNewContext(source, { window, document, getComputedStyle, WeakMap, fetch: async () => ({ ok: true, json: async () => ({}) }), console }, { filename: 'bridge.js' });
  return { window, calls, get initCount() { return initCount; }, get disposed() { return disposed; } };
}

test('ChartBridge 从 token 构造主题并缓存', async () => {
  const env = await bootBridge(); const first = env.window.PrototypeChartBridge.getThemeFromTokens(); const second = env.window.PrototypeChartBridge.getThemeFromTokens();
  assert.equal(first, second); assert.deepEqual(Array.from(first.color), ['#111111', '#222222', '#333333', '#444444', '#555555']); assert.equal(first.textStyle.fontFamily, 'Inter');
});

test('ChartBridge lazy init、setOption、dispose', async () => {
  const env = await bootBridge(); const root = { querySelector: () => ({}) };
  env.window.PrototypeChartBridge.setOption(root, { series: [] }); env.window.PrototypeChartBridge.setOption(root, { series: [1] }, { notMerge: true });
  assert.equal(env.initCount, 1); assert.equal(env.calls.length, 2); assert.equal(env.calls[1][1].notMerge, true); env.window.PrototypeChartBridge.dispose(root); assert.equal(env.disposed, 1);
});
