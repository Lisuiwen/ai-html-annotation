import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const sourceUrl = new URL('../../../../skills/html-prototype-build/runtime/author/core/selector.js', import.meta.url);

function element(tag, parent = null) {
  const attrs = new Map();
  const el = {
    nodeType: 1,
    tagName: tag.toUpperCase(),
    id: '',
    textContent: '',
    parentElement: parent,
    children: [],
    getAttribute: (name) => attrs.get(name) || null,
    setAttribute: (name, value) => attrs.set(name, value)
  };
  if (parent) parent.children.push(el);
  return el;
}

async function loadSelector() {
  const source = await readFile(sourceUrl, 'utf8');
  const html = element('html');
  const body = element('body', html);
  const document = { body, documentElement: html };
  const window = { CSS: { escape: (value) => String(value).replace(/:/g, '\\:') } }; window.window = window;
  vm.runInNewContext(source, { window, document, CSS: window.CSS, String, Array, Object }, { filename: 'selector.js' });
  return { selector: window.AuthorToolsSelector, body };
}

test('stableSelector 优先 id、note target、mark label，再降级 DOM path', async () => {
  const { selector, body } = await loadSelector();
  const byId = element('div', body); byId.id = 'foo:bar';
  assert.equal(selector.stableSelector(byId), '#foo\\:bar');
  const byNote = element('div', body); byNote.setAttribute('data-prototype-note-target', 'save"item');
  assert.equal(selector.stableSelector(byNote), '[data-prototype-note-target="save\\"item"]');
  const byMark = element('div', body); byMark.setAttribute('data-mm-label', 'toolbar');
  assert.equal(selector.stableSelector(byMark), '[data-mm-label="toolbar"]');
});

test('cssPath 使用 nth-of-type，并在稳定祖先 id 处截断', async () => {
  const { selector, body } = await loadSelector();
  const section = element('section', body); section.id = 'panel';
  element('span', section); const second = element('span', section);
  assert.equal(selector.cssPath(second), '#panel > span:nth-of-type(2)');
});

test('noteTarget 有 id Hour生成 anchor，无 id Hour生成 selector', async () => {
  const { selector, body } = await loadSelector();
  const anchored = element('button', body); anchored.id = 'save'; anchored.textContent = 'Save';
  assert.deepEqual(JSON.parse(JSON.stringify(selector.noteTarget(anchored))), { anchor: 'save', label: 'Save' });
  const selected = element('div', body); selected.setAttribute('data-prototype-note-target', 'content'); selected.textContent = 'Content';
  assert.deepEqual(JSON.parse(JSON.stringify(selector.noteTarget(selected))), { selector: '[data-prototype-note-target="content"]', label: 'Content' });
});

test('noteTarget label 优先 aria-label 且最多 60 字符', async () => {
  const { selector, body } = await loadSelector();
  const target = element('button', body); target.setAttribute('aria-label', 'x'.repeat(80)); target.textContent = 'ignored';
  const note = selector.noteTarget(target);
  assert.equal(note.label, 'x'.repeat(60));
});
