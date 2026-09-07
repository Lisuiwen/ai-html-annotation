import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

async function bootPresets() {
  const source = await readFile(new URL('../../../../skills/html-prototype-build/runtime/client/charts/presets.js', import.meta.url), 'utf8');
  const window = { PrototypeChartBridge: { getThemeFromTokens: () => ({ color: ['#1', '#2', '#3', '#4', '#5'], textStyle: { fontFamily: 'sans-serif', color: '#666' }, axisLine: '#aaa', splitLine: '#eee' }) } }; window.window = window;
  vm.runInNewContext(source, { window }, { filename: 'presets.js' });
  return window.PrototypeChartPresets;
}

test('Chart presets 覆盖 line/bar/donut/map 关键变体', async () => {
  const presets = await bootPresets();
  const line = presets.line({ variant: 'area', categories: ['A'], visibleSeries: ['x'], series: [{ key: 'x', name: 'X', data: [1] }, { key: 'y', name: 'Y', data: [2] }] });
  assert.equal(line.series[0].show, true); assert.equal(line.series[1].show, false); assert.ok(line.series[0].areaStyle);
  const bar = presets.bar({ layout: 'horizontal', categories: ['A'] }); assert.equal(bar.xAxis.type, 'value'); assert.equal(bar.yAxis.type, 'category');
  assert.equal(presets.donut({}).series[0].type, 'pie'); assert.equal(presets.map({ mapId: 'china-test' }).series[0].map, 'china-test');
});
