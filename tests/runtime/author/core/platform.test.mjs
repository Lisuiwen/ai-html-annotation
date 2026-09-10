import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const sourceUrl = new URL('../../../../skills/html-prototype-build/runtime/author/core/platform.js', import.meta.url);

async function boot(platform = 'Win32') {
  const source = await readFile(sourceUrl, 'utf8');
  const window = {};
  window.window = window;
  vm.runInNewContext(source, {
    window,
    navigator: { platform, userAgentData: platform === 'macOS' ? { platform: 'macOS' } : undefined }
  }, { filename: 'platform.js' });
  return window.AuthorToolsPlatform;
}

test('clickModifierLabel returns ⌘ on macOS and Ctrl elsewhere', async () => {
  assert.equal((await boot('MacIntel')).clickModifierLabel(), '⌘');
  assert.equal((await boot('Win32')).clickModifierLabel(), 'Ctrl');
});

test('pickerClickModifier on macOS accepts metaKey only', async () => {
  const api = await boot('MacIntel');
  assert.equal(api.pickerClickModifier({ metaKey: true, ctrlKey: false }), true);
  assert.equal(api.pickerClickModifier({ metaKey: false, ctrlKey: true }), false);
});

test('pickerModifierActive on macOS accepts metaKey or ctrlKey', async () => {
  const api = await boot('MacIntel');
  assert.equal(api.pickerModifierActive({ metaKey: true, ctrlKey: false }), true);
  assert.equal(api.pickerModifierActive({ metaKey: false, ctrlKey: true }), true);
});

test('saveModifierActive on macOS accepts ⌘ or Control', async () => {
  const api = await boot('MacIntel');
  assert.equal(api.saveModifierActive({ metaKey: true, ctrlKey: false }), true);
  assert.equal(api.saveModifierActive({ metaKey: false, ctrlKey: true }), true);
  assert.equal(api.saveModifierActive({ metaKey: false, ctrlKey: false }), false);
});

test('saveModifierActive on Windows accepts Ctrl only', async () => {
  const api = await boot('Win32');
  assert.equal(api.saveModifierActive({ metaKey: true, ctrlKey: false }), false);
  assert.equal(api.saveModifierActive({ metaKey: false, ctrlKey: true }), true);
});
