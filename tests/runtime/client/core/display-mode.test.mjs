import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

function classes() {
  const set = new Set();
  return { add: (...xs) => xs.forEach((x) => set.add(x)), remove: (...xs) => xs.forEach((x) => set.delete(x)), contains: (x) => set.has(x) };
}

async function boot(search = '') {
  const source = await readFile(new URL('../../../../skills/html-prototype-build/runtime/client/core/display-mode.js', import.meta.url), 'utf8');
  const headChildren = [];
  const body = { classList: classes() };
  const document = {
    readyState: 'complete', body, documentElement: {}, addEventListener() {},
    head: { appendChild: (node) => headChildren.push(node) },
    createElement: () => ({ id: '', textContent: '' }),
    getElementById: (id) => headChildren.find((node) => node.id === id) || null
  };
  const window = { location: { search, href: 'http://127.0.0.1:4178/demo.html' }, history: { pushState() {}, replaceState() {} }, URL, URLSearchParams };
  window.window = window;
  vm.runInNewContext(source, { window, document, URL, URLSearchParams, console }, { filename: 'display-mode.js' });
  return { window, document, headChildren };
}

test('DisplayMode installs styles once and detects overlay', async () => {
  const { window, headChildren } = await boot();
  assert.equal(headChildren.filter((node) => node.id === 'prototype-author-chrome-style').length, 1);
  window.PrototypeAuthorChrome.installStyles();
  assert.equal(headChildren.filter((node) => node.id === 'prototype-author-chrome-style').length, 1);
  assert.equal(window.PrototypeAuthorChrome.isOverlay({ closest: (selector) => selector.includes('.at-ui') ? {} : null }), true);
  assert.equal(window.PrototypeAuthorChrome.isOverlay(null), false);
});

test('product-only=1 enters pure page mode automatically', async () => {
  const { window, document } = await boot('?product-only=1');
  assert.equal(window.PrototypeAuthorChrome.isProductOnly(), true);
  assert.equal(document.body.classList.contains('pa-product-only'), true);
});
