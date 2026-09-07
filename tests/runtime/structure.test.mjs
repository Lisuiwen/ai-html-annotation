import assert from 'node:assert/strict';
import { access, readdir } from 'node:fs/promises';
import test from 'node:test';

const runtimeUrl = new URL('../../skills/html-prototype-build/runtime/', import.meta.url);

test('Runtime 根目录只按执行边界保留四个分类目录', async () => {
  const entries = await readdir(runtimeUrl, { withFileTypes: true });
  assert.deepEqual(entries.map((entry) => entry.name).sort(), ['author', 'cli', 'client', 'server']);
  assert.equal(entries.every((entry) => entry.isDirectory()), true);
});

test('旧 standalone Mark 与旧 author-tools 路径已删除', async () => {
  await assert.rejects(access(new URL('../../skills/html-prototype-build/runtime/prepare-mark.mjs', import.meta.url)), { code: 'ENOENT' });
  await assert.rejects(access(new URL('../../skills/html-prototype-build/runtime/author-tools', import.meta.url)), { code: 'ENOENT' });
});
