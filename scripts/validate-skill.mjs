/** 聚合 Skill 元数据、链接、浏览器脚本语法、UI Pack、示例和运行时契约验证。 */
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const repositoryDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillDirectory = path.join(repositoryDirectory, 'skills', 'html-prototype-build');
const examplesDirectory = path.join(repositoryDirectory, 'examples');

/** 递归枚举目录中的全部文件。 */
async function listFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(target));
    else files.push(target);
  }
  return files;
}

/** 校验 SKILL.md 的必需 frontmatter 与目录命名。 */
async function validateMetadata() {
  const source = await readFile(path.join(skillDirectory, 'SKILL.md'), 'utf8');
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error('SKILL.md 缺少 YAML frontmatter。');
  const fields = [...match[1].matchAll(/^([a-z_-]+):\s*(.+)$/gm)].map((item) => item[1]);
  if (!fields.includes('name') || !fields.includes('description')) throw new Error('SKILL.md 缺少 name 或 description。');
  if (fields.some((field) => !['name', 'description'].includes(field))) throw new Error('SKILL.md frontmatter 只能包含 name 与 description。');
  if (!/^html-prototype-build$/.test(path.basename(skillDirectory))) throw new Error('Skill 目录名不符合命名规则。');
}

/** 使用 VM 编译不含 ESM import 的浏览器脚本，避免依赖派生进程。 */
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

/** 校验 Markdown 中本地相对链接及 Markdown 章节锚点。 */
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
        throw new Error(`Markdown 链接不存在：${path.relative(repositoryDirectory, file)} -> ${href || target}`);
      }
      if (fragment && resolved.endsWith('.md')) {
        const slug = markdownSlug(decodeURIComponent(fragment));
        const headings = await markdownHeadings(resolved);
        if (!headings.has(slug)) {
          throw new Error(`Markdown 章节不存在：${path.relative(repositoryDirectory, file)} -> ${target}`);
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
await import('../skills/html-prototype-build/ui/packs/admin-desktop/tools/validate-pack.mjs');
if (process.exitCode) {
  throw new Error('UI Pack 校验失败，详见上方错误输出。');
}
process.exitCode = 0;
await import('../tests/runtime/index.test.mjs');
await import('../tests/contracts/runtime.test.mjs');
await import('../tests/examples/minimal-notes/prototype.test.mjs');
console.log('Skill 统一验证通过。');
