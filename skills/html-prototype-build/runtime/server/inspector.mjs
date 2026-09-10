import { existsSync, readFileSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { spawn } from 'node:child_process';

/* Inject session-level Inspector tokens on semantic nodes and keep token → original source line mapping. */
export function injectTargets(content) {
  var cleaned = content
    .replace(/\s+data-insp-path\s*=\s*"[^"]*"/gi, '')
    .replace(/\s+data-insp-path\s*=\s*'[^']*'/gi, '')
    .replace(/\s+data-insp-target\s*=\s*"[^"]*"/gi, '')
    .replace(/\s+data-insp-target\s*=\s*'[^']*'/gi, '');
  var tokens = {};
  var seq = 0;
  var lastOffset = 0;
  var line = 1;
  var semanticRe = /<(section|article|nav|aside|main|header|footer|form|fieldset|table|thead|tbody|tfoot|tr|th|td|ul|ol|li|dl|dt|dd|h1|h2|h3|h4|h5|h6|p|figure|figcaption|details|summary|dialog|button|a|label|select|textarea|div)(\s[^<>]*?)?\s*(\/?)>/gi;
  var html = cleaned.replace(semanticRe, function (match, tagName, attrs, selfClose, offset) {
    if (selfClose) return match;
    var token = 'i' + String(++seq).padStart(2, '0');
    var segment = cleaned.slice(lastOffset, offset);
    line += (segment.match(/\n/g) || []).length;
    lastOffset = offset;
    tokens[token] = line;
    return '<' + tagName + (attrs || '') + ' data-insp-target="' + token + '">';
  });
  return { html: html, tokens: tokens };
}

/* Resolve Inspector requests without launching the IDE so routes and unit tests share the same security boundary. */
export function resolveInspectorTarget({ root, htmlPath, filePath, targetId }) {
  var requested = filePath || String(htmlPath || '').split(/[\\/]/).pop();
  var resolvedPath = resolve(root, requested);
  if (relative(root, resolvedPath).startsWith('..')) return { ok: false, status: 403, message: 'Forbidden' };
  if (!existsSync(resolvedPath) || !statSync(resolvedPath).isFile()) {
    return { ok: false, status: 404, message: 'File not found: ' + requested };
  }
  var content = readFileSync(resolvedPath, 'utf8');
  var line = injectTargets(content).tokens[targetId];
  if (!line) return { ok: false, status: 404, message: 'Target element not found: ' + targetId };
  return { ok: true, status: 200, filePath: requested, resolvedPath: resolvedPath, line: line };
}

function quoteWinArg(arg) {
  var s = String(arg);
  if (!/[\s"]/g.test(s)) return s;
  return '"' + s.replace(/"/g, '\\"') + '"';
}

function spawnIDE(cmd, args, onFail) {
  function fail() { if (typeof onFail === 'function') onFail(); }
  try {
    var opts = { stdio: 'ignore', detached: true, shell: false, windowsHide: true };
    var child;
    if (process.platform === 'win32' && !/\.exe$/i.test(cmd)) {
      var line = [cmd].concat(args).map(quoteWinArg).join(' ');
      child = spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', line], opts);
    } else child = spawn(cmd, args, opts);
    child.on('error', fail);
    child.unref();
  } catch (error) { fail(); }
}

/* Open source location in order: CODE_EDITOR → cursor → code. */
export function openIDE(filePath, line) {
  var args = ['-g', filePath + ':' + line + ':1'];
  var target = filePath + ':' + line + ':1';
  var configured = (process.env.CODE_EDITOR || '').trim();
  var fallbacks = ['cursor', 'code'];
  var candidates = configured ? [configured].concat(fallbacks.filter(function (item) { return item !== configured; })) : fallbacks;
  function tryNext(index) {
    if (index >= candidates.length) {
      console.error('[inspector] Could not launch IDE; set CODE_EDITOR in <skill-root>/.env or open manually: ' + target);
      return;
    }
    var cmd = candidates[index];
    console.log('[inspector] ' + cmd + ' -g ' + target);
    spawnIDE(cmd, args, function () { tryNext(index + 1); });
  }
  tryNext(0);
}
