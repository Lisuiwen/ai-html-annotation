import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

{
const sourceUrl = new URL('../../../../skills/html-prototype-build/runtime/author/tools/mark/storage.js', import.meta.url);
async function boot(initial = null) { const source = await readFile(sourceUrl, 'utf8'); const store = new Map(); if (initial !== null) store.set('html-mark:/demo', initial); const localStorage = { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => store.set(key, value) }; const window = {}; window.window = window; vm.runInNewContext(source, { window, location: { pathname: '/demo' }, localStorage, JSON }, { filename: 'storage.js' }); return { api: window.AuthorToolsMarkStorage, store }; }
test('MarkStorage save 不保存 DOM 引用', async () => {
  const { api, store } = await boot(); api.save([{ id: 1, note: 'n', label: 'L', selector: '#x', path: 'body>x', text: 't', html: '<div>', relX: 0.5, relY: 0.2, pageX: 10, pageY: 20, pinEl: {}, targetEl: {} }]); const saved = JSON.parse(store.get('html-mark:/demo')); assert.equal(saved[0].selector, '#x'); assert.equal('pinEl' in saved[0], false); assert.equal('targetEl' in saved[0], false);
});
test('MarkStorage load 对坏 JSON/非数组降级为空数组', async () => {
  assert.deepEqual(Array.from((await boot('{bad')).api.load()), []); assert.deepEqual(Array.from((await boot('{"x":1}')).api.load()), []);
});
}

{
const sourceUrl = new URL('../../../../skills/html-prototype-build/runtime/author/tools/mark/pins.js', import.meta.url);
function node(tag = 'div') { const listeners = new Map(); return { tagName: tag.toUpperCase(), className: '', dataset: {}, style: {}, children: [], textContent: '', appendChild(child) { this.children.push(child); child.parentElement = this; }, addEventListener(name, fn) { listeners.set(name, fn); }, dispatch(name, event) { listeners.get(name)?.(event); } }; }
async function boot() { const source = await readFile(sourceUrl, 'utf8'); const body = node('body'); const document = { body, createElement: (tag) => node(tag), createTextNode: (text) => ({ nodeValue: text, textContent: text }) }; const window = { scrollX: 10, scrollY: 20 }; window.window = window; let rafCalls = 0; const requestAnimationFrame = (fn) => { rafCalls++; fn(); return rafCalls; }; vm.runInNewContext(source, { window, document, requestAnimationFrame }, { filename: 'pins.js' }); return { api: window.AuthorToolsMarkPins, body, get rafCalls() { return rafCalls; } }; }
test('Pin 根据目标 rect + 相对坐标重算页面坐标', async () => {
  const { api } = await boot(); const ann = { relX: 0.5, relY: 0.25, pageX: 0, pageY: 0, targetEl: { nodeType: 1, isConnected: true, getBoundingClientRect: () => ({ left: 100, top: 200, width: 40, height: 80 }) }, pinEl: { style: {} } }; api.position(ann); assert.equal(ann.pageX, 130); assert.equal(ann.pageY, 240); assert.equal(ann.pinEl.style.left, '119px');
});
test('Pin build 连接 open/remove handler', async () => {
  const { api, body } = await boot(); const calls = []; const ann = { id: 3, pageX: 30, pageY: 40, targetEl: null }; const pin = api.build(ann, { onOpen: (item) => calls.push(['open', item.id]), onRemove: (id) => calls.push(['remove', id]) }); pin.dispatch('click', { target: pin, stopPropagation() {} }); pin.children[1].dispatch('click', { target: pin.children[1], stopPropagation() {} }); assert.equal(body.children.includes(pin), true); assert.deepEqual(calls, [['open', 3], ['remove', 3]]);
});
}

{
const sourceUrl = new URL('../../../../skills/html-prototype-build/runtime/author/tools/mark/index.js', import.meta.url);
async function boot() { const source = await readFile(sourceUrl, 'utf8'); const calls = []; const bodyClasses = new Set(); const window = { AuthorToolsPicker: { activate: (options) => calls.push(['activate', options]), release: (owner) => calls.push(['release', owner]) } }; window.window = window; const document = { body: { classList: { add: (name) => bodyClasses.add(name), remove: (name) => bodyClasses.delete(name), contains: (name) => bodyClasses.has(name) } }, getElementById: () => null, createElement: () => ({}), head: { appendChild() {} } }; vm.runInNewContext(source, { window, document, location: { pathname: '/demo', hash: '' }, console, setTimeout, clearTimeout }, { filename: 'mark/index.js' }); return { window, calls, bodyClasses }; }
test('Mark activate 使用共享 Picker 且不持久化选择高亮', async () => {
  const { window, calls, bodyClasses } = await boot(); window.AuthorToolsMarkTool.activate(); const [, options] = calls[0]; assert.equal(options.owner, 'mark'); assert.equal(options.persistSelection, false); assert.equal(typeof options.onSelect, 'function'); assert.equal(bodyClasses.has('mm-on'), true);
});
test('Mark deactivate 释放 owner 并关闭显示态', async () => {
  const { window, calls, bodyClasses } = await boot(); window.AuthorToolsMarkTool.activate(); window.AuthorToolsMarkTool.deactivate(); assert.deepEqual(calls.at(-1), ['release', 'mark']); assert.equal(bodyClasses.has('mm-on'), false);
});
test('Mark restore 优先 selector 再 fallback path', async () => {
  const source = await readFile(sourceUrl, 'utf8'); const start = source.indexOf('function restore()'); const end = source.indexOf('\n  function handleKey', start); const body = source.slice(start, end); assert.ok(body.indexOf('item.selector') >= 0); assert.ok(body.indexOf('item.path') > body.indexOf('item.selector'));
});
}
