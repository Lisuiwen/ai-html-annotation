export function parseFrontmatter(source, missing = 'empty') {
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return missing === 'null' ? null : {};
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([a-zA-Z][\w-]*):\s*(.*)$/);
    if (pair) fields[pair[1]] = pair[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return fields;
}
