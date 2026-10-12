import assert from 'node:assert/strict';
import test from 'node:test';
import { fileFor } from '../../../../skills/html-prototype-build/runtime/author/sketch/serve.mjs';

test('sketch server: only the board and installed packs are readable', () => {
  const board = fileFor('/sketch/board.js');
  assert.match(board, /runtime[/\\]author[/\\]sketch[/\\]board\.js$/);
  assert.equal(fileFor('/sketch/../../package.json'), null);
  assert.equal(fileFor('/prototype.html'), null);
  assert.equal(fileFor('/examples/minimal-notes-system/prototype.html'), null);
  assert.match(fileFor('/.html-prototype/packs/admin-desktop/manifest.json'), /manifest\.json$/);
});
