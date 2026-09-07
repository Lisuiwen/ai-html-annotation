import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const viewerUrl = new URL('../../../../skills/html-prototype-build/runtime/client/notes/viewer.js', import.meta.url);

test('Notes Viewer 只保留说明渲染职责，不再内嵌 Client Core', async () => {
  const source = await readFile(viewerUrl, 'utf8');
  assert.match(source, /PrototypeNotesViewer/);
  assert.doesNotMatch(source, /原型统一状态协调器/);
  assert.doesNotMatch(source, /PrototypeAuthorChrome\s*=/);
  assert.doesNotMatch(source, /PrototypeViewers\s*=\s*\{/);
  assert.match(source, /缺少 PrototypeViewers 状态内核/);
});

test('Viewer 深链恢复只读取 scene，不恢复 legacy state', async () => {
  const source = await readFile(viewerUrl, 'utf8');
  const start = source.indexOf('function activateInitialState');
  const end = source.indexOf('\n  }', start);
  const body = source.slice(start, end);
  assert.match(body, /readUrlParam\('scene'\)/);
  assert.doesNotMatch(body, /legacyState/);
});
