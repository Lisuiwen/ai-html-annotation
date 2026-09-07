import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

{
const sourceUrl = new URL('../../skills/html-prototype-build/runtime/author-loader.js', import.meta.url);

async function boot() {
  const source = await readFile(sourceUrl, 'utf8');
  const listeners = new Map();
  const events = [];
  const window = { dispatchEvent: (event) => events.push(event), addEventListener() {} };
  window.window = window;
  const document = {
    readyState: 'loading',
    addEventListener: (name, fn) => listeners.set(name, fn),
    createElement: () => ({}),
    head: { appendChild() {} }
  };
  function CustomEvent(type, init) { this.type = type; this.detail = init && init.detail; }
  vm.runInNewContext(source, { window, document, CustomEvent, Promise, console }, { filename: 'author-loader.js' });
  return { window, listeners, events };
}

test('PrototypeAuthor 注册插件并在模式切换时停用其他插件', async () => {
  const { window, events } = await boot();
  const calls = [];
  window.PrototypeAuthor.register('mark', () => calls.push('mark-off'));
  window.PrototypeAuthor.register('edit', () => calls.push('edit-off'));
  window.PrototypeAuthor.activate('edit');
  assert.deepEqual(calls, ['mark-off']);
  assert.equal(window.PrototypeAuthor.getMode(), 'edit');
  assert.equal(events.at(-1).type, 'prototype-author:mode-change');
  assert.equal(events.at(-1).detail.mode, 'edit');
  window.PrototypeAuthor.activate('');
  assert.deepEqual(calls, ['mark-off', 'mark-off', 'edit-off']);
  assert.equal(window.PrototypeAuthor.getMode(), '');
});

test('author-loader 在 DOM loading 时延迟 init', async () => {
  const { listeners } = await boot();
  assert.equal(typeof listeners.get('DOMContentLoaded'), 'function');
});
}

{
const sourceUrl = new URL('../../skills/html-prototype-build/runtime/author-chrome.js', import.meta.url);

function classes() {
  const set = new Set();
  return { add: (...xs) => xs.forEach((x) => set.add(x)), remove: (...xs) => xs.forEach((x) => set.delete(x)), contains: (x) => set.has(x) };
}

async function boot(search = '') {
  const source = await readFile(sourceUrl, 'utf8');
  const headChildren = [];
  const body = { classList: classes() };
  const document = {
    readyState: 'complete',
    body,
    head: { appendChild: (node) => headChildren.push(node) },
    createElement: () => ({ id: '', textContent: '' }),
    getElementById: (id) => headChildren.find((node) => node.id === id) || null,
    documentElement: {},
    addEventListener() {}
  };
  const window = {
    location: { search, href: 'http://127.0.0.1:4178/demo.html' },
    history: { pushState() {}, replaceState() {} },
    URL,
    URLSearchParams
  };
  window.window = window;
  vm.runInNewContext(source, { window, document, URL, URLSearchParams, console }, { filename: 'author-chrome.js' });
  return { window, document, headChildren };
}

test('PrototypeAuthorChrome 安装一次样式并识别 overlay', async () => {
  const { window, headChildren } = await boot();
  assert.equal(headChildren.filter((node) => node.id === 'prototype-author-chrome-style').length, 1);
  window.PrototypeAuthorChrome.installStyles();
  assert.equal(headChildren.filter((node) => node.id === 'prototype-author-chrome-style').length, 1);
  const overlay = { closest: (selector) => selector.includes('.at-ui') ? {} : null };
  assert.equal(window.PrototypeAuthorChrome.isOverlay(overlay), true);
  assert.equal(window.PrototypeAuthorChrome.isOverlay(null), false);
});

test('product-only=1 自动进入纯页面态', async () => {
  const { window, document } = await boot('?product-only=1');
  assert.equal(window.PrototypeAuthorChrome.isProductOnly(), true);
  assert.equal(document.body.classList.contains('pa-product-only'), true);
});
}

{
const sourceUrl = new URL('../../skills/html-prototype-build/runtime/viewer.js', import.meta.url);

async function bootCoordinator() {
  const source = await readFile(sourceUrl, 'utf8');
  const start = source.indexOf('/* 原型统一状态协调器');
  const end = source.indexOf('/* 原型正式标注只读 Viewer', start);
  assert.ok(start >= 0 && end > start, 'viewer.js 应包含状态协调器区段');
  const segment = source.slice(start, end);
  const window = { location: { href: 'http://example.test/demo.html' }, history: { pushState() {}, replaceState() {} }, URL };
  window.window = window;
  vm.runInNewContext(segment, { window, URL, console }, { filename: 'viewer-state.js' });
  return window.PrototypeViewers;
}

test('PrototypeViewers 按 normalize → apply → render 提交', async () => {
  const api = await bootCoordinator();
  const order = [];
  api.registerState('product', {
    normalize(value) { order.push('normalize'); return { ...(value || {}), normalized: true }; },
    apply(value) { order.push('apply'); assert.equal(value.normalized, true); }
  });
  api.registerViewer('notes', { render(state) { order.push('render'); assert.equal(state.product.normalized, true); } });
  api.setState({ product: { page: 'list' } });
  assert.deepEqual(order, ['normalize', 'apply', 'render']);
  assert.equal(api.getState().product.page, 'list');
});

test('PrototypeViewers getState 返回副本，外部修改不污染唯一状态', async () => {
  const api = await bootCoordinator();
  api.setState({ product: { page: 'list', filters: ['a'] } });
  const state = api.getState();
  state.product.page = 'bad';
  state.product.filters.push('b');
  assert.equal(api.getState().product.page, 'list');
  assert.deepEqual(Array.from(api.getState().product.filters), ['a']);
});

test('场景继承基于 baseline，patchState 默认退出场景', async () => {
  const api = await bootCoordinator();
  api.setState({ product: { page: 'base', layer: '' } }, { baseline: true });
  api.registerScenario('parent', { state: { product: { page: 'detail' } } });
  api.registerScenario('child', { extends: 'parent', state: { product: { layer: 'modal' } } });
  assert.equal(api.activateScenario('child'), true);
  assert.equal(api.getActiveScenario(), 'child');
  assert.equal(api.getState().product.page, 'detail');
  assert.equal(api.getState().product.layer, 'modal');
  api.patchState({ product: { layer: 'drawer' } });
  assert.equal(api.getActiveScenario(), '');
  assert.equal(api.getState().product.layer, 'drawer');
});

test('循环场景继承返回 false', async () => {
  const api = await bootCoordinator();
  api.registerScenario('a', { extends: 'b', state: {} });
  api.registerScenario('b', { extends: 'a', state: {} });
  assert.equal(api.activateScenario('a'), false);
});
}
