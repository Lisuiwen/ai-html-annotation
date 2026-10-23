import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const sourceUrl = new URL('../../../../../skills/html-prototype-build/runtime/author/tools/mark/index.js', import.meta.url);
const styleUrl = new URL('../../../../../skills/html-prototype-build/runtime/author/tools/mark/index.css', import.meta.url);

async function boot() { const source = await readFile(sourceUrl, 'utf8'); const calls = []; const bodyClasses = new Set(); const window = { AuthorToolsPicker: { activate: (options) => calls.push(['activate', options]), release: (owner) => calls.push(['release', owner]) } }; window.window = window; const document = { body: { classList: { add: (name) => bodyClasses.add(name), remove: (name) => bodyClasses.delete(name), contains: (name) => bodyClasses.has(name) } }, getElementById: () => null, createElement: () => ({}), head: { appendChild() {} } }; vm.runInNewContext(source, { window, document, location: { pathname: '/demo', hash: '' }, console, setTimeout, clearTimeout }, { filename: 'mark/index.js' }); return { window, calls, bodyClasses, source }; }

test('Mark activate uses shared Picker without persisting selection highlight', async () => {
  const { window, calls, bodyClasses } = await boot(); window.AuthorToolsMarkTool.activate(); const [, options] = calls[0]; assert.equal(options.owner, 'mark'); assert.equal(options.persistSelection, false); assert.equal(typeof options.onSelect, 'function'); assert.equal(bodyClasses.has('mm-on'), true);
});

test('Mark deactivate releases owner and closes display state', async () => {
  const { window, calls, bodyClasses } = await boot(); window.AuthorToolsMarkTool.activate(); window.AuthorToolsMarkTool.deactivate(); assert.deepEqual(calls.at(-1), ['release', 'mark']); assert.equal(bodyClasses.has('mm-on'), false);
});

test('Mark restore prefers selector then fallback path', async () => {
  const { source } = await boot(); const start = source.indexOf('function restore()'); const end = source.indexOf('\n  function handleKey', start); const body = source.slice(start, end); assert.ok(body.indexOf('item.selector') >= 0); assert.ok(body.indexOf('item.path') > body.indexOf('item.selector'));
});

test('Mark styles independent of controller JS', async () => {
  const [source, css] = await Promise.all([readFile(sourceUrl, 'utf8'), readFile(styleUrl, 'utf8')]);
  assert.doesNotMatch(source, /var css\s*=/);
  assert.doesNotMatch(source, /function installCss\(/);
  assert.doesNotMatch(source, /createElement\('style'\)/);
  assert.match(css, /\.mm-pin\s*\{/);
  assert.match(css, /\.mm-note-pop\s*\{/);
  assert.match(css, /\.mm-pin\.mm-pin-hidden/);
});

test('Mark repositions pins when a popup opens or closes', async () => {
  const calls = [];
  let observer = null;
  function MutationObserver(callback) { this.callback = callback; observer = this; }
  MutationObserver.prototype.observe = function (node, options) { this.node = node; this.options = options; };
  const window = {
    AuthorToolsMarkStorage: { load: () => [], save() {} },
    AuthorToolsMarkPins: { build() {}, scheduleReposition: (items) => calls.push(items) },
    MutationObserver,
    addEventListener() {}
  };
  window.window = window;
  const body = {};
  const document = {
    body,
    addEventListener() {},
    title: ''
  };
  vm.runInNewContext(source, { window, document, location: { pathname: '/demo', hash: '' }, console, setTimeout, clearTimeout }, { filename: 'mark/index.js' });
  const container = {
    innerHTML: '',
    querySelector(selector) {
      if (selector === '#mm-list') return { innerHTML: '' };
      return { addEventListener() {} };
    }
  };
  window.AuthorToolsMarkTool.mount(container, {});
  assert.equal(observer.node, body);
  assert.equal(observer.options.subtree, true);
  assert.equal(observer.options.attributeFilter.includes('hidden'), true);
  assert.equal(observer.options.attributeFilter.includes('class'), true);
  observer.callback([{ target: { nodeType: 1, closest: () => null } }]);
  assert.equal(calls.length, 1);
  observer.callback([{ target: { nodeType: 1, closest: () => ({}) } }]);
  assert.equal(calls.length, 1);
});
