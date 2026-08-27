import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const packDirectory = path.resolve(toolDirectory, '..');
const manifestPath = path.join(packDirectory, 'manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const errors = [];

/** 检查 manifest 中引用的相对文件是否存在。 */
async function requireFile(relativePath, label) {
  try {
    const entry = await stat(path.join(packDirectory, relativePath));
    if (!entry.isFile()) errors.push(`${label} 不是文件: ${relativePath}`);
  } catch {
    errors.push(`${label} 不存在: ${relativePath}`);
  }
}

/** 检查文本资源使用 UTF-8、无 BOM，且实现文件不引入外部 URL。 */
async function validateTextFile(relativePath) {
  const buffer = await readFile(path.join(packDirectory, relativePath));
  if (buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    errors.push(`文件不得包含 UTF-8 BOM: ${relativePath}`);
  }
  const content = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  if (/https?:\/\//i.test(content)) errors.push(`实现文件不得引用外部 URL: ${relativePath}`);
}

/** 读取契约 frontmatter 中的 id，验证索引和叶子契约没有漂移。 */
async function validateContractId(id, relativePath) {
  const content = await readFile(path.join(packDirectory, relativePath), 'utf8');
  const match = content.match(/^---\s*[\s\S]*?^id:\s*([^\r\n]+)[\s\S]*?^---/m);
  if (!match || match[1].trim() !== id) {
    errors.push(`契约 id 不匹配: ${id} -> ${relativePath}`);
  }
}

const registries = {
  ...manifest.components,
  ...manifest.patterns,
  ...manifest.presets
};

await requireFile(manifest.foundation.contract, 'Foundation 契约');
for (const source of manifest.foundation.sources) {
  await requireFile(source, 'Foundation 源');
  await validateTextFile(source);
}

const componentRootEntries = await readdir(path.join(packDirectory, 'components'), { withFileTypes: true });
for (const entry of componentRootEntries) {
  if (entry.isFile() && entry.name.endsWith('.html')) {
    errors.push(`不得保留类别聚合文件: components/${entry.name}`);
  }
}

for (const [id, entry] of Object.entries(registries)) {
  await requireFile(entry.contract, `${id} 契约`);
  await requireFile(entry.source, `${id} 实现`);
  await validateTextFile(entry.contract);
  await validateTextFile(entry.source);
  if (entry.adapter) {
    await requireFile(entry.adapter, `${id} 状态 Adapter`);
    await validateTextFile(entry.adapter);
  }
  await validateContractId(id, entry.contract);

  for (const dependency of [...(entry.requires ?? []), ...(entry.optional ?? []), ...(entry.uses ?? [])]) {
    if (!registries[dependency]) errors.push(`${id} 引用了未知依赖: ${dependency}`);
  }
}

for (const [id, entry] of Object.entries({ ...manifest.patterns, ...manifest.presets })) {
  for (const dependency of [...(entry.requires ?? []), ...(entry.optional ?? []), ...(entry.uses ?? [])]) {
    if (manifest.components[dependency]?.visibility === 'internal') {
      errors.push(`${id} 不得直接引用私有组件: ${dependency}`);
    }
  }
}

/** 深度优先检查强依赖和 uses 的循环。 */
function visit(id, visiting = new Set(), visited = new Set()) {
  if (visited.has(id)) return;
  if (visiting.has(id)) {
    errors.push(`检测到循环依赖: ${[...visiting, id].join(' -> ')}`);
    return;
  }
  visiting.add(id);
  const entry = registries[id];
  for (const dependency of [...(entry.requires ?? []), ...(entry.uses ?? [])]) {
    visit(dependency, new Set(visiting), visited);
  }
  visited.add(id);
}

for (const id of Object.keys(registries)) visit(id);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`UI Pack 有效：${Object.keys(manifest.components).length} 个组件，${Object.keys(manifest.patterns).length} 个 Pattern，${Object.keys(manifest.presets).length} 个 Preset。`);
}
