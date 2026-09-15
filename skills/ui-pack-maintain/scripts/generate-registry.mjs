#!/usr/bin/env node
/**
 * Generate .html-prototype/packs/registry.json from local pack directories.
 */
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from './_pack-md.mjs';

const argv = process.argv.slice(2);
const valueOf = (flag) => {
  const match = argv.find((arg) => arg.startsWith(`${flag}=`));
  return match ? match.slice(flag.length + 1) : undefined;
};

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const packRoot = path.resolve(valueOf('--pack-root') || path.join(repositoryRoot, '.html-prototype', 'packs'));
const defaultRegistryPath = path.join(packRoot, 'registry.json');
const fallbackRegistryPath = path.join(repositoryRoot, 'skills', 'html-prototype-build', 'ui', 'pack-registry.fallback.json');
const outputPath = path.resolve(valueOf('--output') || defaultRegistryPath);
const writeFallback = !argv.includes('--check') && outputPath === path.resolve(defaultRegistryPath);
const defaultRef = valueOf('--default-ref') || 'v0.4.1';
const repository = valueOf('--repository') || 'Lisuiwen/ai-html-annotation';
const checkOnly = argv.includes('--check');

function summaryFromPackMd(source) {
  const body = source.replace(/^---[\s\S]*?---\s*/, '').trim();
  for (const block of body.split(/\n\s*\n/).map((item) => item.trim())) {
    if (!block || block.startsWith('#')) continue;
    const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (lines.every((line) => line.startsWith('-') || line.startsWith('`'))) continue;
    const text = lines.join(' ').replace(/\s+/g, ' ');
    if (text) return text.slice(0, 240);
  }
  return '';
}

async function summarizePack(packDirectory) {
  const manifest = JSON.parse(await readFile(path.join(packDirectory, 'manifest.json'), 'utf8'));
  const packMd = await readFile(path.join(packDirectory, 'PACK.md'), 'utf8');
  const meta = parseFrontmatter(packMd);
  return {
    id: manifest.id,
    name: meta.name || manifest.id,
    description: meta.summary || meta.description || summaryFromPackMd(packMd),
    version: manifest.version,
    schemaVersion: manifest.schemaVersion,
    ref: defaultRef,
    foundation: manifest.foundation?.id ?? null,
    providers: Object.keys(manifest.providers ?? {}),
    counts: {
      components: Object.keys(manifest.components ?? {}).length,
      patterns: Object.keys(manifest.patterns ?? {}).length,
      presets: Object.keys(manifest.presets ?? {}).length
    }
  };
}

const packs = [];
for (const entry of await readdir(packRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const packDirectory = path.join(packRoot, entry.name);
  try {
    await stat(path.join(packDirectory, 'manifest.json'));
  } catch {
    continue;
  }
  packs.push(await summarizePack(packDirectory));
}
packs.sort((left, right) => left.id.localeCompare(right.id));

const registry = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: {
    repository,
    defaultRef,
    packPath: '.html-prototype/packs'
  },
  packs
};

function stableSerialize(value) {
  const clone = JSON.parse(JSON.stringify(value));
  delete clone.generatedAt;
  return `${JSON.stringify(clone, null, 2)}\n`;
}

const serialized = `${JSON.stringify(registry, null, 2)}\n`;

if (checkOnly) {
  const existing = JSON.parse(await readFile(outputPath, 'utf8'));
  if (stableSerialize(existing) !== stableSerialize(registry)) {
    console.error(`registry.json is stale: ${outputPath}`);
    console.error('Run: node skills/ui-pack-maintain/scripts/generate-registry.mjs');
    process.exit(1);
  }
  console.log(`registry.json is up to date (${packs.length} pack(s)).`);
  process.exit(0);
}

await writeFile(outputPath, serialized, 'utf8');
console.log(`Wrote ${outputPath} (${packs.length} pack(s)).`);
if (writeFallback) {
  await writeFile(fallbackRegistryPath, serialized, 'utf8');
  console.log(`Wrote ${fallbackRegistryPath} (${packs.length} pack(s)).`);
}
