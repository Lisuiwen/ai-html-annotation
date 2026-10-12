import assert from 'node:assert/strict';
import test from 'node:test';

test('sketch board: importing outside a document does not boot', async () => {
  const board = await import('../../../../skills/html-prototype-build/runtime/author/sketch/board.js');
  assert.equal(board, board);
});
