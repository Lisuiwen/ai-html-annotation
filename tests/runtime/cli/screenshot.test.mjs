import assert from 'node:assert/strict';
import test from 'node:test';
import { collectScenarios } from '../../../skills/html-prototype-build/runtime/cli/screenshot.mjs';

test('screenshot scenarios extracted in declaration order from object and array scenarios', () => {
  assert.deepEqual(collectScenarios({ cards: [], scenarios: { base: {}, modal: {} } }), [{ id: 'base', query: 'scene' }, { id: 'modal', query: 'scene' }]);
  assert.deepEqual(collectScenarios({ cards: [], scenarios: [{ id: 'base' }, { name: 'legacy-name' }] }), [{ id: 'base', query: 'scene' }, { id: 'legacy-name', query: 'scene' }]);
});

test('screenshot scenarios reject missing, empty, traversal, and Windows reserved names', () => {
  assert.throws(() => collectScenarios({ cards: [] }), /declare scenarios explicitly/);
  assert.throws(() => collectScenarios({ cards: [], scenarios: {} }), /valid IDs/);
  assert.throws(() => collectScenarios({ scenarios: { base: {} } }), /missing cards array/);
  assert.throws(() => collectScenarios({ cards: [], scenarios: { '../escape': {} } }), /not safe/);
  assert.throws(() => collectScenarios({ cards: [], scenarios: { 'bad:name': {} } }), /not safe/);
  assert.throws(() => collectScenarios({ cards: [], scenarios: { CON: {} } }), /reserved device name/);
});
