import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const sourceUrl = new URL('../../../../../skills/html-prototype-build/runtime/author/tools/notes-editor/index.js', import.meta.url);
const styleUrl = new URL('../../../../../skills/html-prototype-build/runtime/author/tools/notes-editor/index.css', import.meta.url);

function run(source, window, errors) {
  window.window = window;
  vm.runInNewContext(source, { window, document: {}, console: { error: (...args) => errors.push(args.join(' ')), log() {} }, JSON }, { filename: 'notes-editor/index.js' });
}

test('NotesEditor exits safely when Viewer uninitialized and keeps public API', async () => {
  const source = await readFile(sourceUrl, 'utf8'); const errors = []; const window = {};
  run(source, window, errors);
  assert.equal(typeof window.PrototypeNotesEditor.init, 'function');
  assert.equal(typeof window.PrototypeNotesEditor.save, 'function');
  assert.match(errors.join('\n'), /Viewer not initialized/);
});

test('NotesEditor exits safely when shared selector missing', async () => {
  const source = await readFile(sourceUrl, 'utf8'); const errors = [];
  const window = { PrototypeNotesViewer: { getData: () => ({ header: {}, cards: [] }) } };
  run(source, window, errors);
  assert.match(errors.join('\n'), /AuthorToolsSelector/);
});

test('NotesEditor exits safely when data model missing', async () => {
  const source = await readFile(sourceUrl, 'utf8'); const errors = [];
  const window = {
    PrototypeNotesViewer: { getData: () => ({ header: {}, cards: [] }) },
    AuthorToolsSelector: {}
  };
  run(source, window, errors);
  assert.match(errors.join('\n'), /PrototypeNotesEditorModel/);
});

test('NotesEditor delegates data and selector rules to shared model with bind/dirty guards', async () => {
  const source = await readFile(sourceUrl, 'utf8');
  assert.match(source, /PrototypeNotesEditorModel\.createCard/);
  assert.match(source, /PrototypeNotesEditorModel\.removeCard/);
  assert.match(source, /PrototypeNotesEditorModel\.applyVisibleOrder/);
  assert.match(source, /PrototypeNotesEditorModel\.reorderVisibleIds/);
  assert.match(source, /AuthorToolsSelector\.cssPath/);
  assert.match(source, /AuthorToolsSelector\.noteTarget/);
  assert.doesNotMatch(source, /function createCardId\(/);
  assert.doesNotMatch(source, /function whenForCurrentLayer\(/);
  assert.doesNotMatch(source, /function cssPathForPick\(/);
  assert.doesNotMatch(source, /function selectorFor\(/);
  assert.match(source, /function startPick/);
  assert.match(source, /beforeunload/);
  assert.match(source, /saveModifierActive/);
  assert.match(source, /AuthorToolsPlatform\.saveModifierActive/);
});

test('NotesEditor author styles independent of controller JS', async () => {
  const [source, css] = await Promise.all([readFile(sourceUrl, 'utf8'), readFile(styleUrl, 'utf8')]);
  assert.doesNotMatch(source, /function installStyles\(/);
  assert.doesNotMatch(source, /createElement\('style'\)/);
  assert.match(css, /\.pn-author-toolbar\s*\{/);
  assert.match(source, /pn-panel-actions-start/);
  assert.match(source, /syncPanelActions/);
  assert.match(css, /\.pn-pick-tooltip\s*\{/);
});
