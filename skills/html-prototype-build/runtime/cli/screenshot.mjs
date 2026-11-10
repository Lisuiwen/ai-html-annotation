#!/usr/bin/env node
/* Headless capture: one screenshot per explicit scenario.
   Viewer enters product-only mode at collapsed=1&product-only=1, hiding Mark, collapse control, and interaction badges.
   Default capture measures layout via CDP and resizes the viewport to fit the product preview region. */
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { mkdtempSync, rmSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const input = args.find((arg) => !arg.startsWith('--'));
const hasFlag = (name) => args.includes('--' + name);
const flag = (name, fallback) => {
  const hit = args.find((arg) => arg.startsWith('--' + name + '='));
  return hit ? hit.split('=').slice(1).join('=') : fallback;
};

const isDirectExecution = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
const htmlPath = input ? resolve(input) : '';

/* Ship screenshots separately from page runtime assets: screenshots live under screenshots/. */
const outDir = resolve(flag('out', htmlPath ? join(dirname(htmlPath), 'screenshots') : 'screenshots'));
const minWidth = Number(flag('width', '1440')) || 1440;
const minHeight = Number(flag('height', '900')) || 900;
const maxWidth = Number(flag('max-width', '4096')) || 4096;
const maxHeight = Number(flag('max-height', '12000')) || 12000;
const autoSize = !hasFlag('no-auto-size');
const onlyScenes = flag('only', '');

/* Resolve the single annotation data source: default <prototype-dir>/prototype/notes.snapshot.js, overridable via --snapshot=. */
const snapshotPath = resolve(flag('snapshot', htmlPath ? join(dirname(htmlPath), 'prototype', 'notes.snapshot.js') : 'prototype/notes.snapshot.js'));

/* Evaluated in the page after load; relies on product-only capture layout rules in display-mode.js. */
/* Build a page-side readiness promise: product-only, collapsed rail, hidden notes, scene applied. */
export function buildCaptureReadyExpression(sceneId) {
  const sceneLit = sceneId ? JSON.stringify(sceneId) : 'null';
  return `(() => new Promise((resolve) => {
    const wantScene = ${sceneLit};
    const deadline = Date.now() + 12000;
    function heal() {
      if (window.PrototypeAuthorChrome && window.PrototypeAuthorChrome.enable) window.PrototypeAuthorChrome.enable();
      var page = document.querySelector('.pn-page');
      if (page) page.classList.add('pn-collapsed');
    }
    function ready() {
      heal();
      var body = document.body;
      var page = document.querySelector('.pn-page');
      var notes = document.querySelector('.pn-notes');
      var preview = document.querySelector('.pn-preview');
      if (!body || !body.classList.contains('pa-product-only')) return false;
      if (!page || !page.classList.contains('pn-collapsed')) return false;
      if (!preview) return false;
      if (notes && window.getComputedStyle(notes).display !== 'none') return false;
      if (wantScene && window.PrototypeViewers && window.PrototypeViewers.getActiveScenario() !== wantScene) return false;
      return true;
    }
    (function tick() {
      if (ready()) return resolve(true);
      if (Date.now() > deadline) return resolve(ready());
      requestAnimationFrame(tick);
    })();
  }))()`;
}

export const CAPTURE_CLIP_EXPRESSION = `(() => {
  const el = document.querySelector('.pn-preview');
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: Math.max(0, r.x), y: Math.max(0, r.y), width: Math.ceil(r.width), height: Math.ceil(r.height), scale: 1 };
})()`;

export const CAPTURE_SIZE_EXPRESSION = `(() => {
  const pad = 16;
  const preview = document.querySelector('.pn-preview');
  const box = (preview && (preview.querySelector('.ui-shell') || preview.firstElementChild)) || preview || document.body;
  if (!box) return { width: 1440, height: 900 };
  const base = box.getBoundingClientRect();
  let maxBottom = base.height;
  let maxRight = base.width;
  const skip = (el) => !!(el.closest && el.closest('.pn-notes,.pn-connections,.at-ui,.mm-ui,.mm-pin,.mm-note-pop,.pn-panel-actions'));
  box.querySelectorAll('*').forEach((el) => {
    if (skip(el)) return;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return;
    const rects = el.getClientRects();
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      maxBottom = Math.max(maxBottom, r.bottom - base.top);
      maxRight = Math.max(maxRight, r.right - base.left);
    }
  });
  return {
    width: Math.ceil(Math.max(maxRight, base.width)) + pad,
    height: Math.ceil(Math.max(maxBottom, base.height)) + pad
  };
})()`;

/* Strictly read the static snapshot from the author server; refuse to execute any JavaScript inside. */
export function readNotes() {
  const code = readFileSync(snapshotPath, 'utf8');
  const match = code.match(/^\s*(?:(?:\/\*[\s\S]*?\*\/|\/\/[^\r\n]*(?:\r?\n|$))\s*)*window\.__PROTOTYPE_NOTES__\s*=\s*([\s\S]*?)\s*;\s*$/);
  if (!match) {
    throw new Error('Annotation data must be a single window.__PROTOTYPE_NOTES__ = <JSON>; assignment with no executable code.');
  }
  try {
    return JSON.parse(match[1]);
  } catch {
    throw new Error('__PROTOTYPE_NOTES__ in annotation data must be valid JSON.');
  }
}

/* Validate scenario id is safe as a cross-platform filename to avoid traversal, device names, and implicit overwrite. */
function assertSafeFileName(id) {
  if (typeof id !== 'string' || !id || id.length > 120) {
    throw new Error('Scenario ID must be a string of 1–120 characters.');
  }
  if (id === '.' || id === '..' || /[<>:"/\\|?*\u0000-\u001f]/.test(id) || /[. ]$/.test(id)) {
    throw new Error(`Scenario ID is not safe as a screenshot filename: ${id}`);
  }
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i.test(id)) {
    throw new Error(`Scenario ID matches a Windows reserved device name: ${id}`);
  }
  return id;
}

/* Extract capture scenarios from snapshot data; only explicitly declared scenarios are accepted. */
export function collectScenarios(notes) {
  if (!notes || !Array.isArray(notes.cards)) {
    throw new Error('Annotation data violates contract: missing cards array.');
  }
  if (!notes.scenarios || typeof notes.scenarios !== 'object') {
    throw new Error('snapshot must declare scenarios explicitly.');
  }
  const ids = Array.isArray(notes.scenarios)
    ? notes.scenarios.map((scenario) => scenario && (scenario.id || scenario.name))
    : Object.keys(notes.scenarios);
  if (ids.length === 0 || ids.some((id) => typeof id !== 'string' || !id)) {
    throw new Error('scenarios must include entries with valid IDs.');
  }
  return ids.map((id) => ({ id: assertSafeFileName(id), query: 'scene' }));
}

export function clampCaptureDimensions(measured, options = {}) {
  const floors = {
    minWidth: options.minWidth ?? 1440,
    minHeight: options.minHeight ?? 900,
    maxWidth: options.maxWidth ?? 4096,
    maxHeight: options.maxHeight ?? 12000
  };
  const rawW = Number(measured && measured.width) || floors.minWidth;
  const rawH = Number(measured && measured.height) || floors.minHeight;
  return {
    width: Math.min(floors.maxWidth, Math.max(floors.minWidth, Math.ceil(rawW))),
    height: Math.min(floors.maxHeight, Math.max(floors.minHeight, Math.ceil(rawH)))
  };
}

export function filterScenarios(shots, onlyCsv) {
  if (!onlyCsv) return shots;
  const allow = new Set(onlyCsv.split(',').map((id) => id.trim()).filter(Boolean));
  if (allow.size === 0) return shots;
  return shots.filter((shot) => allow.has(shot.id));
}

class CdpClient {
  constructor(ws) {
    this.ws = ws;
    this.seq = 0;
    this.pending = new Map();
    this.events = new Map();
    ws.addEventListener('message', (ev) => {
      let msg;
      try {
        msg = JSON.parse(String(ev.data));
      } catch {
        return;
      }
      if (msg.id != null && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message || 'CDP error'));
        else resolve(msg.result);
      } else if (msg.method) {
        const handlers = this.events.get(msg.method);
        if (handlers) handlers.forEach((fn) => fn(msg.params));
      }
    });
  }

  on(method, fn) {
    if (!this.events.has(method)) this.events.set(method, new Set());
    this.events.get(method).add(fn);
  }

  send(method, params = {}) {
    const id = ++this.seq;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  static async connect(wsUrl) {
    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true });
      ws.addEventListener('error', reject, { once: true });
    });
    return new CdpClient(ws);
  }

  close() {
    try {
      this.ws.close();
    } catch {}
  }
}

async function waitForDebugger(port, timeout = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 80));
  }
  throw new Error(`Debugger did not start on port ${port}`);
}

async function waitForLoad(client, timeout = 15000) {
  await client.send('Page.enable');
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeout);
    client.on('Page.loadEventFired', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

async function paintSettle(client) {
  await client.send('Runtime.evaluate', {
    expression: 'new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))',
    awaitPromise: true
  });
}

async function waitForCaptureReady(client, sceneId) {
  const { result } = await client.send('Runtime.evaluate', {
    expression: buildCaptureReadyExpression(sceneId),
    awaitPromise: true,
    returnByValue: true
  });
  return !!(result && result.value);
}

async function measureCaptureSize(client) {
  const { result } = await client.send('Runtime.evaluate', {
    expression: CAPTURE_SIZE_EXPRESSION,
    returnByValue: true
  });
  return result && result.value;
}

async function readPreviewClip(client) {
  const { result } = await client.send('Runtime.evaluate', {
    expression: CAPTURE_CLIP_EXPRESSION,
    returnByValue: true
  });
  const clip = result && result.value;
  if (!clip || !clip.width || !clip.height) return null;
  return clip;
}

function buildCaptureUrl(shot) {
  return pathToFileURL(htmlPath).href + '?' + shot.query + '=' + encodeURIComponent(shot.id) + '&collapsed=1&product-only=1';
}

async function openCaptureTarget(port, url) {
  const endpoint = `http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`;
  let res = await fetch(endpoint, { method: 'PUT' });
  if (res.status === 405) res = await fetch(endpoint);
  if (!res.ok) throw new Error(`Failed to open capture target (${res.status}): ${url}`);
  return res.json();
}

async function closeCaptureTarget(port, targetId) {
  try {
    await fetch(`http://127.0.0.1:${port}/json/close/${targetId}`);
  } catch {}
}

/* CDP capture: measure layout, resize viewport, screenshot full composed product area. */
async function shootWithCdp(shot, port) {
  const url = buildCaptureUrl(shot);
  const outFile = resolve(outDir, shot.id + '.png');
  if (relative(outDir, outFile).startsWith('..')) {
    console.error(`✗ Unsafe screenshot output path: ${outFile}`);
    return false;
  }
  let target;
  let client;
  try {
    target = await openCaptureTarget(port, url);
    client = await CdpClient.connect(target.webSocketDebuggerUrl);
    await waitForLoad(client);
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: minWidth,
      height: minHeight,
      deviceScaleFactor: 1,
      mobile: false
    });
    await waitForCaptureReady(client, shot.id);
    await paintSettle(client);
    const measured = await measureCaptureSize(client);
    const dims = clampCaptureDimensions(measured, { minWidth, minHeight, maxWidth, maxHeight });
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: dims.width,
      height: dims.height,
      deviceScaleFactor: 1,
      mobile: false
    });
    await waitForCaptureReady(client, shot.id);
    await paintSettle(client);
    await client.send('Runtime.evaluate', {
      expression: 'document.querySelector(".pn-preview")?.scrollTo(0,0);window.scrollTo(0,0);',
      awaitPromise: false
    });
    const clip = await readPreviewClip(client);
    const captureParams = {
      format: 'png',
      captureBeyondViewport: true,
      fromSurface: true
    };
    if (clip) captureParams.clip = clip;
    const capture = await client.send('Page.captureScreenshot', captureParams);
    writeFileSync(outFile, Buffer.from(capture.data, 'base64'));
    console.log(`✓ [${shot.id}] ${outFile} (${dims.width}×${dims.height})`);
    return true;
  } catch (error) {
    console.error(`✗ [${shot.id}] Screenshot failed: ${error.message}`);
    return false;
  } finally {
    if (client) client.close();
    if (target && target.id) await closeCaptureTarget(port, target.id);
  }
}

/* Legacy capture: fixed window size via --screenshot (no layout measurement). */
function shootLegacy(shot, exe) {
  return new Promise((resolveShot) => {
    const url = buildCaptureUrl(shot);
    const outFile = resolve(outDir, shot.id + '.png');
    if (relative(outDir, outFile).startsWith('..')) {
      console.error(`✗ Unsafe screenshot output path: ${outFile}`);
      resolveShot(false);
      return;
    }
    const child = spawn(exe, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--window-size=' + minWidth + ',' + minHeight,
      '--virtual-time-budget=2000',
      '--screenshot=' + outFile,
      url
    ], { stdio: 'ignore' });
    child.on('error', () => {
      console.error(`✗ Failed to launch browser: ${exe}`);
      process.exitCode = 1;
      resolveShot(false);
    });
    child.on('close', (code) => {
      if (code === 0) waitForFile(outFile, 4000).then((exists) => {
        if (exists) {
          console.log(`✓ [${shot.id}] ${outFile}`);
          resolveShot(true);
        } else {
          console.error(`✗ [${shot.id}] Screenshot file not created (exit ${code}): ${url}`);
          resolveShot(false);
        }
      });
      else {
        console.error(`✗ [${shot.id}] Screenshot failed (exit ${code}): ${url}`);
        resolveShot(false);
      }
    });
  });
}

/* Poll until screenshot file exists, up to timeout ms. */
function waitForFile(path, timeout) {
  return new Promise((resolveWait) => {
    const start = Date.now();
    (function check() {
      if (existsSync(path)) return resolveWait(true);
      if (Date.now() - start >= timeout) return resolveWait(false);
      setTimeout(check, 150);
    })();
  });
}

/* Probe common install paths for an available browser; prefer msedge. */
function resolveBrowser() {
  const explicit = flag('browser', '');
  if (explicit) return existsSync(explicit) ? explicit : null;
  const candidates = [
    'msedge',
    'chrome',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const path of candidates) {
    if (!path.includes('\\')) {
      if (commandExists(path)) return path;
    } else if (existsSync(path)) {
      return path;
    }
  }
  return null;
}

/* Check whether a command is available on PATH. */
function commandExists(cmd) {
  const probe = spawnSync(cmd, ['--version'], { stdio: 'ignore', shell: true });
  return probe.error === undefined && probe.status === 0;
}

function startDebuggerBrowser(exe, port, userDataDir) {
  return spawn(exe, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ], { stdio: 'ignore' });
}

function pickDebugPort() {
  return 19222 + Math.floor(Math.random() * 3000);
}

/* Capture serially so multiple headless instances do not race the same output file. */
async function main() {
  if (!input) {
    console.error(
      'Usage: node runtime/cli/screenshot.mjs <prototype.html> [--out=dir] [--browser=exe] [--width=1440] [--height=900] [--max-width=4096] [--max-height=12000] [--only=id1,id2] [--no-auto-size] [--snapshot=annotation-path]'
    );
    process.exit(1);
  }
  if (!existsSync(htmlPath) || !statSync(htmlPath).isFile()) {
    console.error(`Prototype HTML not found: ${htmlPath}`);
    process.exit(1);
  }
  if (!existsSync(snapshotPath)) {
    console.error(`✗ Annotation data not found: ${snapshotPath}`);
    process.exit(1);
  }
  mkdirSync(outDir, { recursive: true });
  let shots;
  try {
    shots = filterScenarios(collectScenarios(readNotes()), onlyScenes);
  } catch (error) {
    console.error('✗ ' + error.message);
    process.exit(1);
  }
  if (shots.length === 0) {
    console.error('✗ No scenarios found in annotation data.');
    process.exit(1);
  }
  const exe = resolveBrowser();
  if (!exe) {
    console.error('✗ Edge/Chrome not found; use --browser= to specify an executable path.');
    process.exit(1);
  }
  console.log(
    `Found ${shots.length} scenario(s): ${shots.map((shot) => shot.id).join(', ')}` +
    (autoSize ? ' (auto-size)' : ' (fixed viewport)')
  );
  let ok = 0;
  if (autoSize) {
    const port = pickDebugPort();
    const userDataDir = mkdtempSync(join(tmpdir(), 'html-prototype-shot-'));
    const browser = startDebuggerBrowser(exe, port, userDataDir);
    const cleanup = () => {
      try {
        browser.kill();
      } catch {}
      try {
        rmSync(userDataDir, { recursive: true, force: true });
      } catch {}
    };
    browser.on('error', () => {
      console.error(`✗ Failed to launch browser: ${exe}`);
      process.exitCode = 1;
    });
    try {
      await waitForDebugger(port);
      for (const shot of shots) {
        if (await shootWithCdp(shot, port)) ok++;
      }
    } catch (error) {
      console.error('✗ ' + error.message);
      process.exitCode = 1;
    } finally {
      cleanup();
    }
  } else {
    for (const shot of shots) {
      if (await shootLegacy(shot, exe)) ok++;
    }
  }
  console.log(`Done: ${ok}/${shots.length}, output dir ${outDir}`);
  process.exit(ok === shots.length ? 0 : 1);
}

if (isDirectExecution) main();
