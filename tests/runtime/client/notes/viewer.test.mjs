import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

async function bootCoordinator() {
  const source = await readFile(new URL('../../../../skills/html-prototype-build/runtime/client/notes/viewer.js', import.meta.url), 'utf8');
  const start = source.indexOf('/* 原型统一状态协调器');
  const end = source.indexOf('/* 原型正式标注只读 Viewer', start);
  assert.ok(start >= 0 && end > start, 'viewer.js 应包含状态协调器区段');
  const window = { location: { href: 'http://example.test/demo.html' }, history: { pushState() {}, replaceState() {} }, URL };
  window.window = window;
  vm.runInNewContext(source.slice(start, end), { window, URL, console }, { filename: 'viewer-state.js' });
  return window.PrototypeViewers;
}

test('PrototypeViewers 按 normalize → apply → render 提交', async () => {
  const api = await bootCoordinator();
  const order = [];
  api.registerState('product', { normalize(value) { order.push('normalize'); return { ...(value || {}), normalized: true }; }, apply(value) { order.push('apply'); assert.equal(value.normalized, true); } });
  api.registerViewer('notes', { render(state) { order.push('render'); assert.equal(state.product.normalized, true); } });
  api.setState({ product: { page: 'list' } });
  assert.deepEqual(order, ['normalize', 'apply', 'render']);
});

test('getState 返回深副本，外部修改不污染唯一状态', async () => {
  const api = await bootCoordinator();
  api.setState({ product: { page: 'list', filters: ['a'] } });
  const state = api.getState(); state.product.page = 'bad'; state.product.filters.push('b');
  assert.equal(api.getState().product.page, 'list');
  assert.deepEqual(Array.from(api.getState().product.filters), ['a']);
});

test('场景继承基于 baseline，patchState 默认退出场景', async () => {
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

test('循环场景继承返回 false', async () => {
  const api = await bootCoordinator();
  api.registerScenario('a', { extends: 'b', state: {} }); api.registerScenario('b', { extends: 'a', state: {} });
  assert.equal(api.activateScenario('a'), false);
});

test('Viewer 深链恢复只读取 scene，不恢复 legacy state', async () => {
  const source = await readFile(new URL('../../../../skills/html-prototype-build/runtime/client/notes/viewer.js', import.meta.url), 'utf8');
  const start = source.indexOf('function activateInitialState');
  const end = source.indexOf('\n  }', start);
  const body = source.slice(start, end);
  assert.match(body, /readUrlParam\('scene'\)/);
  assert.doesNotMatch(body, /legacyState/);
});
