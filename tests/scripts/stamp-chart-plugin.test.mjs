import assert from 'node:assert/strict';
import test from 'node:test';
import { applyChartFragment, renderPluginText } from '../../skills/ui-pack-maintain/scripts/stamp-chart-plugin.mjs';

test('renderPluginText fills prefix and theme vars', () => {
  const text = renderPluginText('.{{prefix}}chart { color: var(--{{prefix}}text-secondary); }\nvar THEME_VARS = {{themeVars}};', {
    prefix: 'mv-',
    themeVars: ['--mv-primary', '--mv-danger']
  });
  assert.match(text, /\.mv-chart/);
  assert.match(text, /--mv-text-secondary/);
  assert.match(text, /--mv-danger/);
  assert.doesNotMatch(text, /\{\{/);
});

test('applyChartFragment keeps card optional only on the desktop host', () => {
  const fragment = {
    delivery: { 'vendor/echarts/echarts.min.js': 'assets/echarts.min.js' },
    components: {
      'data.chart-line': {
        category: 'data',
        optional: ['data.card'],
        atoms: { chart: { label: 'Line chart', resize: 'both', width: 480, height: 240 } }
      }
    }
  };
  const manifest = { id: 'mobile-vant', version: 2, schemaVersion: 1, components: {}, delivery: {} };
  const mobile = applyChartFragment(manifest, fragment, {
    version: 3,
    schemaVersion: 2,
    optionalCard: false,
    atomWidth: 343
  });
  assert.equal(mobile.schemaVersion, 2);
  assert.equal(mobile.components['data.chart-line'].optional, undefined);
  assert.equal(mobile.components['data.chart-line'].atoms.chart.width, 343);
  assert.equal(mobile.delivery['vendor/echarts/echarts.min.js'], 'assets/echarts.min.js');

  const desktop = applyChartFragment(manifest, fragment, {
    version: 7,
    schemaVersion: 2,
    optionalCard: true,
    atomWidth: null
  });
  assert.deepEqual(desktop.components['data.chart-line'].optional, ['data.card']);
  assert.equal(desktop.components['data.chart-line'].atoms.chart.width, 480);
});
