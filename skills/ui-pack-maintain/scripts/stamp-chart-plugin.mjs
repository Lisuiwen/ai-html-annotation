#!/usr/bin/env node
/**
 * Stamp the ECharts pack plugin into host UI packs.
 * The plugin is not installable. Edit .html-prototype/pack-plugins/echarts, then run this script.
 */
import { readFile, writeFile, cp, mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..', '..', '..');
const pluginRoot = path.join(repositoryRoot, '.html-prototype', 'pack-plugins', 'echarts');
const packRoot = path.join(repositoryRoot, '.html-prototype', 'packs');

export function renderPluginText(text, host) {
  return String(text)
    .replaceAll('{{themeVars}}', JSON.stringify(host.themeVars))
    .replaceAll('{{prefix}}', host.prefix);
}

export function applyChartFragment(manifest, fragment, host) {
  const next = structuredClone(manifest);
  next.version = host.version;
  next.schemaVersion = host.schemaVersion;
  next.delivery = { ...(next.delivery || {}) };
  for (const [source, target] of Object.entries(fragment.delivery || {})) {
    next.delivery[source] = target;
  }
  for (const [id, entry] of Object.entries(fragment.components || {})) {
    const component = structuredClone(entry);
    if (!host.optionalCard) delete component.optional;
    if (host.atomWidth && component.atoms?.chart) component.atoms.chart.width = host.atomWidth;
    next.components[id] = component;
  }
  return next;
}

async function walk(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute, relative));
    else if (entry.isFile()) files.push(relative);
  }
  return files;
}

function isText(relativePath) {
  return !relativePath.startsWith('vendor/') && !relativePath.endsWith('.min.js');
}

async function stampHost(host, fragment) {
  const filesRoot = path.join(pluginRoot, 'files');
  const targetRoot = path.join(packRoot, host.id);
  const manifestPath = path.join(targetRoot, 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (manifest.id !== host.id) throw new Error(`Host id mismatch: ${host.id} vs ${manifest.id}`);
  for (const relative of await walk(filesRoot)) {
    const from = path.join(filesRoot, relative);
    const to = path.join(targetRoot, relative);
    await mkdir(path.dirname(to), { recursive: true });
    if (!isText(relative)) {
      await cp(from, to);
      continue;
    }
    let text = renderPluginText(await readFile(from, 'utf8'), host);
    if (!host.optionalCard && relative.endsWith('/COMPONENT.md')) {
      text = text.replace(/^optional:.*\r?\n/m, '');
    }
    if (relative === 'runtime/charts/bridge.js') {
      text = `/* Stamped from pack-plugins/echarts into ${host.id}. Edit the plugin, then re-run stamp-chart-plugin.mjs. */\n${text}`;
    }
    await writeFile(to, text, 'utf8');
  }
  const stamped = applyChartFragment(manifest, fragment, host);
  await writeFile(manifestPath, `${JSON.stringify(stamped, null, 2)}\n`, 'utf8');
  return targetRoot;
}

async function main() {
  const hosts = JSON.parse(await readFile(path.join(pluginRoot, 'hosts.json'), 'utf8')).hosts;
  const fragment = JSON.parse(await readFile(path.join(pluginRoot, 'fragment.json'), 'utf8'));
  for (const host of hosts) {
    const info = await stat(path.join(packRoot, host.id, 'manifest.json'));
    if (!info.isFile()) throw new Error(`Missing host pack: ${host.id}`);
    const target = await stampHost(host, fragment);
    console.log(`stamped ${host.id} -> ${target}`);
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
