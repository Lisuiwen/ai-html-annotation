import assert from 'node:assert/strict';
import test from 'node:test';
import { isChart } from '../../../../skills/html-prototype-build/runtime/author/sketch/charts.js';

test('sketch charts: only admin-desktop chart atoms paint a preset', () => {
  assert.equal(isChart('data.chart-line'), true);
  assert.equal(isChart('data.chart-map'), true);
  assert.equal(isChart('action.button'), false);
});
