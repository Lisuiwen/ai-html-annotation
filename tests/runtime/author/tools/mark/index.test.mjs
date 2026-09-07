import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const sourceUrl = new URL('../../../../../skills/html-prototype-build/runtime/author/tools/mark/index.js', import.meta.url);
async function boot() { const source = await readFile(sourceUrl, 'utf8'); const calls = []; const bodyClasses = new Set(); const window = { AuthorToolsPicker: { activate: (options) => calls.push(['activate', options]), release: (owner) => calls.push(['release', owner]) } }; window.window = window; const document = { body: { classList: { add: (name) => bodyClasses.add(name), remove: (name) => bodyClasses.delete(name), contains: (name) => bodyClasses.has(name) } }, getElementById: () => null, createElement: () => ({}), head: { appendChild() {} } }; vm.runInNewContext(source, { window, document, location: { pathname: '/demo', hash: '' }, console, setTimeout, clearTimeout }, { filename: 'mark/index.js' }); return { window, calls, bodyClasses, source }; }

test('Mark activate 使用共享 Picker 且不持久化选择高亮', async () => {
  const { window, calls, bodyClasses } = await boot(); window.AuthorToolsMarkTool.activate(); const [, options] = calls[0]; assert.equal(options.owner, 'mark'); assert.equal(options.persistSelection, false); assert.equal(typeof options.onSelect, 'function'); assert.equal(bodyClasses.has('mm-on'), true);
});

test('Mark deactivate 释放 owner 并关闭显示态', async () => {
  const { window, calls, bodyClasses } = await boot(); window.AuthorToolsMarkTool.activate(); window.AuthorToolsMarkTool.deactivate(); assert.deepEqual(calls.at(-1), ['release', 'mark']); assert.equal(bodyClasses.has('mm-on'), false);
});

test('Mark restore 优先 selector 再 fallback path', async () => {
  const { source } = await boot(); const start = source.indexOf('function restore()'); const end = source.indexOf('\n  function handleKey', start); const body = source.slice(start, end); assert.ok(body.indexOf('item.selector') >= 0); assert.ok(body.indexOf('item.path') > body.indexOf('item.selector'));
});
