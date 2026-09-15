import { access } from 'node:fs/promises';
import path from 'node:path';

export const PACK_SOURCE_FILE = '.pack-source.json';

export function readOption(argv, name, fallback = '') {
  const prefix = `--${name}=`;
  const match = argv.find((value) => value.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

export function hasFlag(argv, name) {
  return argv.includes(`--${name}`);
}

export function exitWithJson(payload, code) {
  console.log(JSON.stringify(payload, null, 2));
  process.exit(code);
}

export async function pathExists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

export async function readPackOrigin(packDirectory) {
  if (!await pathExists(path.join(packDirectory, 'manifest.json'))) return null;
  if (await pathExists(path.join(packDirectory, PACK_SOURCE_FILE))) return 'installed';
  return 'local';
}
