#!/usr/bin/env node
/* 无头截图：按标注组分别截图；URL 带 state=<组>&collapsed=1。
   Viewer 在 collapsed=1 时进入纯页面态，自动隐藏 Mark、右下角折叠钮与交互闪电。 */
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const input = args.find((arg) => !arg.startsWith('--'));
const flag = (name, fallback) => {
  const hit = args.find((arg) => arg.startsWith('--' + name + '='));
  return hit ? hit.split('=').slice(1).join('=') : fallback;
};

if (!input) {
  console.error('用法：node shoot.mjs <prototype.html> [--out=目录] [--browser=exe路径] [--width=1440] [--height=900] [--snapshot=标注数据路径]');
  process.exit(1);
}

const htmlPath = resolve(input);
if (!existsSync(htmlPath) || !statSync(htmlPath).isFile()) {
  console.error(`找不到原型 HTML：${htmlPath}`);
  process.exit(1);
}

const outDir = resolve(flag('out', join(dirname(htmlPath), 'screenshots')));
const width = flag('width', '1440');
const height = flag('height', '900');
mkdirSync(outDir, { recursive: true });

/* 解析唯一标注数据源：默认 <原型目录>/prototype.notes.snapshot.js，可 --snapshot= 覆盖。 */
const snapshotPath = resolve(flag('snapshot', join(dirname(htmlPath), 'prototype.notes.snapshot.js')));
if (!existsSync(snapshotPath)) {
  console.error(`✗ 找不到标注数据：${snapshotPath}`);
  process.exit(1);
}

/* 从 snapshot 提取所有非 common 分组作为组清单，保持出现顺序并去重。 */
function collectGroups() {
  const code = readFileSync(snapshotPath, 'utf8');
  const notes = new Function('window', `${code}\n;return window.__PROTOTYPE_NOTES__;`)({});
  if (!notes || !Array.isArray(notes.cards)) {
    console.error('✗ 标注数据不符合契约：缺少 cards 数组。');
    process.exit(1);
  }
  const groups = [];
  for (const card of notes.cards) {
    const group = card && card.group;
    if (group && group !== 'common' && !groups.includes(group)) groups.push(group);
  }
  if (groups.length === 0) {
    const fallback = notes.activeGroup || 'base';
    groups.push(fallback);
  }
  return groups;
}

/* 逐组执行无头浏览器截图，URL 带 state=<组>&collapsed=1 折叠右栏与连线。 */
function shoot(group, exe) {
  return new Promise((resolveShot) => {
    const url = pathToFileURL(htmlPath).href + '?state=' + encodeURIComponent(group) + '&collapsed=1';
    const outFile = join(outDir, group + '.png');
    /* --no-sandbox / --disable-dev-shm-usage：Linux 容器与 CI 无头环境下必需，Windows/Mac 上无副作用。 */
    const child = spawn(exe, [
      '--headless=new',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--window-size=' + width + ',' + height,
      '--virtual-time-budget=2000',
      '--screenshot=' + outFile,
      url
    ], { stdio: 'ignore' });
    let settled = false;
    /* 统一收尾：主动结束浏览器并按产物是否落盘判定成败，兼容截图后不自动退出的无头 Chrome。 */
    const finish = (ok, code) => {
      if (settled) return;
      settled = true;
      try { child.kill('SIGKILL'); } catch (_) { /* 进程可能已退出 */ }
      if (ok) {
        console.log(`✓ [${group}] ${outFile}`);
      } else {
        console.error(`✗ [${group}] 截图失败（${code}）：${url}`);
        process.exitCode = 1;
      }
      resolveShot(ok);
    };
    child.on('error', () => {
      console.error(`✗ 启动浏览器失败：${exe}`);
      finish(false, 'spawn');
    });
    /* 部分无头 Chrome 截图后不自动退出：轮询产物落盘（大小稳定）后主动收尾，不再依赖 close 事件。 */
    waitForFile(outFile, 20000).then((exists) => finish(exists, 'timeout'));
  });
}

/* 轮询等待截图文件落盘，最多等待 timeout 毫秒。要求大小非零且连续两次相等，避免读到写入中途的半截文件。 */
function waitForFile(path, timeout) {
  return new Promise((resolveWait) => {
    const start = Date.now();
    let lastSize = -1;
    (function check() {
      if (existsSync(path)) {
        const size = statSync(path).size;
        if (size > 0 && size === lastSize) return resolveWait(true);
        lastSize = size;
      }
      if (Date.now() - start >= timeout) return resolveWait(existsSync(path) && statSync(path).size > 0);
      setTimeout(check, 150);
    })();
  });
}

/* 按常见安装路径依次探测可用浏览器，优先 msedge。 */
function resolveBrowser() {
  const explicit = flag('browser', '');
  if (explicit) return existsSync(explicit) ? explicit : null;
  const candidates = [
    'msedge',
    'chrome',
    'google-chrome',
    'google-chrome-stable',
    'chromium',
    'chromium-browser',
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

/* 检查命令是否在 PATH 中可用。 */
function commandExists(cmd) {
  const probe = spawnSync(cmd, ['--version'], { stdio: 'ignore', shell: true });
  return probe.error === undefined && probe.status === 0;
}

/* 串行截图，避免多个无头实例同时抢占同一输出文件。 */
async function main() {
  const groups = collectGroups();
  if (groups.length === 0) {
    console.error('✗ 未在标注数据中找到任何分组。');
    process.exit(1);
  }
  const exe = resolveBrowser();
  if (!exe) {
    console.error('✗ 未找到 Edge/Chrome 浏览器，请用 --browser= 指定可执行文件路径。');
    process.exit(1);
  }
  console.log(`发现 ${groups.length} 个标注组：${groups.join(', ')}`);
  let ok = 0;
  for (const group of groups) {
    if (await shoot(group, exe)) ok++;
  }
  console.log(`完成：${ok}/${groups.length}，输出目录 ${outDir}`);
  process.exit(ok === groups.length ? 0 : 1);
}

main();
