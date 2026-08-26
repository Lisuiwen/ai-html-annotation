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

/* 正式产物将所有 HTML 配套资源收拢到 assets，截图在其中按类别归档。 */
const outDir = resolve(flag('out', join(dirname(htmlPath), 'prototype-assets', 'screenshots')));
const width = flag('width', '1440');
const height = flag('height', '900');
mkdirSync(outDir, { recursive: true });

/* 解析唯一标注数据源：默认 <原型目录>/prototype-assets/notes.snapshot.js，可 --snapshot= 覆盖。 */
const snapshotPath = resolve(flag('snapshot', join(dirname(htmlPath), 'prototype-assets', 'notes.snapshot.js')));
if (!existsSync(snapshotPath)) {
  console.error(`✗ 找不到标注数据：${snapshotPath}`);
  process.exit(1);
}

/* 严格读取由作者服务生成的静态 snapshot，拒绝执行其中的任意 JavaScript。 */
function readNotes() {
  const code = readFileSync(snapshotPath, 'utf8');
  const match = code.match(/^\s*(?:(?:\/\*[\s\S]*?\*\/|\/\/[^\r\n]*(?:\r?\n|$))\s*)*window\.__PROTOTYPE_NOTES__\s*=\s*([\s\S]*?)\s*;\s*$/);
  if (!match) {
    throw new Error('标注数据必须是单个 window.__PROTOTYPE_NOTES__ = <JSON>; 赋值，不能包含可执行代码。');
  }
  try {
    return JSON.parse(match[1]);
  } catch {
    throw new Error('标注数据中的 __PROTOTYPE_NOTES__ 必须是有效 JSON。');
  }
}

/* 从 snapshot 提取所有非 common 分组作为组清单，保持出现顺序并去重。 */
function collectGroups() {
  let notes;
  try {
    notes = readNotes();
  } catch (error) {
    console.error('✗ ' + error.message);
    process.exit(1);
  }
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
    const child = spawn(exe, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--window-size=' + width + ',' + height,
      '--virtual-time-budget=2000',
      '--screenshot=' + outFile,
      url
    ], { stdio: 'ignore' });
    child.on('error', () => {
      console.error(`✗ 启动浏览器失败：${exe}`);
      process.exitCode = 1;
      resolveShot(false);
    });
    /* 用 close（stdio 完全关闭）而非 exit：Edge 截图文件可能在进程退出后仍有落盘延迟。 */
    child.on('close', (code) => {
      if (code === 0) waitForFile(outFile, 4000).then((exists) => {
        if (exists) {
          console.log(`✓ [${group}] ${outFile}`);
          resolveShot(true);
        } else {
          console.error(`✗ [${group}] 截图文件未生成（exit ${code}）：${url}`);
          resolveShot(false);
        }
      });
      else {
        console.error(`✗ [${group}] 截图失败（exit ${code}）：${url}`);
        resolveShot(false);
      }
    });
  });
}

/* 轮询等待截图文件落盘，最多等待 timeout 毫秒。 */
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

/* 按常见安装路径依次探测可用浏览器，优先 msedge。 */
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
