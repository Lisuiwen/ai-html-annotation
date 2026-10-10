import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { packIdFrom, paletteEntries } from '../../sketch/mount.js';
import { resolveSizing } from '../../sketch/sizing.js';

const repositoryDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const readManifest = (id) => JSON.parse(readFileSync(path.join(repositoryDirectory, '.html-prototype', 'packs', id, 'manifest.json'), 'utf8'));

test('sketch palette: every official pack exposes atoms only from manifest declarations', () => {
  for (const id of ['admin-desktop', 'mobile-vant']) {
    const manifest = readManifest(id);
    const { entries, categoryOrder } = paletteEntries(manifest);
    const declared = Object.values(manifest.components).reduce((sum, component) => sum + Object.keys(component.atoms || {}).length, 0);
    assert.ok(entries.length > 0, id);
    assert.equal(entries.length, declared, id);
    assert.deepEqual(categoryOrder, Object.keys(manifest.providers));
    for (const entry of entries) {
      const component = manifest.components[entry.componentId];
      assert.notEqual(component.visibility, 'internal', entry.id);
      assert.equal(entry.category, component.category, entry.id);
      assert.equal(entry.id, `${entry.componentId}#${entry.key}`);
      assert.equal(entry.label, component.atoms[entry.key].label);
    }
  }
});

test('sketch palette: components without atoms and internal components are skipped', () => {
  const { entries } = paletteEntries({
    providers: { action: {}, data: {} },
    components: {
      'action.button': { category: 'action', atoms: { primary: { label: 'Primary', resize: 'x' } } },
      'data.plain': { category: 'data' },
      'data._core': { category: 'data', visibility: 'internal', atoms: { core: { label: 'Core', resize: 'none' } } }
    }
  });
  assert.deepEqual(entries.map((entry) => entry.id), ['action.button#primary']);
});

test('sketch sizing: resize declarations map to stamp specs', () => {
  assert.deepEqual(resolveSizing({ resize: 'none', width: 300 }), { axis: 'none', width: null, height: null, minWidth: 1, minHeight: 1, lockWidth: false, lockHeight: false });
  assert.equal(resolveSizing({ resize: 'x', width: 720, height: 102 }).lockHeight, true);
  assert.equal(resolveSizing({ resize: 'x', minWidth: 32 }).lockHeight, false);
  assert.equal(resolveSizing({ resize: 'x', minWidth: 32 }).width, null);
  assert.equal(resolveSizing({ resize: 'y', width: 420, height: 480 }).lockWidth, true);
  assert.equal(resolveSizing({ resize: 'bogus' }).axis, 'none');
});

test('sketch pack id: only hyphen-case ids are accepted', () => {
  assert.equal(packIdFrom('?pack=mobile-vant'), 'mobile-vant');
  assert.equal(packIdFrom('?pack=../etc'), 'admin-desktop');
  assert.equal(packIdFrom(''), 'admin-desktop');
});
