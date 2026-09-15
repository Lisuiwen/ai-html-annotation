import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const slash = (value) => value.split(path.sep).join('/');

async function collectFiles(directory, relativeDirectory = '') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relativePath = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(absolutePath, relativePath));
    } else {
      files.push({ relativePath: slash(relativePath), absolutePath });
    }
  }
  return files;
}

function padOctal(value, size) {
  return value.toString(8).padStart(size - 1, '0') + '\0';
}

function createTarHeader(name, size) {
  const header = Buffer.alloc(512, 0);
  header.write(name.slice(0, 100), 0, 'utf8');
  header.write('0000644\0', 100, 'utf8');
  header.write('0000000\0', 108, 'utf8');
  header.write('0000000\0', 116, 'utf8');
  header.write(padOctal(size, 12), 124, 'utf8');
  header.write(padOctal(Math.floor(Date.now() / 1000), 12), 136, 'utf8');
  header.write('        ', 148, 'utf8');
  header.write('0', 156, 'utf8');
  header.write('ustar\0', 257, 'utf8');
  header.write('00', 263, 'utf8');
  let checksum = 0;
  for (let index = 0; index < 512; index += 1) {
    checksum += header[index];
  }
  header.write(padOctal(checksum, 7), 148, 'utf8');
  return header;
}

function encodeTar(entries) {
  const chunks = [];
  for (const entry of entries) {
    const content = Buffer.isBuffer(entry.content) ? entry.content : Buffer.from(entry.content);
    chunks.push(createTarHeader(entry.name, content.length));
    chunks.push(content);
    const padding = (512 - (content.length % 512)) % 512;
    if (padding) chunks.push(Buffer.alloc(padding));
  }
  chunks.push(Buffer.alloc(512));
  return Buffer.concat(chunks);
}

/**
 * Build a gzip tarball shaped like GitHub codeload archives for install-pack tests.
 */
export async function buildPackTarball({
  packDirectory,
  packId,
  packPath = '.html-prototype/packs',
  archiveRoot = 'fixture-repo-master'
}) {
  const prefix = `${archiveRoot}/${packPath}/${packId}/`;
  const files = await collectFiles(packDirectory);
  const entries = [];
  for (const file of files) {
    entries.push({
      name: `${prefix}${file.relativePath}`,
      content: await readFile(file.absolutePath)
    });
  }
  return gzipSync(encodeTar(entries));
}
