import { cpSync, mkdtempSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function copyFixturePack(fixtureDirectory, prefix = 'pack-copy-') {
  const tempDirectory = mkdtempSync(path.join(os.tmpdir(), prefix));
  const targetDirectory = path.join(tempDirectory, path.basename(fixtureDirectory));
  cpSync(fixtureDirectory, targetDirectory, { recursive: true });
  return { tempDirectory, packDirectory: targetDirectory };
}
