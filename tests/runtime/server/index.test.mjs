import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { validateSnapshot } from '../../../skills/html-prototype-build/runtime/server/index.mjs';

function validSnapshot() {
  return {
    schemaVersion: 2,
    header: { title: 'Demo' },
    scenarios: { base: { state: { product: { page: 'list' } } } },
    cards: [
      { id: 'n1', target: { selector: '#save' }, when: { 'product.page': 'list' } },
      { id: 'n2', target: { anchor: 'save-button' } }
    ]
  };
}

test('validateSnapshot 接受对象式和数组式 scenarios', () => {
  assert.equal(validateSnapshot(validSnapshot()), true);
  const array = validSnapshot();
  array.scenarios = [{ id: 'base', state: {} }, { id: 'modal' }];
  assert.equal(validateSnapshot(array), true);
});

test('validateSnapshot 拒绝错误 schema/header/cards/scenarios/when', () => {
  assert.equal(validateSnapshot(null), false);
  assert.equal(validateSnapshot({ ...validSnapshot(), schemaVersion: 1 }), false);
  assert.equal(validateSnapshot({ ...validSnapshot(), header: {} }), false);
  assert.equal(validateSnapshot({ ...validSnapshot(), cards: {} }), false);
  assert.equal(validateSnapshot({ ...validSnapshot(), scenarios: {} }), false);
  const badTarget = validSnapshot(); badTarget.cards = [{ id: 'n1', target: {} }];
  assert.equal(validateSnapshot(badTarget), false);
  const badWhen = validSnapshot(); badWhen.cards = [{ id: 'n1', target: { selector: '#x' }, when: [] }];
  assert.equal(validateSnapshot(badWhen), false);
});

test('Server 资源边界只暴露 author/client 并注入新 bootstrap', async () => {
  const source = await readFile(new URL('../../../skills/html-prototype-build/runtime/server/index.mjs', import.meta.url), 'utf8');
  assert.match(source, /rel\.startsWith\('author\/'\)/);
  assert.match(source, /rel\.startsWith\('client\/'\)/);
  assert.match(source, /\/__prototype-author\/author\/bootstrap\.js/);
  assert.doesNotMatch(source, /author-tools\//);
  assert.doesNotMatch(source, /author-loader\.js/);
});
