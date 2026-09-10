import assert from 'node:assert/strict';
import { access, readdir } from 'node:fs/promises';
import test from 'node:test';

const runtimeUrl = new URL('../../skills/html-prototype-build/runtime/', import.meta.url);

async function listScripts(directory, prefix = '') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const target = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
    if (entry.isDirectory()) files.push(...await listScripts(target, rel));
    else if (/\.(?:m?js)$/.test(entry.name)) files.push(rel);
  }
  return files;
}

test('Runtime root keeps four boundary directories only', async () => {
  const entries = await readdir(runtimeUrl, { withFileTypes: true });
  assert.deepEqual(entries.map((entry) => entry.name).sort(), ['author', 'cli', 'client', 'server']);
  assert.equal(entries.every((entry) => entry.isDirectory()), true);
});

test('Runtime flat scripts consolidated into four boundary directories', async () => {
  await assert.rejects(access(new URL('../../skills/html-prototype-build/runtime/prepare-mark.mjs', import.meta.url)), { code: 'ENOENT' });
  await assert.rejects(access(new URL('../../skills/html-prototype-build/runtime/author-tools', import.meta.url)), { code: 'ENOENT' });
});

test('each Runtime JS/MJS has matching unit test path', async () => {
  const scripts = await listScripts(runtimeUrl);
  const missing = [];
  for (const source of scripts) {
    const testPath = source.replace(/\.(?:m?js)$/, '.test.mjs');
    try {
      await access(new URL(`./${testPath}`, import.meta.url));
    } catch {
      missing.push(testPath);
    }
  }
  assert.deepEqual(missing, [], `missing Runtime unit test for：${missing.join(', ')}`);
});
