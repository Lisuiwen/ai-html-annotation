import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const viewerUrl = new URL('../../../../skills/html-prototype-build/runtime/client/notes/viewer.js', import.meta.url);

test('Notes Viewer 只保留 DOM/连线职责，状态与 when 逻辑由依赖提供', async () => {
  const source = await readFile(viewerUrl, 'utf8');
  assert.match(source, /PrototypeNotesViewer/);
  assert.doesNotMatch(source, /原型统一状态协调器/);
  assert.doesNotMatch(source, /PrototypeAuthorChrome\s*=/);
  assert.doesNotMatch(source, /PrototypeViewers\s*=\s*\{/);
  assert.doesNotMatch(source, /function matchesWhen/);
  assert.doesNotMatch(source, /function equalStateValue/);
  assert.match(source, /PrototypeNotesModel\.visibleCards/);
  assert.match(source, /missing PrototypeViewers state core/);
  assert.match(source, /missing PrototypeNotesModel/);
});

test('Viewer 深链恢复只读取 scene', async () => {
  const source = await readFile(viewerUrl, 'utf8');
  const start = source.indexOf('function activateInitialState');
  const end = source.indexOf('\n  }', start);
  const body = source.slice(start, end);
  assert.match(body, /readUrlParam\('scene'\)/);
  assert.doesNotMatch(body, /legacyState/);
});
