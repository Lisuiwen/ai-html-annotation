import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

{
const sourceUrl = new URL('../../skills/html-prototype-build/runtime/inspector.js', import.meta.url);
function classList() {
  const set = new Set();
  return { add: (...xs) => xs.forEach((x) => set.add(x)), remove: (...xs) => xs.forEach((x) => set.delete(x)), contains: (x) => set.has(x) };
}
async function boot() {
  const source = await readFile(sourceUrl, 'utf8');
  const listeners = new Map();
  const registered = [];
  let mode = '';
  const body = { classList: classList(), appendChild() {} };
  const document = {
    body,
    documentElement: {},
    head: { appendChild() {} },
    createElement: () => ({ className: '', style: {}, classList: classList(), setAttribute() {}, getBoundingClientRect: () => ({ width: 10, height: 10 }) }),
    addEventListener: (name, fn) => listeners.set(name, fn)
  };
  const window = {
    PrototypeAuthor: { register: (name, off) => registered.push([name, off]), activate: (name) => { mode = name; }, getMode: () => mode },
    PrototypeAuthorChrome: { isProductOnly: () => false, isOverlay: () => false }
  };
  window.window = window;
  vm.runInNewContext(source, { window, document, URLSearchParams, fetch: async () => ({ ok: true, text: async () => 'ok' }), console }, { filename: 'inspector.js' });
  return { window, document, listeners, registered, get mode() { return mode; } };
}
test('Inspector 初始化时注册全局事件和 PrototypeAuthor 插件', async () => {
  const env = await boot();
  assert.equal(env.window.__PROTOTYPE_INSPECTOR_LOADED__, true);
  assert.equal(typeof env.listeners.get('keydown'), 'function');
  assert.equal(typeof env.listeners.get('mousemove'), 'function');
  assert.equal(typeof env.listeners.get('click'), 'function');
  assert.equal(env.registered[0][0], 'inspector');
});
test('Alt+Shift 进入 inspector 模式，松键退出', async () => {
  const env = await boot();
  env.listeners.get('keydown')({ altKey: true, shiftKey: true, metaKey: false, ctrlKey: false });
  assert.equal(env.mode, 'inspector');
  assert.equal(env.document.body.classList.contains('pi-inspecting'), true);
  env.listeners.get('keyup')({ altKey: false, shiftKey: true, metaKey: false, ctrlKey: false });
  assert.equal(env.mode, '');
  assert.equal(env.document.body.classList.contains('pi-inspecting'), false);
});
}

{
const sourceUrl = new URL('../../skills/html-prototype-build/runtime/editor.js', import.meta.url);
test('NotesEditor 在 Viewer 未初始化时安全退出并保留公开 API', async () => {
  const source = await readFile(sourceUrl, 'utf8');
  const errors = [];
  const window = {};
  window.window = window;
  const document = {};
  const consoleMock = { error: (...args) => errors.push(args.join(' ')), log() {} };
  vm.runInNewContext(source, { window, document, console: consoleMock, JSON }, { filename: 'editor.js' });
  assert.equal(typeof window.PrototypeNotesEditor.init, 'function');
  assert.equal(typeof window.PrototypeNotesEditor.save, 'function');
  assert.match(errors.join('\n'), /Viewer 尚未初始化/);
});
test('NotesEditor 源码保留排序、绑定、脏状态保护关键路径', async () => {
  const source = await readFile(sourceUrl, 'utf8');
  assert.match(source, /function applyVisibleOrder/);
  assert.match(source, /function startPick/);
  assert.match(source, /beforeunload/);
  assert.match(source, /window\.PrototypeAuthor\.register\('notes-target'/);
});
}

{
const sourceUrl = new URL('../../skills/html-prototype-build/runtime/author-tools/shell.js', import.meta.url);
async function boot(productOnly = true) {
  const source = await readFile(sourceUrl, 'utf8');
  let created = 0;
  const window = { PrototypeAuthorChrome: { isProductOnly: () => productOnly } };
  window.window = window;
  const document = { createElement: () => { created++; return {}; } };
  vm.runInNewContext(source, { window, document, MutationObserver: function () {}, clearTimeout, setTimeout }, { filename: 'shell.js' });
  return { window, get created() { return created; } };
}
test('AuthorTools 暴露统一 Shell API', async () => {
  const { window } = await boot();
  assert.equal(window.AuthorTools.__ready, true);
  for (const method of ['register', 'toast', 'open', 'close', 'requestTab', 'init']) assert.equal(typeof window.AuthorTools[method], 'function');
  assert.equal(window.__AUTHOR_TOOLS_LOADED__, true);
});
test('product-only 模式 init 不创建作者 UI', async () => {
  const env = await boot(true);
  env.window.AuthorTools.init();
  assert.equal(env.created, 0);
});
}
