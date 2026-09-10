import assert from 'node:assert/strict';
import test from 'node:test';
import { collectScenarios } from '../../../skills/html-prototype-build/runtime/cli/screenshot.mjs';

test('截图场景From对象和数组 scenarios 按声明顺序提取', () => {
  assert.deepEqual(collectScenarios({ cards: [], scenarios: { base: {}, modal: {} } }), [{ id: 'base', query: 'scene' }, { id: 'modal', query: 'scene' }]);
  assert.deepEqual(collectScenarios({ cards: [], scenarios: [{ id: 'base' }, { name: 'legacy-name' }] }), [{ id: 'base', query: 'scene' }, { id: 'legacy-name', query: 'scene' }]);
});

test('截图场景拒绝缺失、空List、路径穿越和 Windows 保留名', () => {
  assert.throws(() => collectScenarios({ cards: [] }), /declare scenarios explicitly/);
  assert.throws(() => collectScenarios({ cards: [], scenarios: {} }), /valid IDs/);
  assert.throws(() => collectScenarios({ scenarios: { base: {} } }), /cards array/);
  assert.throws(() => collectScenarios({ cards: [], scenarios: { '../escape': {} } }), /not safe/);
  assert.throws(() => collectScenarios({ cards: [], scenarios: { 'bad:name': {} } }), /not safe/);
  assert.throws(() => collectScenarios({ cards: [], scenarios: { CON: {} } }), /reserved device name/);
});
