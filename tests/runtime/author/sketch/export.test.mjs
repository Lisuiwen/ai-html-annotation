import assert from 'node:assert/strict';
import test from 'node:test';
import { copyBoardPng } from '../../../../skills/html-prototype-build/runtime/author/sketch/export.js';

test('sketch export: clipboard image copy fails closed without a clipboard API', async () => {
  await assert.rejects(copyBoardPng({}), /Clipboard image copy is not available/);
});
