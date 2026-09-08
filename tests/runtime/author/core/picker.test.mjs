import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const selectorUrl = new URL('../../../../skills/html-prototype-build/runtime/author/core/selector.js', import.meta.url);
const sourceUrl = new URL('../../../../skills/html-prototype-build/runtime/author/core/picker.js', import.meta.url);
function classList() { const values = new Set(); return { add: (...names) => names.forEach((name) => values.add(name)), remove: (...names) => names.forEach((name) => values.delete(name)), contains: (name) => values.has(name), toggle: (name, on) => on ? values.add(name) : values.delete(name) }; }
function element(tag, parent = null) { const attrs = new Map(); const el = { nodeType: 1, tagName: tag.toUpperCase(), id: '', parentElement: parent, children: [], classList: classList(), closest: () => null, matches: () => false, getAttribute: (name) => attrs.get(name) || null, setAttribute: (name, value) => attrs.set(name, value) }; if (parent && parent.children) parent.children.push(el); return el; }
async function boot(platform = 'Win32') {
  const [selectorSource, source] = await Promise.all([readFile(selectorUrl, 'utf8'), readFile(sourceUrl, 'utf8')]); const listeners = new Map(); const windowListeners = new Map(); const body = element('body'); const html = element('html'); body.parentElement = html;
  const document = { body, documentElement: html, addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: (name) => listeners.delete(name) };
  const window = { CSS: { escape: (value) => String(value).replace(/:/g, '\\:') }, addEventListener: (name, fn) => windowListeners.set(name, fn), removeEventListener: (name) => windowListeners.delete(name) }; window.window = window;
  const context = { window, document, navigator: { platform }, requestAnimationFrame: (fn) => { fn(); return 1; }, CSS: window.CSS, console, String, Array, Object };
  vm.runInNewContext(selectorSource, context, { filename: 'selector.js' });
  vm.runInNewContext(source, context, { filename: 'picker.js' });
  return { window, listeners, body, source };
}
function clickEvent(target, extra = {}) { return { target, ctrlKey: true, metaKey: false, preventDefault() {}, stopPropagation() {}, ...extra }; }

test('普通点击不选择，Ctrl+Click 选择', async () => {
  const { window, listeners, body } = await boot(); const target = element('button', body); target.matches = (selector) => selector.includes('button'); let selected = null;
  window.AuthorToolsPicker.activate({ owner: 'edit', onSelect: (el) => { selected = el; } });
  listeners.get('click')({ ...clickEvent(target), ctrlKey: false }); assert.equal(selected, null);
  listeners.get('click')(clickEvent(target)); assert.equal(selected, target); assert.equal(target.classList.contains('at-hl'), true);
});

test('onSelect=false 保留旧选中态', async () => {
  const { window, listeners, body } = await boot(); const a = element('div', body); const b = element('div', body); a.id = 'a'; b.id = 'b';
  window.AuthorToolsPicker.activate({ owner: 'edit', onSelect: (target) => target !== b }); listeners.get('click')(clickEvent(a)); listeners.get('click')(clickEvent(b));
  assert.equal(a.classList.contains('at-hl'), true); assert.equal(b.classList.contains('at-hl'), false);
});

test('persistSelection=false 不留下选中高亮', async () => {
  const { window, listeners, body } = await boot(); const target = element('div', body); target.id = 'x'; let called = 0;
  window.AuthorToolsPicker.activate({ owner: 'mark', persistSelection: false, onSelect: () => { called++; } }); listeners.get('click')(clickEvent(target));
  assert.equal(called, 1); assert.equal(target.classList.contains('at-hl'), false);
});

test('stableSelector 通过共享 selector 保持 id、note target、cssPath 行为', async () => {
  const { window, body, source } = await boot(); const byId = element('div', body); byId.id = 'foo:bar'; assert.equal(window.AuthorToolsPicker.stableSelector(byId), '#foo\\:bar');
  const byNote = element('div', body); byNote.setAttribute('data-prototype-note-target', 'save'); assert.equal(window.AuthorToolsPicker.stableSelector(byNote), '[data-prototype-note-target="save"]');
  const parent = element('section', body); element('span', parent); const two = element('span', parent); assert.match(window.AuthorToolsPicker.cssPath(two), /span:nth-of-type\(2\)$/);
  assert.match(source, /AuthorToolsSelector\.stableSelector/); assert.match(source, /AuthorToolsSelector\.cssPath/);
});

test('切换 owner 会释放旧 owner 的监听与高亮', async () => {
  const { window, listeners, body } = await boot(); const target = element('div', body); target.id = 'x'; window.AuthorToolsPicker.activate({ owner: 'edit' }); listeners.get('click')(clickEvent(target));
  assert.equal(target.classList.contains('at-hl'), true); window.AuthorToolsPicker.activate({ owner: 'mark', persistSelection: false }); assert.equal(target.classList.contains('at-hl'), false); window.AuthorToolsPicker.release('mark'); assert.equal(listeners.has('click'), false);
});
