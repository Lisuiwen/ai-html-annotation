import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { buildPackTarball } from '../helpers/build-pack-tarball.mjs';
import { buildRegistryEntry, createMockPackServer } from '../helpers/mock-pack-server.mjs';
import { parseJson, runScript, runScriptAsync } from '../helpers/run-script.mjs';

const repositoryDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const fixturePackRoot = path.join(repositoryDirectory, 'tests', 'fixtures', 'pack-root');
const miniPackDirectory = path.join(fixturePackRoot, 'mini-pack');
const installer = path.join(repositoryDirectory, 'skills', 'html-prototype-build', 'scripts', 'install-pack.mjs');
const resolver = path.join(repositoryDirectory, 'skills', 'html-prototype-build', 'scripts', 'resolve-pack.mjs');

const miniPackSummary = {
  id: 'mini-pack',
  name: 'Mini Pack',
  description: 'Minimal fixture pack for pack install and registry e2e tests.',
  version: 1,
  schemaVersion: 1,
  foundation: 'mini-pack.default',
  providers: ['action'],
  counts: { components: 1, patterns: 0, presets: 0 }
};

function buildRegistry(ref) {
  return {
    schemaVersion: 1,
    generatedAt: '2026-09-15T00:00:00.000Z',
    source: {
      repository: 'test/fixture',
      defaultRef: ref,
      packPath: '.html-prototype/packs'
    },
    packs: [buildRegistryEntry(miniPackSummary, ref)]
  };
}

test('e2e install: mock registry tarball installs and resolves mini-pack', async () => {
  const tempDirectory = mkdtempSync(path.join(os.tmpdir(), 'pack-install-e2e-'));
  const packDest = path.join(tempDirectory, 'packs');
  const tarball = await buildPackTarball({ packDirectory: miniPackDirectory, packId: 'mini-pack' });
  const mock = await createMockPackServer({
    registry: buildRegistry('master'),
    tarballs: { master: tarball }
  });

  try {
    const installResult = await runScriptAsync(installer, [
      '--pack=mini-pack',
      `--registry=${mock.registryUrl}`,
      `--dest=${packDest}`
    ], {
      env: {
        HTML_PROTOTYPE_PACK_SOURCE: mock.tarballBase
      }
    });
    assert.equal(installResult.status, 0, installResult.stderr || installResult.stdout);
    const installed = parseJson(installResult.stdout);
    assert.equal(installed.pack, 'mini-pack');
    assert.equal(installed.ref, 'master');
    assert.equal(installed.targetDirectory, path.join(packDest, 'mini-pack'));
    assert.equal(statSync(path.join(packDest, 'mini-pack', 'manifest.json')).isFile(), true);

    const provenance = JSON.parse(readFileSync(path.join(packDest, 'mini-pack', '.pack-source.json'), 'utf8'));
    assert.equal(provenance.packId, 'mini-pack');
    assert.equal(provenance.ref, 'master');

    const listResult = runScript(resolver, ['--list'], {
      cwd: tempDirectory,
      env: { HTML_PROTOTYPE_PACK_ROOT: packDest }
    });
    assert.equal(listResult.status, 0, listResult.stderr || listResult.stdout);
    const listed = parseJson(listResult.stdout);
    assert.equal(listed.packs.length, 1);
    assert.equal(listed.packs[0].id, 'mini-pack');
    assert.equal(listed.packs[0].origin, 'installed');

    const resolveResult = runScript(resolver, [
      '--pack=mini-pack',
      '--select=action.button'
    ], {
      cwd: tempDirectory,
      env: { HTML_PROTOTYPE_PACK_ROOT: packDest }
    });
    assert.equal(resolveResult.status, 0, resolveResult.stderr || resolveResult.stdout);
    const resolved = parseJson(resolveResult.stdout);
    assert.equal(resolved.pack, 'mini-pack');
    assert.ok(resolved.read.some((file) => file.endsWith('components\\action\\button\\component.html')
      || file.endsWith('components/action/button/component.html')));
    assert.deepEqual(resolved.deliver, []);
  } finally {
    await mock.close();
    rmSync(tempDirectory, { recursive: true, force: true });
  }
});

test('e2e install: pinned ref falls back to master when tarball is missing', async () => {
  const tempDirectory = mkdtempSync(path.join(os.tmpdir(), 'pack-install-fallback-e2e-'));
  const packDest = path.join(tempDirectory, 'packs');
  const tarball = await buildPackTarball({ packDirectory: miniPackDirectory, packId: 'mini-pack' });
  const mock = await createMockPackServer({
    registry: buildRegistry('v0.4.1'),
    tarballs: { master: tarball }
  });

  try {
    const installResult = await runScriptAsync(installer, [
      '--pack=mini-pack',
      `--registry=${mock.registryUrl}`,
      `--dest=${packDest}`
    ], {
      env: {
        HTML_PROTOTYPE_PACK_SOURCE: mock.tarballBase
      }
    });
    assert.equal(installResult.status, 0, installResult.stderr || installResult.stdout);
    const installed = parseJson(installResult.stdout);
    assert.equal(installed.ref, 'master');
    assert.equal(installed.refFallback.requested, 'v0.4.1');
    assert.equal(installed.refFallback.actual, 'master');
    assert.match(installed.refFallback.reason, /tarball fetch failed \(404\): .+\/v0\.4\.1\.tar\.gz$/);
    assert.match(installed.warning, /Pinned ref v0\.4\.1 unavailable; installed from master\./);

    const provenance = JSON.parse(readFileSync(path.join(packDest, 'mini-pack', '.pack-source.json'), 'utf8'));
    assert.equal(provenance.requestedRef, 'v0.4.1');
    assert.equal(provenance.ref, 'master');
    assert.equal(provenance.refFallback.actual, 'master');
  } finally {
    await mock.close();
    rmSync(tempDirectory, { recursive: true, force: true });
  }
});
