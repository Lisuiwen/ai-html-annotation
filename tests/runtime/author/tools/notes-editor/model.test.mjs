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

test('createCardId 避免与已有 note-N 冲突', async () => {
  const model = await loadModel();
  assert.equal(model.createCardId([]), 'note-1');
  assert.equal(model.createCardId([{ id: 'note-3' }, { id: 'custom' }, { id: 'note-4' }]), 'note-5');
  assert.equal(model.createCardId([{ id: 'note-2' }]), 'note-3');
});

test('whenForCurrentLayer 只提取 layer/layers/page 并复制 layers', async () => {
  const model = await loadModel();
  const layers = ['create'];
  const when = model.whenForCurrentLayer({ product: { page: 'list', layers, tab: 'x' } });
  assert.deepEqual(JSON.parse(JSON.stringify(when)), { 'product.layers': ['create'], 'product.page': 'list' });
  layers.push('confirm');
  assert.deepEqual(Array.from(when['product.layers']), ['create']);
  assert.equal(model.whenForCurrentLayer({ product: { page: 'list' } }), undefined);
  assert.deepEqual(JSON.parse(JSON.stringify(model.whenForCurrentLayer({ product: { layer: 'modal' } }))), { 'product.layer': 'modal' });
});

test('createCard 生成DefaultCard并带当前图层 when', async () => {
  const model = await loadModel();
  const card = model.createCard([{ id: 'note-2' }], { product: { page: 'list', layers: [] } });
  assert.equal(card.id, 'note-3');
  assert.equal(card.title, 'New note');
  assert.deepEqual(JSON.parse(JSON.stringify(card.target)), { selector: '', label: '' });
  assert.deepEqual(JSON.parse(JSON.stringify(card.when)), { 'product.layers': [], 'product.page': 'list' });
});

test('removeCard Delete指定 id 且不改原数组', async () => {
  const model = await loadModel();
  const cards = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  const next = model.removeCard(cards, 'b');
  assert.deepEqual(next.map((item) => item.id), ['a', 'c']);
  assert.deepEqual(cards.map((item) => item.id), ['a', 'b', 'c']);
});

test('applyVisibleOrder 只替换可见Card槽位，隐藏Card相对位置不变', async () => {
  const model = await loadModel();
  const cards = [{ id: 'a' }, { id: 'hidden-1' }, { id: 'b' }, { id: 'hidden-2' }, { id: 'c' }];
  const next = model.applyVisibleOrder(cards, ['c', 'a', 'b']);
  assert.deepEqual(next.map((item) => item.id), ['c', 'hidden-1', 'a', 'hidden-2', 'b']);
});

test('reorderVisibleIds 按前后落点重排且非法落点保持原序', async () => {
  const model = await loadModel();
  assert.deepEqual(Array.from(model.reorderVisibleIds(['a', 'b', 'c'], 'a', 'c', true)), ['b', 'c', 'a']);
  assert.deepEqual(Array.from(model.reorderVisibleIds(['a', 'b', 'c'], 'c', 'a', false)), ['c', 'a', 'b']);
  assert.deepEqual(Array.from(model.reorderVisibleIds(['a', 'b'], 'x', 'a', false)), ['a', 'b']);
});
