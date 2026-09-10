import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { serializeSnapshot, validateSnapshot, writeSnapshot } from '../../../skills/html-prototype-build/runtime/server/snapshot.mjs';

function validSnapshot() {
  return {
    schemaVersion: 2,
    header: { title: 'Demo' },
    scenarios: { base: { state: { product: { page: 'list' } } } },
    cards: [
      { id: 'n1', target: { selector: '#save' }, when: { 'product.page': 'list' } },
      { id: 'n2', target: { anchor: 'save-button' } }
    ]
  };
}

test('validateSnapshot accepts object and array scenarios', () => {
  assert.equal(validateSnapshot(validSnapshot()), true);
  const array = validSnapshot();
  array.scenarios = [{ id: 'base', state: {} }, { id: 'modal' }];
  assert.equal(validateSnapshot(array), true);
});

test('validateSnapshot rejects bad schema/header/cards/scenarios/when', () => {
  assert.equal(validateSnapshot(null), false);
  assert.equal(validateSnapshot({ ...validSnapshot(), schemaVersion: 1 }), false);
  assert.equal(validateSnapshot({ ...validSnapshot(), header: {} }), false);
  assert.equal(validateSnapshot({ ...validSnapshot(), cards: {} }), false);
  assert.equal(validateSnapshot({ ...validSnapshot(), scenarios: {} }), false);
  const badTarget = validSnapshot(); badTarget.cards = [{ id: 'n1', target: {} }];
  assert.equal(validateSnapshot(badTarget), false);
  const badWhen = validSnapshot(); badWhen.cards = [{ id: 'n1', target: { selector: '#x' }, when: [] }];
  assert.equal(validateSnapshot(badWhen), false);
});

test('serializeSnapshot keeps single window assignment format', () => {
  const data = validSnapshot();
  const source = serializeSnapshot(data);
  assert.match(source, /^\/\* Canonical prototype annotation data source/);
  assert.match(source, /window\.__PROTOTYPE_NOTES__ = \{/);
  assert.equal(source.endsWith(';\n'), true);
  assert.equal(JSON.parse(source.match(/window\.__PROTOTYPE_NOTES__ = ([\s\S]*);\n$/)[1]).schemaVersion, 2);
});

test('writeSnapshot uses temp file then atomic replace', () => {
  const dir = mkdtempSync(join(tmpdir(), 'prototype-snapshot-'));
  try {
    const target = join(dir, 'notes.snapshot.js');
    writeSnapshot(target, validSnapshot());
    assert.equal(existsSync(target), true);
    assert.equal(existsSync(target + '.tmp'), false);
    assert.match(readFileSync(target, 'utf8'), /window\.__PROTOTYPE_NOTES__/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
