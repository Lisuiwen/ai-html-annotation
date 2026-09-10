import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const sourceUrl = new URL('../../../examples/minimal-notes-system/prototype/prototype.js', import.meta.url);
const handoffTemplateUrl = new URL('../../../skills/html-prototype-build/templates/AGENTS.md', import.meta.url);
const handoffexampleUrl = new URL('../../../examples/minimal-notes-system/AGENTS.md', import.meta.url);

function classList() {
  const values = new Set();
  return {
    add: (...names) => names.forEach((name) => values.add(name)),
    remove: (...names) => names.forEach((name) => values.delete(name)),
    contains: (name) => values.has(name),
    toggle(name, on) {
      if (on === undefined) {
        if (values.has(name)) values.delete(name);
        else values.add(name);
        return values.has(name);
      }
      if (on) values.add(name);
      else values.delete(name);
      return !!on;
    }
  };
}

function node(text = '') {
  const attrs = new Map();
  const listeners = new Map();
  return {
    classList: classList(),
    dataset: {},
    textContent: text,
    value: '',
    hidden: false,
    children: [],
    setAttribute: (name, value) => attrs.set(name, String(value)),
    getAttribute: (name) => attrs.get(name) || null,
    addEventListener: (name, fn) => listeners.set(name, fn),
    dispatch(name, event = {}) { listeners.get(name)?.(event); },
    contains(target) { return target === this || this.children.includes(target); },
    querySelector() { return this.focusTarget || null; },
    replaceChildren(...children) { this.children = children; },
    remove() {},
    closest() { return null; }
  };
}

async function boot() {
  const source = await readFile(sourceUrl, 'utf8');
  const ids = Object.fromEntries([
    'createModal', 'editModal', 'strategyModal',
    'strategyNameSelect', 'strategyNameValue',
    'strategyConditionSelect', 'strategyConditionValue',
    'toastRegion', 'createButton', 'resetButton', 'queryButton',
    'filterName', 'filterCode'
  ].map((id) => [id, node()]));

  const focusLog = [];
  for (const layer of ['create', 'edit', 'strategy']) {
    const focusTarget = node();
    focusTarget.focus = () => focusLog.push(layer);
    ids[`${layer}Modal`].focusTarget = focusTarget;
  }

  const triggers = {
    strategyName: node(),
    strategyCondition: node()
  };
  const options = {
    strategyName: [node('Name A'), node('Name B')],
    strategyCondition: [node('items A'), node('items B')]
  };
  const documentListeners = new Map();
  const document = {
    getElementById: (id) => ids[id] || null,
    querySelector(selector) {
      if (selector.startsWith('#strategyNameSelect')) return triggers.strategyName;
      if (selector.startsWith('#strategyConditionSelect')) return triggers.strategyCondition;
      return null;
    },
    querySelectorAll(selector) {
      if (selector.startsWith('#strategyNameOptions')) return options.strategyName;
      if (selector.startsWith('#strategyConditionOptions')) return options.strategyCondition;
      return [];
    },
    createElement: () => node(),
    addEventListener: (name, fn) => documentListeners.set(name, fn)
  };

  let adapter = null;
  let currentState = { product: { page: 'list', layers: [], selects: {} } };
  const activated = [];
  const patches = [];
  const viewers = {
    registerState(name, definition) {
      assert.equal(name, 'product');
      adapter = definition;
    },
    getState: () => currentState,
    patchState(patch) {
      patches.push(patch);
      currentState = { ...currentState, ...patch };
    },
    activateScenario: (id) => activated.push(id)
  };
  const window = {
    PrototypeViewers: viewers,
    requestAnimationFrame: (fn) => fn(),
    setTimeout: () => 1,
    confirm: () => true
  };
  window.window = window;

  vm.runInNewContext(source, { window, document, console, Object, Array, Boolean }, { filename: 'prototype.js' });
  return { adapter, ids, activated, patches, focusLog };
}

test('example handoff doc matches Skill template', async () => {
  const [template, example] = await Promise.all([
    readFile(handoffTemplateUrl, 'utf8'),
    readFile(handoffexampleUrl, 'utf8')
  ]);
  assert.equal(example, template);
});

test('example Adapter 规范化 page、layers 与 select 局部state', async () => {
  const { adapter } = await boot();
  const normalized = adapter.normalize({
    page: 'unknown',
    layers: ['create', 'bad', 'edit'],
    selects: { strategyName: { open: 1, value: 42 } }
  });
  assert.equal(normalized.page, 'list');
  assert.deepEqual(Array.from(normalized.layers), ['create', 'edit']);
  assert.equal(normalized.selects.strategyName.open, true);
  assert.equal(normalized.selects.strategyName.value, '');
  assert.equal(normalized.selects.strategyCondition.open, false);
});

test('example浮层栈顺序变化会重新聚焦新 顶层浮层', async () => {
  const { adapter, focusLog } = await boot();
  adapter.apply({ page: 'list', layers: ['create', 'edit'], selects: {} });
  adapter.apply({ page: 'list', layers: ['edit', 'create'], selects: {} });
  assert.deepEqual(focusLog, ['edit', 'create']);
});

test('example main business entry driven by explicit scenario', async () => {
  const { ids, activated } = await boot();
  ids.createButton.dispatch('click');
  assert.deepEqual(activated, ['create']);
});
