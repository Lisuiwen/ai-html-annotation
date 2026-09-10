import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const sourceUrl = new URL('../../../../../skills/html-prototype-build/runtime/author/tools/direct-edit/style-model.js', import.meta.url);
function styleStore(initial = {}) { const values = new Map(Object.entries(initial)); const priorities = new Map(); return { values, getPropertyValue: (name) => values.get(name) || '', getPropertyPriority: (name) => priorities.get(name) || '', setProperty(name, value, priority = '') { values.set(name, value); if (priority) priorities.set(name, priority); else priorities.delete(name); }, removeProperty(name) { values.delete(name); priorities.delete(name); } }; }
function createElement(initialStyle = {}, text = 'hello') {
  const style = styleStore(initialStyle); const attrs = new Map(); const serialize = () => [...style.values].map(([k, v]) => `${k}: ${v}`).join('; '); if (Object.keys(initialStyle).length) attrs.set('style', serialize()); const textNode = { nodeType: 3, textContent: text };
  return { nodeType: 1, style, id: 'box', classList: { contains: () => false }, childNodes: [textNode], textContent: text, parentElement: null, getAttribute: (name) => name === 'style' ? (attrs.get('style') || null) : null,
    setAttribute(name, value) { attrs.set(name, value); if (name === 'style') { style.values.clear(); String(value).split(';').forEach((part) => { const i = part.indexOf(':'); if (i > 0) style.values.set(part.slice(0, i).trim(), part.slice(i + 1).trim()); }); } }, removeAttribute(name) { attrs.delete(name); if (name === 'style') style.values.clear(); }, matches: () => false };
}
async function boot(el, computed = {}) {
  const source = await readFile(sourceUrl, 'utf8'); const document = { styleSheets: [], documentElement: {} };
  const window = { getComputedStyle: () => ({ getPropertyValue: (prop) => computed[prop] ?? (prop === 'color' || prop === 'background-color' || prop === 'border-color' ? 'rgba(0, 0, 0, 0)' : prop === 'font-weight' ? '400' : prop === 'text-align' ? 'start' : prop === 'border-style' ? 'none' : '0px') }), matchMedia: () => ({ matches: true }) }; window.window = window;
  vm.runInNewContext(source, { window, document, console }, { filename: 'style-model.js' }); return window.AuthorToolsStyleModel.createSession(el);
}

test('StyleModel 回显 computed value 并保留 inline 基线', async () => {
  const session = await boot(createElement({ color: 'red' }), { color: 'rgb(0, 0, 255)' }); assert.equal(session.rows.color.displayValue, '#0000ff'); assert.equal(session.rows.color.inlineValue, 'red'); assert.equal(session.rows.color.originalInline, 'red');
});

test('previewStyle 只把用户修改写入 patch 并继承原单位', async () => {
  const el = createElement(); const session = await boot(el, { width: '100px' }); session.previewStyle('width', '120'); assert.equal(el.style.getPropertyValue('width'), '120px'); assert.equal(session.isDirty(), true); assert.deepEqual(JSON.parse(JSON.stringify(session.toPatch())), { styles: { width: '120px' }, removeStyles: [] });
});

test('resetProperty Delete inline 并生成 removeStyles', async () => {
  const el = createElement({ width: '80px' }); const session = await boot(el, { width: '80px' }); session.resetProperty('width'); assert.equal(el.style.getPropertyValue('width'), ''); assert.deepEqual(Array.from(session.toPatch().removeStyles), ['width']);
});

test('discard 恢复 inline 和A本', async () => {
  const el = createElement({ width: '80px' }, 'before'); const session = await boot(el, { width: '80px' }); session.previewStyle('width', '120'); session.setText('after'); session.discard(); assert.equal(el.style.getPropertyValue('width'), '80px'); assert.equal(el.textContent, 'before'); assert.equal(session.isDirty(), false);
});

test('含子节点元素DisabledA本Edit', async () => {
  const el = createElement(); el.childNodes = [{ nodeType: 1, textContent: 'child' }]; const session = await boot(el); assert.equal(session.canEditText, false); session.setText('ignored'); assert.equal(session.isDirty(), false);
});
