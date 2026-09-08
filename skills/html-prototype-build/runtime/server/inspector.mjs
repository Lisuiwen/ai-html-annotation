import { existsSync, readFileSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { spawn } from 'node:child_process';

/* 给语义节点注入会话级 Inspector token，并保留 token → 原始源码行号映射。 */
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

/* 解析 Inspector 请求，但不启动 IDE，便于路由和单测共享同一安全边界。 */
export function resolveInspectorTarget({ root, htmlPath, filePath, targetId }) {
  var requested = filePath || String(htmlPath || '').split(/[\\/]/).pop();
  var resolvedPath = resolve(root, requested);
  if (relative(root, resolvedPath).startsWith('..')) return { ok: false, status: 403, message: 'Forbidden' };
  if (!existsSync(resolvedPath) || !statSync(resolvedPath).isFile()) {
    return { ok: false, status: 404, message: '找不到文件：' + requested };
  }
  var content = readFileSync(resolvedPath, 'utf8');
  var line = injectTargets(content).tokens[targetId];
  if (!line) return { ok: false, status: 404, message: '找不到目标元素：' + targetId };
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

/* 按 CODE_EDITOR → cursor → code 顺序打开源码定位。 */
export function openIDE(filePath, line) {
  var args = ['-g', filePath + ':' + line + ':1'];
  var target = filePath + ':' + line + ':1';
  var configured = (process.env.CODE_EDITOR || '').trim();
  var fallbacks = ['cursor', 'code'];
  var candidates = configured ? [configured].concat(fallbacks.filter(function (item) { return item !== configured; })) : fallbacks;
  function tryNext(index) {
    if (index >= candidates.length) {
      console.error('[inspector] 无法启动 IDE，请在 <skill-root>/.env 配置 CODE_EDITOR，或手动打开：' + target);
      return;
    }
    var cmd = candidates[index];
    console.log('[inspector] ' + cmd + ' -g ' + target);
    spawnIDE(cmd, args, function () { tryNext(index + 1); });
  }
  tryNext(0);
}
