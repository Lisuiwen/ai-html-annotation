/* Pack files the sketch board reads. Same order as resolve-pack.mjs: project, then user cache. */
import { existsSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';

export function packRoots(startDir = process.cwd()) {
  const roots = [];
  let current = resolve(startDir);
  while (true) {
    const candidate = join(current, '.html-prototype', 'packs');
    if (existsSync(candidate)) roots.push(candidate);
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  const user = join(homedir(), '.html-prototype', 'packs');
  if (existsSync(user) && !roots.includes(resolve(user))) roots.push(user);
  return roots;
}

export function resolvePackAsset(relativePath, startDir = process.cwd()) {
  const clean = String(relativePath || '').replace(/^\/+/, '');
  if (!clean || clean.split('/').includes('..')) return null;
  for (const root of packRoots(startDir)) {
    const assetPath = resolve(root, clean);
    if (relative(root, assetPath).startsWith('..')) continue;
    if (existsSync(assetPath) && statSync(assetPath).isFile()) return assetPath;
  }
  return null;
}
