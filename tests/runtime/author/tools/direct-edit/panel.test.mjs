import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const sourceUrl = new URL('../../../../../skills/html-prototype-build/runtime/author/tools/direct-edit/panel.js', import.meta.url);
async function panelApi() { const source = await readFile(sourceUrl, 'utf8'); const window = {}; window.window = window; vm.runInNewContext(source, { window }, { filename: 'panel.js' }); return window.AuthorToolsEditPanel; }

test('Panel 无 session 展示空态且ActionsButtonDisabled', async () => {
  const api = await panelApi(); const container = { innerHTML: '' }; api.render(container, null, {});
  assert.match(container.innerHTML, /at-edit-body/);
  assert.match(container.innerHTML, /Ctrl/);
  assert.match(container.innerHTML, /data-act="save" disabled/);
  assert.match(container.innerHTML, /data-act="reset" disabled/);
});

test('Panel 对 meta/value 做 HTML 转义', async () => {
  const api = await panelApi(); const container = { innerHTML: '' }; const session = { fields: [{ group: 'Content', key: 'text', label: 'A本', kind: 'text' }], rows: {}, canEditText: true, getText: () => '<img onerror=1>', isDirty: () => true };
  api.render(container, session, { tag: '<div>', id: '"x"', classes: '<bad>' }); assert.doesNotMatch(container.innerHTML, /<img onerror=1>/); assert.match(container.innerHTML, /&lt;img onerror=1&gt;/); assert.match(container.innerHTML, /&lt;div&gt;/);
});

test('Panel dirty 决定SaveButtonStatus', async () => {
  const api = await panelApi(); const container = { innerHTML: '' }; const base = { fields: [{ group: '尺寸', key: 'width', label: '宽度', kind: 'length' }], rows: { width: { displayValue: '100', unit: 'px', sourceKind: 'class', sourceLabel: '.card', sourceTitle: '.card' } }, canEditText: false, getText: () => '' };
  api.render(container, { ...base, isDirty: () => false }, { tag: 'div', id: '', classes: '' }); assert.match(container.innerHTML, /data-act="save" disabled/); api.render(container, { ...base, isDirty: () => true }, { tag: 'div', id: '', classes: '' }); assert.doesNotMatch(container.innerHTML, /data-act="save" disabled/);
});
