import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { SUPPORTED_SCHEMA_VERSIONS } from '../../skills/ui-pack-maintain/scripts/_pack-schema.mjs';

const repositoryDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const resolvePackSource = path.join(repositoryDirectory, 'skills', 'html-prototype-build', 'scripts', 'resolve-pack.mjs');
const schemaDoc = path.join(repositoryDirectory, 'skills', 'ui-pack-maintain', 'references', 'schema-version.md');

test('resolve-pack imports the shared schemaVersion allowlist', async () => {
  const source = await readFile(resolvePackSource, 'utf8');
  assert.match(source, /_pack-schema\.mjs/);
  assert.doesNotMatch(source, /new Set\(\[1, 2\]\)/);
});

test('schema-version.md documents the shared allowlist', async () => {
  const source = await readFile(schemaDoc, 'utf8');
  for (const version of SUPPORTED_SCHEMA_VERSIONS) {
    assert.match(source, new RegExp(`\\b${version}\\b`));
  }
});
