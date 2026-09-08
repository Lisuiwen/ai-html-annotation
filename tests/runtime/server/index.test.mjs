import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer as createNetServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const serverUrl = new URL('../../../skills/html-prototype-build/runtime/server/index.mjs', import.meta.url);

async function freePort() {
  return new Promise((resolve, reject) => {
    const probe = createNetServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address();
      probe.close((error) => error ? reject(error) : resolve(address.port));
    });
  });
}

async function waitForServer(child) {
  return new Promise((resolve, reject) => {
    let stderr = '';
    const timer = setTimeout(() => reject(new Error(`作者服务启动超时：${stderr}`)), 5000);
    child.stderr.on('data', (chunk) => { stderr += String(chunk); });
    child.stdout.on('data', (chunk) => {
      if (!String(chunk).includes('作者服务：http://127.0.0.1:')) return;
      clearTimeout(timer);
      resolve();
    });
    child.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`作者服务提前退出 ${code}：${stderr}`));
    });
  });
}

test('Server 入口只装配 HTTP 路由，Snapshot 与 Inspector 逻辑由独立模块提供', async () => {
  const source = await readFile(serverUrl, 'utf8');
  assert.match(source, /from '\.\/snapshot\.mjs'/);
  assert.match(source, /from '\.\/inspector\.mjs'/);
  assert.match(source, /writeSnapshot\(snapshotPath, data\)/);
  assert.match(source, /resolveInspectorTarget\(\{/);
  assert.doesNotMatch(source, /function validateSnapshot/);
  assert.doesNotMatch(source, /function injectTargets/);
  assert.doesNotMatch(source, /node:child_process/);
  assert.match(source, /loadEnvFile\(join\(skillRoot, '\.env'\)\)/);
});

test('Server HTTP 集成守住资源边界并可写回 HTML / snapshot', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'ai-html-author-'));
  const htmlPath = join(directory, 'prototype.html');
  const snapshotPath = join(directory, 'notes.snapshot.js');
  await writeFile(htmlPath, '<!doctype html><body><div id="box">before</div></body>', 'utf8');
  await writeFile(snapshotPath, 'window.__PROTOTYPE_NOTES__ = {};\n', 'utf8');

  const port = await freePort();
  const child = spawn(process.execPath, [
    fileURLToPath(serverUrl),
    htmlPath,
    `--port=${port}`,
    '--snapshot=notes.snapshot.js'
  ], { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, CODE_EDITOR: '' } });

  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill();
      await once(child, 'exit').catch(() => {});
    }
    await rm(directory, { recursive: true, force: true });
  });

  await waitForServer(child);
  const origin = `http://127.0.0.1:${port}`;

  const page = await fetch(`${origin}/prototype.html`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /data-prototype-author-loader/);

  const authorAsset = await fetch(`${origin}/__prototype-author/author/bootstrap.js`);
  assert.equal(authorAsset.status, 200);
  const authorStyle = await fetch(`${origin}/__prototype-author/author/tools/mark/index.css`);
  assert.equal(authorStyle.status, 200);
  assert.match(authorStyle.headers.get('content-type') || '', /^text\/css/);
  const forbiddenAsset = await fetch(`${origin}/__prototype-author/server/index.mjs`);
  assert.equal(forbiddenAsset.status, 403);

  const rejectedEdit = await fetch(`${origin}/__prototype-author/edit`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://attacker.test' },
    body: JSON.stringify({ selector: '#box', changes: { text: 'bad' } })
  });
  assert.equal(rejectedEdit.status, 403);

  const edit = await fetch(`${origin}/__prototype-author/edit`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin },
    body: JSON.stringify({ selector: '#box', changes: { text: 'changed' } })
  });
  assert.equal(edit.status, 204);
  assert.match(await readFile(htmlPath, 'utf8'), /<div id="box">changed<\/div>/);

  const snapshot = {
    schemaVersion: 2,
    state: { product: { page: 'list', layers: [] } },
    activeScenario: 'base',
    scenarios: { base: { state: {} } },
    header: { title: 'Demo' },
    cards: [{ id: 'card-1', title: 'Card', body: 'Body', target: { anchor: 'box' } }]
  };
  const notes = await fetch(`${origin}/__prototype-author/notes`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', origin },
    body: JSON.stringify(snapshot)
  });
  assert.equal(notes.status, 204);
  const writtenSnapshot = await readFile(snapshotPath, 'utf8');
  assert.match(writtenSnapshot, /window\.__PROTOTYPE_NOTES__/);
  assert.match(writtenSnapshot, /"card-1"/);
});
