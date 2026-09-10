#!/usr/bin/env node
/* Headless capture: one screenshot per explicit scenario.
   Viewer enters product-only mode at collapsed=1&product-only=1, hiding Mark, collapse control, and interaction badges. */
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const input = args.find((arg) => !arg.startsWith('--'));
const flag = (name, fallback) => {
  const hit = args.find((arg) => arg.startsWith('--' + name + '='));
  return hit ? hit.split('=').slice(1).join('=') : fallback;
};

const isDirectExecution = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
const htmlPath = input ? resolve(input) : '';

/* Ship screenshots separately from page runtime assets: screenshots live under screenshots/. */
const outDir = resolve(flag('out', htmlPath ? join(dirname(htmlPath), 'screenshots') : 'screenshots'));
const width = flag('width', '1440');
const height = flag('height', '900');

/* Resolve the single annotation data source: default <prototype-dir>/prototype/notes.snapshot.js, overridable via --snapshot=. */
const snapshotPath = resolve(flag('snapshot', htmlPath ? join(dirname(htmlPath), 'prototype', 'notes.snapshot.js') : 'prototype/notes.snapshot.js'));

/* Strictly read the static snapshot from the author server; refuse to execute any JavaScript inside. */
export function readNotes() {
  const code = readFileSync(snapshotPath, 'utf8');
  const match = code.match(/^\s*(?:(?:\/\*[\s\S]*?\*\/|\/\/[^\r\n]*(?:\r?\n|$))\s*)*window\.__PROTOTYPE_NOTES__\s*=\s*([\s\S]*?)\s*;\s*$/);
  if (!match) {
    throw new Error('Annotation data must be a single window.__PROTOTYPE_NOTES__ = <JSON>; assignment with no executable code.');
  }
  try {
    return JSON.parse(match[1]);
  } catch {
    throw new Error('__PROTOTYPE_NOTES__ in annotation data must be valid JSON.');
  }
}

/* Validate scenario id is safe as a cross-platform filename to avoid traversal, device names, and implicit overwrite. */
function assertSafeFileName(id) {
  if (typeof id !== 'string' || !id || id.length > 120) {
    throw new Error('Scenario ID must be a string of 1–120 characters.');
  }
  if (id === '.' || id === '..' || /[<>:"/\\|?*\u0000-\u001f]/.test(id) || /[. ]$/.test(id)) {
    throw new Error(`Scenario ID is not safe as a screenshot filename: ${id}`);
  }
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i.test(id)) {
    throw new Error(`Scenario ID matches a Windows reserved device name: ${id}`);
  }
  return id;
}

/* Extract capture scenarios from snapshot data; only explicitly declared scenarios are accepted. */
export function collectScenarios(notes) {
  if (!notes || !Array.isArray(notes.cards)) {
    throw new Error('Annotation data violates contract: missing cards array.');
  }
  if (!notes.scenarios || typeof notes.scenarios !== 'object') {
    throw new Error('snapshot must declare scenarios explicitly.');
  }
  const ids = Array.isArray(notes.scenarios)
    ? notes.scenarios.map((scenario) => scenario && (scenario.id || scenario.name))
    : Object.keys(notes.scenarios);
  if (ids.length === 0 || ids.some((id) => typeof id !== 'string' || !id)) {
    throw new Error('scenarios must include entries with valid IDs.');
  }
  return ids.map((id) => ({ id: assertSafeFileName(id), query: 'scene' }));
}

/* Capture each scenario with scene query param while collapsing the right rail and connectors. */
function shoot(shot, exe) {
  return new Promise((resolveShot) => {
    const url = pathToFileURL(htmlPath).href + '?' + shot.query + '=' + encodeURIComponent(shot.id) + '&collapsed=1&product-only=1';
    const outFile = resolve(outDir, shot.id + '.png');
    /* Double-check final path stays inside output dir in case name rules are relaxed later. */
    if (relative(outDir, outFile).startsWith('..')) {
      console.error(`✗ Unsafe screenshot output path: ${outFile}`);
      resolveShot(false);
      return;
    }
    const child = spawn(exe, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--window-size=' + width + ',' + height,
      '--virtual-time-budget=2000',
      '--screenshot=' + outFile,
      url
    ], { stdio: 'ignore' });
    child.on('error', () => {
      console.error(`✗ Failed to launch browser: ${exe}`);
      process.exitCode = 1;
      resolveShot(false);
    });
    /* Use close (stdio fully closed) not exit: Edge may delay writing the screenshot after process exit. */
    child.on('close', (code) => {
      if (code === 0) waitForFile(outFile, 4000).then((exists) => {
        if (exists) {
          console.log(`✓ [${shot.id}] ${outFile}`);
          resolveShot(true);
        } else {
          console.error(`✗ [${shot.id}] Screenshot file not created (exit ${code}): ${url}`);
          resolveShot(false);
        }
      });
      else {
        console.error(`✗ [${shot.id}] Screenshot failed (exit ${code}): ${url}`);
        resolveShot(false);
      }
    });
  });
}

/* Poll until screenshot file exists, up to timeout ms. */
function waitForFile(path, timeout) {
  return new Promise((resolveWait) => {
    const start = Date.now();
    (function check() {
      if (existsSync(path)) return resolveWait(true);
      if (Date.now() - start >= timeout) return resolveWait(false);
      setTimeout(check, 150);
    })();
  });
}

/* Probe common install paths for an available browser; prefer msedge. */
function resolveBrowser() {
  const explicit = flag('browser', '');
  if (explicit) return existsSync(explicit) ? explicit : null;
  const candidates = [
    'msedge',
    'chrome',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const path of candidates) {
    if (!path.includes('\\')) {
      if (commandExists(path)) return path;
    } else if (existsSync(path)) {
      return path;
    }
  }
  return null;
}

/* Check whether a command is available on PATH. */
function commandExists(cmd) {
  const probe = spawnSync(cmd, ['--version'], { stdio: 'ignore', shell: true });
  return probe.error === undefined && probe.status === 0;
}

/* Capture serially so multiple headless instances do not race the same output file. */
async function main() {
  if (!input) {
    console.error('Usage: node runtime/cli/screenshot.mjs <prototype.html> [--out=dir] [--browser=exe] [--width=1440] [--height=900] [--snapshot=annotation-path]');
    process.exit(1);
  }
  if (!existsSync(htmlPath) || !statSync(htmlPath).isFile()) {
    console.error(`Prototype HTML not found: ${htmlPath}`);
    process.exit(1);
  }
  if (!existsSync(snapshotPath)) {
    console.error(`✗ Annotation data not found: ${snapshotPath}`);
    process.exit(1);
  }
  mkdirSync(outDir, { recursive: true });
  let shots;
  try {
    shots = collectScenarios(readNotes());
  } catch (error) {
    console.error('✗ ' + error.message);
    process.exit(1);
  }
  if (shots.length === 0) {
    console.error('✗ No scenarios found in annotation data.');
    process.exit(1);
  }
  const exe = resolveBrowser();
  if (!exe) {
    console.error('✗ Edge/Chrome not found; use --browser= to specify an executable path.');
    process.exit(1);
  }
  console.log(`Found ${shots.length} scenario(s): ${shots.map((shot) => shot.id).join(', ')}`);
  let ok = 0;
  for (const shot of shots) {
    if (await shoot(shot, exe)) ok++;
  }
  console.log(`Done: ${ok}/${shots.length}, output dir ${outDir}`);
  process.exit(ok === shots.length ? 0 : 1);
}

if (isDirectExecution) main();
