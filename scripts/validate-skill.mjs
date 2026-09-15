/** Aggregate Skill metadata, links, browser script syntax, UI pack, example, and runtime contract validation. */
import { spawnSync } from 'node:child_process';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const repositoryDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillDirectory = path.join(repositoryDirectory, 'skills', 'html-prototype-build');
const examplesDirectory = path.join(repositoryDirectory, 'examples');

/** Recursively list all files under a directory. */
async function listFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(target));
    else files.push(target);
  }
  return files;
}

/** Validate required SKILL.md frontmatter and directory naming. */
async function validateMetadata() {
  const source = await readFile(path.join(skillDirectory, 'SKILL.md'), 'utf8');
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error('SKILL.md is missing YAML frontmatter.');
  const fields = [...match[1].matchAll(/^([a-z_-]+):\s*(.+)$/gm)].map((item) => item[1]);
  if (!fields.includes('name') || !fields.includes('description')) throw new Error('SKILL.md is missing name or description.');
  if (fields.some((field) => !['name', 'description'].includes(field))) throw new Error('SKILL.md frontmatter may contain only name and description.');
  if (!/^html-prototype-build$/.test(path.basename(skillDirectory))) throw new Error('Skill directory name does not match naming rules.');
}

/** Compile browser scripts without ESM import via VM to avoid spawning child processes. */
async function validateBrowserScripts(files) {
  for (const file of files.filter((target) => target.endsWith('.js') && !target.includes(`${path.sep}vendor${path.sep}`))) {
    const source = await readFile(file, 'utf8');
    new vm.Script(source, { filename: file });
  }
}

function markdownSlug(value) {
  return String(value)
    .replace(/<[^>]*>/g, '')
    .replace(/[`*_~]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const headingCache = new Map();
async function markdownHeadings(file) {
  if (headingCache.has(file)) return headingCache.get(file);
  const source = await readFile(file, 'utf8');
  const slugs = new Set();
  const counts = new Map();
  for (const match of source.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)) {
    const base = markdownSlug(match[1]);
    if (!base) continue;
    const count = counts.get(base) || 0;
    slugs.add(count ? `${base}-${count}` : base);
    counts.set(base, count + 1);
  }
  headingCache.set(file, slugs);
  return slugs;
}

/** Validate local relative Markdown links and heading anchors. */
async function validateMarkdownLinks(files) {
  for (const file of files.filter((target) => target.endsWith('.md'))) {
    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const target = match[1].trim();
      if (/^[a-z]+:/i.test(target)) continue;
      const hash = target.indexOf('#');
      const href = hash >= 0 ? target.slice(0, hash) : target;
      const fragment = hash >= 0 ? target.slice(hash + 1) : '';
      const resolved = href ? path.resolve(path.dirname(file), decodeURIComponent(href)) : file;
      try {
        await stat(resolved);
      } catch {
        throw new Error(`Markdown link missing: ${path.relative(repositoryDirectory, file)} -> ${href || target}`);
      }
      if (fragment && resolved.endsWith('.md')) {
        const slug = markdownSlug(decodeURIComponent(fragment));
        const headings = await markdownHeadings(resolved);
        if (!headings.has(slug)) {
          throw new Error(`Markdown heading missing: ${path.relative(repositoryDirectory, file)} -> ${target}`);
        }
      }
    }
  }
}

const skillFiles = await listFiles(skillDirectory);
const exampleFiles = await listFiles(examplesDirectory);
const rootMarkdownFiles = ['README.md', 'README.zh-CN.md'].map((name) => path.join(repositoryDirectory, name));
await validateMetadata();
await validateMarkdownLinks([...skillFiles, ...exampleFiles, ...rootMarkdownFiles]);
await validateBrowserScripts([...skillFiles, ...exampleFiles]);

const packRootDirectory = path.join(repositoryDirectory, '.html-prototype', 'packs');
const packValidator = path.join(repositoryDirectory, 'skills', 'ui-pack-maintain', 'scripts', 'validate-pack.mjs');
for (const entry of await readdir(packRootDirectory, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const packDirectory = path.join(packRootDirectory, entry.name);
  try {
    await stat(path.join(packDirectory, 'manifest.json'));
  } catch {
    continue;
  }
  const result = spawnSync(process.execPath, [
    packValidator,
    `--pack=${packDirectory}`
  ], { stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`UI Pack validation failed for ${entry.name}; see errors above.`);
  }
}

const registryGenerator = path.join(repositoryDirectory, 'skills', 'ui-pack-maintain', 'scripts', 'generate-registry.mjs');
for (const output of [
  path.join(repositoryDirectory, '.html-prototype', 'packs', 'registry.json'),
  path.join(skillDirectory, 'ui', 'pack-registry.fallback.json')
]) {
  const registryCheck = spawnSync(process.execPath, [registryGenerator, '--check', `--output=${output}`], { stdio: 'inherit' });
  if (registryCheck.status !== 0) {
    throw new Error(`pack registry is stale: ${output}; run node skills/ui-pack-maintain/scripts/generate-registry.mjs`);
  }
}

await import('../tests/scripts/resolve-pack.test.mjs');
await import('../tests/scripts/install-pack.test.mjs');
await import('../tests/scripts/pack-install-ref.test.mjs');
await import('../tests/scripts/schema-versions.test.mjs');
await import('../tests/e2e/pack-publish.e2e.mjs');
await import('../tests/e2e/pack-install.e2e.mjs');
await import('../tests/e2e/pack-validate.e2e.mjs');
await import('../tests/e2e/pack-resolve.e2e.mjs');
await import('../tests/packs/admin-desktop/charts.test.mjs');
await import('../tests/runtime/index.test.mjs');
await import('../tests/contracts/runtime.test.mjs');
await import('../tests/examples/minimal-notes-system/prototype.test.mjs');
console.log('Skill validation passed.');
