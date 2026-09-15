import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { parseJson, runScript } from '../helpers/run-script.mjs';

const repositoryDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const resolver = path.join(repositoryDirectory, 'skills', 'html-prototype-build', 'scripts', 'resolve-pack.mjs');
const installer = path.join(repositoryDirectory, 'skills', 'html-prototype-build', 'scripts', 'install-pack.mjs');
const chartPackDirectory = path.join(repositoryDirectory, 'tests', 'fixtures', 'chart-pack');
const miniPackDirectory = path.join(repositoryDirectory, 'tests', 'fixtures', 'pack-root', 'mini-pack');

function homeEnv(homeDirectory) {
  return process.platform === 'win32'
    ? { USERPROFILE: homeDirectory, HOME: homeDirectory }
    : { HOME: homeDirectory };
}

function writeMiniPack(packDirectory, version) {
  mkdirSync(packDirectory, { recursive: true });
  cpSync(miniPackDirectory, packDirectory, { recursive: true });
  const manifestPath = path.join(packDirectory, 'manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  manifest.version = version;
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

test('e2e resolve: project pack wins over user-cache for the same id', () => {
  const tempDirectory = mkdtempSync(path.join(os.tmpdir(), 'pack-resolve-chain-'));
  const homeDirectory = mkdtempSync(path.join(os.tmpdir(), 'pack-resolve-home-'));
  const projectPack = path.join(tempDirectory, '.html-prototype', 'packs', 'mini-pack');
  const userPack = path.join(homeDirectory, '.html-prototype', 'packs', 'mini-pack');
  writeMiniPack(projectPack, 2);
  writeMiniPack(userPack, 1);

  try {
    const result = runScript(resolver, ['--list'], {
      cwd: tempDirectory,
      env: homeEnv(homeDirectory)
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const payload = parseJson(result.stdout);
    const mini = payload.packs.find((pack) => pack.id === 'mini-pack');
    assert.ok(mini);
    assert.equal(mini.source, 'project');
    assert.equal(mini.version, 2);
    assert.ok(mini.shadowed.some((entry) => entry.source === 'user-cache'));
  } finally {
    rmSync(tempDirectory, { recursive: true, force: true });
    rmSync(homeDirectory, { recursive: true, force: true });
  }
});

test('e2e resolve: deliver[] copies chart-pack assets into prototype paths', () => {
  const tempDirectory = mkdtempSync(path.join(os.tmpdir(), 'pack-deliver-'));
  const packDest = path.join(tempDirectory, 'packs');
  const prototypeDirectory = path.join(tempDirectory, 'prototype');

  try {
    const installResult = runScript(installer, [
      '--pack=chart-pack',
      `--from-local=${chartPackDirectory}`,
      `--dest=${packDest}`
    ]);
    assert.equal(installResult.status, 0, installResult.stderr || installResult.stdout);

    const resolveResult = runScript(resolver, [
      '--pack=chart-pack',
      '--select=data.chart-line'
    ], {
      cwd: tempDirectory,
      env: { HTML_PROTOTYPE_PACK_ROOT: packDest }
    });
    assert.equal(resolveResult.status, 0, resolveResult.stderr || resolveResult.stdout);
    const payload = parseJson(resolveResult.stdout);
    assert.equal(payload.pack, 'chart-pack');
    assert.deepEqual(
      payload.deliver.map((entry) => entry.to).sort(),
      ['assets/chart.js', 'prototype/bridge.js']
    );

    for (const entry of payload.deliver) {
      assert.ok(path.isAbsolute(entry.from));
      const targetPath = path.join(prototypeDirectory, entry.to);
      mkdirSync(path.dirname(targetPath), { recursive: true });
      cpSync(entry.from, targetPath);
      assert.ok(readFileSync(targetPath, 'utf8').length > 0);
    }
  } finally {
    rmSync(tempDirectory, { recursive: true, force: true });
  }
});
