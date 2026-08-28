#!/usr/bin/env node
/* 无头截图：按显式场景分别截图。
   Viewer 在 collapsed=1 时进入纯页面态，自动隐藏 Mark、右下角折叠钮与交互闪电。 */
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const input = args.find((arg) => !arg.startsWith('--'));
const flag = (name, fallback) => {
  const hit = args.find((arg) => arg.startsWith('--' + name + '='));
  return hit ? hit.split('=').slice(1).join('=') : fallback;
};

const isDirectExecution = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
const htmlPath = input ? resolve(input) : '';

/* 正式产物将截图与页面运行资源分开：截图位于根目录 screenshots。 */
const outDir = resolve(flag('out', htmlPath ? join(dirname(htmlPath), 'screenshots') : 'screenshots'));
const width = flag('width', '1440');
const height = flag('height', '900');

/* 解析唯一标注数据源：默认 <原型目录>/prototype/notes.snapshot.js，可 --snapshot= 覆盖。 */
const snapshotPath = resolve(flag('snapshot', htmlPath ? join(dirname(htmlPath), 'prototype', 'notes.snapshot.js') : 'prototype/notes.snapshot.js'));

/* 严格读取由作者服务生成的静态 snapshot，拒绝执行其中的任意 JavaScript。 */
export function readNotes() {
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

/* 校验场景 ID 可安全作为跨平台文件名，避免路径穿越、设备名和隐式覆盖。 */
function assertSafeFileName(id) {
  if (typeof id !== 'string' || !id || id.length > 120) {
    throw new Error('场景 ID 必须是 1～120 个字符的字符串。');
  }
  if (id === '.' || id === '..' || /[<>:"/\\|?*\u0000-\u001f]/.test(id) || /[. ]$/.test(id)) {
    throw new Error(`场景 ID 不能安全用作截图文件名：${id}`);
  }
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i.test(id)) {
    throw new Error(`场景 ID 命中 Windows 保留设备名：${id}`);
  }
  return id;
}

/* 从 snapshot 纯数据提取截图场景，仅接受显式声明的 scenarios。 */
export function collectScenarios(notes) {
  if (!notes || !Array.isArray(notes.cards)) {
    throw new Error('标注数据不符合契约：缺少 cards 数组。');
  }
  if (!notes.scenarios || typeof notes.scenarios !== 'object') {
    throw new Error('snapshot 必须显式声明 scenarios。');
  }
  const ids = Array.isArray(notes.scenarios)
    ? notes.scenarios.map((scenario) => scenario && (scenario.id || scenario.name))
    : Object.keys(notes.scenarios);
  if (ids.length === 0 || ids.some((id) => typeof id !== 'string' || !id)) {
    throw new Error('scenarios 必须包含带有效 ID 的场景。');
  }
  return ids.map((id) => ({ id: assertSafeFileName(id), query: 'scene' }));
}

/* 读取 snapshot 后调用纯场景提取函数，CLI 层统一处理错误与退出码。 */
function collectShots() {
  return collectScenarios(readNotes());
}

/* 逐场景执行截图；统一使用 scene 查询参数并折叠右栏与连线。 */
function shoot(shot, exe) {
  return new Promise((resolveShot) => {
    const url = pathToFileURL(htmlPath).href + '?' + shot.query + '=' + encodeURIComponent(shot.id) + '&collapsed=1';
    const outFile = resolve(outDir, shot.id + '.png');
    /* 双重验证最终路径仍在输出目录中，防止未来放宽名称规则后引入穿越。 */
    if (relative(outDir, outFile).startsWith('..')) {
      console.error(`✗ 不安全的截图输出路径：${outFile}`);
      resolveShot(false);
      return;
    }
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
          console.log(`✓ [${shot.id}] ${outFile}`);
          resolveShot(true);
        } else {
          console.error(`✗ [${shot.id}] 截图文件未生成（exit ${code}）：${url}`);
          resolveShot(false);
        }
      });
      else {
        console.error(`✗ [${shot.id}] 截图失败（exit ${code}）：${url}`);
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
  if (!input) {
    console.error('用法：node shoot.mjs <prototype.html> [--out=目录] [--browser=exe路径] [--width=1440] [--height=900] [--snapshot=标注数据路径]');
    process.exit(1);
  }
  if (!existsSync(htmlPath) || !statSync(htmlPath).isFile()) {
    console.error(`找不到原型 HTML：${htmlPath}`);
    process.exit(1);
  }
  if (!existsSync(snapshotPath)) {
    console.error(`✗ 找不到标注数据：${snapshotPath}`);
    process.exit(1);
  }
  mkdirSync(outDir, { recursive: true });
  let shots;
  try {
    shots = collectShots();
  } catch (error) {
    console.error('✗ ' + error.message);
    process.exit(1);
  }
  if (shots.length === 0) {
    console.error('✗ 未在标注数据中找到任何场景。');
    process.exit(1);
  }
  const exe = resolveBrowser();
  if (!exe) {
    console.error('✗ 未找到 Edge/Chrome 浏览器，请用 --browser= 指定可执行文件路径。');
    process.exit(1);
  }
  console.log(`发现 ${shots.length} 个场景：${shots.map((shot) => shot.id).join(', ')}`);
  let ok = 0;
  for (const shot of shots) {
    if (await shoot(shot, exe)) ok++;
  }
  console.log(`完成：${ok}/${shots.length}，输出目录 ${outDir}`);
  process.exit(ok === shots.length ? 0 : 1);
}

if (isDirectExecution) main();
