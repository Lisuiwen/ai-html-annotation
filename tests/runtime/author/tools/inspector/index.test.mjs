import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

function classList() { const set = new Set(); return { add: (...xs) => xs.forEach((x) => set.add(x)), remove: (...xs) => xs.forEach((x) => set.delete(x)), contains: (x) => set.has(x) }; }
async function boot() {
  const source = await readFile(new URL('../../../../../skills/html-prototype-build/runtime/author/tools/inspector/index.js', import.meta.url), 'utf8');
  const listeners = new Map(); const registered = []; let mode = '';
  const body = { classList: classList(), appendChild() {} };
  const document = { body, documentElement: {}, head: { appendChild() {} }, createElement: () => ({ className: '', style: {}, classList: classList(), setAttribute() {}, getBoundingClientRect: () => ({ width: 10, height: 10 }) }), addEventListener: (name, fn) => listeners.set(name, fn) };
  const window = { PrototypeAuthor: { register: (name, off) => registered.push([name, off]), activate: (name) => { mode = name; }, getMode: () => mode }, PrototypeAuthorChrome: { isProductOnly: () => false, isOverlay: () => false } }; window.window = window;
  vm.runInNewContext(source, { window, document, URLSearchParams, fetch: async () => ({ ok: true, text: async () => 'ok' }), console }, { filename: 'inspector/index.js' });
  return { window, document, listeners, registered, get mode() { return mode; } };
}

test('Inspector 初始化Sign up全局事件和 PrototypeAuthor 插件', async () => {
  const env = await boot(); assert.equal(env.window.__PROTOTYPE_INSPECTOR_LOADED__, true); assert.equal(typeof env.listeners.get('keydown'), 'function'); assert.equal(typeof env.listeners.get('mousemove'), 'function'); assert.equal(typeof env.listeners.get('click'), 'function'); assert.equal(env.registered[0][0], 'inspector');
});

test('Alt+Shift 进入 inspector，松键退出', async () => {
  const env = await boot(); env.listeners.get('keydown')({ altKey: true, shiftKey: true, metaKey: false, ctrlKey: false }); assert.equal(env.mode, 'inspector'); assert.equal(env.document.body.classList.contains('pi-inspecting'), true);
  env.listeners.get('keyup')({ altKey: false, shiftKey: true, metaKey: false, ctrlKey: false }); assert.equal(env.mode, ''); assert.equal(env.document.body.classList.contains('pi-inspecting'), false);
});
