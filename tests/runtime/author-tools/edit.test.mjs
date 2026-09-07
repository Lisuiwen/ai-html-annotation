import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

{
const sourceUrl = new URL('../../../skills/html-prototype-build/runtime/author-tools/edit/index.js', import.meta.url);
function containerStub() { return { querySelectorAll: () => [], querySelector: () => null }; }
async function boot({ dirty = false, selector = '#box' } = {}) {
  const source = await readFile(sourceUrl, 'utf8');
  const calls = []; const toasts = []; const sessions = [];
  const window = {
    AuthorToolsEditPanel: { render: () => {} },
    AuthorToolsPicker: { activate: (options) => calls.push(['activate', options]), release: (owner) => calls.push(['release', owner]), stableSelector: () => selector },
    AuthorToolsStyleModel: { createSession: (el) => {
      const session = { element: el, rows: {}, isDirty: () => dirty, discard: () => calls.push(['discard']), toPatch: () => ({ styles: { width: '120px' }, removeStyles: [] }), setText() {}, previewStyle() {}, resetProperty() {}, resetElement() {} };
      sessions.push(session); return session;
    } }
  };
  window.window = window;
  const fetchCalls = [];
  const fetch = async (...args) => { fetchCalls.push(args); return { ok: true, text: async () => '' }; };
  vm.runInNewContext(source, { window, fetch, JSON, console }, { filename: 'edit/index.js' });
  window.AuthorToolsEditTool.mount(containerStub(), { toast: (msg) => toasts.push(msg) });
  return { window, calls, toasts, sessions, fetchCalls };
}
test('Direct Edit activate/release 通过共享 Picker 管理 owner', async () => {
  const env = await boot(); env.window.AuthorToolsEditTool.activate();
  assert.equal(env.calls[0][0], 'activate'); assert.equal(env.calls[0][1].owner, 'edit'); assert.equal(typeof env.calls[0][1].onSelect, 'function');
  env.window.AuthorToolsEditTool.deactivate(); assert.deepEqual(env.calls.at(-1), ['release', 'edit']);
});
test('dirty session 拒绝切换元素并提示用户', async () => {
  const env = await boot({ dirty: true }); env.window.AuthorToolsEditTool.activate(); const onSelect = env.calls[0][1].onSelect;
  const first = { tagName: 'DIV', id: 'a', className: '' }; const second = { tagName: 'DIV', id: 'b', className: '' };
  assert.equal(onSelect(first), true); assert.equal(onSelect(second), false); assert.match(env.toasts.at(-1), /先保存或取消/);
});
test('无稳定 selector 时不发送保存请求', async () => {
  const env = await boot({ dirty: true, selector: 'body > div' }); env.window.AuthorToolsEditTool.activate(); env.calls[0][1].onSelect({ tagName: 'DIV', id: '', className: '' });
  const source = await readFile(sourceUrl, 'utf8'); assert.match(source, /selector\.charAt\(0\) !== '#'/); assert.match(source, /fetch\('\/__prototype-author\/edit'/); assert.equal(env.fetchCalls.length, 0);
});
test('Direct Edit 输入显式处理 IME，不在 input 中整体 render', async () => {
  const source = await readFile(sourceUrl, 'utf8'); assert.match(source, /compositionstart/); assert.match(source, /compositionend/);
  const start = source.indexOf("input.addEventListener('input'"); const end = source.indexOf("input.addEventListener('compositionstart'", start);
  assert.ok(start >= 0 && end > start); assert.doesNotMatch(source.slice(start, end), /\brender\(\)/);
});
}

{
const sourceUrl = new URL('../../../skills/html-prototype-build/runtime/author-tools/edit/style-model.js', import.meta.url);
function styleStore(initial = {}) {
  const values = new Map(Object.entries(initial)); const priorities = new Map();
  return { values, getPropertyValue: (name) => values.get(name) || '', getPropertyPriority: (name) => priorities.get(name) || '', setProperty(name, value, priority = '') { values.set(name, value); if (priority) priorities.set(name, priority); else priorities.delete(name); }, removeProperty(name) { values.delete(name); priorities.delete(name); } };
}
function createElement(initialStyle = {}, text = 'hello') {
  const style = styleStore(initialStyle); const attrs = new Map(); const serialize = () => [...style.values].map(([k, v]) => `${k}: ${v}`).join('; '); if (Object.keys(initialStyle).length) attrs.set('style', serialize());
  const textNode = { nodeType: 3, textContent: text };
  return { nodeType: 1, style, id: 'box', classList: { contains: () => false }, childNodes: [textNode], textContent: text, parentElement: null,
    getAttribute: (name) => name === 'style' ? (attrs.get('style') || null) : null,
    setAttribute(name, value) { attrs.set(name, value); if (name === 'style') { style.values.clear(); String(value).split(';').forEach((part) => { const i = part.indexOf(':'); if (i > 0) style.values.set(part.slice(0, i).trim(), part.slice(i + 1).trim()); }); } },
    removeAttribute(name) { attrs.delete(name); if (name === 'style') style.values.clear(); }, matches: () => false };
}
async function boot(el, computed = {}) {
  const source = await readFile(sourceUrl, 'utf8'); const document = { styleSheets: [], documentElement: {} };
  const window = { getComputedStyle: () => ({ getPropertyValue: (prop) => computed[prop] ?? (prop === 'color' || prop === 'background-color' || prop === 'border-color' ? 'rgba(0, 0, 0, 0)' : prop === 'font-weight' ? '400' : prop === 'text-align' ? 'start' : prop === 'border-style' ? 'none' : '0px') }), matchMedia: () => ({ matches: true }) };
  window.window = window; vm.runInNewContext(source, { window, document, console }, { filename: 'style-model.js' }); return window.AuthorToolsStyleModel.createSession(el);
}
test('StyleModel 回显 computed value，同时保留 inline 基线', async () => {
  const el = createElement({ color: 'red' }); const session = await boot(el, { color: 'rgb(0, 0, 255)' });
  assert.equal(session.rows.color.displayValue, '#0000ff'); assert.equal(session.rows.color.inlineValue, 'red'); assert.equal(session.rows.color.originalInline, 'red');
});
test('previewStyle 只把用户修改写入 patch，并继承原单位', async () => {
  const el = createElement(); const session = await boot(el, { width: '100px' }); session.previewStyle('width', '120');
  assert.equal(el.style.getPropertyValue('width'), '120px'); assert.equal(session.isDirty(), true);
  assert.deepEqual(JSON.parse(JSON.stringify(session.toPatch())), { styles: { width: '120px' }, removeStyles: [] });
});
test('resetProperty 删除 inline 并生成 removeStyles', async () => {
  const el = createElement({ width: '80px' }); const session = await boot(el, { width: '80px' }); session.resetProperty('width');
  assert.equal(el.style.getPropertyValue('width'), ''); assert.equal(session.isDirty(), true); assert.deepEqual(Array.from(session.toPatch().removeStyles), ['width']);
});
test('discard 恢复 inline 和文本', async () => {
  const el = createElement({ width: '80px' }, 'before'); const session = await boot(el, { width: '80px' }); session.previewStyle('width', '120'); session.setText('after');
  assert.equal(session.isDirty(), true); session.discard(); assert.equal(el.style.getPropertyValue('width'), '80px'); assert.equal(el.textContent, 'before'); assert.equal(session.isDirty(), false);
});
test('含子节点元素禁用文本编辑', async () => {
  const el = createElement(); el.childNodes = [{ nodeType: 1, textContent: 'child' }]; const session = await boot(el); assert.equal(session.canEditText, false); session.setText('ignored'); assert.equal(session.isDirty(), false);
});
}

{
const sourceUrl = new URL('../../../skills/html-prototype-build/runtime/author-tools/edit/panel.js', import.meta.url);
async function panelApi() { const source = await readFile(sourceUrl, 'utf8'); const window = {}; window.window = window; vm.runInNewContext(source, { window }, { filename: 'panel.js' }); return window.AuthorToolsEditPanel; }
test('Panel 无 session 时展示空态且操作按钮禁用', async () => {
  const api = await panelApi(); const container = { innerHTML: '' }; api.render(container, null, {}); assert.match(container.innerHTML, /Ctrl/); assert.match(container.innerHTML, /data-act="save" disabled/); assert.match(container.innerHTML, /data-act="reset" disabled/);
});
test('Panel 对 meta、value、source title 做 HTML 转义', async () => {
  const api = await panelApi(); const container = { innerHTML: '' };
  const session = { fields: [{ group: '内容', key: 'text', label: '文本', kind: 'text' }], rows: {}, canEditText: true, getText: () => '<img onerror=1>', isDirty: () => true };
  api.render(container, session, { tag: '<div>', id: '"x"', classes: '<bad>' }); assert.doesNotMatch(container.innerHTML, /<img onerror=1>/); assert.match(container.innerHTML, /&lt;img onerror=1&gt;/); assert.match(container.innerHTML, /&lt;div&gt;/);
});
test('Panel dirty 决定保存/取消按钮状态', async () => {
  const api = await panelApi(); const container = { innerHTML: '' };
  const base = { fields: [{ group: '尺寸', key: 'width', label: '宽度', kind: 'length' }], rows: { width: { displayValue: '100', unit: 'px', sourceKind: 'class', sourceLabel: '.card', sourceTitle: '.card' } }, canEditText: false, getText: () => '' };
  api.render(container, { ...base, isDirty: () => false }, { tag: 'div', id: '', classes: '' }); assert.match(container.innerHTML, /data-act="save" disabled/);
  api.render(container, { ...base, isDirty: () => true }, { tag: 'div', id: '', classes: '' }); assert.doesNotMatch(container.innerHTML, /data-act="save" disabled/);
});
}
