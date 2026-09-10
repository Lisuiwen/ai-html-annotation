import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

async function boot(productOnly = true) {
  const source = await readFile(new URL('../../../../skills/html-prototype-build/runtime/author/shell/index.js', import.meta.url), 'utf8');
  let created = 0; const window = { PrototypeAuthorChrome: { isProductOnly: () => productOnly } }; window.window = window;
  const document = { createElement: () => { created++; return {}; } };
  vm.runInNewContext(source, { window, document, MutationObserver: function () {}, clearTimeout, setTimeout }, { filename: 'shell/index.js' });
  return { window, source, get created() { return created; } };
}

test('AuthorTools exposes unified Shell API', async () => {
  const { window } = await boot(); assert.equal(window.AuthorTools.__ready, true);
  for (const method of ['register', 'toast', 'open', 'close', 'requestTab', 'init']) assert.equal(typeof window.AuthorTools[method], 'function');
  assert.equal(window.__AUTHOR_TOOLS_LOADED__, true);
});

test('product-only init skips author UI', async () => {
  const env = await boot(true); env.window.AuthorTools.init(); assert.equal(env.created, 0);
});

test('Shell keeps dirty tab switch and close guard', async () => {
  const { source } = await boot();
  assert.match(source, /prev\.isDirty\(\)/);
  assert.match(source, /pendingTab = '__close__'/);
  assert.match(source, /discardAndSwitch/);
  assert.match(source, /confirmClose/);
});
