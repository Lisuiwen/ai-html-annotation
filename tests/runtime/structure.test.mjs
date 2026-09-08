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

test('Runtime 根目录只按执行边界保留四个分类目录', async () => {
  const entries = await readdir(runtimeUrl, { withFileTypes: true });
  assert.deepEqual(entries.map((entry) => entry.name).sort(), ['author', 'cli', 'client', 'server']);
  assert.equal(entries.every((entry) => entry.isDirectory()), true);
});

test('Runtime 平铺脚本已收敛到四个分类目录', async () => {
  await assert.rejects(access(new URL('../../skills/html-prototype-build/runtime/prepare-mark.mjs', import.meta.url)), { code: 'ENOENT' });
  await assert.rejects(access(new URL('../../skills/html-prototype-build/runtime/author-tools', import.meta.url)), { code: 'ENOENT' });
});

test('每个 Runtime JS/MJS 都有同路径单元测试', async () => {
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
  assert.deepEqual(missing, [], `缺少 Runtime 对应单测：${missing.join(', ')}`);
});
