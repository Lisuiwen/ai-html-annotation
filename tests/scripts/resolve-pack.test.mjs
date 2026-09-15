import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repositoryDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const resolver = path.join(repositoryDirectory, 'skills', 'html-prototype-build', 'scripts', 'resolve-pack.mjs');

function runResolver(args, options = {}) {
  const result = spawnSync(process.execPath, [resolver, ...args], {
    cwd: options.cwd || repositoryDirectory,
    encoding: 'utf8',
    env: {
      ...process.env,
      HTML_PROTOTYPE_PACK_ROOT: options.packRootEnv || ''
    }
  });
  return {
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || ''
  };
}

function parseJson(stdout) {
  return JSON.parse(stdout.trim());
}

test('resolve-pack --list discovers project packs', () => {
  const result = runResolver(['--list']);
  assert.equal(result.status, 0);
  const payload = parseJson(result.stdout);
  const ids = payload.packs.map((pack) => pack.id).sort();
  assert.deepEqual(ids, ['admin-desktop', 'mobile-vant']);
  assert.ok(payload.roots.some((root) => root.source === 'project' && root.exists));
  assert.ok(payload.packs.every((pack) => pack.origin === 'local'));
});

test('resolve-pack --list reports installed origin when provenance exists', () => {
  const tempDirectory = mkdtempSync(path.join(os.tmpdir(), 'resolve-pack-origin-'));
  const packRoot = path.join(tempDirectory, 'packs');
  const packDirectory = path.join(packRoot, 'demo-pack');
  mkdirSync(packDirectory, { recursive: true });
  writeFileSync(path.join(packDirectory, 'manifest.json'), JSON.stringify({
    schemaVersion: 1,
    id: 'demo-pack',
    version: 1,
    classPrefix: 'dp-',
    tokenPrefix: 'dp-',
    foundation: { id: 'demo-pack.default', contract: 'foundation/FOUNDATION.md', sources: [] },
    providers: { action: { compatibleFoundations: ['demo-pack.default'] } },
    components: {}
  }), 'utf8');
  writeFileSync(path.join(packDirectory, '.pack-source.json'), JSON.stringify({ packId: 'demo-pack', ref: 'v0.4.0' }), 'utf8');
  const result = runResolver(['--list'], { cwd: tempDirectory, packRootEnv: packRoot });
  assert.equal(result.status, 0);
  const payload = parseJson(result.stdout);
  assert.equal(payload.packs[0].origin, 'installed');
});

test('resolve-pack resolves admin-desktop closure with absolute paths', () => {
  const result = runResolver(['--pack=admin-desktop', '--select=action.button']);
  assert.equal(result.status, 0);
  const payload = parseJson(result.stdout);
  assert.equal(payload.pack, 'admin-desktop');
  assert.equal(payload.source, 'project');
  assert.ok(payload.read.every((file) => path.isAbsolute(file)));
  assert.ok(payload.read.some((file) => file.endsWith('components\\action\\button\\component.html') || file.endsWith('components/action/button/component.html')));
  assert.ok(Array.isArray(payload.deliver));
  assert.equal(payload.deliver.length, 0);
});

test('resolve-pack delivers chart assets from the pack with from/to pairs', () => {
  const result = runResolver(['--pack=admin-desktop', '--select=data.chart-line']);
  assert.equal(result.status, 0);
  const payload = parseJson(result.stdout);
  const echarts = payload.deliver.find((entry) => entry.to === 'assets/echarts.min.js');
  assert.ok(echarts);
  assert.ok(path.isAbsolute(echarts.from));
  assert.match(echarts.from, /vendor[\\/]echarts[\\/]echarts\.min\.js$/);
  assert.ok(payload.deliver.some((entry) => entry.to === 'prototype/bridge.js'));
});

test('resolve-pack exits 2 when pack is missing', () => {
  const tempDirectory = mkdtempSync(path.join(os.tmpdir(), 'resolve-pack-'));
  const emptyPackRoot = path.join(tempDirectory, 'empty-packs');
  mkdirSync(emptyPackRoot, { recursive: true });
  const result = runResolver(['--pack=missing-pack', '--select=action.button'], {
    cwd: tempDirectory,
    packRootEnv: emptyPackRoot
  });
  assert.equal(result.status, 2);
  const payload = parseJson(result.stdout);
  assert.equal(payload.error, 'pack-not-found');
  assert.equal(payload.requested, 'missing-pack');
});

test('resolve-pack exits 3 for unknown resource id', () => {
  const result = runResolver(['--pack=admin-desktop', '--select=missing.component']);
  assert.equal(result.status, 3);
  const payload = parseJson(result.stdout);
  assert.equal(payload.error, 'unknown-resource');
  assert.equal(payload.id, 'missing.component');
});
