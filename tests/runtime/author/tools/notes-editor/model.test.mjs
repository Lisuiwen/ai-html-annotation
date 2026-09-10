import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const sourceUrl = new URL('../../../../../skills/html-prototype-build/runtime/author/tools/notes-editor/model.js', import.meta.url);

async function loadModel() {
  const source = await readFile(sourceUrl, 'utf8');
  const window = {}; window.window = window;
  vm.runInNewContext(source, { window, Object, Array }, { filename: 'notes-editor/model.js' });
  return window.PrototypeNotesEditorModel;
}

test('createCardId avoids note-N collisions', async () => {
  const model = await loadModel();
  assert.equal(model.createCardId([]), 'note-1');
  assert.equal(model.createCardId([{ id: 'note-3' }, { id: 'custom' }, { id: 'note-4' }]), 'note-5');
  assert.equal(model.createCardId([{ id: 'note-2' }]), 'note-3');
});

test('whenForCurrentLayer extracts layer/layers/page and copies layers', async () => {
  const model = await loadModel();
  const layers = ['create'];
  const when = model.whenForCurrentLayer({ product: { page: 'list', layers, tab: 'x' } });
  assert.deepEqual(JSON.parse(JSON.stringify(when)), { 'product.layers': ['create'], 'product.page': 'list' });
  layers.push('confirm');
  assert.deepEqual(Array.from(when['product.layers']), ['create']);
  assert.equal(model.whenForCurrentLayer({ product: { page: 'list' } }), undefined);
  assert.deepEqual(JSON.parse(JSON.stringify(model.whenForCurrentLayer({ product: { layer: 'modal' } }))), { 'product.layer': 'modal' });
});

test('createCard creates default card with current layer when', async () => {
  const model = await loadModel();
  const card = model.createCard([{ id: 'note-2' }], { product: { page: 'list', layers: [] } });
  assert.equal(card.id, 'note-3');
  assert.equal(card.title, 'New note');
  assert.deepEqual(JSON.parse(JSON.stringify(card.target)), { selector: '', label: '' });
  assert.deepEqual(JSON.parse(JSON.stringify(card.when)), { 'product.layers': [], 'product.page': 'list' });
});

test('removeCard removes id without mutating original array', async () => {
  const model = await loadModel();
  const cards = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  const next = model.removeCard(cards, 'b');
  assert.deepEqual(next.map((item) => item.id), ['a', 'c']);
  assert.deepEqual(cards.map((item) => item.id), ['a', 'b', 'c']);
});

test('applyVisibleOrder swaps visible slots only; hidden card order unchanged', async () => {
  const model = await loadModel();
  const cards = [{ id: 'a' }, { id: 'hidden-1' }, { id: 'b' }, { id: 'hidden-2' }, { id: 'c' }];
  const next = model.applyVisibleOrder(cards, ['c', 'a', 'b']);
  assert.deepEqual(next.map((item) => item.id), ['c', 'hidden-1', 'a', 'hidden-2', 'b']);
});

test('reorderVisibleIds reorders by drop target; invalid drops keep order', async () => {
  const model = await loadModel();
  assert.deepEqual(Array.from(model.reorderVisibleIds(['a', 'b', 'c'], 'a', 'c', true)), ['b', 'c', 'a']);
  assert.deepEqual(Array.from(model.reorderVisibleIds(['a', 'b', 'c'], 'c', 'a', false)), ['c', 'a', 'b']);
  assert.deepEqual(Array.from(model.reorderVisibleIds(['a', 'b'], 'x', 'a', false)), ['a', 'b']);
});
