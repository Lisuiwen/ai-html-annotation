import assert from 'node:assert/strict';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { copyFixturePack } from '../helpers/copy-fixture-pack.mjs';
import { runScript } from '../helpers/run-script.mjs';

const repositoryDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const validator = path.join(repositoryDirectory, 'skills', 'ui-pack-maintain', 'scripts', 'validate-pack.mjs');
const miniPackDirectory = path.join(repositoryDirectory, 'tests', 'fixtures', 'pack-root', 'mini-pack');
const chartPackDirectory = path.join(repositoryDirectory, 'tests', 'fixtures', 'chart-pack');

function validatePack(packDirectory, strict = false) {
  const args = [`--pack=${packDirectory}`];
  if (strict) args.push('--strict');
  const result = runScript(validator, args);
  return {
    status: result.status,
    output: `${result.stdout}\n${result.stderr}`
  };
}

test('e2e validate: chart-pack fixture passes strict validation', () => {
  const result = validatePack(chartPackDirectory, true);
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /UI Pack valid: chart-pack/);
});

test('e2e validate: missing delivery target fails', () => {
  const { tempDirectory, packDirectory } = copyFixturePack(chartPackDirectory);
  try {
    const manifest = JSON.parse(readFileSync(path.join(packDirectory, 'manifest.json'), 'utf8'));
    delete manifest.delivery['vendor/chart/chart.js'];
    writeFileSync(path.join(packDirectory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    const result = validatePack(packDirectory);
    assert.notEqual(result.status, 0);
    assert.match(result.output, /manifest\.delivery target: vendor\/chart\/chart\.js/);
  } finally {
    rmSync(tempDirectory, { recursive: true, force: true });
  }
});

test('e2e validate: unknown requires dependency fails', () => {
  const { tempDirectory, packDirectory } = copyFixturePack(miniPackDirectory);
  try {
    const manifest = JSON.parse(readFileSync(path.join(packDirectory, 'manifest.json'), 'utf8'));
    manifest.components['action.button'].requires = ['missing.component'];
    writeFileSync(path.join(packDirectory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    const result = validatePack(packDirectory);
    assert.notEqual(result.status, 0);
    assert.match(result.output, /references unknown dependency: missing\.component/);
  } finally {
    rmSync(tempDirectory, { recursive: true, force: true });
  }
});

test('e2e validate: forbidden adapter API fails', () => {
  const { tempDirectory, packDirectory } = copyFixturePack(miniPackDirectory);
  try {
    const manifest = JSON.parse(readFileSync(path.join(packDirectory, 'manifest.json'), 'utf8'));
    const adapterPath = 'components/action/button/state-adapter.js';
    manifest.components['action.button'].adapter = adapterPath;
    writeFileSync(path.join(packDirectory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    writeFileSync(path.join(packDirectory, adapterPath), `(function(){ PrototypeViewers.getState(); })();\n`, 'utf8');
    const result = validatePack(packDirectory);
    assert.notEqual(result.status, 0);
    assert.match(result.output, /adapter accesses PrototypeViewers/);
  } finally {
    rmSync(tempDirectory, { recursive: true, force: true });
  }
});

test('e2e validate: external URL in component fails', () => {
  const { tempDirectory, packDirectory } = copyFixturePack(miniPackDirectory);
  try {
    const componentPath = path.join(packDirectory, 'components/action/button/component.html');
    writeFileSync(componentPath, '<img src="https://example.test/icon.png" alt="icon">\n', 'utf8');
    const result = validatePack(packDirectory, true);
    assert.notEqual(result.status, 0);
    assert.match(result.output, /must not reference external URLs/);
  } finally {
    rmSync(tempDirectory, { recursive: true, force: true });
  }
});

test('e2e validate: strict classPrefix violation fails', () => {
  const { tempDirectory, packDirectory } = copyFixturePack(miniPackDirectory);
  try {
    const componentPath = path.join(packDirectory, 'components/action/button/component.html');
    writeFileSync(componentPath, '<button type="button" class="is-active">OK</button>\n', 'utf8');
    const result = validatePack(packDirectory, true);
    assert.notEqual(result.status, 0);
    assert.match(result.output, /Class does not use manifest\.classPrefix/);
  } finally {
    rmSync(tempDirectory, { recursive: true, force: true });
  }
});
