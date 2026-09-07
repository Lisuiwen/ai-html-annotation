import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const sourceUrl = new URL('../../../../../skills/html-prototype-build/runtime/author/tools/direct-edit/index.js', import.meta.url);
function containerStub() { return { querySelectorAll: () => [], querySelector: () => null }; }
async function boot({ dirty = false, selector = '#box' } = {}) {
  const source = await readFile(sourceUrl, 'utf8'); const calls = []; const toasts = []; const sessions = [];
  const window = {
    AuthorToolsEditPanel: { render: () => {} },
    AuthorToolsPicker: { activate: (options) => calls.push(['activate', options]), release: (owner) => calls.push(['release', owner]), stableSelector: () => selector },
    AuthorToolsStyleModel: { createSession: (el) => { const session = { element: el, rows: {}, isDirty: () => dirty, discard: () => calls.push(['discard']), toPatch: () => ({ styles: { width: '120px' }, removeStyles: [] }), setText() {}, previewStyle() {}, resetProperty() {}, resetElement() {} }; sessions.push(session); return session; } }
  };
  window.window = window; const fetchCalls = []; const fetch = async (...args) => { fetchCalls.push(args); return { ok: true, text: async () => '' }; };
  vm.runInNewContext(source, { window, fetch, JSON, console }, { filename: 'direct-edit/index.js' }); window.AuthorToolsEditTool.mount(containerStub(), { toast: (msg) => toasts.push(msg) });
  return { window, calls, toasts, sessions, fetchCalls, source };
}

test('Direct Edit activate/release 通过共享 Picker 管理 owner', async () => {
  const env = await boot(); env.window.AuthorToolsEditTool.activate(); assert.equal(env.calls[0][1].owner, 'edit'); assert.equal(typeof env.calls[0][1].onSelect, 'function'); env.window.AuthorToolsEditTool.deactivate(); assert.deepEqual(env.calls.at(-1), ['release', 'edit']);
});

test('dirty session 拒绝切换元素并提示', async () => {
  const env = await boot({ dirty: true }); env.window.AuthorToolsEditTool.activate(); const onSelect = env.calls[0][1].onSelect;
  assert.equal(onSelect({ tagName: 'DIV', id: 'a', className: '' }), true); assert.equal(onSelect({ tagName: 'DIV', id: 'b', className: '' }), false); assert.match(env.toasts.at(-1), /先保存或取消/);
});

test('无稳定 selector 时守住写回边界', async () => {
  const env = await boot({ dirty: true, selector: 'body > div' }); env.window.AuthorToolsEditTool.activate(); env.calls[0][1].onSelect({ tagName: 'DIV', id: '', className: '' });
  assert.match(env.source, /selector\.charAt\(0\) !== '#'/); assert.equal(env.fetchCalls.length, 0);
});

test('Direct Edit 输入处理 IME 且逐键不整体 render', async () => {
  const { source } = await boot(); assert.match(source, /compositionstart/); assert.match(source, /compositionend/); const start = source.indexOf("input.addEventListener('input'"); const end = source.indexOf("input.addEventListener('compositionstart'", start); assert.ok(start >= 0 && end > start); assert.doesNotMatch(source.slice(start, end), /\brender\(\)/);
});
