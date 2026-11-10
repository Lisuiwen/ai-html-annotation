import assert from 'node:assert/strict';
import test from 'node:test';
import {
  clampCaptureDimensions,
  collectScenarios,
  filterScenarios
} from '../../../skills/html-prototype-build/runtime/cli/screenshot.mjs';

test('screenshot scenarios extracted in declaration order from object and array scenarios', () => {
  assert.deepEqual(collectScenarios({ cards: [], scenarios: { base: {}, modal: {} } }), [{ id: 'base', query: 'scene' }, { id: 'modal', query: 'scene' }]);
  assert.deepEqual(collectScenarios({ cards: [], scenarios: [{ id: 'base' }, { name: 'legacy-name' }] }), [{ id: 'base', query: 'scene' }, { id: 'legacy-name', query: 'scene' }]);
});

test('clampCaptureDimensions applies floors and caps', () => {
  assert.deepEqual(
    clampCaptureDimensions({ width: 800, height: 400 }, { minWidth: 1440, minHeight: 900, maxWidth: 4096, maxHeight: 12000 }),
    { width: 1440, height: 900 }
  );
  assert.deepEqual(
    clampCaptureDimensions({ width: 5000, height: 20000 }, { minWidth: 1440, minHeight: 900, maxWidth: 4096, maxHeight: 12000 }),
    { width: 4096, height: 12000 }
  );
});

test('filterScenarios keeps only listed ids when --only is set', () => {
  const shots = [{ id: 'login', query: 'scene' }, { id: 'tasks', query: 'scene' }];
  assert.deepEqual(filterScenarios(shots, 'tasks'), [{ id: 'tasks', query: 'scene' }]);
  assert.deepEqual(filterScenarios(shots, ''), shots);
});

test('screenshot scenarios reject missing, empty, traversal, and Windows reserved names', () => {
  assert.throws(() => collectScenarios({ cards: [] }), /declare scenarios explicitly/);
  assert.throws(() => collectScenarios({ cards: [], scenarios: {} }), /valid IDs/);
  assert.throws(() => collectScenarios({ scenarios: { base: {} } }), /missing cards array/);
  assert.throws(() => collectScenarios({ cards: [], scenarios: { '../escape': {} } }), /not safe/);
  assert.throws(() => collectScenarios({ cards: [], scenarios: { 'bad:name': {} } }), /not safe/);
  assert.throws(() => collectScenarios({ cards: [], scenarios: { CON: {} } }), /reserved device name/);
});
