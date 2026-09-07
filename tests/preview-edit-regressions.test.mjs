import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import * as serveModule from '../skills/html-prototype-build/runtime/serve.mjs';

const pickerUrl = new URL('../skills/html-prototype-build/runtime/author-tools/picker.js', import.meta.url);
const editUrl = new URL('../skills/html-prototype-build/runtime/author-tools/edit/index.js', import.meta.url);
const styleModelUrl = new URL('../skills/html-prototype-build/runtime/author-tools/edit/style-model.js', import.meta.url);
const markUrl = new URL('../skills/html-prototype-build/runtime/author-tools/mark/index.js', import.meta.url);
const standaloneMarkUrl = new URL('../skills/html-prototype-build/runtime/html-mark.js', import.meta.url);

function classList() {
  const values = new Set();
  return {
    add: (...names) => names.forEach((name) => values.add(name)),
    remove: (...names) => names.forEach((name) => values.delete(name)),
    contains: (name) => values.has(name),
    toggle: (name, on) => {
      if (on) values.add(name);
      else values.delete(name);
    }
  };
}

function fakeElement(name, body) {
  return {
    nodeType: 1,
    tagName: name.toUpperCase(),
    id: '',
    parentElement: body,
    classList: classList(),
    closest: () => null,
    matches: () => false,
    getAttribute: () => null
  };
}

test('旧 standalone html-mark 已删除，只保留 Author Tools Mark', async () => {
  await assert.rejects(access(standaloneMarkUrl), { code: 'ENOENT' });
});

test('Direct Edit 写回不会拆坏包含分号的 CSS 值', () => {
  const html = '<div id="box" style="--label: &quot;a;b&quot;; color: red"></div>';
  const next = serveModule.applyPrototypeEdit(html, {
    selector: '#box',
    changes: { styles: { width: '120px' } }
  });
  assert.match(next, /--label:\s*&quot;a;b&quot;/);
  assert.match(next, /color:\s*red/);
  assert.match(next, /width:\s*120px/);
});

test('Direct Edit 服务端能解析 CSS.escape 产生的转义 id', () => {
  const next = serveModule.applyPrototypeEdit('<div id="foo:bar">x</div>', {
    selector: '#foo\\:bar',
    changes: { styles: { color: 'red' } }
  });
  assert.match(next, /id="foo:bar" style="color: red"/);
});

test('作者写接口只接受可信 localhost JSON 请求', () => {
  assert.equal(typeof serveModule.isTrustedAuthorRequest, 'function');
  const good = {
    method: 'POST',
    headers: {
      host: '127.0.0.1:4178',
      origin: 'http://127.0.0.1:4178',
      'content-type': 'application/json'
    }
  };
  assert.equal(serveModule.isTrustedAuthorRequest(good, 4178), true);
  assert.equal(serveModule.isTrustedAuthorRequest({
    ...good,
    headers: { ...good.headers, host: 'attacker.example:4178' }
  }, 4178), false);
  assert.equal(serveModule.isTrustedAuthorRequest({
    ...good,
    headers: { ...good.headers, origin: 'https://attacker.example' }
  }, 4178), false);
  assert.equal(serveModule.isTrustedAuthorRequest({
    ...good,
    headers: { ...good.headers, 'content-type': 'text/plain' }
  }, 4178), false);
});

test('Picker 在 onSelect 拒绝切换时保留原选中元素', async () => {
  const source = await readFile(pickerUrl, 'utf8');
  const listeners = new Map();
  const body = { nodeType: 1, classList: classList() };
  const document = {
    body,
    documentElement: { nodeType: 1 },
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: (name) => listeners.delete(name)
  };
  const window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    requestAnimationFrame: (fn) => { fn(); return 1; }
  };
  window.window = window;
  const context = {
    window,
    document,
    navigator: { platform: 'Win32' },
    requestAnimationFrame: window.requestAnimationFrame,
    CSS: { escape: (value) => value },
    console
  };
  vm.runInNewContext(source, context, { filename: 'picker.js' });

  const a = fakeElement('div', body);
  const b = fakeElement('div', body);
  window.AuthorToolsPicker.activate({
    owner: 'edit',
    selectedClass: 'at-hl',
    onSelect: (target) => target !== b
  });
  const click = listeners.get('click');
  const eventFor = (target) => ({
    target,
    ctrlKey: true,
    metaKey: false,
    preventDefault() {},
    stopPropagation() {}
  });
  click(eventFor(a));
  assert.equal(a.classList.contains('at-hl'), true);
  click(eventFor(b));
  assert.equal(a.classList.contains('at-hl'), true);
  assert.equal(b.classList.contains('at-hl'), false);
});

test('Direct Edit 输入期间不整体重绘面板，并显式处理 IME composition', async () => {
  const source = await readFile(editUrl, 'utf8');
  assert.match(source, /compositionstart/);
  assert.match(source, /compositionend/);
  assert.match(source, /syncPanelAfterInput/);
  const start = source.indexOf("input.addEventListener('input'");
  const end = source.indexOf("input.addEventListener('compositionstart'", start);
  assert.ok(start >= 0 && end > start, '应存在独立 input/composition 处理');
  assert.doesNotMatch(source.slice(start, end), /\brender\(\)/, '逐键 input 不应销毁并重建整个面板');
});

test('StyleModel 回显真实 computed value，不让 inline 来源覆盖实际生效值', async () => {
  const source = await readFile(styleModelUrl, 'utf8');
  const inline = new Map([['color', 'red']]);
  const style = {
    getPropertyValue: (name) => inline.get(name) || '',
    getPropertyPriority: () => '',
    setProperty: (name, value) => inline.set(name, value),
    removeProperty: (name) => inline.delete(name)
  };
  const el = {
    nodeType: 1,
    style,
    id: 'box',
    classList: { contains: () => false },
    childNodes: [{ nodeType: 3, textContent: 'x' }],
    textContent: 'x',
    parentElement: null,
    getAttribute: (name) => name === 'style' ? 'color: red' : null,
    setAttribute() {},
    removeAttribute() {},
    matches: () => false
  };
  const document = { styleSheets: [], documentElement: {} };
  const window = {
    getComputedStyle: () => ({
      getPropertyValue: (prop) => {
        if (prop === 'color') return 'rgb(0, 0, 255)';
        if (prop === 'background-color' || prop === 'border-color') return 'rgba(0, 0, 0, 0)';
        if (prop === 'font-weight') return '400';
        if (prop === 'text-align') return 'start';
        if (prop === 'border-style') return 'none';
        return '0px';
      }
    }),
    matchMedia: () => ({ matches: true })
  };
  window.window = window;
  vm.runInNewContext(source, { window, document, console }, { filename: 'style-model.js' });
  const session = window.AuthorToolsStyleModel.createSession(el);
  assert.equal(session.rows.color.displayValue, '#0000ff');
  assert.equal(session.rows.color.inlineValue, 'red');
});

test('Mark 恢复时优先稳定 selector，path 只作为降级', async () => {
  const source = await readFile(markUrl, 'utf8');
  const start = source.indexOf('function restore()');
  const end = source.indexOf('\n  function handleKey', start);
  assert.ok(start >= 0 && end > start);
  const body = source.slice(start, end);
  const selectorIndex = body.indexOf('item.selector');
  const pathIndex = body.indexOf('item.path');
  assert.ok(selectorIndex >= 0, 'restore 应尝试稳定 selector');
  assert.ok(pathIndex > selectorIndex, 'restore 应在 selector 失败后再尝试 path');
});
