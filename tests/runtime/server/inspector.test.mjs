import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { injectTargets, resolveInspectorTarget } from '../../../skills/html-prototype-build/runtime/server/inspector.mjs';

test('injectTargets 清理旧 token 并为语义节点生成稳定行号映射', () => {
  const source = '<main data-insp-target="old">\n  <button id="save">Save</button>\n</main>\n';
  const result = injectTargets(source);
  assert.doesNotMatch(result.html, /data-insp-target="old"/);
  assert.match(result.html, /<main data-insp-target="i01">/);
  assert.match(result.html, /<button id="save" data-insp-target="i02">/);
  assert.equal(result.tokens.i01, 1);
  assert.equal(result.tokens.i02, 2);
});

test('injectTargets 不给自闭合节点Minute配 token', () => {
  const result = injectTargets('<div />\n<section>Content</section>');
  assert.doesNotMatch(result.html, /<div [^>]*data-insp-target/);
  assert.equal(result.tokens.i01, 2);
});

test('resolveInspectorTarget 限制在原型目录并Back目标源码行', () => {
  const root = mkdtempSync(join(tmpdir(), 'prototype-inspector-'));
  try {
    const htmlPath = join(root, 'prototype.html');
    writeFileSync(htmlPath, '<main>\n<button>Save</button>\n</main>', 'utf8');
    const hit = resolveInspectorTarget({ root, htmlPath, filePath: '', targetId: 'i02' });
    assert.equal(hit.ok, true);
    assert.equal(hit.filePath, 'prototype.html');
    assert.equal(hit.line, 2);

    const missing = resolveInspectorTarget({ root, htmlPath, filePath: '', targetId: 'missing' });
    assert.deepEqual({ ok: missing.ok, status: missing.status }, { ok: false, status: 404 });

    const escaped = resolveInspectorTarget({ root, htmlPath, filePath: '../outside.html', targetId: 'i01' });
    assert.deepEqual({ ok: escaped.ok, status: escaped.status }, { ok: false, status: 403 });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
