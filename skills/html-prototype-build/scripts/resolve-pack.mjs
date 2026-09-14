/**
 * Discover UI packs via pack-root lookup chain and resolve minimal dependency closure.
 * optional dependencies are added only when caller explicitly selects via --optional.
 */
import { readFile, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  exitWithJson,
  hasFlag,
  pathExists,
  readOption,
  readPackOrigin
} from './_script-utils.mjs';
import { SUPPORTED_SCHEMA_VERSION_SET as SUPPORTED_SCHEMA_VERSIONS } from '../../ui-pack-maintain/scripts/_pack-schema.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultSkillDirectory = path.resolve(scriptDirectory, '..');
const argv = process.argv.slice(2);

function parseIds(value) {
  return [...new Set(String(value || '').split(',').map((id) => id.trim()).filter(Boolean))];
}

function parsePathList(value) {
  return [...new Set(String(value || '').split(path.delimiter).map((entry) => entry.trim()).filter(Boolean))];
}

function readExplicitPackRoots() {
  const roots = [];
  for (const [source, value] of [
    ['explicit-root', readOption(argv, 'pack-root')],
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

async function buildRootChain() {
  const roots = [
    ...readExplicitPackRoots(),
    ...(await discoverProjectPackRoots(process.cwd())),
    { source: 'user-cache', dir: path.join(os.homedir(), '.html-prototype', 'packs') },
    { source: 'builtin', dir: path.join(defaultSkillDirectory, 'ui', 'packs') }
  ];
  const seen = new Set();
  const chain = [];
  for (const root of roots) {
    const normalized = path.resolve(root.dir);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    chain.push({ source: root.source, dir: normalized, exists: await pathExists(normalized) });
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
    shadowed,
    manifest
  };
}

async function discoverPacks(rootChain) {
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
    delete summary.manifest;
    packs.push(summary);
  }
  packs.sort((left, right) => left.id.localeCompare(right.id));
  return { packs, instances: [...packsById.values()] };
}

function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') return 'manifest must be an object';
  if (!SUPPORTED_SCHEMA_VERSIONS.has(manifest.schemaVersion)) {
    return `unsupported schemaVersion: ${manifest.schemaVersion}`;
  }
  if (!manifest.foundation?.id || !manifest.foundation?.contract || !Array.isArray(manifest.foundation?.sources)) {
    return 'manifest.foundation is incomplete';
  }
  return null;
}

function resolveClosure(registry, roots) {
  const resolved = [];
  const visited = new Set();

  function visit(id, stack = new Set()) {
    if (visited.has(id)) return;
    const entry = registry[id];
    if (!entry) throw Object.assign(new Error(`Unknown UI resource: ${id}`), { code: 'unknown-resource', id, available: Object.keys(registry).sort() });
    if (stack.has(id)) throw Object.assign(new Error(`Cycle detected: ${[...stack, id].join(' -> ')}`), { code: 'invalid-manifest' });
    stack.add(id);
    for (const dependency of [...(entry.uses ?? []), ...(entry.requires ?? [])]) visit(dependency, stack);
    stack.delete(id);
    visited.add(id);
    resolved.push(id);
  }

  for (const id of roots) visit(id);
  return resolved;
}

function collectReadPaths(manifest, registry, ids) {
  const files = ['design-system.md', manifest.foundation.contract, ...manifest.foundation.sources];
  for (const id of ids) {
    const entry = registry[id];
    files.push(entry.contract, entry.source);
    if (entry.adapter) files.push(entry.adapter);
  }
  return [...new Set(files)];
}

function collectDelivery(manifest, registry, ids, packDirectory) {
  const deliveryMap = manifest.delivery ?? {};
  const sources = new Set();
  for (const id of ids) {
    const entry = registry[id];
    if (!entry) continue;
    for (const item of [...(entry.vendor ?? []), ...(entry.runtime ?? []), ...(entry.assets ?? [])]) {
      sources.add(item);
    }
  }
  const deliveries = [];
  for (const source of [...sources].sort()) {
    const target = deliveryMap[source];
    if (!target || typeof target !== 'string') {
      throw Object.assign(new Error(`manifest.delivery missing target for ${source}`), { code: 'invalid-manifest' });
    }
    deliveries.push({ from: path.resolve(packDirectory, source), to: target });
  }
  return deliveries;
}

function printUsage() {
  console.error('Usage:');
  console.error('  node resolve-pack.mjs --list [--pack-root=<dir>]');
  console.error('  node resolve-pack.mjs --pack=<id> --select=<id[,id...]> [--optional=<id[,id...]>] [--pack-dir=<dir>] [--pack-root=<dir>]');
  console.error('  --entry is an alias for --select');
}

function packInstallRemediation(requested) {
  return {
    listRemote: 'node <skill-root>/scripts/install-pack.mjs --list-remote',
    install: `node <skill-root>/scripts/install-pack.mjs --pack=${requested || '<id>'}`,
    manual: 'Place the pack at ~/.html-prototype/packs/<id>/ or <project>/.html-prototype/packs/<id>/',
    reference: 'references/pack-install.md'
  };
}

function packNotFoundPayload(requested, rootChain, available) {
  return {
    error: 'pack-not-found',
    requested,
    roots: rootChain,
    available,
    remediation: packInstallRemediation(requested)
  };
}

const rootChain = await buildRootChain();

if (hasFlag(argv, 'list')) {
  const { packs } = await discoverPacks(rootChain);
  exitWithJson({ roots: rootChain, packs }, 0);
}

const packDirOption = readOption(argv, 'pack-dir');
const packId = readOption(argv, 'pack');
const selectedIds = parseIds(readOption(argv, 'select') || readOption(argv, 'entry'));
const optionalIds = parseIds(readOption(argv, 'optional'));

if (!selectedIds.length) {
  printUsage();
  process.exit(1);
}

let packDirectory;
let packSource;
let manifest;

if (packDirOption) {
  packDirectory = path.resolve(packDirOption);
  packSource = 'explicit-dir';
  try {
    manifest = JSON.parse(await readFile(path.join(packDirectory, 'manifest.json'), 'utf8'));
  } catch {
    exitWithJson(packNotFoundPayload(packId || path.basename(packDirectory), rootChain, []), 2);
  }
} else {
  const { packs, instances } = await discoverPacks(rootChain);
  const resolvedPackId = packId || (packs.length === 1 ? packs[0].id : '');
  if (!resolvedPackId) {
    printUsage();
    console.error('error: --pack=<id> is required when multiple packs are visible; run --list first.');
    process.exit(1);
  }
  const winner = instances.find((entry) => entry.id === resolvedPackId);
  if (!winner) {
    exitWithJson(packNotFoundPayload(resolvedPackId, rootChain, packs.map((pack) => pack.id)), 2);
  }
  packDirectory = winner.packDir;
  packSource = winner.source;
  manifest = winner.manifest;
}

const manifestError = validateManifest(manifest);
if (manifestError) exitWithJson({ error: 'invalid-manifest', detail: manifestError }, 4);

const registry = { ...manifest.components, ...manifest.patterns, ...manifest.presets };

let resolvedIds;
try {
  resolvedIds = resolveClosure(registry, [...selectedIds, ...optionalIds]);
} catch (error) {
  if (error.code === 'unknown-resource') {
    exitWithJson({ error: error.code, id: error.id, available: error.available }, 3);
  }
  exitWithJson({ error: error.code || 'invalid-manifest', detail: error.message }, 4);
}

let deliver;
try {
  deliver = collectDelivery(manifest, registry, resolvedIds, packDirectory);
} catch (error) {
  exitWithJson({ error: error.code || 'invalid-manifest', detail: error.message }, 4);
}

exitWithJson({
  pack: manifest.id,
  packDir: packDirectory,
  skillDir: defaultSkillDirectory,
  source: packSource,
  foundation: manifest.foundation.id,
  selected: selectedIds,
  optional: optionalIds,
  resolved: resolvedIds,
  read: collectReadPaths(manifest, registry, resolvedIds).map((file) => path.resolve(packDirectory, file)),
  deliver
}, 0);
