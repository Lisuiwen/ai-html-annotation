import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { validateSnapshot } from '../../skills/html-prototype-build/runtime/server/index.mjs';

const runtimeDisplayModeUrl = new URL('../../skills/html-prototype-build/runtime/client/core/display-mode.js', import.meta.url);
const runtimeStateUrl = new URL('../../skills/html-prototype-build/runtime/client/core/state.js', import.meta.url);
const runtimeModelUrl = new URL('../../skills/html-prototype-build/runtime/client/notes/model.js', import.meta.url);
const runtimeViewerUrl = new URL('../../skills/html-prototype-build/runtime/client/notes/viewer.js', import.meta.url);
const exampleDisplayModeUrl = new URL('../../examples/minimal-notes-system/prototype/display-mode.js', import.meta.url);
const exampleStateUrl = new URL('../../examples/minimal-notes-system/prototype/state.js', import.meta.url);
const exampleModelUrl = new URL('../../examples/minimal-notes-system/prototype/model.js', import.meta.url);
const exampleViewerUrl = new URL('../../examples/minimal-notes-system/prototype/viewer.js', import.meta.url);
const prototypeUrl = new URL('../../examples/minimal-notes-system/prototype.html', import.meta.url);
const snapshotUrl = new URL('../../examples/minimal-notes-system/prototype/notes.snapshot.js', import.meta.url);
const packManifestUrl = new URL('../../skills/html-prototype-build/ui/packs/admin-desktop/manifest.json', import.meta.url);

async function readSnapshot() {
  const source = await readFile(snapshotUrl, 'utf8');
  const match = source.match(/^\s*(?:(?:\/\*[\s\S]*?\*\/|\/\/[^\r\n]*(?:\r?\n|$))\s*)*window\.__PROTOTYPE_NOTES__\s*=\s*([\s\S]*?)\s*;\s*$/);
  assert.ok(match, '示例 snapshot 应保持单一 JSON 赋值格式');
  return JSON.parse(match[1]);
}

function collectHtmlIds(html) {
  return [...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map((match) => match[1]);
}

test('Client Runtime matches example distribution copies file by file', async () => {
  const pairs = [
    [runtimeDisplayModeUrl, exampleDisplayModeUrl],
    [runtimeStateUrl, exampleStateUrl],
    [runtimeModelUrl, exampleModelUrl],
    [runtimeViewerUrl, exampleViewerUrl]
  ];
  for (const [runtimeUrl, exampleUrl] of pairs) {
    const [runtimeSource, exampleSource] = await Promise.all([readFile(runtimeUrl, 'utf8'), readFile(exampleUrl, 'utf8')]);
    assert.equal(exampleSource, runtimeSource);
  }
});

test('example loads Client Runtime in display-mode → state → model → viewer order', async () => {
  const html = await readFile(prototypeUrl, 'utf8');
  const snapshot = html.indexOf('./prototype/notes.snapshot.js');
  const displayMode = html.indexOf('./prototype/display-mode.js');
  const state = html.indexOf('./prototype/state.js');
  const model = html.indexOf('./prototype/model.js');
  const viewer = html.indexOf('./prototype/viewer.js');
  const product = html.indexOf('./prototype/prototype.js');
  assert.ok(snapshot >= 0 && displayMode > snapshot && state > displayMode && model > state && viewer > model && product > viewer);
});

test('example does not use stateful data-ui attributes', async () => {
  const html = await readFile(prototypeUrl, 'utf8');
  const deprecated = /\bdata-ui-(?:open|layer|confirm|edit|delete|select(?:-value)?)\b/gi;
  assert.deepEqual([...html.matchAll(deprecated)].map((match) => match[0]), []);
});

test('example DOM ids unique and snapshot v2 anchors match once', async () => {
  const [html, snapshot] = await Promise.all([readFile(prototypeUrl, 'utf8'), readSnapshot()]);
  assert.equal(snapshot.schemaVersion, 2); assert.equal(validateSnapshot(snapshot), true);
  const ids = collectHtmlIds(html); assert.equal(new Set(ids).size, ids.length, 'HTML ids must be unique');
  for (const card of snapshot.cards || []) {
    const anchor = String(card?.target?.anchor || '').replace(/^#/, '');
    assert.ok(anchor, `卡片 ${card?.id || '<unknown>'} must declare target.anchor`);
    assert.equal(ids.filter((id) => id === anchor).length, 1, `锚点 ${anchor} must match DOM exactly once`);
  }
});

test('UI pack stateful components provide local Adapter and static snippets avoid stateful data-ui protocol', async () => {
  const manifest = JSON.parse(await readFile(packManifestUrl, 'utf8'));
  const statefulIds = Object.entries(manifest.components).filter(([, entry]) => entry.adapter).map(([id]) => id);
  const deprecated = /\bdata-ui-(?:open|layer|close|confirm|select(?:-value)?|tree-toggle|tabs|toast|table-state)\b/gi;
  for (const id of statefulIds) {
    const entry = manifest.components[id];
    const [source, adapter] = await Promise.all([
      readFile(new URL(`../../skills/html-prototype-build/ui/packs/admin-desktop/${entry.source}`, import.meta.url), 'utf8'),
      readFile(new URL(`../../skills/html-prototype-build/ui/packs/admin-desktop/${entry.adapter}`, import.meta.url), 'utf8')
    ]);
    assert.doesNotMatch(source, /<script\b/i, `${id} static component snippet must not register global events`);
    assert.deepEqual([...source.matchAll(deprecated)].map((match) => match[0]), []);
    assert.match(adapter, /PrototypeUiAdapters/); assert.match(adapter, /render/);
  }
});
