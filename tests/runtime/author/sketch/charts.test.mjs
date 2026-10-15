import assert from 'node:assert/strict';
import test from 'node:test';
import { isChart } from '../../../../skills/html-prototype-build/runtime/author/sketch/charts.js';

test('sketch charts: data.chart-* atoms paint a preset in whichever pack is open', () => {
  assert.equal(isChart('data.chart-line'), true);
  assert.equal(isChart('data.chart-map'), true);
  assert.equal(isChart('action.button'), false);
  assert.equal(isChart('data._echarts-core'), false);
});
