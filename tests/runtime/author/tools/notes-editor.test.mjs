import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const sourceUrl = new URL('../../../../skills/html-prototype-build/runtime/author/tools/notes-editor/index.js', import.meta.url);

test('NotesEditor 在 Viewer 未初始化时安全退出并保留公开 API', async () => {
  const source = await readFile(sourceUrl, 'utf8'); const errors = []; const window = {}; window.window = window;
  vm.runInNewContext(source, { window, document: {}, console: { error: (...args) => errors.push(args.join(' ')), log() {} }, JSON }, { filename: 'notes-editor/index.js' });
  assert.equal(typeof window.PrototypeNotesEditor.init, 'function'); assert.equal(typeof window.PrototypeNotesEditor.save, 'function'); assert.match(errors.join('\n'), /Viewer 尚未初始化/);
});

test('NotesEditor 保留排序、绑定与 beforeunload 脏状态保护', async () => {
  const source = await readFile(sourceUrl, 'utf8'); assert.match(source, /function applyVisibleOrder/); assert.match(source, /function startPick/); assert.match(source, /beforeunload/); assert.match(source, /window\.PrototypeAuthor\.register\('notes-target'/);
});
