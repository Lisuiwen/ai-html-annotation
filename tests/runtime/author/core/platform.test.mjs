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

test('clickModifierLabel 在 macOS Back ⌘，其他平台Back Ctrl', async () => {
  assert.equal((await boot('MacIntel')).clickModifierLabel(), '⌘');
  assert.equal((await boot('Win32')).clickModifierLabel(), 'Ctrl');
});

test('pickerClickModifier 在 macOS 只认 metaKey', async () => {
  const api = await boot('MacIntel');
  assert.equal(api.pickerClickModifier({ metaKey: true, ctrlKey: false }), true);
  assert.equal(api.pickerClickModifier({ metaKey: false, ctrlKey: true }), false);
});

test('pickerModifierActive 在 macOS 接受 metaKey 或 ctrlKey', async () => {
  const api = await boot('MacIntel');
  assert.equal(api.pickerModifierActive({ metaKey: true, ctrlKey: false }), true);
  assert.equal(api.pickerModifierActive({ metaKey: false, ctrlKey: true }), true);
});

test('saveModifierActive 在 macOS 接受 ⌘ 或 Control', async () => {
  const api = await boot('MacIntel');
  assert.equal(api.saveModifierActive({ metaKey: true, ctrlKey: false }), true);
  assert.equal(api.saveModifierActive({ metaKey: false, ctrlKey: true }), true);
  assert.equal(api.saveModifierActive({ metaKey: false, ctrlKey: false }), false);
});

test('saveModifierActive 在 Windows 只认 Ctrl', async () => {
  const api = await boot('Win32');
  assert.equal(api.saveModifierActive({ metaKey: true, ctrlKey: false }), false);
  assert.equal(api.saveModifierActive({ metaKey: false, ctrlKey: true }), true);
});
