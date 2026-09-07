import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Server 入口只装配 HTTP 路由，Snapshot 与 Inspector 逻辑由独立模块提供', async () => {
  const source = await readFile(new URL('../../../skills/html-prototype-build/runtime/server/index.mjs', import.meta.url), 'utf8');
  assert.match(source, /from '\.\/snapshot\.mjs'/);
  assert.match(source, /from '\.\/inspector\.mjs'/);
  assert.match(source, /writeSnapshot\(snapshotPath, data\)/);
  assert.match(source, /resolveInspectorTarget\(\{/);
  assert.doesNotMatch(source, /function validateSnapshot/);
  assert.doesNotMatch(source, /function injectTargets/);
  assert.doesNotMatch(source, /node:child_process/);
});

test('Server 资源边界只暴露 author/client 并注入新 bootstrap', async () => {
  const source = await readFile(new URL('../../../skills/html-prototype-build/runtime/server/index.mjs', import.meta.url), 'utf8');
  assert.match(source, /rel\.startsWith\('author\/'\)/);
  assert.match(source, /rel\.startsWith\('client\/'\)/);
  assert.match(source, /\/__prototype-author\/author\/bootstrap\.js/);
  assert.doesNotMatch(source, /author-tools\//);
  assert.doesNotMatch(source, /author-loader\.js/);
});
