#!/usr/bin/env node
/* 原型作者本地服务：提供工作目录、作者插件，并把标注对象原子写回唯一 snapshot 文件。 */
import { createServer } from 'node:http';
import { existsSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { applyPrototypeEdit, isTrustedAuthorRequest } from './source-editor.mjs';

export { applyPrototypeEdit, isTrustedAuthorRequest };

const here = dirname(fileURLToPath(import.meta.url));
const runtimeRoot = resolve(here, '..');
const input = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
const isDirectExecution = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
const portArg = process.argv.find((arg) => arg.startsWith('--port='));
const port = Number(portArg && portArg.split('=')[1] || 4178);

/* 读取 server 目录 .env；不覆盖已有 process.env，便于 CI/本机外层变量优先。 */
function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  readFileSync(filePath, 'utf8').split(/\r?\n/).forEach((raw) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) return;
    const eq = line.indexOf('=');
    if (eq <= 0) return;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (key && process.env[key] === undefined) process.env[key] = value;
  });
}

loadEnvFile(join(here, '.env'));

const htmlPath = input ? resolve(input) : '';
const root = htmlPath ? dirname(htmlPath) : '';
const snapshotArg = process.argv.find((arg) => arg.startsWith('--snapshot='));
const snapshotPath = snapshotArg && root ? resolve(root, snapshotArg.split('=').slice(1).join('=')) : null;

function readJson(request) {
  return new Promise((resolveBody, reject) => {
    const limit = 2 * 1024 * 1024;
    let body = '';
    let size = 0;
    let settled = false;
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      if (settled) return;
      size += Buffer.byteLength(chunk, 'utf8');
      if (size > limit) {
        settled = true;
        body = '';
        reject(new Error('标注数据超过 2MB 上限。'));
        return;
      }
      body += chunk;
    });
    request.on('end', () => {
      if (settled) return;
      settled = true;
      try { resolveBody(JSON.parse(body)); } catch { reject(new Error('请求体不是有效 JSON。')); }
    });
    request.on('error', (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    });
  });
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validateWhenValue(value, depth = 0) {
  if (depth > 8) return false;
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) return true;
  if (Array.isArray(value)) return value.every((item) => validateWhenValue(item, depth + 1));
  return isObject(value) && Object.keys(value).every((key) => key && validateWhenValue(value[key], depth + 1));
}

function validateScenarios(scenarios) {
  if (Array.isArray(scenarios)) {
    return scenarios.length > 0 && scenarios.every((scenario) => (
      isObject(scenario) && typeof scenario.id === 'string' && scenario.id.length > 0
      && (scenario.state === undefined || isObject(scenario.state))
    ));
  }
  return isObject(scenarios) && Object.keys(scenarios).length > 0
    && Object.entries(scenarios).every(([id, scenario]) => (
      id.length > 0 && isObject(scenario) && (scenario.state === undefined || isObject(scenario.state))
    ));
}

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

function writeFileAtomic(filePath, content) {
  const temp = `${filePath}.tmp`;
  writeFileSync(temp, content, 'utf8');
  renameSync(temp, filePath);
}

function writeSnapshot(data) {
  const content = `/* 原型正式标注唯一数据源；由 prototype-author 编辑器维护。 */\nwindow.__PROTOTYPE_NOTES__ = ${JSON.stringify(data, null, 2)};\n`;
  writeFileAtomic(snapshotPath, content);
}

function sendFile(response, path) {
  if (!existsSync(path) || !statSync(path).isFile()) {
    response.writeHead(404).end('Not Found');
    return;
  }
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };
  response.writeHead(200, { 'content-type': types[extname(path).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
  response.end(readFileSync(path));
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    if (request.method === 'PUT' && url.pathname === '/__prototype-author/notes') {
      if (!isTrustedAuthorRequest(request, port)) return response.writeHead(403).end('Forbidden author request');
      if (!snapshotPath) return response.writeHead(503).end('本服务未配置 snapshot 文件。');
      const data = await readJson(request);
      if (!validateSnapshot(data)) return response.writeHead(400).end('标注数据不符合 schema v2 最小契约。');
      writeSnapshot(data);
      response.writeHead(204).end();
      return;
    }

    if (request.method === 'POST' && url.pathname === '/__prototype-author/edit') {
      if (!isTrustedAuthorRequest(request, port)) return response.writeHead(403).end('Forbidden author request');
      if (!htmlPath) return response.writeHead(503).end('本服务未配置原型 HTML。');
      const payload = await readJson(request);
      const next = applyPrototypeEdit(readFileSync(htmlPath, 'utf8'), payload);
      writeFileAtomic(htmlPath, next);
      response.writeHead(204).end();
      return;
    }

    if (request.method === 'GET' && url.pathname === '/__prototype-author/inspector/open') {
      var filePath = url.searchParams.get('file') || htmlPath.split(/[\\/]/).pop();
      var targetId = url.searchParams.get('target') || '';
      var resolvedPath = resolve(root, filePath);
      if (relative(root, resolvedPath).startsWith('..')) return response.writeHead(403).end('Forbidden');
      if (!existsSync(resolvedPath) || !statSync(resolvedPath).isFile()) return response.writeHead(404).end('找不到文件：' + filePath);
      var content = readFileSync(resolvedPath, 'utf8');
      var line = injectTargets(content).tokens[targetId];
      if (!line) return response.writeHead(404).end('找不到目标元素：' + targetId);
      openIDE(resolvedPath, line);
      response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' }).end('已跳转到 ' + filePath + ':' + line);
      return;
    }

    /* 作者浏览器资源只允许来自 runtime/author 与 runtime/client。 */
    if (url.pathname.startsWith('/__prototype-author/')) {
      const rel = decodeURIComponent(url.pathname.slice('/__prototype-author/'.length));
      const allowed = rel.startsWith('author/') || rel.startsWith('client/');
      if (!allowed || rel.includes('..')) return response.writeHead(403).end('Forbidden');
      const assetPath = resolve(runtimeRoot, rel);
      if (relative(runtimeRoot, assetPath).startsWith('..')) return response.writeHead(403).end('Forbidden');
      sendFile(response, assetPath);
      return;
    }

    const pathname = url.pathname === '/' ? `/${htmlPath.split(/[\\/]/).pop()}` : decodeURIComponent(url.pathname);
    const staticPath = normalize(join(root, pathname));
    if (relative(root, staticPath).startsWith('..')) return response.writeHead(403).end('Forbidden');
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

function injectAuthorLoader(content) {
  var script = '<script src="/__prototype-author/author/bootstrap.js" data-prototype-author-loader></script>';
  if (/<\/body>/i.test(content)) return content.replace(/<\/body>/i, script + '\n</body>');
  return content + '\n' + script + '\n';
}

function quoteWinArg(arg) {
  var s = String(arg);
  if (!/[\s"]/g.test(s)) return s;
  return '"' + s.replace(/"/g, '\\"') + '"';
}

function spawnIDE(cmd, args, onFail) {
  function fail() { if (typeof onFail === 'function') onFail(); }
  try {
    var opts = { stdio: 'ignore', detached: true, shell: false, windowsHide: true };
    var child;
    if (process.platform === 'win32' && !/\.exe$/i.test(cmd)) {
      var line = [cmd].concat(args).map(quoteWinArg).join(' ');
      child = spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', line], opts);
    } else child = spawn(cmd, args, opts);
    child.on('error', fail);
    child.unref();
  } catch (error) { fail(); }
}

function openIDE(filePath, line) {
  var args = ['-g', filePath + ':' + line + ':1'];
  var target = filePath + ':' + line + ':1';
  var configured = (process.env.CODE_EDITOR || '').trim();
  var fallbacks = ['cursor', 'code'];
  var candidates = configured ? [configured].concat(fallbacks.filter(function (item) { return item !== configured; })) : fallbacks;
  function tryNext(index) {
    if (index >= candidates.length) {
      console.error('[inspector] 无法启动 IDE，请在 runtime/server/.env 配置 CODE_EDITOR，或手动打开：' + target);
      return;
    }
    var cmd = candidates[index];
    console.log('[inspector] ' + cmd + ' -g ' + target);
    spawnIDE(cmd, args, function () { tryNext(index + 1); });
  }
  tryNext(0);
}

export function startServer() {
  if (!input) {
    console.error('用法：node runtime/server/index.mjs <prototype.html> [--port=4178] [--snapshot=prototype/notes.snapshot.js]');
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
