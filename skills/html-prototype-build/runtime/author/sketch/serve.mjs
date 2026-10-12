#!/usr/bin/env node
/* Read-only static server so the sketch board can fetch UI pack files. */
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolvePackAsset } from '../../server/packs.mjs';

const sketchDir = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.SKETCH_PORT || 4180);
const allowedHosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`]);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

function sketchFile(pathname) {
  const rel = pathname.replace(/^\/sketch\/?/, '') || 'index.html';
  if (!rel || rel.split('/').includes('..')) return null;
  const filePath = resolve(sketchDir, rel);
  if (relative(sketchDir, filePath).startsWith('..')) return null;
  if (existsSync(filePath) && statSync(filePath).isDirectory()) return join(filePath, 'index.html');
  return filePath;
}

function fileFor(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded === '/sketch' || decoded.startsWith('/sketch/')) return sketchFile(decoded);
  if (decoded.startsWith('/.html-prototype/packs/')) return resolvePackAsset(decoded.slice('/.html-prototype/packs/'.length));
  return null;
}

const isDirectExecution = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

export { fileFor };

const server = createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { allow: 'GET, HEAD' }).end('Method Not Allowed');
    return;
  }
  if (!allowedHosts.has(request.headers.host)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  let url;
  try {
    url = new URL(request.url, `http://127.0.0.1:${port}`);
  } catch {
    response.writeHead(400).end('Bad Request');
    return;
  }
  if (url.pathname === '/') {
    response.writeHead(302, { location: '/sketch/' }).end();
    return;
  }
  const filePath = fileFor(url.pathname);
  if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404).end('Not Found');
    return;
  }
  const body = request.method === 'HEAD' ? undefined : readFileSync(filePath);
  response.writeHead(200, {
    'content-type': types[extname(filePath).toLowerCase()] || 'application/octet-stream',
    'cache-control': 'no-store'
  });
  response.end(body);
});

if (isDirectExecution) {
  server.listen(port, '127.0.0.1', () => {
    console.log(`Sketch board: http://127.0.0.1:${port}/sketch/`);
  });
}
