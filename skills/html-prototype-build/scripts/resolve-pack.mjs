/**
 * Resolve minimal strong dependency closure for Component, Pattern, or Preset from UI Pack manifest.
 * optional dependencies are added only when caller explicitly selects via --optional.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const skillDirectory = path.resolve(scriptDirectory, '..');

/** Read command-line argument shaped like --name=value. */
function readOption(name, fallback = '') {
  const prefix = `--${name}=`;
  const match = process.argv.slice(2).find((value) => value.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

/** Normalize comma-separated ID list to a deduplicated array. */
function parseIds(value) {
  return [...new Set(String(value || '').split(',').map((id) => id.trim()).filter(Boolean))];
}

/** Recursively expand requires and uses, detecting cyclic dependencies. */
function resolveClosure(registry, roots) {
  const resolved = [];
  const visited = new Set();

  function visit(id, stack = new Set()) {
    if (visited.has(id)) return;
    const entry = registry[id];
    if (!entry) throw new Error(`Unknown UI resource: ${id}`);
    if (stack.has(id)) throw new Error(`Cycle detected: ${[...stack, id].join(' -> ')}`);
    stack.add(id);
    for (const dependency of [...(entry.uses ?? []), ...(entry.requires ?? [])]) {
      visit(dependency, stack);
    }
    stack.delete(id);
    visited.add(id);
    resolved.push(id);
  }

  for (const id of roots) visit(id);
  return resolved;
}

/** Summarize foundation, contracts, implementations, and Adapter paths for precise Agent loading. */
function collectFiles(manifest, registry, ids) {
  const files = [
    'design-system.md',
    manifest.foundation.contract,
    ...manifest.foundation.sources
  ];
  for (const id of ids) {
    const entry = registry[id];
    files.push(entry.contract, entry.source);
    if (entry.adapter) files.push(entry.adapter);
  }
  return [...new Set(files)];
}

/** Aggregate skill-level vendor / runtime / assets deliverables along closure (paths relative to skill root). */
function collectDeliverables(registry, ids) {
  const vendor = new Set();
  const runtime = new Set();
  const assets = new Set();
  for (const id of ids) {
    const entry = registry[id];
    for (const path of entry.vendor ?? []) vendor.add(path);
    for (const path of entry.runtime ?? []) runtime.add(path);
    for (const path of entry.assets ?? []) assets.add(path);
  }
  return {
    vendor: [...vendor],
    runtime: [...runtime],
    assets: [...assets]
  };
}

const packId = readOption('pack', 'admin-desktop');
const selectedIds = parseIds(readOption('select'));
const optionalIds = parseIds(readOption('optional'));
if (!selectedIds.length) {
  console.error('Usage: node resolve-pack.mjs --select=<id[,id...]> [--optional=<id[,id...]>] [--pack=admin-desktop]');
  process.exit(1);
}

const packDirectory = path.join(skillDirectory, 'ui', 'packs', packId);
const manifest = JSON.parse(await readFile(path.join(packDirectory, 'manifest.json'), 'utf8'));
const registry = { ...manifest.components, ...manifest.patterns, ...manifest.presets };
const resolvedIds = resolveClosure(registry, [...selectedIds, ...optionalIds]);

const deliverables = collectDeliverables(registry, resolvedIds);

console.log(JSON.stringify({
  pack: manifest.id,
  foundation: manifest.foundation.id,
  selected: selectedIds,
  optional: optionalIds,
  resolved: resolvedIds,
  files: collectFiles(manifest, registry, resolvedIds),
  vendor: deliverables.vendor,
  runtime: deliverables.runtime,
  assets: deliverables.assets
}, null, 2));
