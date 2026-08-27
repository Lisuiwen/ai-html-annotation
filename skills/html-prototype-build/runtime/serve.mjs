#!/usr/bin/env node
/* 原型作者本地服务：提供工作目录、作者插件，并把标注对象原子写回唯一 snapshot 文件。 */
import { createServer } from 'node:http';
import { existsSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const markPath = join(here, 'html-mark.js');
const input = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
const isDirectExecution = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
const portArg = process.argv.find((arg) => arg.startsWith('--port='));
const port = Number(portArg && portArg.split('=')[1] || 4178);

/* 读取 skill 目录 .env；不覆盖已有 process.env，便于 CI/本机外层变量优先。 */
function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  readFileSync(filePath, 'utf8').split(/\r?\n/).forEach((raw) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) return;
    const eq = line.indexOf('=');
    if (eq <= 0) return;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  });
}

loadEnvFile(join(here, '.env'));

const htmlPath = input ? resolve(input) : '';

const root = htmlPath ? dirname(htmlPath) : '';
const snapshotArg = process.argv.find((arg) => arg.startsWith('--snapshot='));
const snapshotPath = snapshotArg && root ? resolve(root, snapshotArg.split('=').slice(1).join('=')) : null;
/* 无 snapshot 时不要求文件存在，直接跳过标注写回功能。 */

/* 将请求体限制在 2MB，避免作者接口被意外大请求占满内存。 */
function readJson(request) {
  return new Promise((resolveBody, reject) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 2 * 1024 * 1024) reject(new Error('标注数据超过 2MB 上限。'));
    });
    request.on('end', () => {
      try {
        resolveBody(JSON.parse(body));
      } catch {
        reject(new Error('请求体不是有效 JSON。'));
      }
    });
    request.on('error', reject);
  });
}

/* 判断值是否为普通 JSON 对象，排除数组与 null。 */
function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/* 验证 v2 卡片组合条件：仅接收可序列化的对象/数组/标量结构。 */
function validateWhenValue(value, depth = 0) {
  if (depth > 8) return false;
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) return true;
  if (Array.isArray(value)) return value.every((item) => validateWhenValue(item, depth + 1));
  return isObject(value)
    && Object.keys(value).every((key) => key && validateWhenValue(value[key], depth + 1));
}

/* 验证显式场景清单，兼容对象映射与带 id 的数组两种静态表示。 */
function validateScenarios(scenarios) {
  if (Array.isArray(scenarios)) {
    return scenarios.length > 0 && scenarios.every((scenario) => (
      isObject(scenario)
      && typeof scenario.id === 'string' && scenario.id.length > 0
      && (scenario.state === undefined || isObject(scenario.state))
    ));
  }
  return isObject(scenarios)
    && Object.keys(scenarios).length > 0
    && Object.entries(scenarios).every(([id, scenario]) => (
      id.length > 0 && isObject(scenario)
      && (scenario.state === undefined || isObject(scenario.state))
    ));
}

/* 验证最小 snapshot 契约：仅接受 schema v2，要求 anchor、when 与显式 scenarios。 */
export function validateSnapshot(data) {
  if (!isObject(data) || data.schemaVersion !== 2) return false;
  if (!isObject(data.header) || typeof data.header.title !== 'string' || !Array.isArray(data.cards)) return false;
  if (data.scenarios === undefined || !validateScenarios(data.scenarios)) return false;
  return data.cards.every((card) => {
    if (!isObject(card) || typeof card.id !== 'string' || !isObject(card.target)) return false;
    const hasSelector = typeof card.target.selector === 'string';
    const hasAnchor = typeof card.target.anchor === 'string' && card.target.anchor.length > 0;
    if (!hasAnchor && !hasSelector) return false;
    return card.when === undefined || (isObject(card.when) && validateWhenValue(card.when));
  });
}

/* 使用临时文件替换目标文件，避免保存中断留下半个 snapshot。 */
function writeSnapshot(data) {
  const temp = `${snapshotPath}.tmp`;
  const content = `/* 原型正式标注唯一数据源；由 prototype-author 编辑器维护。 */\nwindow.__PROTOTYPE_NOTES__ = ${JSON.stringify(data, null, 2)};\n`;
  writeFileSync(temp, content, 'utf8');
  renameSync(temp, snapshotPath);
}

/* 返回静态文件，并限制所有普通路径都落在原型目录内。 */
function sendFile(response, path) {
  if (!existsSync(path) || !statSync(path).isFile()) {
    response.writeHead(404).end('Not Found');
    return;
  }
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };
  response.writeHead(200, { 'content-type': types[extname(path).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
  response.end(readFileSync(path));
}

/* 路由作者接口、作者资源和原型目录静态文件。 */
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    if (request.method === 'PUT' && url.pathname === '/__prototype-author/notes') {
      if (!snapshotPath) {
        response.writeHead(503).end('本服务未配置 snapshot 文件。');
        return;
      }
      const data = await readJson(request);
      if (!validateSnapshot(data)) {
        response.writeHead(400).end('标注数据不符合 schema v2 最小契约。');
        return;
      }
      writeSnapshot(data);
      response.writeHead(204).end();
      return;
    }

    /* 点击时实时重读文件并用同一纯函数重算 token→行号，保证行号不因编辑漂移。 */
    if (request.method === 'GET' && url.pathname === '/__prototype-author/inspector/open') {
      var filePath = url.searchParams.get('file') || htmlPath.split(/[\\/]/).pop();
      var targetId = url.searchParams.get('target') || '';
      var resolvedPath = resolve(root, filePath);
      if (relative(root, resolvedPath).startsWith('..')) {
        response.writeHead(403).end('Forbidden');
        return;
      }
      if (!existsSync(resolvedPath) || !statSync(resolvedPath).isFile()) {
        response.writeHead(404).end('找不到文件：' + filePath);
        return;
      }
      var content = readFileSync(resolvedPath, 'utf8');
      var line = injectTargets(content).tokens[targetId];
      if (!line) {
        response.writeHead(404).end('找不到目标元素：' + targetId);
        return;
      }
      openIDE(resolvedPath, line);
      response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' }).end('已跳转到 ' + filePath + ':' + line);
      return;
    }

    const authorFiles = {
      '/__prototype-author/author-loader.js': join(here, 'author-loader.js'),
      '/__prototype-author/author-chrome.js': join(here, 'author-chrome.js'),
      '/__prototype-author/editor.js': join(here, 'editor.js'),
      '/__prototype-author/html-mark.js': markPath,
      '/__prototype-author/inspector.js': join(here, 'inspector.js')
    };
    if (authorFiles[url.pathname]) {
      sendFile(response, authorFiles[url.pathname]);
      return;
    }

    const pathname = url.pathname === '/' ? `/${htmlPath.split(/[\\/]/).pop()}` : decodeURIComponent(url.pathname);
    const staticPath = normalize(join(root, pathname));
    if (relative(root, staticPath).startsWith('..')) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    /* 原型 HTML 走内存动态注入：strip 旧属性后按语义元素写入短 token，源文件不被污染。 */
    if (url.pathname === '/' || url.pathname === '/' + htmlPath.split(/[\\/]/).pop()) {
      const injected = injectTargets(readFileSync(htmlPath, 'utf8'));
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      response.end(injectAuthorLoader(injected.html));
      return;
    }
    sendFile(response, staticPath);
  } catch (error) {
    response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' }).end(error.message);
  }
});

/* 纯函数：剥离旧 inspector 属性后，给语义元素注入定长短 token，并记录 token→起始行号。 */
function injectTargets(content) {
  var cleaned = content
    .replace(/\s+data-insp-path\s*=\s*"[^"]*"/gi, '')
    .replace(/\s+data-insp-path\s*=\s*'[^']*'/gi, '')
    .replace(/\s+data-insp-target\s*=\s*"[^"]*"/gi, '')
    .replace(/\s+data-insp-target\s*=\s*'[^']*'/gi, '');
  var tokens = {};
  var seq = 0;
  var lastOffset = 0;
  var line = 1;
  /* 语义元素才可定位；纯文本叶子跳过，点击时由前端冒泡到最近祖先。 */
  var semanticRe = /<(section|article|nav|aside|main|header|footer|form|fieldset|table|thead|tbody|tfoot|tr|th|td|ul|ol|li|dl|dt|dd|h1|h2|h3|h4|h5|h6|p|figure|figcaption|details|summary|dialog|button|a|label|select|textarea|div)(\s[^<>]*?)?\s*(\/?)>/gi;

  var html = cleaned.replace(semanticRe, function (match, tagName, attrs, selfClose, offset) {
    if (selfClose) return match;
    var token = 'i' + String(++seq).padStart(2, '0');
    var segment = cleaned.slice(lastOffset, offset);
    line += (segment.match(/\n/g) || []).length;
    lastOffset = offset;
    tokens[token] = line;
    return '<' + tagName + (attrs || '') + ' data-insp-target="' + token + '">';
  });

  return { html: html, tokens: tokens };
}

/* 仅在服务响应中加载作者工具，保持源 HTML 与正式交付物不受污染。 */
function injectAuthorLoader(content) {
  var script = '<script src="/__prototype-author/author-loader.js" data-prototype-author-loader></script>';
  if (/<\/body>/i.test(content)) return content.replace(/<\/body>/i, script + '\n</body>');
  return content + '\n' + script + '\n';
}

/* 给 Windows cmd /c 参数加引号，避免路径空格被拆词。 */
function quoteWinArg(arg) {
  var s = String(arg);
  if (!/[\s"]/g.test(s)) return s;
  return '"' + s.replace(/"/g, '\\"') + '"';
}

/* 尝试启动指定 IDE。禁用 shell，避免把 .env 值当作命令行解释。
   Windows + Node 22：shell:false 直接 spawn .cmd 会同步抛 EINVAL；
   裸 CLI 名也不走 PATHEXT，故非 .exe 一律经 cmd.exe /d /s /c。 */
function spawnIDE(cmd, args, onFail) {
  function fail() {
    if (typeof onFail === 'function') onFail();
  }
  try {
    var opts = { stdio: 'ignore', detached: true, shell: false, windowsHide: true };
    var child;
    if (process.platform === 'win32' && !/\.exe$/i.test(cmd)) {
      var line = [cmd].concat(args).map(quoteWinArg).join(' ');
      child = spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', line], opts);
    } else {
      child = spawn(cmd, args, opts);
    }
    child.on('error', fail);
    child.unref();
  } catch (error) {
    fail();
  }
}

/* 按 .env 的 CODE_EDITOR（或回退链）打开 IDE 并定位到文件行号。 */
function openIDE(filePath, line) {
  var args = ['-g', filePath + ':' + line + ':1'];
  var target = filePath + ':' + line + ':1';
  var configured = (process.env.CODE_EDITOR || '').trim();
  var fallbacks = ['cursor', 'code'];
  var candidates = configured
    ? [configured].concat(fallbacks.filter(function (item) { return item !== configured; }))
    : fallbacks;

  /* 按候选顺序依次尝试，全部失败则打印手动打开提示。 */
  function tryNext(index) {
    if (index >= candidates.length) {
      console.error('[inspector] 无法启动 IDE，请在 runtime/.env 配置 CODE_EDITOR，或手动打开：' + target);
      return;
    }
    var cmd = candidates[index];
    console.log('[inspector] ' + cmd + ' -g ' + target);
    spawnIDE(cmd, args, function () { tryNext(index + 1); });
  }

  tryNext(0);
}

/* 启动作者服务；独立导出便于测试导入校验函数时不监听端口。 */
export function startServer() {
  if (!input) {
    console.error('用法：node serve.mjs <prototype.html> [--port=4178] [--snapshot=prototype-assets/notes.snapshot.js]');
    process.exit(1);
  }
  if (!existsSync(htmlPath) || !statSync(htmlPath).isFile()) {
    console.error(`找不到原型 HTML：${htmlPath}`);
    process.exit(1);
  }
  if (snapshotArg && relative(root, snapshotPath).startsWith('..')) {
    console.error('snapshot 文件必须位于原型目录内。');
    process.exit(1);
  }
  server.listen(port, '127.0.0.1', () => {
    console.log(`作者服务：http://127.0.0.1:${port}/${htmlPath.split(/[\\/]/).pop()}`);
    console.log('Inspector IDE：' + ((process.env.CODE_EDITOR || '').trim() || '未配置，回退 cursor → code'));
    console.log('关闭服务：Ctrl+C');
  });
}

if (isDirectExecution) startServer();
