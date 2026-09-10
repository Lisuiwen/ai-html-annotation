import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const sourceUrl = new URL('../../../../skills/html-prototype-build/runtime/author/core/modes.js', import.meta.url);

async function boot() {
  const source = await readFile(sourceUrl, 'utf8');
  const events = [];
  const window = { dispatchEvent: (event) => events.push(event) };
  window.window = window;
  function CustomEvent(type, init) { this.type = type; this.detail = init && init.detail; }
  vm.runInNewContext(source, { window, CustomEvent }, { filename: 'modes.js' });
  return { window, events };
}

test('PrototypeAuthor mode switch disables other picker plugins', async () => {
  const { window, events } = await boot();
  const calls = [];
  window.PrototypeAuthor.register('mark', () => calls.push('mark-off'));
  window.PrototypeAuthor.register('edit', () => calls.push('edit-off'));
  window.PrototypeAuthor.activate('edit');
  assert.deepEqual(calls, ['mark-off']);
  assert.equal(window.PrototypeAuthor.getMode(), 'edit');
  assert.equal(events.at(-1).detail.mode, 'edit');
  window.PrototypeAuthor.activate('');
  assert.deepEqual(calls, ['mark-off', 'mark-off', 'edit-off']);
});

test('modes reload keeps existing coordinator instance', async () => {
  const source = await readFile(sourceUrl, 'utf8');
  const existing = { register() {}, activate() {}, getMode() { return 'keep'; } };
  const window = { PrototypeAuthor: existing, dispatchEvent() {} };
  window.window = window;
  function CustomEvent() {}
  vm.runInNewContext(source, { window, CustomEvent }, { filename: 'modes.js' });
  assert.equal(window.PrototypeAuthor, existing);
});
