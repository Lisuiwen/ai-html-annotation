#!/usr/bin/env node
/* Local prototype author server: HTTP, static assets, and author-tool wiring only. */
import { createServer } from 'node:http';
import { existsSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyPrototypeEdit, isTrustedAuthorRequest } from './source-editor.mjs';
import { validateSnapshot, writeSnapshot } from './snapshot.mjs';
import { injectTargets, openIDE, resolveInspectorTarget } from './inspector.mjs';

export { applyPrototypeEdit, isTrustedAuthorRequest } from './source-editor.mjs';
export { validateSnapshot } from './snapshot.mjs';
export { injectTargets, resolveInspectorTarget } from './inspector.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const runtimeRoot = resolve(here, '..');
const skillRoot = resolve(here, '../..');
const input = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
const isDirectExecution = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
const portArg = process.argv.find((arg) => arg.startsWith('--port='));
const port = Number(portArg && portArg.split('=')[1] || 4178);

/* Load skill-root .env without overriding existing process.env so outer CI/local vars win. */
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

loadEnvFile(join(skillRoot, '.env'));

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
        reject(new error('Annotation payload exceeds 2MB limit.'));
        return;
      }
      body += chunk;
    });
    request.on('end', () => {
      if (settled) return;
      settled = true;
      try { resolveBody(JSON.parse(body)); } catch { reject(new error('Request body is not valid JSON.')); }
    });
    request.on('error', (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    });
  });
}

function writeFileAtomic(filePath, content) {
  const temp = `${filePath}.tmp`;
  writeFileSync(temp, content, 'utf8');
  renameSync(temp, filePath);
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
      if (!snapshotPath) return response.writeHead(503).end('This service has no snapshot file configured.');
      const data = await readJson(request);
      if (!validateSnapshot(data)) return response.writeHead(400).end('Annotation data does not meet schema v2 minimum contract.');
      writeSnapshot(snapshotPath, data);
      response.writeHead(204).end();
      return;
    }

    if (request.method === 'POST' && url.pathname === '/__prototype-author/edit') {
      if (!isTrustedAuthorRequest(request, port)) return response.writeHead(403).end('Forbidden author request');
      if (!htmlPath) return response.writeHead(503).end('This service has no prototype HTML configured.');
      const payload = await readJson(request);
      const next = applyPrototypeEdit(readFileSync(htmlPath, 'utf8'), payload);
      writeFileAtomic(htmlPath, next);
      response.writeHead(204).end();
      return;
    }

    if (request.method === 'GET' && url.pathname === '/__prototype-author/inspector/open') {
      const target = resolveInspectorTarget({
        root,
        htmlPath,
        filePath: url.searchParams.get('file') || '',
        targetId: url.searchParams.get('target') || ''
      });
      if (!target.ok) return response.writeHead(target.status).end(target.message);
      openIDE(target.resolvedPath, target.line);
      response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' }).end('Opened ' + target.filePath + ':' + target.line);
      return;
    }

    /* Author browser assets may only come from runtime/author and runtime/client. */
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

function injectAuthorLoader(content) {
  var script = '<script src="/__prototype-author/author/bootstrap.js" data-prototype-author-loader></script>';
  if (/<\/body>/i.test(content)) return content.replace(/<\/body>/i, script + '\n</body>');
  return content + '\n' + script + '\n';
}

export function startServer() {
  if (!input) {
    console.error('Usage: node runtime/server/index.mjs <prototype.html> [--port=4178] [--snapshot=prototype/notes.snapshot.js]');
    process.exit(1);
  }
  if (!existsSync(htmlPath) || !statSync(htmlPath).isFile()) {
    console.error(`Prototype HTML not found: ${htmlPath}`);
    process.exit(1);
  }
  if (snapshotArg && relative(root, snapshotPath).startsWith('..')) {
    console.error('Snapshot file must be inside the prototype directory.');
    process.exit(1);
  }
  server.listen(port, '127.0.0.1', () => {
    console.log(`Author server: http://127.0.0.1:${port}/${htmlPath.split(/[\\/]/).pop()}`);
    console.log('Inspector IDE: ' + ((process.env.CODE_EDITOR || '').trim() || 'not configured, fallback cursor → code'));
    console.log('Stop server: Ctrl+C');
  });
}

if (isDirectExecution) startServer();
