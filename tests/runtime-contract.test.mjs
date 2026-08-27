/**
 * 状态管理改造的零依赖契约测试。
 *
 * 这些测试同时守护运行时分发、示例迁移和稳定锚点，避免后续修改重新引入
 * 以 DOM 属性保存业务状态的旧协议。
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { collectScenarios } from '../skill/runtime/shoot.mjs';
import { validateSnapshot } from '../skill/runtime/serve.mjs';

const runtimeViewerUrl = new URL('../skill/runtime/viewer.js', import.meta.url);
const exampleViewerUrl = new URL('../examples/minimal-notes/prototype-assets/viewer.js', import.meta.url);
const prototypeUrl = new URL('../examples/minimal-notes/prototype.html', import.meta.url);
const snapshotUrl = new URL('../examples/minimal-notes/prototype-assets/notes.snapshot.js', import.meta.url);

/** 从静态 snapshot 赋值文件安全提取 JSON，不执行其中的 JavaScript。 */
async function readSnapshot() {
  const source = await readFile(snapshotUrl, 'utf8');
  const match = source.match(/^\s*(?:(?:\/\*[\s\S]*?\*\/|\/\/[^\r\n]*(?:\r?\n|$))\s*)*window\.__PROTOTYPE_NOTES__\s*=\s*([\s\S]*?)\s*;\s*$/);
  assert.ok(match, '示例 snapshot 应保持单一 JSON 赋值格式');
  return JSON.parse(match[1]);
}

/** 提取 HTML 中全部 id，供唯一性和锚点存在性检查使用。 */
function collectHtmlIds(html) {
  return [...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map((match) => match[1]);
}

/** 将 v2 卡片 target.anchor 归一化为不带 # 的 DOM id。 */
function normalizeAnchor(anchor) {
  return String(anchor || '').replace(/^#/, '');
}

/** 构造最小 v2 snapshot，便于校验 schema 边界。 */
function createV2Snapshot(overrides = {}) {
  return {
    schemaVersion: 2,
    activeScenario: 'base',
    state: { activeGroup: 'base', product: { page: 'list', layers: [] } },
    header: { title: '功能说明' },
    scenarios: { base: { state: { product: { page: 'list' } } } },
    cards: [{ id: 'query', target: { anchor: 'queryButton' }, when: { 'product.page': 'list' } }],
    ...overrides
  };
}

/** 在最小浏览器桩中加载 Viewer，使状态内核可脱离真实 DOM 测试。 */
async function createViewerHarness(search = '') {
  const source = await readFile(runtimeViewerUrl, 'utf8');
  const listeners = new Map();
  const historyCalls = [];
  const document = {
    readyState: 'loading',
    getElementById: () => null,
    createElement: () => ({}),
    head: { appendChild: () => {} },
    addEventListener: (name, listener) => listeners.set(name, listener)
  };
  const window = {
    location: { search, href: `https://prototype.test/index.html${search}` },
    history: {
      pushState: (_state, _title, url) => historyCalls.push(['push', url]),
      replaceState: (_state, _title, url) => historyCalls.push(['replace', url])
    },
    URL,
    setTimeout,
    clearTimeout
  };
  vm.runInNewContext(source, {
    window,
    document,
    URL,
    URLSearchParams,
    console,
    setTimeout,
    clearTimeout
  }, { filename: 'viewer.js' });
  return { api: window.PrototypeViewers, historyCalls, listeners, window };
}

/** 把跨 VM realm 的状态转成当前 realm 的普通 JSON 值。 */
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

/** 确保截图工具优先枚举 v2 显式场景，并使用 scene 查询参数。 */
test('scenarios v2 按声明顺序枚举', () => {
  const shots = collectScenarios(createV2Snapshot({
    scenarios: {
      base: { state: { product: { page: 'list' } } },
      create: { state: { product: { layers: ['create'] } } }
    }
  }));
  assert.deepEqual(shots, [
    { id: 'base', query: 'scene' },
    { id: 'create', query: 'scene' }
  ]);
});

/** 确保旧 snapshot 仍能从卡片 group 去重生成 state 截图清单。 */
test('schema v1 缺少 scenarios 时回退 cards.group', () => {
  const shots = collectScenarios({
    schemaVersion: 1,
    activeGroup: 'base',
    cards: [
      { group: 'common' },
      { group: 'base' },
      { group: 'edit' },
      { group: 'edit' }
    ]
  });
  assert.deepEqual(shots, [
    { id: 'base', query: 'state' },
    { id: 'edit', query: 'state' }
  ]);
});

/** 确保作者服务同时接受合法 v1/v2，并拒绝缺失稳定锚点的 v2 数据。 */
test('snapshot schema 验证覆盖 v1、v2 与非法锚点', () => {
  assert.equal(validateSnapshot(createV2Snapshot()), true);
  assert.equal(validateSnapshot(createV2Snapshot({ cards: [{ id: 'broken', target: {} }] })), false);
  assert.equal(validateSnapshot({
    schemaVersion: 1,
    header: { title: '旧数据' },
    cards: [{ id: 'legacy', target: { selector: '#legacy' } }]
  }), true);
});

/** 确保状态提交按固定顺序执行、对象深合并、数组整体替换且返回防篡改副本。 */
test('统一状态内核深合并并按 normalize/apply/render 顺序提交', async () => {
  const { api } = await createViewerHarness();
  const calls = [];
  api.registerState('product', {
    normalize: (value) => {
      calls.push('normalize');
      return { page: 'list', layers: [], ...value };
    },
    apply: () => calls.push('apply')
  });
  api.registerViewer('notes', { render: () => calls.push('render') });
  api.setState({ product: { filters: { keyword: 'a' }, layers: ['create'] } });
  assert.deepEqual(calls, ['normalize', 'apply', 'render']);

  api.patchState({ product: { filters: { code: 'A01' }, layers: ['edit'] } });
  const state = plain(api.getState());
  assert.deepEqual(state.product, {
    page: 'list',
    filters: { keyword: 'a', code: 'A01' },
    layers: ['edit']
  });
  state.product.layers.push('tampered');
  assert.deepEqual(plain(api.getState()).product.layers, ['edit']);
});

/** 确保场景继承可组合多维状态，并把新 scene 写回兼容 URL。 */
test('场景继承合并多维状态并同步 scene URL', async () => {
  const { api, historyCalls } = await createViewerHarness('?state=legacy');
  api.setState({ product: { page: 'list', layers: [], tabs: { modal: 'basic' } } }, { baseline: true });
  api.registerScenario('base', { state: { activeGroup: 'base', product: { page: 'list' } } });
  api.registerScenario('edit-rules', {
    extends: 'base',
    state: { activeGroup: 'edit', product: { layers: ['edit'], tabs: { modal: 'rules' } } }
  });
  assert.equal(api.activateScenario('edit-rules', { history: 'replace' }), true);
  assert.equal(api.getActiveScenario(), 'edit-rules');
  assert.deepEqual(plain(api.getState()), {
    activeGroup: 'edit',
    product: { page: 'list', layers: ['edit'], tabs: { modal: 'rules' } }
  });
  assert.equal(historyCalls.length, 1);
  assert.match(historyCalls[0][1], /[?&]scene=edit-rules(?:&|$)/);
  assert.doesNotMatch(historyCalls[0][1], /[?&]state=/);
});

/** 静态守护初始化分支：scene 必须优先于旧 state，旧 state 仍保留兼容入口。 */
test('Viewer 深链恢复优先 scene 并兼容 state', async () => {
  const source = await readFile(runtimeViewerUrl, 'utf8');
  const start = source.indexOf('function activateInitialState');
  const end = source.indexOf('\n  }', start);
  assert.ok(start >= 0 && end > start, '应存在深链恢复函数');
  const body = source.slice(start, end);
  const sceneRead = body.indexOf("readUrlParam('scene')");
  const stateRead = body.indexOf("readUrlParam('state')");
  const sceneBranch = body.indexOf('if (scene)');
  const stateBranch = body.indexOf('if (legacyState)');
  assert.ok(sceneRead >= 0 && stateRead >= 0, '应同时读取 scene 与旧 state');
  assert.ok(sceneBranch >= 0 && stateBranch > sceneBranch, 'scene 分支必须先于旧 state 分支');
});

/** 确保复制到示例的 Viewer 不会与正式运行时发生版本漂移。 */
test('运行时 viewer 与示例分发副本完全一致', async () => {
  const [runtimeViewer, exampleViewer] = await Promise.all([
    readFile(runtimeViewerUrl, 'utf8'),
    readFile(exampleViewerUrl, 'utf8')
  ]);
  assert.equal(exampleViewer, runtimeViewer);
});

/** 确保示例不再把业务状态或动作类型编码到多套 data-ui 属性中。 */
test('示例不再使用废弃的状态型 data-ui 属性', async () => {
  const html = await readFile(prototypeUrl, 'utf8');
  const deprecatedAttribute = /\bdata-ui-(?:open|layer|confirm|edit|delete|select(?:-value)?)\b/gi;
  assert.deepEqual([...html.matchAll(deprecatedAttribute)].map((match) => match[0]), []);
});

/** 确保每张说明卡片只依赖一个稳定且唯一的 DOM id。 */
test('示例 DOM id 唯一且 v2 卡片锚点均唯一命中', async () => {
  const [html, snapshot] = await Promise.all([readFile(prototypeUrl, 'utf8'), readSnapshot()]);
  assert.equal(snapshot.schemaVersion, 2);
  assert.ok(snapshot.state && snapshot.activeScenario, 'v2 示例应声明顶层 state 与 activeScenario');
  assert.equal(validateSnapshot(snapshot), true, '示例 snapshot 应通过服务端 schema 校验');
  const ids = collectHtmlIds(html);
  assert.equal(new Set(ids).size, ids.length, 'HTML id 不得重复');

  for (const card of snapshot.cards || []) {
    const anchor = normalizeAnchor(card?.target?.anchor);
    assert.ok(anchor, `卡片 ${card?.id || '<unknown>'} 应声明 target.anchor`);
    assert.equal(ids.filter((id) => id === anchor).length, 1, `锚点 ${anchor} 应唯一命中 DOM`);
  }
});
