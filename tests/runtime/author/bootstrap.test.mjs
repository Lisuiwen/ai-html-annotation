import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const sourceUrl = new URL('../../../skills/html-prototype-build/runtime/author/bootstrap.js', import.meta.url);

async function boot() {
  const source = await readFile(sourceUrl, 'utf8');
  const listeners = new Map();
  const window = { dispatchEvent() {}, addEventListener() {} }; window.window = window;
  const document = { readyState: 'loading', addEventListener: (name, fn) => listeners.set(name, fn), createElement: () => ({}), head: { appendChild() {} } };
  function CustomEvent(type, init) { this.type = type; this.detail = init && init.detail; }
  vm.runInNewContext(source, { window, document, CustomEvent, Promise, console }, { filename: 'bootstrap.js' });
  return { window, listeners, source };
}

test('bootstrap 在 DOM loading 时延迟初始化', async () => {
  const { listeners } = await boot(); assert.equal(typeof listeners.get('DOMContentLoaded'), 'function');
});

test('bootstrap 只负责加载新 client/author 资源路径', async () => {
  const { source } = await boot();
  for (const path of [
    '/__prototype-author/author/core/modes.js',
    '/__prototype-author/client/core/display-mode.js',
    '/__prototype-author/author/core/selector.js',
    '/__prototype-author/author/core/picker.js',
    '/__prototype-author/author/shell/index.css',
    '/__prototype-author/author/shell/index.js',
    '/__prototype-author/author/tools/direct-edit/index.js',
    '/__prototype-author/author/tools/mark/index.js',
    '/__prototype-author/author/tools/notes-editor/model.js',
    '/__prototype-author/author/tools/notes-editor/index.js',
    '/__prototype-author/author/tools/inspector/index.js'
  ]) assert.match(source, new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.doesNotMatch(source, /var modes\s*=/);
  assert.doesNotMatch(source, /function register\(/);
  assert.doesNotMatch(source, /author-tools\//);
  assert.doesNotMatch(source, /author-loader\.js/);
});

test('bootstrap 先加载共享 selector，再加载 NotesEditor 与 Picker', async () => {
  const { source } = await boot();
  const selector = source.indexOf('/__prototype-author/author/core/selector.js');
  const model = source.indexOf('/__prototype-author/author/tools/notes-editor/model.js');
  const controller = source.indexOf('/__prototype-author/author/tools/notes-editor/index.js');
  const picker = source.indexOf('/__prototype-author/author/core/picker.js');
  assert.ok(selector >= 0 && model > selector && controller > model && picker > selector);
});
