import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const packDirectory = path.resolve(toolDirectory, '..');
const skillDirectory = path.resolve(packDirectory, '../../..');
const manifestPath = path.join(packDirectory, 'manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const errors = [];

/** Ensure a relative path referenced by the manifest exists. */
async function requireFile(relativePath, label, rootDirectory = packDirectory) {
  try {
    const entry = await stat(path.join(rootDirectory, relativePath));
    if (!entry.isFile()) errors.push(`${label} is not a file: ${relativePath}`);
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      errors.push(`${label} missing: ${relativePath}`);
    } else {
      errors.push(`${label} inaccessible: ${relativePath} (${err.message})`);
    }
  }
}

/** Text assets must be UTF-8 without BOM; implementation files must not reference external URLs. */
async function validateTextFile(relativePath) {
  const buffer = await readFile(path.join(packDirectory, relativePath));
  if (buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    errors.push(`File must not contain a UTF-8 BOM: ${relativePath}`);
  }
  const content = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  if (/https?:\/\//i.test(content)) errors.push(`Implementation file must not reference external URLs: ${relativePath}`);
}

/** Read contract frontmatter id and verify index and leaf contracts stay aligned. */
async function validateContractId(id, relativePath) {
  const content = await readFile(path.join(packDirectory, relativePath), 'utf8');
  const match = content.match(/^---\s*[\s\S]*?^id:\s*([^\r\n]+)[\s\S]*?^---/m);
  if (!match || match[1].trim() !== id) {
    errors.push(`Contract id mismatch: ${id} -> ${relativePath}`);
  }
}

const registries = {
  ...manifest.components,
  ...manifest.patterns,
  ...manifest.presets
};

await requireFile(manifest.foundation.contract, 'Foundation contract');
for (const source of manifest.foundation.sources) {
  await requireFile(source, 'Foundation source');
  await validateTextFile(source);
}

const componentRootEntries = await readdir(path.join(packDirectory, 'components'), { withFileTypes: true });
for (const entry of componentRootEntries) {
  if (entry.isFile() && entry.name.endsWith('.html')) {
    errors.push(`Category aggregate files must not remain: components/${entry.name}`);
  }
}

for (const [id, entry] of Object.entries(registries)) {
  await requireFile(entry.contract, `${id} contract`);
  await requireFile(entry.source, `${id} implementation`);
  await validateTextFile(entry.contract);
  await validateTextFile(entry.source);
  if (entry.adapter) {
    await requireFile(entry.adapter, `${id} state adapter`);
    await validateTextFile(entry.adapter);
  }
  await validateContractId(id, entry.contract);

  for (const dependency of [...(entry.requires ?? []), ...(entry.optional ?? []), ...(entry.uses ?? [])]) {
    if (!registries[dependency]) errors.push(`${id} references unknown dependency: ${dependency}`);
  }

  for (const vendorPath of entry.vendor ?? []) {
    await requireFile(vendorPath, `${id} vendor`, skillDirectory);
  }
  for (const runtimePath of entry.runtime ?? []) {
    await requireFile(runtimePath, `${id} runtime`, skillDirectory);
  }
  for (const assetPath of entry.assets ?? []) {
    await requireFile(assetPath, `${id} asset`, skillDirectory);
  }
}

for (const [id, entry] of Object.entries({ ...manifest.patterns, ...manifest.presets })) {
  for (const dependency of [...(entry.requires ?? []), ...(entry.optional ?? []), ...(entry.uses ?? [])]) {
    if (manifest.components[dependency]?.visibility === 'internal') {
      errors.push(`${id} must not reference private component directly: ${dependency}`);
    }
  }
}

/** Depth-first cycle check for requires and uses. */
function visit(id, visiting = new Set(), visited = new Set()) {
  if (visited.has(id)) return;
  if (visiting.has(id)) {
    errors.push(`Cycle detected: ${[...visiting, id].join(' -> ')}`);
    return;
  }
  visiting.add(id);
  const entry = registries[id];
  for (const dependency of [...(entry.requires ?? []), ...(entry.uses ?? [])]) {
    visit(dependency, visiting, visited);
  }
  visiting.delete(id);
  visited.add(id);
}

for (const id of Object.keys(registries)) visit(id);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`UI Pack valid: ${Object.keys(manifest.components).length} components, ${Object.keys(manifest.patterns).length} patterns, ${Object.keys(manifest.presets).length} presets.`);
}
