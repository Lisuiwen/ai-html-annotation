#!/usr/bin/env node
/**
 * List UI packs visible to ui-pack-maintain (same lookup chain as html-prototype-build).
 */
import { listInstalledPacks } from './_pack-discover.mjs';

const payload = await listInstalledPacks(process.cwd(), process.argv.slice(2));
console.log(JSON.stringify(payload, null, 2));
