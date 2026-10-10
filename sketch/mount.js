/* Mount one atom from a pack component. Styles inject once. No adapters. */

import { ATOMS, findAtom } from './atoms.js';

const PACK = '/.html-prototype/packs/admin-desktop/';
const styled = new Set();
const htmlCache = new Map();
let manifestPromise = null;

export function loadManifest() {
  if (!manifestPromise) {
    manifestPromise = fetch(PACK + 'manifest.json').then((response) => {
      if (!response.ok) throw new Error('Cannot read admin-desktop manifest');
      return response.json();
    });
  }
  return manifestPromise;
}

function splitHtml(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const css = Array.from(doc.querySelectorAll('style')).map((node) => node.textContent).join('\n');
  doc.querySelectorAll('style').forEach((node) => node.remove());
  return { css, body: doc.body.innerHTML };
}

async function componentHtml(entry) {
  const key = entry.source;
  if (!htmlCache.has(key)) {
    const response = await fetch(PACK + entry.source);
    if (!response.ok) throw new Error('Cannot read ' + entry.source);
    htmlCache.set(key, splitHtml(await response.text()));
  }
  return htmlCache.get(key);
}

function injectStyle(id, css) {
  if (styled.has(id)) return;
  styled.add(id);
  const style = document.createElement('style');
  style.id = 'pack-style-' + id;
  style.dataset.pack = id;
  style.textContent = css;
  document.head.appendChild(style);
}

async function ensureStyles(id, components) {
  const entry = components[id];
  if (!entry) return;
  for (const req of entry.requires || []) {
    await ensureStyles(req, components);
  }
  const { css } = await componentHtml(entry);
  injectStyle(id, css);
}

function prefixIds(root, stampId) {
  const map = new Map();
  const nodes = [root, ...root.querySelectorAll('[id]')];
  nodes.forEach((el) => {
    if (!el.id || map.has(el.id)) return;
    const next = stampId + '--' + el.id;
    map.set(el.id, next);
    el.id = next;
  });
  root.querySelectorAll('*').forEach((el) => {
    ['for', 'aria-controls', 'aria-labelledby', 'aria-describedby'].forEach((attr) => {
      const value = el.getAttribute(attr);
      if (!value) return;
      el.setAttribute(attr, value.split(/\s+/).map((part) => map.get(part) || part).join(' '));
    });
  });
}

function applyText(node, atom) {
  if (atom.text == null) return;
  const target = atom.textSelector ? node.querySelector(atom.textSelector) : node;
  if (!target) return;
  if (target === node && target.childElementCount > 0 && !atom.textSelector) return;
  target.textContent = atom.text;
}

function extractAtom(bodyHtml, atom, stampId) {
  const doc = new DOMParser().parseFromString(bodyHtml, 'text/html');
  doc.querySelectorAll('script').forEach((node) => node.remove());
  if (!atom.selector) {
    const panel = doc.body.querySelector('.ui-modal, .ui-drawer');
    const kids = Array.from(doc.body.children);
    const root = panel || (kids.length === 1 ? kids[0] : null);
    const host = root || document.createElement('div');
    if (!root) kids.forEach((kid) => host.appendChild(kid));
    host.querySelectorAll('[hidden]').forEach((el) => el.remove());
    host.removeAttribute('hidden');
    host.removeAttribute('aria-hidden');
    prefixIds(host, stampId);
    return host;
  }
  const found = doc.querySelector(atom.selector);
  if (!found) throw new Error('找不到原子件 ' + atom.id);
  let node;
  if (atom.piece) {
    const piece = found.querySelector(atom.piece);
    if (!piece) throw new Error('找不到原子件 ' + atom.id);
    node = found.cloneNode(false);
    node.appendChild(piece.cloneNode(true));
  } else {
    node = found.cloneNode(true);
  }
  if (atom.strip) node.querySelectorAll(atom.strip).forEach((el) => el.remove());
  node.querySelectorAll('[hidden]').forEach((el) => el.remove());
  applyText(node, atom);
  prefixIds(node, stampId);
  return node;
}

/* Place the stamp in the measurer, read its content size, then return it detached. */
export function measureStamp(stamp, spec) {
  const measurer = document.getElementById('measurer');
  measurer.appendChild(stamp);
  const hugWidth = spec.axis === 'none' || spec.width == null;
  if (hugWidth) {
    stamp.style.width = 'max-content';
    stamp.style.height = spec.height == null ? 'max-content' : spec.height + 'px';
  } else {
    stamp.style.width = spec.width + 'px';
    stamp.style.height = spec.height == null ? 'auto' : spec.height + 'px';
  }
  if (spec.chart && spec.height != null) {
    stamp.querySelector('.stamp-host').style.setProperty('--ui-chart-height', spec.height + 'px');
  }
  const host = stamp.querySelector('.stamp-host');
  const width = hugWidth ? host.scrollWidth : spec.width;
  const height = spec.height == null ? host.scrollHeight : Math.max(spec.height, host.scrollHeight);
  stamp.remove();
  return {
    width: Math.max(spec.minWidth || 1, Math.ceil(width)),
    height: Math.max(spec.minHeight || 1, Math.ceil(height))
  };
}

export async function fillStamp(stamp, atomId) {
  const atom = findAtom(atomId);
  if (!atom) throw new Error('未知原子件 ' + atomId);
  const manifest = await loadManifest();
  const entry = manifest.components[atom.componentId];
  if (!entry) throw new Error('Unknown component ' + atom.componentId);
  await ensureStyles(atom.componentId, manifest.components);
  const { body } = await componentHtml(entry);
  const root = extractAtom(body, atom, stamp.dataset.stampId);
  stamp.querySelector('.stamp-host').replaceChildren(root);
}

export function paletteEntries(manifest) {
  const components = manifest && manifest.components || {};
  const categoryOrder = manifest && manifest.providers ? Object.keys(manifest.providers) : [];
  const entries = ATOMS.map((atom) => {
    const component = components[atom.componentId];
    const category = component && typeof component.category === 'string' ? component.category.trim() : '';
    return {
      id: atom.id,
      label: atom.label,
      category,
      componentId: atom.componentId,
      sizing: atom.sizing,
      sizingKey: atom.sizingKey
    };
  });
  return { entries, categoryOrder };
}
