/**
 * List and install UI packs from the published registry. This is the only
 * html-prototype-build script that performs network I/O.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import {
  PACK_REF_FALLBACK_BRANCH,
  planPackRefFallback
} from './_pack-install-ref.mjs';
import {
  PACK_SOURCE_FILE,
  exitWithJson,
  hasFlag,
  pathExists,
  readOption,
  readPackOrigin
} from './_script-utils.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const skillDirectory = path.resolve(scriptDirectory, '..');
const fallbackRegistryPath = path.join(skillDirectory, 'ui', 'pack-registry.fallback.json');
const DEFAULT_REPOSITORY = 'Lisuiwen/ai-html-annotation';
const DEFAULT_BRANCH = PACK_REF_FALLBACK_BRANCH;
const DEFAULT_PACK_PATH = '.html-prototype/packs';
const argv = process.argv.slice(2);

function printUsage() {
  console.error('Usage:');
  console.error('  node install-pack.mjs --list-remote [--registry=<url-or-path>]');
  console.error('  node install-pack.mjs --pack=<id> [--dest=user|project|<pack-root>] [--ref=<tag>] [--registry=<url-or-path>] [--dry-run] [--force]');
  console.error('  node install-pack.mjs --pack=<id> --from-local=<pack-directory> [--dest=user|project|<pack-root>] [--force]');
}

async function readRegistrySource(registryOption) {
  const envRegistry = process.env.HTML_PROTOTYPE_PACK_REGISTRY || '';
  const source = registryOption || envRegistry || `https://raw.githubusercontent.com/${DEFAULT_REPOSITORY}/${DEFAULT_BRANCH}/${DEFAULT_PACK_PATH}/registry.json`;
  if (/^https?:\/\//i.test(source)) {
    const response = await fetch(source);
    if (!response.ok) throw new Error(`registry fetch failed (${response.status}): ${source}`);
    return { registry: JSON.parse(await response.text()), source, mode: 'remote' };
  }
  const filePath = path.resolve(source);
  return { registry: JSON.parse(await readFile(filePath, 'utf8')), source: filePath, mode: 'local' };
}

async function loadRegistry(registryOption) {
  try {
    return await readRegistrySource(registryOption);
  } catch (error) {
    const fallback = JSON.parse(await readFile(fallbackRegistryPath, 'utf8'));
    return {
      registry: fallback,
      source: fallbackRegistryPath,
      mode: 'bundled-fallback',
      warning: error.message
    };
  }
}

function resolveDestination(destOption) {
  const dest = destOption || 'user';
  if (dest === 'project') {
    return { label: 'project', dir: path.join(process.cwd(), '.html-prototype', 'packs') };
  }
  if (dest === 'user') {
    return { label: 'user-cache', dir: path.join(os.homedir(), '.html-prototype', 'packs') };
  }
  if (dest.includes('/') || dest.includes('\\') || path.isAbsolute(dest)) {
    return { label: 'explicit-root', dir: path.resolve(dest) };
  }
  throw new Error(`unknown --dest value: ${dest}`);
}

async function assertInstallAllowed(targetDirectory, force) {
  if (await readPackOrigin(targetDirectory) === 'local' && !force) {
    exitWithJson({
      error: 'install-blocked',
      reason: 'target-contains-local-pack',
      targetDirectory,
      hint: 'Local packs are not backed up remotely. Re-run with --force to overwrite, or choose a different pack id.'
    }, 3);
  }
}

async function writePackSource(targetDirectory, metadata) {
  await writeFile(path.join(targetDirectory, PACK_SOURCE_FILE), `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');
}

function tarballUrl(repository, ref) {
  const sourceBase = process.env.HTML_PROTOTYPE_PACK_SOURCE;
  if (sourceBase) return `${sourceBase.replace(/\/$/, '')}/${ref}.tar.gz`;
  return `https://codeload.github.com/${repository}/tar.gz/${ref}`;
}

function parseTarEntryName(header) {
  const nameRaw = header.subarray(0, 100).toString('utf8').replace(/\0.*$/, '');
  const prefix = header.subarray(345, 500).toString('utf8').replace(/\0.*$/, '');
  const name = prefix ? `${prefix}/${nameRaw}` : nameRaw;
  return name.split(path.sep).join('/');
}

function parseTar(buffer) {
  const entries = [];
  let offset = 0;
  while (offset + 512 <= buffer.length) {
    const header = buffer.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const typeflag = String.fromCharCode(header[156] || 0);
    let name = parseTarEntryName(header);
    let size = Number.parseInt(header.subarray(124, 136).toString('utf8').replace(/\0.*$/, '').trim(), 8) || 0;
    offset += 512;

    if (typeflag === 'x' || typeflag === 'g') {
      offset += Math.ceil(size / 512) * 512;
      continue;
    }

    if (typeflag === 'L') {
      const longName = buffer.subarray(offset, offset + size).toString('utf8').replace(/\0.*$/, '');
      offset += Math.ceil(size / 512) * 512;
      const nextHeader = buffer.subarray(offset, offset + 512);
      name = longName.split(path.sep).join('/');
      size = Number.parseInt(nextHeader.subarray(124, 136).toString('utf8').replace(/\0.*$/, '').trim(), 8) || 0;
      offset += 512;
    }

    const content = size > 0 ? buffer.subarray(offset, offset + size) : Buffer.alloc(0);
    offset += Math.ceil(size / 512) * 512;
    if (name && typeflag !== '5') entries.push({ name, size, content });
  }
  return entries;
}

async function assertPackIntegrity(targetDirectory, manifest) {
  const registry = { ...(manifest.components ?? {}), ...(manifest.patterns ?? {}), ...(manifest.presets ?? {}) };
  const delivery = manifest.delivery ?? {};
  const sources = new Set();
  for (const entry of Object.values(registry)) {
    if (!entry || typeof entry !== 'object') continue;
    for (const item of [...(entry.vendor ?? []), ...(entry.runtime ?? []), ...(entry.assets ?? [])]) sources.add(item);
  }
  const missing = [];
  for (const source of sources) {
    if (!await pathExists(path.join(targetDirectory, source))) missing.push(source);
    if (!delivery[source]) missing.push(`delivery:${source}`);
  }
  if (missing.length) throw new Error(`installed pack is incomplete: ${missing.join(', ')}`);
}

function stripArchiveRoot(entries) {
  const first = entries.find((entry) => entry.name && !entry.name.endsWith('/'));
  if (!first) return entries;
  const root = first.name.split('/')[0];
  return entries
    .filter((entry) => entry.name.startsWith(`${root}/`))
    .map((entry) => ({ ...entry, name: entry.name.slice(root.length + 1) }));
}

async function copyDirectory(sourceDirectory, targetDirectory) {
  await mkdir(targetDirectory, { recursive: true });
  for (const entry of await readdir(sourceDirectory, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDirectory, entry.name);
    const targetPath = path.join(targetDirectory, entry.name);
    if (entry.isDirectory()) await copyDirectory(sourcePath, targetPath);
    else await writeFile(targetPath, await readFile(sourcePath));
  }
}

async function fetchPackFilesFromTarball({ repository, ref, packPath, packId }) {
  const url = tarballUrl(repository, ref);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`tarball fetch failed (${response.status}): ${url}`);
  const archive = gunzipSync(Buffer.from(await response.arrayBuffer()));
  const prefix = `${packPath}/${packId}/`;
  const files = stripArchiveRoot(parseTar(archive)).filter((entry) => entry.name.startsWith(prefix) && entry.size > 0);
  if (!files.length) throw new Error(`pack path not found in archive: ${prefix}`);
  return { url, prefix, files };
}

async function installFromTarball({
  repository,
  ref,
  packId,
  packPath,
  destinationDirectory,
  registrySource,
  dryRun,
  force
}) {
  const requestedRef = ref;
  let refFallback = null;
  let tarball;
  try {
    tarball = await fetchPackFilesFromTarball({ repository, ref: requestedRef, packPath, packId });
  } catch (error) {
    refFallback = planPackRefFallback(requestedRef, error);
    if (!refFallback) throw error;
    tarball = await fetchPackFilesFromTarball({
      repository,
      ref: refFallback.actual,
      packPath,
      packId
    });
  }
  const actualRef = refFallback?.actual ?? requestedRef;
  const { url, prefix, files } = tarball;

  const targetDirectory = path.join(destinationDirectory, packId);
  await assertInstallAllowed(targetDirectory, force);
  if (dryRun) {
    return {
      mode: 'tarball',
      url,
      ref: actualRef,
      requestedRef,
      refFallback,
      targetDirectory,
      files: files.length,
      manifest: null
    };
  }
  await rm(targetDirectory, { recursive: true, force: true });
  await mkdir(targetDirectory, { recursive: true });
  for (const file of files) {
    const relative = file.name.slice(prefix.length);
    const targetPath = path.join(targetDirectory, relative);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, file.content);
  }
  const hash = createHash('sha256');
  for (const file of files) hash.update(file.name).update(file.content);
  await writePackSource(targetDirectory, {
    packId,
    ref: actualRef,
    requestedRef: refFallback ? requestedRef : undefined,
    refFallback: refFallback ?? undefined,
    repository,
    registrySource,
    tarballUrl: url,
    installedAt: new Date().toISOString(),
    checksum: `sha256:${hash.digest('hex')}`
  });
  const manifest = JSON.parse(await readFile(path.join(targetDirectory, 'manifest.json'), 'utf8'));
  await assertPackIntegrity(targetDirectory, manifest);
  return {
    mode: 'tarball',
    url,
    ref: actualRef,
    requestedRef,
    refFallback,
    targetDirectory,
    files: files.length,
    manifest
  };
}

async function installFromLocal(localDirectory, destinationDirectory, packId, dryRun, force) {
  const manifest = JSON.parse(await readFile(path.join(localDirectory, 'manifest.json'), 'utf8'));
  if (packId && manifest.id !== packId) {
    exitWithJson({
      error: 'pack-id-mismatch',
      requested: packId,
      manifestId: manifest.id,
      source: localDirectory
    }, 2);
  }
  const targetDirectory = path.join(destinationDirectory, manifest.id);
  await assertInstallAllowed(targetDirectory, force);
  if (dryRun) return { mode: 'local', source: localDirectory, targetDirectory, manifest };
  await rm(targetDirectory, { recursive: true, force: true });
  await copyDirectory(localDirectory, targetDirectory);
  await assertPackIntegrity(targetDirectory, manifest);
  return { mode: 'local', source: localDirectory, targetDirectory, manifest };
}

if (hasFlag(argv, 'help') || (!hasFlag(argv, 'list-remote') && !readOption(argv, 'pack'))) {
  printUsage();
  process.exit(1);
}

const registryOption = readOption(argv, 'registry');

if (hasFlag(argv, 'list-remote')) {
  const loaded = await loadRegistry(registryOption);
  exitWithJson({
    source: loaded.source,
    mode: loaded.mode,
    warning: loaded.warning ?? null,
    registry: loaded.registry,
    installHint: 'node <skill-root>/scripts/install-pack.mjs --pack=<id>',
    defaultDest: '~/.html-prototype/packs/<id>/',
    manualHint: 'End users: ~/.html-prototype/packs/<id>/ (local only). Project developers: <repo>/.html-prototype/packs/<id>/ (committed).'
  }, 0);
}

const packId = readOption(argv, 'pack');
const fromLocal = readOption(argv, 'from-local');
const destination = resolveDestination(readOption(argv, 'dest', 'user'));
const dryRun = hasFlag(argv, 'dry-run');
const force = hasFlag(argv, 'force');

let result;
if (fromLocal) {
  result = await installFromLocal(path.resolve(fromLocal), destination.dir, packId, dryRun, force);
} else {
  const loaded = await loadRegistry(registryOption);
  const entry = (loaded.registry.packs ?? []).find((pack) => pack.id === packId);
  if (!entry) {
    exitWithJson({
      error: 'pack-not-in-registry',
      requested: packId,
      available: (loaded.registry.packs ?? []).map((pack) => pack.id),
      registrySource: loaded.source
    }, 2);
  }
  result = await installFromTarball({
    repository: loaded.registry.source?.repository || DEFAULT_REPOSITORY,
    ref: readOption(argv, 'ref', entry.ref),
    packId,
    packPath: loaded.registry.source?.packPath || DEFAULT_PACK_PATH,
    destinationDirectory: destination.dir,
    registrySource: loaded.source,
    dryRun,
    force
  });
}

exitWithJson({
  pack: result.manifest?.id ?? packId,
  version: result.manifest?.version ?? null,
  schemaVersion: result.manifest?.schemaVersion ?? null,
  destination: destination.label,
  targetDirectory: result.targetDirectory,
  dryRun,
  warning: result.refFallback
    ? `Pinned ref ${result.refFallback.requested} unavailable; installed from ${result.refFallback.actual}.`
    : null,
  ...result
}, 0);
