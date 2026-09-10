import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

async function bootCoordinator() {
  const source = await readFile(new URL('../../../../skills/html-prototype-build/runtime/client/core/state.js', import.meta.url), 'utf8');
  const window = { location: { href: 'http://example.test/demo.html' }, history: { pushState() {}, replaceState() {} }, URL };
  window.window = window;
  vm.runInNewContext(source, { window, URL, console }, { filename: 'state.js' });
  return window.PrototypeViewers;
}

test('PrototypeViewers commits in normalize → apply → render order', async () => {
  const api = await bootCoordinator();
  const order = [];
  api.registerState('product', { normalize(value) { order.push('normalize'); return { ...(value || {}), normalized: true }; }, apply(value) { order.push('apply'); assert.equal(value.normalized, true); } });
  api.registerViewer('notes', { render(state) { order.push('render'); assert.equal(state.product.normalized, true); } });
  api.setState({ product: { page: 'list' } });
  assert.deepEqual(order, ['normalize', 'apply', 'render']);
});

test('getState returns deep copy; external edits do not mutate source of truth', async () => {
  const api = await bootCoordinator();
  api.setState({ product: { page: 'list', filters: ['a'] } });
  const state = api.getState(); state.product.page = 'bad'; state.product.filters.push('b');
  assert.equal(api.getState().product.page, 'list');
  assert.deepEqual(Array.from(api.getState().product.filters), ['a']);
});

test('scenario inheritance uses baseline; patchState exits scenario by default', async () => {
  const api = await bootCoordinator();
  api.setState({ product: { page: 'base', layer: '' } }, { baseline: true });
  api.registerScenario('parent', { state: { product: { page: 'detail' } } });
  api.registerScenario('child', { extends: 'parent', state: { product: { layer: 'modal' } } });
  assert.equal(api.activateScenario('child'), true);
  assert.equal(api.getState().product.page, 'detail');
  assert.equal(api.getState().product.layer, 'modal');
  api.patchState({ product: { layer: 'drawer' } });
  assert.equal(api.getActiveScenario(), '');
});

test('cyclic scenario inheritance returns false', async () => {
  const api = await bootCoordinator();
  api.registerScenario('a', { extends: 'b', state: {} });
  api.registerScenario('b', { extends: 'a', state: {} });
  assert.equal(api.activateScenario('a'), false);
});
