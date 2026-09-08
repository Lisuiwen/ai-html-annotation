import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const sourceUrl = new URL('../../../../skills/html-prototype-build/runtime/client/notes/model.js', import.meta.url);

async function boot() {
  const source = await readFile(sourceUrl, 'utf8');
  const window = {}; window.window = window;
  vm.runInNewContext(source, { window }, { filename: 'model.js' });
  return window.PrototypeNotesModel;
}

test('场景 id 与 label 同时兼容对象式和数组式定义', async () => {
  const model = await boot();
  const objectDefs = { base: { label: '基础' }, modal: {} };
  assert.deepEqual(Array.from(model.listScenarioIds(objectDefs)), ['base', 'modal']);
  assert.equal(model.scenarioLabel(objectDefs, 'base'), '基础');
  assert.equal(model.scenarioLabel(objectDefs, 'modal'), 'modal');
  const arrayDefs = [{ id: 'base', label: '基础' }, null, { id: 'modal' }];
  assert.deepEqual(Array.from(model.listScenarioIds(arrayDefs)), ['base', 'modal']);
  assert.equal(model.scenarioLabel(arrayDefs, 'base'), '基础');
});

test('when 支持点路径、深对象和数组精确匹配', async () => {
  const model = await boot();
  const state = { product: { page: 'list', filters: { status: 'open' }, layers: ['create'] } };
  assert.equal(model.matchesWhen({ 'product.page': 'list' }, state), true);
  assert.equal(model.matchesWhen({ product: { filters: { status: 'open' } } }, state), true);
  assert.equal(model.matchesWhen({ 'product.layers': ['create'] }, state), true);
  assert.equal(model.matchesWhen({ 'product.layers': [] }, state), false);
});

test('when .includes 只对数组包含生效且多条件为 AND', async () => {
  const model = await boot();
  const state = { product: { page: 'list', layers: ['create', 'help'] } };
  assert.equal(model.matchesWhen({ 'product.layers.includes': 'create' }, state), true);
  assert.equal(model.matchesWhen({ 'product.layers.includes': 'missing' }, state), false);
  assert.equal(model.matchesWhen({ 'product.page': 'list', 'product.layers.includes': 'help' }, state), true);
  assert.equal(model.matchesWhen({ 'product.page': 'detail', 'product.layers.includes': 'help' }, state), false);
});

test('visibleCards 保留无 when 卡片并过滤不匹配卡片', async () => {
  const model = await boot();
  const cards = [
    { id: 'always' },
    { id: 'list', when: { 'product.page': 'list' } },
    { id: 'detail', when: { 'product.page': 'detail' } }
  ];
  assert.deepEqual(Array.from(model.visibleCards(cards, { product: { page: 'list' } }), (card) => card.id), ['always', 'list']);
  assert.deepEqual(Array.from(model.visibleCards(null, {})), []);
});
