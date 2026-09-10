/* Direct Edit source patch: locate elements by source position; only mutates style/plain text, not DOM outerHTML. */

const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const RAW_TEXT_TAGS = new Set(['script', 'style', 'textarea', 'title']);

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function escapeAttr(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function escapeText(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function decodeAttr(value) {
  return String(value || '')
    .replace(/&quot;|&#34;|&#x22;/gi, '"')
    .replace(/&apos;|&#39;|&#x27;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&');
}

function cssUnescape(value) {
  return String(value || '').replace(/\\([0-9a-fA-F]{1,6})(?:\r\n|[\t\n\f\r ]+)?|\\([^\r\n\f])/g, function (_match, hex, plain) {
    if (hex) {
      var code = parseInt(hex, 16);
      if (!code || code > 0x10ffff) return '\uFFFD';
      try { return String.fromCodePoint(code); } catch (_) { return '\uFFFD'; }
    }
    return plain || '';
  });
}

function findTagEnd(html, start) {
  var quote = '';
  var escaped = false;
  for (var i = start + 1; i < html.length; i++) {
    var ch = html[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = '';
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '>') return i + 1;
  }
  return -1;
}

function parseAttributes(openTag) {
  var attrs = [];
  var nameMatch = openTag.match(/^<\s*[^\s/>]+/);
  var i = nameMatch ? nameMatch[0].length : 1;
  var limit = openTag.length - 1;
  while (i < limit) {
    while (i < limit && /\s/.test(openTag[i])) i++;
    if (i >= limit || openTag[i] === '/' || openTag[i] === '>') break;
    var start = i;
    while (i < limit && !/[\s=/>]/.test(openTag[i])) i++;
    var name = openTag.slice(start, i);
    if (!name) { i++; continue; }
    while (i < limit && /\s/.test(openTag[i])) i++;
    var value = '';
    var valueStart = i;
    var valueEnd = i;
    if (openTag[i] === '=') {
      i++;
      while (i < limit && /\s/.test(openTag[i])) i++;
      if (openTag[i] === '"' || openTag[i] === "'") {
        var quote = openTag[i++];
        valueStart = i;
        while (i < limit && openTag[i] !== quote) i++;
        valueEnd = i;
        value = openTag.slice(valueStart, valueEnd);
        if (i < limit) i++;
      } else {
        valueStart = i;
        while (i < limit && !/[\s>]/.test(openTag[i])) i++;
        valueEnd = i;
        value = openTag.slice(valueStart, valueEnd);
      }
    }
    attrs.push({ name: name.toLowerCase(), rawName: name, value: decodeAttr(value), rawValue: value, start: start, end: i });
  }
  return attrs;
}

function findRawTextClose(html, tagName, from) {
  var re = new RegExp('</' + tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*>', 'ig');
  re.lastIndex = from;
  var match = re.exec(html);
  return match ? { start: match.index, end: re.lastIndex } : null;
}

function readTagAt(html, start) {
  if (start < 0 || html[start] !== '<') return null;
  if (html.startsWith('<!--', start)) {
    var commentEnd = html.indexOf('-->', start + 4);
    return { kind: 'skip', start: start, end: commentEnd < 0 ? html.length : commentEnd + 3 };
  }
  var end = findTagEnd(html, start);
  if (end < 0) return null;
  var raw = html.slice(start, end);
  if (/^<!|^<\?/.test(raw)) return { kind: 'skip', start: start, end: end };
  var close = raw.match(/^<\s*\/\s*([a-zA-Z0-9:-]+)/);
  if (close) return { kind: 'close', start: start, end: end, tagName: close[1].toLowerCase(), raw: raw };
  var open = raw.match(/^<\s*([a-zA-Z0-9:-]+)/);
  if (!open) return { kind: 'skip', start: start, end: end };
  var tagName = open[1].toLowerCase();
  return {
    kind: 'open',
    start: start,
    end: end,
    tagName: tagName,
    raw: raw,
    attrs: parseAttributes(raw),
    selfClosing: VOID_TAGS.has(tagName) || /\/\s*>$/.test(raw)
  };
}

function nextTag(html, from, limit) {
  var i = from;
  var endLimit = typeof limit === 'number' ? limit : html.length;
  while (i < endLimit) {
    var lt = html.indexOf('<', i);
    if (lt < 0 || lt >= endLimit) return null;
    var tag = readTagAt(html, lt);
    if (!tag) return null;
    if (tag.kind === 'skip') {
      i = tag.end;
      continue;
    }
    return tag;
  }
  return null;
}

function findCloseTag(html, tagName, from) {
  if (RAW_TEXT_TAGS.has(tagName)) {
    var rawClose = findRawTextClose(html, tagName, from);
    return rawClose ? rawClose.start : -1;
  }
  var depth = 1;
  var cursor = from;
  while (cursor < html.length) {
    var tag = nextTag(html, cursor);
    if (!tag) return -1;
    if (tag.kind === 'open' && RAW_TEXT_TAGS.has(tag.tagName) && !tag.selfClosing) {
      if (tag.tagName === tagName) depth += 1;
      var rawEnd = findRawTextClose(html, tag.tagName, tag.end);
      if (!rawEnd) return -1;
      if (tag.tagName === tagName) {
        depth -= 1;
        if (depth === 0) return rawEnd.start;
      }
      cursor = rawEnd.end;
      continue;
    }
    if (tag.tagName === tagName) {
      if (tag.kind === 'open' && !tag.selfClosing) depth += 1;
      else if (tag.kind === 'close') {
        depth -= 1;
        if (depth === 0) return tag.start;
      }
    }
    cursor = tag.end;
  }
  return -1;
}

function nodeFromOpenTag(html, tag) {
  var closeStart = -1;
  if (!tag.selfClosing) {
    closeStart = findCloseTag(html, tag.tagName, tag.end);
    if (closeStart < 0) return null;
  }
  return {
    tagStart: tag.start,
    tagEnd: tag.end,
    closeStart: closeStart,
    tagName: tag.tagName,
    selfClosing: tag.selfClosing
  };
}

function locateByAttr(html, name, value) {
  var cursor = 0;
  var wantName = String(name).toLowerCase();
  while (cursor < html.length) {
    var tag = nextTag(html, cursor);
    if (!tag) return null;
    if (tag.kind !== 'open') {
      cursor = tag.end;
      continue;
    }
    var attr = tag.attrs.find(function (item) { return item.name === wantName && item.value === value; });
    if (attr) return nodeFromOpenTag(html, tag);
    if (RAW_TEXT_TAGS.has(tag.tagName) && !tag.selfClosing) {
      var rawClose = findRawTextClose(html, tag.tagName, tag.end);
      cursor = rawClose ? rawClose.end : html.length;
    } else {
      cursor = tag.end;
    }
  }
  return null;
}

function parseSelectorStep(part) {
  var text = String(part || '').trim();
  if (text.charAt(0) === '#') return { kind: 'id', id: cssUnescape(text.slice(1)) };
  var attrMatch = text.match(/^\[([^=\]]+)="((?:\\.|[^"])*)"\]$/);
  if (attrMatch) return { kind: 'attr', name: attrMatch[1], value: cssUnescape(attrMatch[2]) };
  var tagMatch = text.match(/^([a-zA-Z][\w-]*)(?::nth-of-type\((\d+)\))?$/);
  if (tagMatch) return { kind: 'tag', tag: tagMatch[1], nth: tagMatch[2] ? Number(tagMatch[2]) : 1 };
  return null;
}

function locateNthChild(html, parent, tagName, nth) {
  if (!parent || parent.selfClosing || parent.closeStart < 0) return null;
  var want = tagName.toLowerCase();
  var cursor = parent.tagEnd;
  var count = 0;
  while (cursor < parent.closeStart) {
    var tag = nextTag(html, cursor, parent.closeStart);
    if (!tag) return null;
    if (tag.kind === 'close') return null;
    if (tag.kind !== 'open') {
      cursor = tag.end;
      continue;
    }
    var node = nodeFromOpenTag(html, tag);
    if (!node) return null;
    if (tag.tagName === want) {
      count += 1;
      if (count === nth) return node;
    }
    if (node.selfClosing) cursor = node.tagEnd;
    else {
      var closeEnd = findTagEnd(html, node.closeStart);
      cursor = closeEnd < 0 ? parent.closeStart : closeEnd;
    }
  }
  return null;
}

function locateElement(html, selector) {
  var parts = String(selector || '').split(/\s*>\s*/).filter(Boolean);
  if (!parts.length) return null;
  var found = null;
  for (var i = 0; i < parts.length; i++) {
    var step = parseSelectorStep(parts[i]);
    if (!step) return null;
    if (i === 0) {
      if (step.kind === 'id') found = locateByAttr(html, 'id', step.id);
      else if (step.kind === 'attr') found = locateByAttr(html, step.name, step.value);
      else return null;
    } else {
      if (step.kind !== 'tag') return null;
      found = locateNthChild(html, found, step.tag, step.nth);
    }
    if (!found) return null;
  }
  return found;
}

function splitDeclarations(value) {
  var parts = [];
  var start = 0;
  var quote = '';
  var escaped = false;
  var depth = 0;
  for (var i = 0; i < value.length; i++) {
    var ch = value[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = '';
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '(' || ch === '[' || ch === '{') depth += 1;
    else if ((ch === ')' || ch === ']' || ch === '}') && depth > 0) depth -= 1;
    else if (ch === ';' && depth === 0) {
      parts.push(value.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(value.slice(start));
  return parts;
}

function declarationColon(part) {
  var quote = '';
  var escaped = false;
  var depth = 0;
  for (var i = 0; i < part.length; i++) {
    var ch = part[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = '';
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '(' || ch === '[' || ch === '{') depth += 1;
    else if ((ch === ')' || ch === ']' || ch === '}') && depth > 0) depth -= 1;
    else if (ch === ':' && depth === 0) return i;
  }
  return -1;
}

function parseStyle(styleValue) {
  var map = {};
  var order = [];
  splitDeclarations(decodeAttr(styleValue)).forEach(function (part) {
    var index = declarationColon(part);
    if (index < 0) return;
    var key = part.slice(0, index).trim().toLowerCase();
    var value = part.slice(index + 1).trim();
    if (!key) return;
    if (!Object.prototype.hasOwnProperty.call(map, key)) order.push(key);
    map[key] = value;
  });
  return { map: map, order: order };
}

function validCssProperty(prop) {
  return /^--[-_a-zA-Z0-9]+$/.test(prop) || /^-?[a-zA-Z][a-zA-Z0-9-]*$/.test(prop);
}

function mergeStyleAttribute(openTag, styles, removeStyles) {
  var attrs = parseAttributes(openTag);
  var styleAttr = attrs.find(function (attr) { return attr.name === 'style'; });
  var parsed = parseStyle(styleAttr ? styleAttr.rawValue : '');
  (removeStyles || []).forEach(function (prop) {
    var key = String(prop).trim().toLowerCase();
    if (!validCssProperty(key)) return;
    delete parsed.map[key];
    parsed.order = parsed.order.filter(function (item) { return item !== key; });
  });
  Object.entries(styles || {}).forEach(function (entry) {
    var key = String(entry[0]).trim().toLowerCase();
    if (!validCssProperty(key)) throw new Error('Invalid CSS property: ' + entry[0]);
    if (!parsed.order.includes(key)) parsed.order.push(key);
    parsed.map[key] = String(entry[1]);
  });
  var next = parsed.order.filter(function (key) { return parsed.map[key]; })
    .map(function (key) { return key + ': ' + parsed.map[key]; }).join('; ');
  if (styleAttr) {
    if (!next) return openTag.slice(0, styleAttr.start).replace(/\s+$/, '') + openTag.slice(styleAttr.end);
    return openTag.slice(0, styleAttr.start) + 'style="' + escapeAttr(next) + '"' + openTag.slice(styleAttr.end);
  }
  if (!next) return openTag;
  return openTag.replace(/\s*\/?>$/, function (end) { return ' style="' + escapeAttr(next) + '"' + end; });
}

function containsElementMarkup(html) {
  var tag = nextTag(html, 0);
  return !!(tag && tag.kind === 'open');
}

export function applyPrototypeEdit(html, payload) {
  var selector = payload && payload.selector;
  var changes = payload && payload.changes;
  if (typeof selector !== 'string' || !selector || !isObject(changes)) {
    throw new Error('Missing selector or changes.');
  }
  var found = locateElement(html, selector);
  if (!found) throw new Error('Element not found in source HTML: ' + selector);
  var openTag = html.slice(found.tagStart, found.tagEnd);
  var styles = isObject(changes.styles) ? changes.styles : {};
  var removeStyles = Array.isArray(changes.removeStyles) ? changes.removeStyles : [];
  var hasStylePatch = Object.keys(styles).length > 0 || removeStyles.length > 0;
  if (hasStylePatch) {
    Object.values(styles).forEach(function (value) {
      if (typeof value !== 'string') throw new Error('styles values must be strings.');
    });
    openTag = mergeStyleAttribute(openTag, styles, removeStyles);
  }
  var result = html.slice(0, found.tagStart) + openTag + html.slice(found.tagEnd);
  var delta = openTag.length - (found.tagEnd - found.tagStart);
  found.tagEnd += delta;
  if (found.closeStart >= 0) found.closeStart += delta;
  if (Object.prototype.hasOwnProperty.call(changes, 'text')) {
    if (typeof changes.text !== 'string') throw new Error('text must be a string.');
    if (found.selfClosing || found.closeStart < 0) throw new Error('This element cannot change text.');
    var inner = result.slice(found.tagEnd, found.closeStart);
    if (containsElementMarkup(inner)) throw new Error('Element has child nodes; cannot overwrite with text patch.');
    result = result.slice(0, found.tagEnd) + escapeText(changes.text) + result.slice(found.closeStart);
  }
  return result;
}

function headerValue(headers, name) {
  if (!headers) return '';
  var value = headers[name];
  if (Array.isArray(value)) value = value[0];
  return String(value || '').trim();
}

export function isTrustedAuthorRequest(request, listenPort) {
  var expectedPort = Number(listenPort || 4178);
  var host = headerValue(request && request.headers, 'host').toLowerCase();
  var origin = headerValue(request && request.headers, 'origin').toLowerCase();
  var type = headerValue(request && request.headers, 'content-type').toLowerCase();
  var allowedHosts = new Set([
    '127.0.0.1:' + expectedPort,
    'localhost:' + expectedPort,
    '[::1]:' + expectedPort
  ]);
  if (!allowedHosts.has(host)) return false;
  if (origin !== 'http://' + host) return false;
  if (!/^application\/json(?:\s*;|$)/.test(type)) return false;
  return true;
}
