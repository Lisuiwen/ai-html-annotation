import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { packRoots, resolvePackAsset } from '../../../skills/html-prototype-build/runtime/server/packs.mjs';

test('pack lookup reads a project pack and rejects traversal', async () => {
  const root = await mkdtemp(join(tmpdir(), 'pack-lookup-'));
  const manifest = join(root, '.html-prototype', 'packs', 'admin-desktop', 'manifest.json');
  await mkdir(join(root, '.html-prototype', 'packs', 'admin-desktop'), { recursive: true });
  await writeFile(manifest, '{"id":"admin-desktop"}\n');

  assert.equal(packRoots(root)[0], join(root, '.html-prototype', 'packs'));
  assert.equal(resolvePackAsset('admin-desktop/manifest.json', root), manifest);
  assert.equal(resolvePackAsset('../secret', root), null);
  assert.equal(resolvePackAsset('admin-desktop/missing.json', root), null);
});
