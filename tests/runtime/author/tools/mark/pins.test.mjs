import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const sourceUrl = new URL('../../../../../skills/html-prototype-build/runtime/author/tools/mark/pins.js', import.meta.url);
function node(tag = 'div') { const listeners = new Map(); return { tagName: tag.toUpperCase(), className: '', dataset: {}, style: {}, children: [], textContent: '', appendChild(child) { this.children.push(child); child.parentElement = this; }, addEventListener(name, fn) { listeners.set(name, fn); }, dispatch(name, event) { listeners.get(name)?.(event); } }; }
async function boot() { const source = await readFile(sourceUrl, 'utf8'); const body = node('body'); const document = { body, createElement: (tag) => node(tag), createTextNode: (text) => ({ nodeValue: text, textContent: text }) }; const window = { scrollX: 10, scrollY: 20 }; window.window = window; let rafCalls = 0; const requestAnimationFrame = (fn) => { rafCalls++; fn(); return rafCalls; }; vm.runInNewContext(source, { window, document, requestAnimationFrame }, { filename: 'pins.js' }); return { api: window.AuthorToolsMarkPins, body, get rafCalls() { return rafCalls; } }; }

function classListFor(owner) {
  const names = new Set();
  const sync = () => { owner.className = [...names].join(' '); };
  return {
    add(name) { names.add(name); sync(); },
    remove(name) { names.delete(name); sync(); },
    toggle(name, force) { const on = force === undefined ? !names.has(name) : !!force; if (on) names.add(name); else names.delete(name); sync(); return on; },
    contains(name) { return names.has(name); }
  };
}
function pinEl() { const pin = { style: {}, className: '' }; pin.classList = classListFor(pin); return pin; }

test('Pin recomputes page coords from target rect and relative coords', async () => {
  const { api } = await boot(); const ann = { relX: 0.5, relY: 0.25, pageX: 0, pageY: 0, targetEl: { nodeType: 1, isConnected: true, getBoundingClientRect: () => ({ left: 100, top: 200, width: 40, height: 80 }) }, pinEl: { style: {} } }; api.position(ann); assert.equal(ann.pageX, 130); assert.equal(ann.pageY, 240); assert.equal(ann.pinEl.style.left, '119px');
});

test('Pin hides when its target sits in a closed popup and keeps the last point', async () => {
  const { api } = await boot();
  const pin = pinEl();
  const ann = { relX: 0.5, relY: 0.5, pageX: 400, pageY: 300, targetEl: { nodeType: 1, isConnected: true, checkVisibility: () => false, getBoundingClientRect: () => ({ left: 10, top: 20, width: 80, height: 40 }) }, pinEl: pin };
  api.position(ann);
  assert.equal(pin.classList.contains('mm-pin-hidden'), true);
  assert.equal(ann.pageX, 400);
  assert.equal(ann.pageY, 300);
  assert.equal(pin.style.left, '389px');
});

test('Pin shows again when the popup target is laid out', async () => {
  const { api } = await boot();
  const pin = pinEl();
  pin.classList.add('mm-pin-hidden');
  const ann = { relX: 0.5, relY: 0.25, pageX: 400, pageY: 300, targetEl: { nodeType: 1, isConnected: true, checkVisibility: () => true, getBoundingClientRect: () => ({ left: 100, top: 200, width: 40, height: 80 }) }, pinEl: pin };
  api.position(ann);
  assert.equal(pin.classList.contains('mm-pin-hidden'), false);
  assert.equal(ann.pageX, 130);
  assert.equal(ann.pageY, 240);
});

test('Pin hides a connected target that no longer has a box', async () => {
  const { api } = await boot();
  const pin = pinEl();
  const ann = { relX: 0.5, relY: 0.5, pageX: 12, pageY: 16, targetEl: { nodeType: 1, isConnected: true, getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0 }) }, pinEl: pin };
  api.position(ann);
  assert.equal(pin.classList.contains('mm-pin-hidden'), true);
  assert.equal(ann.pageX, 12);
});

test('Pin without a resolved target stays visible at its saved point', async () => {
  const { api } = await boot();
  const pin = pinEl();
  const ann = { pageX: 30, pageY: 40, targetEl: null, pinEl: pin };
  api.position(ann);
  assert.equal(pin.classList.contains('mm-pin-hidden'), false);
  assert.equal(pin.style.left, '19px');
});

test('Pin build wires open/remove handlers', async () => {
  const { api, body } = await boot(); const calls = []; const ann = { id: 3, pageX: 30, pageY: 40, targetEl: null }; const pin = api.build(ann, { onOpen: (item) => calls.push(['open', item.id]), onRemove: (id) => calls.push(['remove', id]) }); pin.dispatch('click', { target: pin, stopPropagation() {} }); pin.children[1].dispatch('click', { target: pin.children[1], stopPropagation() {} }); assert.equal(body.children.includes(pin), true); assert.deepEqual(calls, [['open', 3], ['remove', 3]]);
});
