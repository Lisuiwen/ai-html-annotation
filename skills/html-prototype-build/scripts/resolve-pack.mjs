/**
 * 根据 UI Pack manifest 解析 Component、Pattern 或 Preset 的最小强依赖闭包。
 * optional 依赖仅在调用方通过 --optional 显式选择时加入。
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const skillDirectory = path.resolve(scriptDirectory, '..');

/** 读取形如 --name=value 的命令行参数。 */
function readOption(name, fallback = '') {
  const prefix = `--${name}=`;
  const match = process.argv.slice(2).find((value) => value.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

/** 把逗号分隔的 ID 列表归一化为去重数组。 */
function parseIds(value) {
  return [...new Set(String(value || '').split(',').map((id) => id.trim()).filter(Boolean))];
}

/** 递归展开 requires 与 uses，并检测循环依赖。 */
function resolveClosure(registry, roots) {
  const resolved = [];
  const visited = new Set();

  function visit(id, stack = new Set()) {
    if (visited.has(id)) return;
    const entry = registry[id];
    if (!entry) throw new Error(`未知 UI 资源：${id}`);
    if (stack.has(id)) throw new Error(`检测到循环依赖：${[...stack, id].join(' -> ')}`);
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

/** 汇总 foundation、契约、实现和 Adapter 路径，供 Agent 精确加载。 */
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

/** 沿闭包汇总 skill 级 vendor / runtime / assets 交付物（路径相对 skill 根）。 */
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

const packId = readOption('pack', 'antd-admin');
const selectedIds = parseIds(readOption('select'));
const optionalIds = parseIds(readOption('optional'));
if (!selectedIds.length) {
  console.error('用法：node resolve-pack.mjs --select=<id[,id...]> [--optional=<id[,id...]>] [--pack=antd-admin]');
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
