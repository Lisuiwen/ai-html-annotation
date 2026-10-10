/* Mount sketch atoms a UI pack declares: manifest components[].atoms + data-pack-atom markers. */

const PACKS = '/.html-prototype/packs/';
const DEFAULT_PACK = 'admin-desktop';
const MARKERS = ['data-pack-atom', 'data-pack-atom-scope', 'data-pack-atom-strip'];
const styled = new Set();
const htmlCache = new Map();
let manifestPromise = null;
let foundationPromise = null;

export function packIdFrom(search) {
  const id = new URLSearchParams(search || '').get('pack');
  return id && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) ? id : DEFAULT_PACK;
}

export const packId = packIdFrom(globalThis.location ? globalThis.location.search : '');
export const packBase = PACKS + packId + '/';

export function loadManifest() {
  if (!manifestPromise) {
    manifestPromise = fetch(packBase + 'manifest.json').then((response) => {
      if (!response.ok) throw new Error('Cannot read ' + packId + ' manifest');
      return response.json();
    });
  }
  return manifestPromise;
}

export function loadPackList() {
  return fetch(PACKS + 'registry.json')
    .then((response) => (response.ok ? response.json() : { packs: [] }))
    .then((registry) => (Array.isArray(registry.packs) ? registry.packs : []))
    .catch(() => []);
}

/* Foundation sheets go before board.css so board rules keep winning at equal specificity. */
export function loadFoundation(manifest) {
  if (!foundationPromise) {
    const before = document.querySelector('link[href$="board.css"]');
    const sources = manifest.foundation && Array.isArray(manifest.foundation.sources) ? manifest.foundation.sources : [];
    foundationPromise = Promise.all(sources.map((source) => new Promise((resolve) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = packBase + source;
      link.onload = resolve;
      link.onerror = resolve;
      document.head.insertBefore(link, before);
    })));
  }
  return foundationPromise;
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
    const response = await fetch(packBase + entry.source);
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

function reveal(node) {
  node.removeAttribute('hidden');
  node.removeAttribute('aria-hidden');
}

function extractAtom(bodyHtml, entry, stampId) {
  const doc = new DOMParser().parseFromString(bodyHtml, 'text/html');
  const found = Array.from(doc.querySelectorAll('[data-pack-atom]')).find((el) => el.getAttribute('data-pack-atom') === entry.key);
  if (!found) throw new Error('找不到原子件 ' + entry.id);
  let node = found.cloneNode(true);
  node.querySelectorAll('[data-pack-atom-strip], [hidden], script').forEach((el) => el.remove());
  reveal(node);
  for (let parent = found.parentElement; parent && parent !== doc.body; parent = parent.parentElement) {
    if (!parent.hasAttribute('data-pack-atom-scope')) continue;
    const wrapper = parent.cloneNode(false);
    reveal(wrapper);
    wrapper.appendChild(node);
    node = wrapper;
  }
  [node, ...node.querySelectorAll('*')].forEach((el) => MARKERS.forEach((name) => el.removeAttribute(name)));
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

export async function fillStamp(stamp, entry) {
  const manifest = await loadManifest();
  const component = manifest.components[entry.componentId];
  if (!component) throw new Error('Unknown component ' + entry.componentId);
  await ensureStyles(entry.componentId, manifest.components);
  const { body } = await componentHtml(component);
  stamp.querySelector('.stamp-host').replaceChildren(extractAtom(body, entry, stamp.dataset.stampId));
}

export function paletteEntries(manifest) {
  const components = manifest && manifest.components || {};
  const categoryOrder = manifest && manifest.providers ? Object.keys(manifest.providers) : [];
  const entries = [];
  Object.entries(components).forEach(([componentId, component]) => {
    if (!component || component.visibility === 'internal' || !component.atoms) return;
    const category = typeof component.category === 'string' ? component.category.trim() : '';
    Object.entries(component.atoms).forEach(([key, atom]) => {
      entries.push({
        id: componentId + '#' + key,
        key,
        componentId,
        category,
        label: atom && atom.label || key,
        sizing: atom || {}
      });
    });
  });
  return { entries, categoryOrder };
}
