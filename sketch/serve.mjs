#!/usr/bin/env node
/* Read-only static server so the sketch board can fetch UI pack files. */
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.SKETCH_PORT || 4180);

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

function insideRoot(filePath) {
  const rel = relative(root, filePath);
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
}

function fileFor(pathname) {
  const decoded = decodeURIComponent(pathname);
  const trimmed = decoded.replace(/^\/+/, '');
  const requested = trimmed === '' ? 'sketch/index.html' : trimmed;
  const filePath = normalize(join(root, requested));
  if (!insideRoot(filePath)) return null;
  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    return join(filePath, 'index.html');
  }
  return filePath;
}

const server = createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { allow: 'GET, HEAD' }).end('Method Not Allowed');
    return;
  }
  let url;
  try {
    url = new URL(request.url, `http://127.0.0.1:${port}`);
  } catch {
    response.writeHead(400).end('Bad Request');
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

server.listen(port, '127.0.0.1', () => {
  console.log(`Sketch board: http://127.0.0.1:${port}/sketch/`);
});
