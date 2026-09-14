#!/usr/bin/env node
/**
 *
 * Computes the transitive closure of `requires` and `uses` for a set of entry
 * ids inside a single Pack, verifies every reference resolves and there are no
 * dependency cycles, and reports one representative optional selection.
 *
 * Scope: in-pack resolution only. Cross-pack references are out of scope; treat
 * them as a `ponytail:` evidence gap until a consumer defines cross-pack wiring.
 *
 * Usage:
 *   node resolve-pack.mjs --pack=<pack-directory> --entry=<id>[,<id>...] [--optional=<id>[,<id>...]]
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const valueOf = (flag) => {
  const arg = args.find((a) => a.startsWith(`${flag}=`));
  return arg ? arg.slice(flag.length + 1) : undefined;
};

const packDirectory = valueOf('--pack');
const entryArg = valueOf('--entry');
const optionalArg = valueOf('--optional');

if (!packDirectory || !entryArg) {
  console.error('Usage: node resolve-pack.mjs --pack=<pack-directory> --entry=<id>[,<id>...] [--optional=<id>[,<id>...]]');
  process.exit(2);
}

const split = (value) => (value ? value.split(',').map((s) => s.trim()).filter(Boolean) : []);

let manifest;
try {
  manifest = JSON.parse(await readFile(path.join(path.resolve(packDirectory), 'manifest.json'), 'utf8'));
} catch (error) {
  console.error(`Cannot read manifest.json: ${error.message}`);
  process.exit(1);
}

const registries = {
  ...(manifest.components ?? {}),
  ...(manifest.patterns ?? {}),
  ...(manifest.presets ?? {}),
};

const list = (value) => (Array.isArray(value) ? value : []);

const errors = [];
const entries = split(entryArg);
const optionals = split(optionalArg);

for (const id of entries) {
  if (!registries[id]) errors.push(`Unknown entry: ${id}`);
}
for (const id of optionals) {
  if (!registries[id]) errors.push(`Unknown optional: ${id}`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

/** Walk requires + uses transitively. Returns ordered ids and detects cycles. */
function resolveClosure(roots) {
  const visited = new Set();
  const order = [];
  const stack = [];

  const visit = (id) => {
    if (visited.has(id)) return;
    const cycleAt = stack.indexOf(id);
    if (cycleAt >= 0) {
      errors.push(`Dependency cycle: ${[...stack.slice(cycleAt), id].join(' -> ')}`);
      return;
    }
    stack.push(id);
    const entry = registries[id];
    if (!entry) {
      errors.push(`Unknown dependency: ${id}`);
      stack.pop();
      return;
    }
    for (const dep of [...list(entry.requires), ...list(entry.uses)]) {
      visit(dep);
    }
    stack.pop();
    if (!visited.has(id)) {
      visited.add(id);
      order.push(id);
    }
  };

  for (const root of roots) visit(root);
  return { order, visited };
}

const required = resolveClosure(entries);

// Optional selection: resolve optionals against the required closure, so we can
// report which conditional capabilities are reachable without requiring all of
// them. Each selected optional's own requires/uses are pulled in.
const selectedOptionals = resolveClosure(optionals);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

const all = [...required.visited, ...selectedOptionals.visited].filter(
  (id, index, self) => self.indexOf(id) === index
);

console.log(`Pack: ${manifest.id}`);
console.log(`Entry(ies): ${entries.join(', ')}`);
console.log(`Required closure (${required.order.length}):`);
for (const id of required.order) console.log(`  - ${id}`);
if (optionals.length) {
  console.log(`Optional selection (${selectedOptionals.order.length}):`);
  for (const id of selectedOptionals.order) console.log(`  - ${id}`);
}
console.log(`Resolved: ${all.length} unique id(s).`);
