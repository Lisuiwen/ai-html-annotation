import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const sourceUrl = new URL('../../../skills/html-prototype-build/runtime/author/bootstrap.js', import.meta.url);

async function boot() {
  const source = await readFile(sourceUrl, 'utf8');
  const listeners = new Map(); const events = [];
  const window = { dispatchEvent: (event) => events.push(event), addEventListener() {} }; window.window = window;
  const document = { readyState: 'loading', addEventListener: (name, fn) => listeners.set(name, fn), createElement: () => ({}), head: { appendChild() {} } };
  function CustomEvent(type, init) { this.type = type; this.detail = init && init.detail; }
  vm.runInNewContext(source, { window, document, CustomEvent, Promise, console }, { filename: 'bootstrap.js' });
  return { window, listeners, events, source };
}

test('PrototypeAuthor 模式切换会停用其他选择型插件', async () => {
  const { window, events } = await boot(); const calls = [];
  window.PrototypeAuthor.register('mark', () => calls.push('mark-off')); window.PrototypeAuthor.register('edit', () => calls.push('edit-off'));
  window.PrototypeAuthor.activate('edit');
  assert.deepEqual(calls, ['mark-off']); assert.equal(window.PrototypeAuthor.getMode(), 'edit'); assert.equal(events.at(-1).detail.mode, 'edit');
  window.PrototypeAuthor.activate(''); assert.deepEqual(calls, ['mark-off', 'mark-off', 'edit-off']);
});

test('bootstrap 在 DOM loading 时延迟初始化', async () => {
  const { listeners } = await boot(); assert.equal(typeof listeners.get('DOMContentLoaded'), 'function');
});

test('bootstrap 只引用新 client/author 资源路径', async () => {
  const { source } = await boot();
  for (const path of [
    '/__prototype-author/client/core/display-mode.js',
    '/__prototype-author/author/core/picker.js',
    '/__prototype-author/author/shell/index.css',
    '/__prototype-author/author/shell/index.js',
    '/__prototype-author/author/tools/direct-edit/index.js',
    '/__prototype-author/author/tools/mark/index.js',
    '/__prototype-author/author/tools/notes-editor/index.js',
    '/__prototype-author/author/tools/inspector/index.js'
  ]) assert.match(source, new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.doesNotMatch(source, /author-tools\//); assert.doesNotMatch(source, /author-loader\.js/);
});
