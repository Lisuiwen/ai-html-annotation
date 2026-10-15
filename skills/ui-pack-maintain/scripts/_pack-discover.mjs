/**
 * Discover installed UI packs using the same root chain as html-prototype-build.
 */
import { readFile, readdir, access } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const maintainSkillDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const consumerSkillDirectory = path.resolve(maintainSkillDirectory, '..', 'html-prototype-build');

function valueOf(argv, flag) {
  const prefix = `${flag}=`;
  const arg = argv.find((a) => a.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

function parsePathList(value) {
  return [...new Set(String(value || '').split(path.delimiter).map((entry) => entry.trim()).filter(Boolean))];
}

async function pathExists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

function readExplicitPackRoots(argv) {
  const roots = [];
  for (const [source, value] of [
    ['explicit-root', valueOf(argv, '--pack-root')],
    ['env', process.env.HTML_PROTOTYPE_PACK_ROOT || '']
  ]) {
    for (const entry of parsePathList(value)) {
      roots.push({ source, dir: path.resolve(entry) });
    }
  }
  return roots;
}

async function discoverProjectPackRoots(startDir) {
  const roots = [];
  let current = path.resolve(startDir);
  while (true) {
    const candidate = path.join(current, '.html-prototype', 'packs');
    if (await pathExists(candidate)) roots.push({ source: 'project', dir: candidate });
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return roots;
}

export async function buildRootChain(cwd = process.cwd(), argv = process.argv.slice(2)) {
  const roots = [
    ...readExplicitPackRoots(argv),
    ...(await discoverProjectPackRoots(cwd)),
    { source: 'user-cache', dir: path.join(os.homedir(), '.html-prototype', 'packs') },
    { source: 'builtin', dir: path.join(consumerSkillDirectory, 'ui', 'packs') }
  ];
  const seen = new Set();
  const chain = [];
  const rootKey = (dir) => {
    const normalized = path.resolve(dir);
    return process.platform === 'win32' ? normalized.toLowerCase() : normalized;
  };
  for (const root of roots) {
    const key = rootKey(root.dir);
    if (seen.has(key)) continue;
    seen.add(key);
    const dir = path.resolve(root.dir);
    chain.push({ source: root.source, dir, exists: await pathExists(dir) });
  }
  return chain;
}

async function listPackDirectories(packRoot) {
  if (!await pathExists(packRoot)) return [];
  const packs = [];
  for (const entry of await readdir(packRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const packDir = path.join(packRoot, entry.name);
    if (await pathExists(path.join(packDir, 'manifest.json'))) packs.push(packDir);
  }
  return packs;
}

async function readPackOrigin(packDirectory) {
  if (!await pathExists(path.join(packDirectory, 'manifest.json'))) return null;
  if (await pathExists(path.join(packDirectory, '.pack-source.json'))) return 'installed';
  return 'local';
}

function summarizePack(packDir, source, manifest, shadowed = []) {
  return {
    id: manifest.id,
    dir: packDir,
    source,
    origin: null,
    version: manifest.version ?? null,
    schemaVersion: manifest.schemaVersion ?? null,
    foundation: manifest.foundation?.id ?? null,
    providers: Object.keys(manifest.providers ?? {}),
    counts: {
      components: Object.keys(manifest.components ?? {}).length,
      patterns: Object.keys(manifest.patterns ?? {}).length,
      presets: Object.keys(manifest.presets ?? {}).length
    },
    shadowed
  };
}

export async function discoverPacks(rootChain) {
  const packsById = new Map();
  const allInstances = [];

  for (const root of rootChain) {
    if (!root.exists) continue;
    for (const packDir of await listPackDirectories(root.dir)) {
      let manifest;
      try {
        manifest = JSON.parse(await readFile(path.join(packDir, 'manifest.json'), 'utf8'));
      } catch {
        continue;
      }
      const id = manifest.id || path.basename(packDir);
      const instance = { id, packDir, source: root.source, manifest };
      allInstances.push(instance);
      if (!packsById.has(id)) packsById.set(id, instance);
    }
  }

  const packs = [];
  for (const [id, winner] of packsById.entries()) {
    const shadowed = allInstances
      .filter((entry) => entry.id === id && entry.packDir !== winner.packDir)
      .map((entry) => ({ source: entry.source, dir: entry.packDir }));
    const summary = summarizePack(winner.packDir, winner.source, winner.manifest, shadowed);
    summary.origin = await readPackOrigin(winner.packDir);
    packs.push(summary);
  }
  packs.sort((left, right) => left.id.localeCompare(right.id));
  return { packs, instances: [...packsById.values()] };
}

export async function listInstalledPacks(cwd = process.cwd(), argv = process.argv.slice(2)) {
  const roots = await buildRootChain(cwd, argv);
  const { packs } = await discoverPacks(roots);
  return { roots, packs };
}

/**
 * Resolve a pack directory from a filesystem path or an installed pack id.
 */
export async function resolvePackDirectory(argv = process.argv.slice(2), cwd = process.cwd()) {
  const packArg = valueOf(argv, '--pack');

  if (!packArg) {
    throw new Error('Missing --pack=<pack-id|directory>');
  }

  const asPath = path.resolve(packArg);
  if (await pathExists(path.join(asPath, 'manifest.json'))) {
    return { packDirectory: asPath, source: 'explicit-dir', id: null };
  }

  const roots = await buildRootChain(cwd, argv);
  const { packs, instances } = await discoverPacks(roots);
  const winner = instances.find((entry) => entry.id === packArg);
  if (!winner) {
    const available = packs.map((pack) => pack.id);
    const rootSummary = roots.map((r) => `${r.source}:${r.dir}${r.exists ? '' : ' (missing)'}`).join('; ');
    throw new Error(
      `Pack not found: ${packArg}. Available: ${available.length ? available.join(', ') : '(none)'}. Roots: ${rootSummary}`
    );
  }
  return { packDirectory: winner.packDir, source: winner.source, id: winner.id };
}

export function printDiscoveryUsage(scriptName) {
  console.error(`Usage: node ${scriptName} --pack=<pack-id|directory> [--pack-root=<dir${path.delimiter}dir>]`);
  console.error('List packs: node list-packs.mjs [--pack-root=<dir>]');
  console.error('Extra roots: --pack-root or HTML_PROTOTYPE_PACK_ROOT');
}
