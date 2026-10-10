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

function withAtoms(atoms, html) {
  const { tempDirectory, packDirectory } = copyFixturePack(miniPackDirectory);
  const manifestPath = path.join(packDirectory, 'manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  manifest.components['action.button'].atoms = atoms;
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  if (html !== undefined) writeFileSync(path.join(packDirectory, 'components/action/button/component.html'), html, 'utf8');
  return { tempDirectory, packDirectory };
}

const markedButton = '<button type="button" class="mp-button" data-pack-atom="button">OK</button>\n';

test('e2e validate: declared and marked atom passes strict validation', () => {
  const { tempDirectory, packDirectory } = withAtoms({ button: { label: 'Button', resize: 'x', minWidth: 32 } }, markedButton);
  try {
    const result = validatePack(packDirectory, true);
    assert.equal(result.status, 0, result.output);
  } finally {
    rmSync(tempDirectory, { recursive: true, force: true });
  }
});

test('e2e validate: declared atom without marker fails', () => {
  const { tempDirectory, packDirectory } = withAtoms({ button: { label: 'Button', resize: 'none' } });
  try {
    const result = validatePack(packDirectory);
    assert.notEqual(result.status, 0);
    assert.match(result.output, /atom must be marked exactly once in components\/action\/button\/component\.html: button \(found 0\)/);
  } finally {
    rmSync(tempDirectory, { recursive: true, force: true });
  }
});

test('e2e validate: undeclared atom marker fails', () => {
  const { tempDirectory, packDirectory } = withAtoms(undefined, markedButton);
  try {
    const result = validatePack(packDirectory);
    assert.notEqual(result.status, 0);
    assert.match(result.output, /marks an undeclared atom in components\/action\/button\/component\.html: button/);
  } finally {
    rmSync(tempDirectory, { recursive: true, force: true });
  }
});

test('e2e validate: invalid atom fields fail', () => {
  const { tempDirectory, packDirectory } = withAtoms({ button: { resize: 'diagonal', width: -1, text: 'x' } }, markedButton);
  try {
    const result = validatePack(packDirectory);
    assert.notEqual(result.status, 0);
    assert.match(result.output, /action\.button\.atoms\.button\.label is required/);
    assert.match(result.output, /resize must be one of none, x, y, both/);
    assert.match(result.output, /width must be a positive number/);
    assert.match(result.output, /has unknown fields: text/);
  } finally {
    rmSync(tempDirectory, { recursive: true, force: true });
  }
});

test('e2e validate: internal component must not declare atoms', () => {
  const { tempDirectory, packDirectory } = withAtoms({ button: { label: 'Button', resize: 'none' } }, markedButton);
  try {
    const manifestPath = path.join(packDirectory, 'manifest.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    manifest.components['action.button'].visibility = 'internal';
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    const result = validatePack(packDirectory);
    assert.notEqual(result.status, 0);
    assert.match(result.output, /Internal component must not declare atoms: action\.button/);
  } finally {
    rmSync(tempDirectory, { recursive: true, force: true });
  }
});
