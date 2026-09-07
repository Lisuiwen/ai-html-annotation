import assert from 'node:assert/strict';
import test from 'node:test';
import { applyPrototypeEdit, isTrustedAuthorRequest } from '../../../skills/html-prototype-build/runtime/server/source-editor.mjs';

test('源码写回增删样式且保留复杂 CSS 声明', () => {
  const html = '<div id="box" style="--label: &quot;a;b&quot;; color: red; background-image: url(&quot;data:image/svg+xml;a;b&quot;)">x</div>';
  const next = applyPrototypeEdit(html, { selector: '#box', changes: { styles: { width: '120px' }, removeStyles: ['color'] } });
  assert.match(next, /--label:\s*&quot;a;b&quot;/);
  assert.match(next, /background-image:\s*url\(&quot;data:image\/svg\+xml;a;b&quot;\)/);
  assert.match(next, /width:\s*120px/);
  assert.doesNotMatch(next, /color:\s*red/);
});

test('源码写回支持 CSS.escape id 与直接子级 nth-of-type', () => {
  const html = '<main id="foo:bar"><p>a</p><section><p>nested</p></section><p>b</p><p>c</p></main>';
  const next = applyPrototypeEdit(html, { selector: '#foo\\:bar > p:nth-of-type(3)', changes: { text: '<done>' } });
  assert.match(next, /<p>&lt;done&gt;<\/p><\/main>$/);
  assert.doesNotMatch(next, /<section><p>&lt;done&gt;<\/p>/);
});

test('源码定位忽略 raw-text 伪标签并允许属性值包含 >', () => {
  const html = '<script>const tpl = `<div id="target">fake</div>`;</script><div id="target" title="a > b">real</div>';
  const next = applyPrototypeEdit(html, { selector: '#target', changes: { styles: { height: '20px' }, text: 'changed' } });
  assert.match(next, /<script>const tpl = `<div id="target">fake<\/div>`;<\/script>/);
  assert.match(next, /title="a > b" style="height: 20px">changed<\/div>/);
});

test('源码写回拒绝覆盖含元素子节点的文本', () => {
  assert.throws(() => applyPrototypeEdit('<div id="box">a<span>b</span></div>', { selector: '#box', changes: { text: 'replace' } }), /含子节点/);
});

test('源码写回校验 selector、CSS 属性和值类型', () => {
  assert.throws(() => applyPrototypeEdit('<div id="box"></div>', { changes: {} }), /selector/);
  assert.throws(() => applyPrototypeEdit('<div id="box"></div>', { selector: '#missing', changes: { styles: {} } }), /找不到元素/);
  assert.throws(() => applyPrototypeEdit('<div id="box"></div>', { selector: '#box', changes: { styles: { 'bad prop': '1' } } }), /非法 CSS 属性/);
  assert.throws(() => applyPrototypeEdit('<div id="box"></div>', { selector: '#box', changes: { styles: { width: 1 } } }), /必须是字符串/);
});

test('作者写接口只接受同源 localhost JSON', () => {
  const good = { headers: { host: '127.0.0.1:4178', origin: 'http://127.0.0.1:4178', 'content-type': 'application/json; charset=utf-8' } };
  assert.equal(isTrustedAuthorRequest(good, 4178), true);
  assert.equal(isTrustedAuthorRequest({ headers: { ...good.headers, host: 'localhost:4178', origin: 'http://localhost:4178' } }, 4178), true);
  assert.equal(isTrustedAuthorRequest({ headers: { ...good.headers, host: '[::1]:4178', origin: 'http://[::1]:4178' } }, 4178), true);
  assert.equal(isTrustedAuthorRequest({ headers: { ...good.headers, host: 'attacker.test:4178' } }, 4178), false);
  assert.equal(isTrustedAuthorRequest({ headers: { ...good.headers, origin: 'https://attacker.test' } }, 4178), false);
  assert.equal(isTrustedAuthorRequest({ headers: { ...good.headers, 'content-type': 'text/plain' } }, 4178), false);
});
