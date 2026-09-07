import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const sourceUrl = new URL('../../../../skills/html-prototype-build/runtime/author/tools/notes-editor/index.js', import.meta.url);

test('NotesEditor 在 Viewer 未初始化时安全退出并保留公开 API', async () => {
  const source = await readFile(sourceUrl, 'utf8'); const errors = []; const window = {}; window.window = window;
  vm.runInNewContext(source, { window, document: {}, console: { error: (...args) => errors.push(args.join(' ')), log() {} }, JSON }, { filename: 'notes-editor/index.js' });
  assert.equal(typeof window.PrototypeNotesEditor.init, 'function');
  assert.equal(typeof window.PrototypeNotesEditor.save, 'function');
  assert.match(errors.join('\n'), /Viewer 尚未初始化/);
});

test('NotesEditor 缺少数据模型时安全退出', async () => {
  const source = await readFile(sourceUrl, 'utf8'); const errors = [];
  const window = { PrototypeNotesViewer: { getData: () => ({ header: {}, cards: [] }) } }; window.window = window;
  vm.runInNewContext(source, { window, document: {}, console: { error: (...args) => errors.push(args.join(' ')), log() {} }, JSON }, { filename: 'notes-editor/index.js' });
  assert.match(errors.join('\n'), /PrototypeNotesEditorModel/);
});

test('NotesEditor 将卡片数据规则委托给 model，并保留绑定与脏状态保护', async () => {
  const source = await readFile(sourceUrl, 'utf8');
  assert.match(source, /PrototypeNotesEditorModel\.createCard/);
  assert.match(source, /PrototypeNotesEditorModel\.removeCard/);
  assert.match(source, /PrototypeNotesEditorModel\.applyVisibleOrder/);
  assert.match(source, /PrototypeNotesEditorModel\.reorderVisibleIds/);
  assert.doesNotMatch(source, /function createCardId\(/);
  assert.doesNotMatch(source, /function whenForCurrentLayer\(/);
  assert.match(source, /function startPick/);
  assert.match(source, /beforeunload/);
  assert.match(source, /window\.PrototypeAuthor\.register\('notes-target'/);
});
