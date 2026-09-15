import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { parseJson, runScript } from '../helpers/run-script.mjs';

const repositoryDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const fixturePackRoot = path.join(repositoryDirectory, 'tests', 'fixtures', 'pack-root');
const miniPackDirectory = path.join(fixturePackRoot, 'mini-pack');
const validator = path.join(repositoryDirectory, 'skills', 'ui-pack-maintain', 'scripts', 'validate-pack.mjs');
const generator = path.join(repositoryDirectory, 'skills', 'ui-pack-maintain', 'scripts', 'generate-registry.mjs');

test('e2e publish: validate mini-pack and generate registry', () => {
  const validateResult = runScript(validator, [`--pack=${miniPackDirectory}`, '--strict']);
  assert.equal(validateResult.status, 0, validateResult.stderr || validateResult.stdout);

  const tempDirectory = mkdtempSync(path.join(os.tmpdir(), 'pack-publish-e2e-'));
  const registryPath = path.join(tempDirectory, 'registry.json');
  try {
    const generateResult = runScript(generator, [
      `--pack-root=${fixturePackRoot}`,
      `--output=${registryPath}`,
      '--default-ref=v0.4.1',
      '--repository=test/fixture'
    ]);
    assert.equal(generateResult.status, 0, generateResult.stderr || generateResult.stdout);

    const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
    assert.equal(registry.schemaVersion, 1);
    assert.equal(registry.source.repository, 'test/fixture');
    assert.equal(registry.source.defaultRef, 'v0.4.1');
    assert.equal(registry.packs.length, 1);
    assert.deepEqual(registry.packs[0], {
      id: 'mini-pack',
      name: 'Mini Pack',
      description: 'Minimal fixture pack for pack install and registry e2e tests.',
      version: 1,
      schemaVersion: 1,
      ref: 'v0.4.1',
      foundation: 'mini-pack.default',
      providers: ['action'],
      counts: { components: 1, patterns: 0, presets: 0 }
    });

    const checkResult = runScript(generator, [
      `--pack-root=${fixturePackRoot}`,
      `--output=${registryPath}`,
      '--default-ref=v0.4.1',
      '--repository=test/fixture',
      '--check'
    ]);
    assert.equal(checkResult.status, 0, checkResult.stderr || checkResult.stdout);
  } finally {
    rmSync(tempDirectory, { recursive: true, force: true });
  }
});
