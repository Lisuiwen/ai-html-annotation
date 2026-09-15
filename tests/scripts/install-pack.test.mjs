import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repositoryDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const installer = path.join(repositoryDirectory, 'skills', 'html-prototype-build', 'scripts', 'install-pack.mjs');
const registryPath = path.join(repositoryDirectory, '.html-prototype', 'packs', 'registry.json');

function runInstaller(args) {
  const result = spawnSync(process.execPath, [installer, ...args], {
    cwd: repositoryDirectory,
    encoding: 'utf8'
  });
  return { status: result.status, stdout: result.stdout || '', stderr: result.stderr || '' };
}

test('install-pack --list-remote reads local registry', () => {
  const result = runInstaller([`--registry=${registryPath}`, '--list-remote']);
  assert.equal(result.status, 0);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.mode, 'local');
  assert.deepEqual(payload.registry.packs.map((pack) => pack.id).sort(), ['admin-desktop', 'mobile-vant']);
  assert.match(payload.installHint, /install-pack\.mjs --pack=<id>/);
});

test('install-pack copies pack from local source into explicit dest', () => {
  const tempDirectory = mkdtempSync(path.join(os.tmpdir(), 'install-pack-'));
  const destRoot = path.join(tempDirectory, 'packs');
  const result = runInstaller([
    '--pack=mobile-vant',
    `--registry=${registryPath}`,
    `--from-local=${path.join(repositoryDirectory, '.html-prototype', 'packs', 'mobile-vant')}`,
    `--dest=${destRoot}`
  ]);
  try {
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.pack, 'mobile-vant');
    assert.equal(payload.targetDirectory, path.join(destRoot, 'mobile-vant'));
  } finally {
    rmSync(tempDirectory, { recursive: true, force: true });
  }
});

test('install-pack refuses to overwrite a local pack without --force', () => {
  const tempDirectory = mkdtempSync(path.join(os.tmpdir(), 'install-pack-'));
  const destRoot = path.join(tempDirectory, 'packs');
  const localPack = path.join(destRoot, 'mobile-vant');
  mkdirSync(localPack, { recursive: true });
  writeFileSync(path.join(localPack, 'manifest.json'), JSON.stringify({
    schemaVersion: 1,
    id: 'mobile-vant',
    version: 1,
    classPrefix: 'mv-',
    tokenPrefix: 'mv-',
    foundation: { id: 'mobile-vant.default', contract: 'foundation/FOUNDATION.md', sources: [] },
    providers: {},
    components: {}
  }), 'utf8');
  const result = runInstaller([
    '--pack=mobile-vant',
    `--registry=${registryPath}`,
    `--from-local=${path.join(repositoryDirectory, '.html-prototype', 'packs', 'mobile-vant')}`,
    `--dest=${destRoot}`
  ]);
  try {
    assert.equal(result.status, 3, result.stderr || result.stdout);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.error, 'install-blocked');
  } finally {
    rmSync(tempDirectory, { recursive: true, force: true });
  }
});

test('generate-registry --check passes for committed registry', () => {
  const generator = path.join(repositoryDirectory, 'skills', 'ui-pack-maintain', 'scripts', 'generate-registry.mjs');
  const result = spawnSync(process.execPath, [generator, '--check'], { cwd: repositoryDirectory, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test('resolve-pack pack-not-found includes install remediation', () => {
  const resolver = path.join(repositoryDirectory, 'skills', 'html-prototype-build', 'scripts', 'resolve-pack.mjs');
  const tempDirectory = mkdtempSync(path.join(os.tmpdir(), 'resolve-pack-'));
  const result = spawnSync(process.execPath, [resolver, '--pack=missing-pack', '--select=action.button'], {
    cwd: tempDirectory,
    encoding: 'utf8',
    env: { ...process.env, HTML_PROTOTYPE_PACK_ROOT: tempDirectory }
  });
  assert.equal(result.status, 2);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.error, 'pack-not-found');
  assert.match(payload.remediation.install, /install-pack\.mjs --pack=missing-pack/);
});
