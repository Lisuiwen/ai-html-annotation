#!/usr/bin/env node
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const packArg = args.find((value) => value.startsWith('--pack='));
const skillRootArg = args.find((value) => value.startsWith('--skill-root='));
const strict = args.includes('--strict');
if (!packArg || !packArg.slice('--pack='.length)) {
  console.error('Usage: node validate-pack.mjs --pack=<pack-directory> [--strict]');
  process.exit(2);
}

const packDirectory = path.resolve(packArg.slice('--pack='.length));
const skillDirectory = skillRootArg
  ? path.resolve(skillRootArg.slice('--skill-root='.length))
  : path.resolve(packDirectory, '../../..');
const errors = [];
const warnings = [];
const referencedFiles = new Set(['PACK.md', 'manifest.json', 'design-system.md']);

const slash = (value) => value.split(path.sep).join('/');
const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);
const list = (value) => Array.isArray(value) ? value : [];
const CSS_CUSTOM_PROPERTY_DECLARATION = /(--[a-zA-Z0-9_-]+)\s*:(?=\s|;|$)/g;
const STATE_CLASS_PATTERN = /^is-[a-z0-9-]+$/;

/** Strip block and line comments before static adapter checks. */
function stripJsComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:\\])\/\/.*$/gm, '$1');
}

/** Pack classes use manifest.classPrefix; local state hooks may use is-* modifiers. */
function isAllowedClassName(className, classPrefix) {
  if (!className) return true;
  if (className.startsWith(classPrefix)) return true;
  return STATE_CLASS_PATTERN.test(className);
}

async function fileExists(relativePath, rootDirectory = packDirectory) {
  try {
    return (await stat(path.join(rootDirectory, relativePath))).isFile();
  } catch {
    return false;
  }
}

async function directoryExists(relativePath) {
  try {
    return (await stat(path.join(packDirectory, relativePath))).isDirectory();
  } catch {
    return false;
  }
}

async function requireFile(relativePath, label, rootDirectory = packDirectory) {
  if (rootDirectory === packDirectory) referencedFiles.add(relativePath);
  if (!await fileExists(relativePath, rootDirectory)) {
    errors.push(`${label} missing: ${relativePath}`);
    return false;
  }
  return true;
}

async function readText(relativePath, rootDirectory = packDirectory) {
  const buffer = await readFile(path.join(rootDirectory, relativePath));
  if (buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    errors.push(`UTF-8 BOM is not allowed: ${relativePath}`);
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    errors.push(`File is not valid UTF-8: ${relativePath}`);
    return '';
  }
}

function frontmatter(source) {
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([a-zA-Z][\w-]*):\s*(.*)$/);
    if (pair) fields[pair[1]] = pair[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return fields;
}

async function validateContract(id, relativePath, expectedCategory) {
  if (!await requireFile(relativePath, `${id} contract`)) return;
  const fields = frontmatter(await readText(relativePath));
  if (!fields) {
    errors.push(`Contract frontmatter missing: ${relativePath}`);
    return;
  }
  if (fields.id !== id) errors.push(`Contract id mismatch: ${id} -> ${relativePath}`);
  if (expectedCategory && fields.category !== expectedCategory) {
    errors.push(`Contract category mismatch: ${id} -> ${relativePath}`);
  }
}

async function walk(relativeDirectory) {
  if (!await directoryExists(relativeDirectory)) return [];
  const files = [];
  for (const entry of await readdir(path.join(packDirectory, relativeDirectory), { withFileTypes: true })) {
    const relativePath = slash(path.join(relativeDirectory, entry.name));
    if (entry.isDirectory()) files.push(...await walk(relativePath));
    else files.push(relativePath);
  }
  return files;
}

for (const [name, label] of [
  ['PACK.md', 'Pack contract'],
  ['manifest.json', 'Pack manifest'],
  ['design-system.md', 'Design system']
]) await requireFile(name, label);

let manifest;
try {
  manifest = JSON.parse(await readFile(path.join(packDirectory, 'manifest.json'), 'utf8'));
} catch (error) {
  errors.push(`Manifest is not valid JSON: ${error.message}`);
  finish();
}

if (!Number.isInteger(manifest.schemaVersion) || manifest.schemaVersion < 1) errors.push('manifest.schemaVersion must be a positive integer.');
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.id ?? '')) errors.push('manifest.id must use lowercase hyphen-case.');
if (!Number.isInteger(manifest.version) || manifest.version < 1) errors.push('manifest.version must be a positive integer.');
if (typeof manifest.classPrefix !== 'string' || !manifest.classPrefix.endsWith('-')) errors.push('manifest.classPrefix must be a non-empty prefix ending in "-".');
if (typeof manifest.tokenPrefix !== 'string' || !manifest.tokenPrefix.endsWith('-')) errors.push('manifest.tokenPrefix must be a non-empty prefix ending in "-".');
if (!isObject(manifest.foundation)) errors.push('manifest.foundation must be an object.');
if (!isObject(manifest.providers)) errors.push('manifest.providers must be an object.');
if (!isObject(manifest.components)) errors.push('manifest.components must be an object.');
if (manifest.patterns !== undefined && !isObject(manifest.patterns)) errors.push('manifest.patterns must be an object when present.');
if (manifest.presets !== undefined && !isObject(manifest.presets)) errors.push('manifest.presets must be an object when present.');

const packFields = frontmatter(await readText('PACK.md'));
if (!packFields) errors.push('PACK.md frontmatter missing.');
else {
  if (packFields.id !== manifest.id) errors.push('PACK.md id must match manifest.id.');
  if (!packFields.name) errors.push('PACK.md must declare a human-readable name.');
}

if (!await directoryExists('foundation')) errors.push('Foundation directory missing: foundation');
if (!await directoryExists('components')) errors.push('Components directory missing: components');

const foundation = isObject(manifest.foundation) ? manifest.foundation : {};
if (typeof foundation.id !== 'string' || !foundation.id) errors.push('manifest.foundation.id is required.');
if (typeof foundation.contract !== 'string' || !foundation.contract) errors.push('manifest.foundation.contract is required.');
else await validateContract(foundation.id, foundation.contract);
if (!Array.isArray(foundation.sources) || foundation.sources.length === 0) errors.push('manifest.foundation.sources must contain CSS sources.');
for (const source of list(foundation.sources)) {
  if (!source.startsWith('foundation/') || !source.endsWith('.css')) errors.push(`Foundation source must be CSS inside foundation/: ${source}`);
  if (await requireFile(source, 'Foundation source')) {
    const content = await readText(source);
    if (/<[a-z][^>]*>/i.test(content)) errors.push(`Foundation source contains HTML: ${source}`);
    if (manifest.classPrefix && new RegExp(`\\.${manifest.classPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(content)) {
      errors.push(`Foundation must not define Pack component classes: ${source}`);
    }
  }
}

for (const [category, provider] of Object.entries(isObject(manifest.providers) ? manifest.providers : {})) {
  if (!isObject(provider)) {
    errors.push(`Provider must be an object: ${category}`);
    continue;
  }
  if (!Array.isArray(provider.compatibleFoundations) || provider.compatibleFoundations.some((id) => typeof id !== 'string')) {
    errors.push(`Provider compatibleFoundations must be an array of ids: ${category}`);
  } else if (!provider.compatibleFoundations.includes(foundation.id)) {
    errors.push(`Provider is not compatible with declared foundation: ${category} -> ${foundation.id}`);
  }
}

const components = isObject(manifest.components) ? manifest.components : {};
const patterns = isObject(manifest.patterns) ? manifest.patterns : {};
const presets = isObject(manifest.presets) ? manifest.presets : {};
if (Object.keys(patterns).length && !await directoryExists('patterns')) errors.push('Patterns registry requires a patterns/ directory.');
if (Object.keys(presets).length && !await directoryExists('presets')) errors.push('Presets registry requires a presets/ directory.');

const registries = { ...components, ...patterns, ...presets };
for (const [id, entry] of Object.entries(registries)) {
  if (!isObject(entry)) {
    errors.push(`Registry entry must be an object: ${id}`);
    continue;
  }
  for (const field of ['requires', 'optional', 'uses', 'assets', 'vendor', 'runtime']) {
    if (entry[field] !== undefined && (!Array.isArray(entry[field]) || entry[field].some((value) => typeof value !== 'string'))) {
      errors.push(`${id}.${field} must be an array of strings.`);
    }
  }
  let expectedContract;
  let expectedSource;
  let category;
  if (components[id]) {
    category = entry.category;
    const prefix = `${category}.`;
    if (!category || !id.startsWith(prefix)) errors.push(`Component id must start with its category: ${id}`);
    const leaf = id.startsWith(prefix) ? id.slice(prefix.length) : id;
    expectedContract = `components/${category}/${leaf}/COMPONENT.md`;
    expectedSource = `components/${category}/${leaf}/component.html`;
  } else if (patterns[id]) {
    const leaf = id.replace(/^pattern\./, '');
    if (leaf === id) errors.push(`Pattern id must start with pattern.: ${id}`);
    expectedContract = `patterns/${leaf}/PATTERN.md`;
    expectedSource = `patterns/${leaf}/pattern.html`;
  } else {
    const leaf = id.replace(/^preset\./, '');
    if (leaf === id) errors.push(`Preset id must start with preset.: ${id}`);
    expectedContract = `presets/${leaf}/PRESET.md`;
    expectedSource = `presets/${leaf}/seed.html`;
  }
  if (entry.contract !== expectedContract) errors.push(`${id} contract must use conventional path: ${expectedContract}`);
  if (entry.source !== expectedSource) errors.push(`${id} source must use conventional path: ${expectedSource}`);
  if (typeof entry.contract === 'string') await validateContract(id, entry.contract, category);
  if (typeof entry.source === 'string' && await requireFile(entry.source, `${id} implementation`)) await readText(entry.source);
  if (entry.adapter !== undefined) {
    if (!components[id]) errors.push(`Only components may declare adapters: ${id}`);
    if (typeof entry.adapter !== 'string' || !await requireFile(entry.adapter, `${id} adapter`)) continue;
    const adapter = await readText(entry.adapter);
    const ownDirectory = slash(path.dirname(expectedSource));
    const dependencyAdapters = [...list(entry.requires), ...list(entry.optional)]
      .map((dependency) => components[dependency]?.adapter)
      .filter(Boolean);
    if (!entry.adapter.startsWith(`${ownDirectory}/`) && !dependencyAdapters.includes(entry.adapter)) {
      errors.push(`${id} adapter must live in its own leaf or come from a declared dependency: ${entry.adapter}`);
    }
    const forbidden = [
      [/\bPrototypeViewers\b/, 'accesses PrototypeViewers'],
      [/\b(?:localStorage|sessionStorage)\b/, 'persists browser state'],
      [/\b(?:indexedDB|document\.cookie)\b/, 'uses browser persistence'],
      [/\b(?:fetch|XMLHttpRequest|WebSocket)\b/, 'acquires network state'],
      [/\b(?:location|URLSearchParams)\b/, 'parses location or URLs'],
      [/(?:window|document)(?:\.|\[['"])(?:addEventListener|on[a-z]+)\b/, 'registers a global event handler']
    ];
    const adapterBody = stripJsComments(adapter);
    for (const [pattern, reason] of forbidden) {
      if (pattern.test(adapterBody)) errors.push(`${id} adapter ${reason}: ${entry.adapter}`);
    }
  }
  for (const dependency of [...list(entry.requires), ...list(entry.optional), ...list(entry.uses)]) {
    if (!registries[dependency]) errors.push(`${id} references unknown dependency: ${dependency}`);
  }
  for (const asset of [...list(entry.assets), ...list(entry.vendor), ...list(entry.runtime)]) {
    await requireFile(asset, `${id} skill-level resource`, skillDirectory);
  }
}

for (const [id, entry] of Object.entries(components)) {
  if (!isObject(manifest.providers) || !manifest.providers[entry.category]) {
    errors.push(`${id} category has no provider declaration: ${entry.category}`);
  }
}

for (const [id, entry] of Object.entries({ ...patterns, ...presets })) {
  for (const dependency of [...list(entry.requires), ...list(entry.optional), ...list(entry.uses)]) {
    if (components[dependency]?.visibility === 'internal') errors.push(`${id} must not select internal component directly: ${dependency}`);
  }
}

const visited = new Set();
function visit(id, stack = []) {
  if (visited.has(id)) return;
  const cycleAt = stack.indexOf(id);
  if (cycleAt >= 0) {
    errors.push(`Dependency cycle: ${[...stack.slice(cycleAt), id].join(' -> ')}`);
    return;
  }
  const entry = registries[id];
  if (!entry) return;
  for (const dependency of [...list(entry.requires), ...list(entry.uses)]) visit(dependency, [...stack, id]);
  visited.add(id);
}
for (const id of Object.keys(registries)) visit(id);

if (strict) {
  for (const entry of await readdir(path.join(packDirectory, 'components'), { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.html')) errors.push(`Category aggregate HTML is forbidden: components/${entry.name}`);
  }

  const conventional = (await walk('components')).concat(await walk('patterns'), await walk('presets'))
    .filter((file) => /\/(?:COMPONENT|PATTERN|PRESET)\.md$|\/(?:component|pattern|seed)\.html$|\/state-adapter\.js$/.test(file));
  for (const file of conventional) if (!referencedFiles.has(file)) errors.push(`Orphan Pack resource is not registered in manifest: ${file}`);

  const textFiles = [...new Set([
    ...list(foundation.sources),
    ...Object.values(registries).flatMap((entry) => [entry.source, entry.adapter].filter(Boolean))
  ])];
  const customProperties = new Set();
  const uses = [];
  for (const file of textFiles) {
    const source = await readText(file);
    if (/https?:\/\//i.test(source)) errors.push(`Pack implementation must not reference external URLs: ${file}`);
    for (const match of source.matchAll(CSS_CUSTOM_PROPERTY_DECLARATION)) {
      customProperties.add(match[1]);
      if (!match[1].startsWith(`--${manifest.tokenPrefix}`)) errors.push(`Token declaration does not use manifest.tokenPrefix in ${file}: ${match[1]}`);
    }
    for (const match of source.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)/g)) uses.push([match[1], file]);
    if (/\.(?:html?|js)$/.test(file)) {
      for (const match of source.matchAll(/\bclass\s*=\s*["']([^"']+)["']/gi)) {
        for (const className of match[1].trim().split(/\s+/)) {
          if (className && !isAllowedClassName(className, manifest.classPrefix)) {
            errors.push(`Class does not use manifest.classPrefix in ${file}: ${className}`);
          }
        }
      }
    }
  }
  for (const [token, file] of uses) {
    const expected = `--${manifest.tokenPrefix}`;
    if (!token.startsWith(expected)) errors.push(`Token does not use manifest.tokenPrefix in ${file}: ${token}`);
    else if (!customProperties.has(token)) warnings.push(`Token has no declaration inside this Pack: ${token} used by ${file}`);
  }
}

finish();

function finish() {
  for (const warning of warnings) console.warn(`warning: ${warning}`);
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(errors.length ? 1 : 0);
  }
  console.log(`UI Pack valid: ${manifest.id} (${Object.keys(components).length} components, ${Object.keys(patterns).length} patterns, ${Object.keys(presets).length} presets).`);
}
