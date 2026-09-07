import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const sourceUrl = new URL('../../../../../skills/html-prototype-build/runtime/author/tools/mark/storage.js', import.meta.url);
async function boot(initial = null) { const source = await readFile(sourceUrl, 'utf8'); const store = new Map(); if (initial !== null) store.set('html-mark:/demo', initial); const localStorage = { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => store.set(key, value) }; const window = {}; window.window = window; vm.runInNewContext(source, { window, location: { pathname: '/demo' }, localStorage, JSON }, { filename: 'storage.js' }); return { api: window.AuthorToolsMarkStorage, store }; }

test('MarkStorage save 不保存 DOM 引用', async () => {
  const { api, store } = await boot(); api.save([{ id: 1, note: 'n', label: 'L', selector: '#x', path: 'body>x', text: 't', html: '<div>', relX: 0.5, relY: 0.2, pageX: 10, pageY: 20, pinEl: {}, targetEl: {} }]); const saved = JSON.parse(store.get('html-mark:/demo')); assert.equal(saved[0].selector, '#x'); assert.equal('pinEl' in saved[0], false); assert.equal('targetEl' in saved[0], false);
});

test('MarkStorage load 对坏 JSON/非数组降级为空数组', async () => {
  assert.deepEqual(Array.from((await boot('{bad')).api.load()), []); assert.deepEqual(Array.from((await boot('{"x":1}')).api.load()), []);
});
