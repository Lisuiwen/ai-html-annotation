import assert from 'node:assert/strict';
import test from 'node:test';
import { collectScenarios } from '../../../skills/html-prototype-build/runtime/cli/screenshot.mjs';

test('截图场景从对象和数组 scenarios 按声明顺序提取', () => {
  assert.deepEqual(collectScenarios({ cards: [], scenarios: { base: {}, modal: {} } }), [{ id: 'base', query: 'scene' }, { id: 'modal', query: 'scene' }]);
  assert.deepEqual(collectScenarios({ cards: [], scenarios: [{ id: 'base' }, { name: 'legacy-name' }] }), [{ id: 'base', query: 'scene' }, { id: 'legacy-name', query: 'scene' }]);
});

test('截图场景拒绝缺失、空列表、路径穿越和 Windows 保留名', () => {
  assert.throws(() => collectScenarios({ cards: [] }), /显式声明 scenarios/);
  assert.throws(() => collectScenarios({ cards: [], scenarios: {} }), /有效 ID/);
  assert.throws(() => collectScenarios({ scenarios: { base: {} } }), /cards 数组/);
  assert.throws(() => collectScenarios({ cards: [], scenarios: { '../escape': {} } }), /不能安全/);
  assert.throws(() => collectScenarios({ cards: [], scenarios: { 'bad:name': {} } }), /不能安全/);
  assert.throws(() => collectScenarios({ cards: [], scenarios: { CON: {} } }), /保留设备名/);
});
