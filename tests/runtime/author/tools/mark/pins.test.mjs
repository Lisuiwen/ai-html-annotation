import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const sourceUrl = new URL('../../../../../skills/html-prototype-build/runtime/author/tools/mark/pins.js', import.meta.url);
function node(tag = 'div') { const listeners = new Map(); return { tagName: tag.toUpperCase(), className: '', dataset: {}, style: {}, children: [], textContent: '', appendChild(child) { this.children.push(child); child.parentElement = this; }, addEventListener(name, fn) { listeners.set(name, fn); }, dispatch(name, event) { listeners.get(name)?.(event); } }; }
async function boot() { const source = await readFile(sourceUrl, 'utf8'); const body = node('body'); const document = { body, createElement: (tag) => node(tag), createTextNode: (text) => ({ nodeValue: text, textContent: text }) }; const window = { scrollX: 10, scrollY: 20 }; window.window = window; let rafCalls = 0; const requestAnimationFrame = (fn) => { rafCalls++; fn(); return rafCalls; }; vm.runInNewContext(source, { window, document, requestAnimationFrame }, { filename: 'pins.js' }); return { api: window.AuthorToolsMarkPins, body, get rafCalls() { return rafCalls; } }; }

test('Pin 根据目标 rect + 相对坐标重算page面坐标', async () => {
  const { api } = await boot(); const ann = { relX: 0.5, relY: 0.25, pageX: 0, pageY: 0, targetEl: { nodeType: 1, isConnected: true, getBoundingClientRect: () => ({ left: 100, top: 200, width: 40, height: 80 }) }, pinEl: { style: {} } }; api.position(ann); assert.equal(ann.pageX, 130); assert.equal(ann.pageY, 240); assert.equal(ann.pinEl.style.left, '119px');
});

test('Pin build 连接 open/remove handler', async () => {
  const { api, body } = await boot(); const calls = []; const ann = { id: 3, pageX: 30, pageY: 40, targetEl: null }; const pin = api.build(ann, { onOpen: (item) => calls.push(['open', item.id]), onRemove: (id) => calls.push(['remove', id]) }); pin.dispatch('click', { target: pin, stopPropagation() {} }); pin.children[1].dispatch('click', { target: pin.children[1], stopPropagation() {} }); assert.equal(body.children.includes(pin), true); assert.deepEqual(calls, [['open', 3], ['remove', 3]]);
});
