import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveSizing } from '../../../../skills/html-prototype-build/runtime/author/sketch/sizing.js';

test('sketch sizing: resize declarations map to stamp specs', () => {
  assert.deepEqual(resolveSizing({ resize: 'none', width: 300 }), { axis: 'none', width: null, height: null, minWidth: 1, minHeight: 1, lockWidth: false, lockHeight: false });
  assert.equal(resolveSizing({ resize: 'x', width: 720, height: 102 }).lockHeight, true);
  assert.equal(resolveSizing({ resize: 'x', minWidth: 32 }).lockHeight, false);
  assert.equal(resolveSizing({ resize: 'x', minWidth: 32 }).width, null);
  assert.equal(resolveSizing({ resize: 'y', width: 420, height: 480 }).lockWidth, true);
  assert.equal(resolveSizing({ resize: 'bogus' }).axis, 'none');
});
