import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

import { applyPrototypeEdit, isTrustedAuthorRequest } from '../../skills/html-prototype-build/runtime/author-edit-source.mjs';
import { validateSnapshot } from '../../skills/html-prototype-build/runtime/serve.mjs';
import { collectScenarios } from '../../skills/html-prototype-build/runtime/shoot.mjs';

{
test('applyPrototypeEdit 增删样式且保留复杂 CSS 声明', () => {
  const html = '<div id="box" style="--label: &quot;a;b&quot;; color: red; background-image: url(&quot;data:image/svg+xml;a;b&quot;)">x</div>';
  const next = applyPrototypeEdit(html, {
    selector: '#box',
    changes: { styles: { width: '120px' }, removeStyles: ['color'] }
  });
  assert.match(next, /--label:\s*&quot;a;b&quot;/);
  assert.match(next, /background-image:\s*url\(&quot;data:image\/svg\+xml;a;b&quot;\)/);
  assert.match(next, /width:\s*120px/);
  assert.doesNotMatch(next, /color:\s*red/);
});

test('applyPrototypeEdit 支持 CSS.escape id 与 nth-of-type 子节点', () => {
  const html = '<main id="foo:bar"><div>A</div><div>B</div></main>';
  const next = applyPrototypeEdit(html, {
    selector: '#foo\\:bar > div:nth-of-type(2)',
    changes: { text: '<done>' }
  });
  assert.equal(next, '<main id="foo:bar"><div>A</div><div>&lt;done&gt;</div></main>');
});

test('applyPrototypeEdit 不把 script 中伪 HTML 当作真实节点', () => {
  const html = '<script>const x = \'<div id="box">fake</div>\';</script><div id="box">real</div>';
  const next = applyPrototypeEdit(html, {
    selector: '#box',
    changes: { styles: { color: 'red' } }
  });
  assert.match(next, /<script>const x = '<div id="box">fake<\/div>';<\/script>/);
  assert.match(next, /<div id="box" style="color: red">real<\/div>/);
});

test('applyPrototypeEdit 正确处理属性值中的 >', () => {
  const html = '<div id="box" title="a > b">x</div>';
  const next = applyPrototypeEdit(html, {
    selector: '#box',
    changes: { styles: { width: '10px' } }
  });
  assert.match(next, /title="a > b" style="width: 10px"/);
});

test('applyPrototypeEdit 拒绝覆盖含元素子节点的文本', () => {
  assert.throws(() => applyPrototypeEdit('<div id="box">a<span>b</span></div>', {
    selector: '#box',
    changes: { text: 'replace' }
  }), /含子节点/);
});

test('applyPrototypeEdit 校验 selector、CSS 属性和值类型', () => {
  assert.throws(() => applyPrototypeEdit('<div id="box"></div>', { changes: {} }), /selector/);
  assert.throws(() => applyPrototypeEdit('<div id="box"></div>', {
    selector: '#missing',
    changes: { styles: {} }
  }), /找不到元素/);
  assert.throws(() => applyPrototypeEdit('<div id="box"></div>', {
    selector: '#box',
    changes: { styles: { 'bad prop': '1' } }
  }), /非法 CSS 属性/);
  assert.throws(() => applyPrototypeEdit('<div id="box"></div>', {
    selector: '#box',
    changes: { styles: { width: 1 } }
  }), /必须是字符串/);
});

test('isTrustedAuthorRequest 仅接受同源 localhost JSON', () => {
  const good = {
    headers: {
      host: '127.0.0.1:4178',
      origin: 'http://127.0.0.1:4178',
      'content-type': 'application/json; charset=utf-8'
    }
  };
  assert.equal(isTrustedAuthorRequest(good, 4178), true);
  assert.equal(isTrustedAuthorRequest({ headers: { ...good.headers, host: 'localhost:4178', origin: 'http://localhost:4178' } }, 4178), true);
  assert.equal(isTrustedAuthorRequest({ headers: { ...good.headers, host: '[::1]:4178', origin: 'http://[::1]:4178' } }, 4178), true);
  assert.equal(isTrustedAuthorRequest({ headers: { ...good.headers, host: 'attacker.test:4178' } }, 4178), false);
  assert.equal(isTrustedAuthorRequest({ headers: { ...good.headers, origin: 'https://attacker.test' } }, 4178), false);
  assert.equal(isTrustedAuthorRequest({ headers: { ...good.headers, 'content-type': 'text/plain' } }, 4178), false);
});
}

{
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

test('validateSnapshot 拒绝错误 schema/header/cards/scenarios', () => {
  assert.equal(validateSnapshot(null), false);
  assert.equal(validateSnapshot({ ...validSnapshot(), schemaVersion: 1 }), false);
  assert.equal(validateSnapshot({ ...validSnapshot(), header: {} }), false);
  assert.equal(validateSnapshot({ ...validSnapshot(), cards: {} }), false);
  assert.equal(validateSnapshot({ ...validSnapshot(), scenarios: {} }), false);
  assert.equal(validateSnapshot({ ...validSnapshot(), scenarios: [] }), false);
});

test('validateSnapshot 要求卡片 target 且 when 可序列化', () => {
  const badTarget = validSnapshot();
  badTarget.cards = [{ id: 'n1', target: {} }];
  assert.equal(validateSnapshot(badTarget), false);

  const badWhen = validSnapshot();
  badWhen.cards = [{ id: 'n1', target: { selector: '#x' }, when: [] }];
  assert.equal(validateSnapshot(badWhen), false);

  const tooDeep = validSnapshot();
  let value = true;
  for (let i = 0; i < 10; i++) value = { nested: value };
  tooDeep.cards = [{ id: 'n1', target: { selector: '#x' }, when: { deep: value } }];
  assert.equal(validateSnapshot(tooDeep), false);
});
}

{
test('collectScenarios 从对象和数组 scenarios 提取稳定 ID', () => {
  assert.deepEqual(
    collectScenarios({ cards: [], scenarios: { base: {}, modal: {} } }),
    [{ id: 'base', query: 'scene' }, { id: 'modal', query: 'scene' }]
  );
  assert.deepEqual(
    collectScenarios({ cards: [], scenarios: [{ id: 'base' }, { name: 'legacy-name' }] }),
    [{ id: 'base', query: 'scene' }, { id: 'legacy-name', query: 'scene' }]
  );
});

test('collectScenarios 拒绝缺失或空 scenarios', () => {
  assert.throws(() => collectScenarios({ cards: [] }), /显式声明 scenarios/);
  assert.throws(() => collectScenarios({ cards: [], scenarios: {} }), /有效 ID/);
  assert.throws(() => collectScenarios({ scenarios: { base: {} } }), /cards 数组/);
});

test('collectScenarios 拒绝路径穿越与 Windows 保留名', () => {
  assert.throws(() => collectScenarios({ cards: [], scenarios: { '../escape': {} } }), /不能安全/);
  assert.throws(() => collectScenarios({ cards: [], scenarios: { 'bad:name': {} } }), /不能安全/);
  assert.throws(() => collectScenarios({ cards: [], scenarios: { CON: {} } }), /保留设备名/);
});
}

{
const sourceUrl = new URL('../../skills/html-prototype-build/runtime/prepare-mark.mjs', import.meta.url);

test('prepare-mark 当前仍是 legacy standalone Mark 注入器，重构前显式锁定其遗留状态', async () => {
  const source = await readFile(sourceUrl, 'utf8');
  assert.match(source, /html-mark\.js/);
  assert.match(source, /html-mark-injection-begin/);
  assert.match(source, /--remove/);
});
}
