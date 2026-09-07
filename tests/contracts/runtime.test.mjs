import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { validateSnapshot } from '../../skills/html-prototype-build/runtime/server/index.mjs';

const runtimeDisplayModeUrl = new URL('../../skills/html-prototype-build/runtime/client/core/display-mode.js', import.meta.url);
const runtimeStateUrl = new URL('../../skills/html-prototype-build/runtime/client/core/state.js', import.meta.url);
const runtimeViewerUrl = new URL('../../skills/html-prototype-build/runtime/client/notes/viewer.js', import.meta.url);
const exampleDisplayModeUrl = new URL('../../examples/minimal-notes/prototype/display-mode.js', import.meta.url);
const exampleStateUrl = new URL('../../examples/minimal-notes/prototype/state.js', import.meta.url);
const exampleViewerUrl = new URL('../../examples/minimal-notes/prototype/viewer.js', import.meta.url);
const prototypeUrl = new URL('../../examples/minimal-notes/prototype.html', import.meta.url);
const snapshotUrl = new URL('../../examples/minimal-notes/prototype/notes.snapshot.js', import.meta.url);
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

test('Client Runtime 与示例分发副本逐文件一致', async () => {
  const pairs = [
    [runtimeDisplayModeUrl, exampleDisplayModeUrl],
    [runtimeStateUrl, exampleStateUrl],
    [runtimeViewerUrl, exampleViewerUrl]
  ];
  for (const [runtimeUrl, exampleUrl] of pairs) {
    const [runtimeSource, exampleSource] = await Promise.all([readFile(runtimeUrl, 'utf8'), readFile(exampleUrl, 'utf8')]);
    assert.equal(exampleSource, runtimeSource);
  }
});

test('示例按 display-mode → state → viewer 顺序加载 Client Runtime', async () => {
  const html = await readFile(prototypeUrl, 'utf8');
  const snapshot = html.indexOf('./prototype/notes.snapshot.js');
  const displayMode = html.indexOf('./prototype/display-mode.js');
  const state = html.indexOf('./prototype/state.js');
  const viewer = html.indexOf('./prototype/viewer.js');
  const product = html.indexOf('./prototype/prototype.js');
  assert.ok(snapshot >= 0 && displayMode > snapshot && state > displayMode && viewer > state && product > viewer);
});

test('示例不再使用废弃状态型 data-ui 属性', async () => {
  const html = await readFile(prototypeUrl, 'utf8');
  const deprecated = /\bdata-ui-(?:open|layer|confirm|edit|delete|select(?:-value)?)\b/gi;
  assert.deepEqual([...html.matchAll(deprecated)].map((match) => match[0]), []);
});

test('示例 DOM id 唯一且 snapshot v2 锚点均唯一命中', async () => {
  const [html, snapshot] = await Promise.all([readFile(prototypeUrl, 'utf8'), readSnapshot()]);
  assert.equal(snapshot.schemaVersion, 2); assert.equal(validateSnapshot(snapshot), true);
  const ids = collectHtmlIds(html); assert.equal(new Set(ids).size, ids.length, 'HTML id 不得重复');
  for (const card of snapshot.cards || []) {
    const anchor = String(card?.target?.anchor || '').replace(/^#/, '');
    assert.ok(anchor, `卡片 ${card?.id || '<unknown>'} 应声明 target.anchor`);
    assert.equal(ids.filter((id) => id === anchor).length, 1, `锚点 ${anchor} 应唯一命中 DOM`);
  }
});

test('UI pack 有状态组件提供局部 Adapter 且静态片段不绑定旧协议', async () => {
  const manifest = JSON.parse(await readFile(packManifestUrl, 'utf8'));
  const statefulIds = Object.entries(manifest.components).filter(([, entry]) => entry.adapter).map(([id]) => id);
  const deprecated = /\bdata-ui-(?:open|layer|close|confirm|select(?:-value)?|tree-toggle|tabs|toast|table-state)\b/gi;
  for (const id of statefulIds) {
    const entry = manifest.components[id];
    const [source, adapter] = await Promise.all([
      readFile(new URL(`../../skills/html-prototype-build/ui/packs/admin-desktop/${entry.source}`, import.meta.url), 'utf8'),
      readFile(new URL(`../../skills/html-prototype-build/ui/packs/admin-desktop/${entry.adapter}`, import.meta.url), 'utf8')
    ]);
    assert.doesNotMatch(source, /<script\b/i, `${id} 静态组件片段不应注册全局事件`);
    assert.deepEqual([...source.matchAll(deprecated)].map((match) => match[0]), []);
    assert.match(adapter, /PrototypeUiAdapters/); assert.match(adapter, /render/);
  }
});
