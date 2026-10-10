import { isChart, paintChart } from './charts.js';
import { copyBoardPng } from './export.js';
import { fillStamp, loadFoundation, loadManifest, loadPackList, measureStamp, packId, paletteEntries } from './mount.js';
import { FRAME, resolveSizing } from './sizing.js';

const board = document.getElementById('board');
const status = document.getElementById('status');
const BASIC_TOOLS = [
  ['select', 'Select'],
  ['rect', 'Box'],
  ['ellipse', 'Circle'],
  ['line', 'Line'],
  ['text', 'Text']
];
const AXIS_LABEL = { none: 'move only', x: 'width only', y: 'height only', both: 'width and height' };
const HANDLES = { none: [], x: ['w', 'e'], y: ['n', 's'], both: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'] };

let tool = 'select';
let selected = null;
let drag = null;
let stampSerial = 0;
let placeSerial = 0;
const undoStack = [];

if (new URLSearchParams(location.search).get('embed') === '1') {
  document.body.classList.add('is-embed');
}

function setStatus(message) {
  status.textContent = message || '';
}

function setTool(next) {
  tool = next;
  board.dataset.tool = next;
  document.querySelectorAll('[data-tool]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.tool === next);
  });
}

function select(stamp) {
  if (selected && selected !== stamp) selected.classList.remove('is-selected');
  selected = stamp || null;
  if (!stamp) return;
  stamp.classList.add('is-selected');
}

/* Stacking follows DOM order; the underlay stays the first child. */
function restack(node, toFront) {
  const next = node.nextSibling;
  if (toFront) {
    if (!next) return;
    board.appendChild(node);
  } else {
    const first = underlay.nextSibling;
    if (first === node) return;
    board.insertBefore(node, first);
  }
  remember({ type: 'order', node, next });
  setStatus(toFront ? 'Brought forward' : 'Sent back');
}

function setUnderlay(src) {
  if (src) {
    underlay.src = src;
    underlay.hidden = false;
  } else {
    underlay.removeAttribute('src');
    underlay.hidden = true;
  }
}

function geomOf(stamp) {
  if (stamp.dataset.kind === 'line') {
    return {
      line: true,
      x1: stamp.dataset.x1,
      y1: stamp.dataset.y1,
      x2: stamp.dataset.x2,
      y2: stamp.dataset.y2
    };
  }
  return {
    left: stamp.style.left,
    top: stamp.style.top,
    width: stamp.style.width,
    height: stamp.style.height
  };
}

function sameGeom(before, after) {
  return JSON.stringify(before) === JSON.stringify(after);
}

function applyGeom(stamp, geom) {
  if (geom.line) {
    layoutLine(stamp, Number(geom.x1), Number(geom.y1), Number(geom.x2), Number(geom.y2));
    return;
  }
  stamp.style.left = geom.left;
  stamp.style.top = geom.top;
  stamp.style.width = geom.width;
  stamp.style.height = geom.height;
  syncChart(stamp);
  syncFluidHeight(stamp);
}

function remember(entry) {
  undoStack.push(entry);
  if (undoStack.length > 80) undoStack.shift();
}

function undo() {
  const entry = undoStack.pop();
  if (!entry) {
    setStatus('Nothing to undo');
    return;
  }
  if (entry.type === 'add') {
    if (selected === entry.node) selected = null;
    entry.node.remove();
  } else if (entry.type === 'remove' || entry.type === 'order') {
    if (entry.next && entry.next.parentNode === board) board.insertBefore(entry.node, entry.next);
    else board.appendChild(entry.node);
    select(entry.node);
  } else if (entry.type === 'geom') {
    applyGeom(entry.node, entry.before);
    select(entry.node);
  } else if (entry.type === 'clear') {
    entry.nodes.forEach((node) => board.appendChild(node));
    if (entry.underlay) setUnderlay(entry.underlay);
  } else if (entry.type === 'underlay') {
    setUnderlay(entry.before);
  }
  setStatus('Undone');
}

function removeSelected() {
  if (!selected) return;
  const node = selected;
  const next = node.nextSibling;
  node.remove();
  selected = null;
  remember({ type: 'remove', node, next });
}

function point(event) {
  const rect = board.getBoundingClientRect();
  const scaleX = rect.width / board.offsetWidth || 1;
  const scaleY = rect.height / board.offsetHeight || 1;
  return {
    x: Math.min(board.offsetWidth, Math.max(0, (event.clientX - rect.left) / scaleX)),
    y: Math.min(board.offsetHeight, Math.max(0, (event.clientY - rect.top) / scaleY))
  };
}

function fitBoard() {
  const stage = board.parentElement.parentElement;
  const availW = stage.clientWidth;
  const availH = stage.clientHeight;
  if (availW < 8 || availH < 8) return;
  const height = Math.ceil(FRAME.width * availH / availW);
  board.style.width = FRAME.width + 'px';
  board.style.height = height + 'px';
  board.style.transform = 'scale(' + (availW / FRAME.width) + ')';
}

function boxOf(stamp) {
  return {
    left: stamp.offsetLeft,
    top: stamp.offsetTop,
    width: stamp.offsetWidth,
    height: stamp.offsetHeight
  };
}

function addHandles(stamp, axis) {
  HANDLES[axis].forEach((edge) => {
    const handle = document.createElement('i');
    handle.className = 'handle handle-' + edge;
    handle.dataset.edge = edge;
    stamp.appendChild(handle);
  });
}

function decorate(stamp, spec) {
  stamp.dataset.axis = spec.axis;
  if (spec.lockWidth) stamp.dataset.lockWidth = '1';
  if (spec.lockHeight) stamp.dataset.lockHeight = '1';
  if (spec.chart) stamp.dataset.chart = '1';
  if (spec.axis === 'x' || spec.axis === 'both') stamp.dataset.stretchX = '1';
  if (spec.axis === 'y' || spec.axis === 'both') stamp.dataset.stretchY = '1';
}

function originFor(width, height) {
  if (width >= FRAME.width - 8) {
    const top = Math.min((placeSerial % 8) * 16, Math.max(0, board.offsetHeight - height));
    placeSerial += 1;
    return { left: 0, top };
  }
  const step = placeSerial % 10;
  placeSerial += 1;
  return {
    left: Math.min(24 + step * 20, Math.max(0, FRAME.width - width)),
    top: Math.min(24 + step * 20, Math.max(0, board.offsetHeight - height))
  };
}

function syncChart(stamp) {
  if (stamp.dataset.chart !== '1') return;
  const host = stamp.querySelector('.stamp-host');
  const summary = stamp.querySelector('.ui-chart-summary');
  const extra = summary ? summary.offsetHeight + 12 : 0;
  const height = Math.max(Number(stamp.dataset.minHeight) || 160, stamp.clientHeight - extra);
  host.style.setProperty('--ui-chart-height', height + 'px');
}

function syncFluidHeight(stamp) {
  if (stamp.dataset.kind === 'text') {
    const body = stamp.querySelector('.text-body');
    stamp.style.height = Math.max(Number(stamp.dataset.minHeight) || 22, body.scrollHeight) + 'px';
    return;
  }
  if (stamp.dataset.axis !== 'x' || stamp.dataset.lockHeight === '1') return;
  const host = stamp.querySelector('.stamp-host');
  const next = Math.max(Number(stamp.dataset.minHeight) || 1, host.scrollHeight);
  stamp.style.height = next + 'px';
}

function applyBox(stamp, box) {
  stamp.style.left = Math.round(box.left) + 'px';
  stamp.style.top = Math.round(box.top) + 'px';
  stamp.style.width = Math.round(box.width) + 'px';
  stamp.style.height = Math.round(box.height) + 'px';
  syncChart(stamp);
  syncFluidHeight(stamp);
}

function resizeBox(start, edge, dx, dy, stamp) {
  const minW = Number(stamp.dataset.minWidth) || 1;
  const minH = Number(stamp.dataset.minHeight) || 1;
  const lockW = stamp.dataset.lockWidth === '1';
  const lockH = stamp.dataset.lockHeight === '1';
  const right = start.left + start.width;
  const bottom = start.top + start.height;
  let left = start.left;
  let top = start.top;
  let width = start.width;
  let height = start.height;

  if (!lockW && edge.includes('e')) width = start.width + dx;
  if (!lockW && edge.includes('w')) width = start.width - dx;
  if (!lockH && edge.includes('s')) height = start.height + dy;
  if (!lockH && edge.includes('n')) height = start.height - dy;

  if (stamp.dataset.kind === 'ellipse') {
    if (edge === 'e' || edge === 'w') height = width;
    else if (edge === 'n' || edge === 's') width = height;
  }

  width = Math.max(minW, width);
  height = Math.max(minH, height);
  if (stamp.dataset.kind === 'ellipse') {
    const size = Math.max(width, height);
    width = size;
    height = size;
  }
  if (edge.includes('w')) left = right - width;
  if (edge.includes('n')) top = bottom - height;
  return { left, top, width, height };
}

function layoutLine(stamp, x1, y1, x2, y2) {
  const pad = 8;
  stamp.dataset.x1 = String(x1);
  stamp.dataset.y1 = String(y1);
  stamp.dataset.x2 = String(x2);
  stamp.dataset.y2 = String(y2);
  const left = Math.min(x1, x2) - pad;
  const top = Math.min(y1, y2) - pad;
  const width = Math.max(Math.abs(x2 - x1), 1) + pad * 2;
  const height = Math.max(Math.abs(y2 - y1), 1) + pad * 2;
  stamp.style.left = left + 'px';
  stamp.style.top = top + 'px';
  stamp.style.width = width + 'px';
  stamp.style.height = height + 'px';
  stamp.querySelectorAll('.line-hit, .line-visual').forEach((node) => {
    node.setAttribute('x1', x1 - left);
    node.setAttribute('y1', y1 - top);
    node.setAttribute('x2', x2 - left);
    node.setAttribute('y2', y2 - top);
  });
  placeEndpoint(stamp.querySelector('[data-edge="p1"]'), x1 - left, y1 - top);
  placeEndpoint(stamp.querySelector('[data-edge="p2"]'), x2 - left, y2 - top);
}

function placeEndpoint(handle, x, y) {
  handle.style.left = (x - 5) + 'px';
  handle.style.top = (y - 5) + 'px';
}

function createLine() {
  const stamp = document.createElement('div');
  stamp.className = 'stamp';
  stamp.dataset.kind = 'line';
  stamp.dataset.axis = 'both';
  stamp.innerHTML = '<svg class="line-svg"><line class="line-hit" /><line class="line-visual" /></svg>';
  ['p1', 'p2'].forEach((edge) => {
    const handle = document.createElement('i');
    handle.className = 'handle';
    handle.dataset.edge = edge;
    stamp.appendChild(handle);
  });
  return stamp;
}

function createShape(kind) {
  const stamp = document.createElement('div');
  stamp.className = 'stamp';
  stamp.dataset.kind = kind;
  stamp.dataset.axis = kind === 'text' ? 'x' : 'both';
  stamp.dataset.minWidth = kind === 'text' ? '48' : '8';
  stamp.dataset.minHeight = kind === 'text' ? '22' : '8';
  if (kind === 'text') {
    const body = document.createElement('div');
    body.className = 'text-body';
    try { body.contentEditable = 'plaintext-only'; } catch (error) { body.contentEditable = 'true'; }
    body.spellcheck = false;
    body.textContent = 'Text';
    body.addEventListener('input', () => {
      stamp.dataset.edited = '1';
      syncFluidHeight(stamp);
    });
    stamp.appendChild(body);
    addHandles(stamp, 'x');
  } else {
    const shape = document.createElement('div');
    shape.className = kind === 'ellipse' ? 'shape-ellipse' : 'shape-rect';
    stamp.appendChild(shape);
    addHandles(stamp, 'both');
  }
  return stamp;
}

function boxFromDrag(start, current, kind) {
  if (kind === 'text') {
    return {
      left: Math.min(start.x, current.x),
      top: start.y,
      width: Math.max(Math.abs(current.x - start.x), 48),
      height: 22
    };
  }
  let width = Math.abs(current.x - start.x);
  let height = Math.abs(current.y - start.y);
  if (kind === 'ellipse') {
    const size = Math.max(width, height, 8);
    width = size;
    height = size;
  }
  width = Math.max(width, 8);
  height = Math.max(height, 8);
  return {
    left: current.x < start.x ? start.x - width : start.x,
    top: current.y < start.y ? start.y - height : start.y,
    width,
    height
  };
}

async function placeComponent(entry, button) {
  button.disabled = true;
  setStatus('');
  try {
    const spec = { ...resolveSizing(entry.sizing), chart: isChart(entry.componentId) };
    const stamp = document.createElement('div');
    stamp.className = 'stamp';
    stamp.dataset.kind = 'component';
    stamp.dataset.component = entry.componentId;
    stamp.dataset.atom = entry.id;
    stamp.dataset.stampId = 's' + (++stampSerial);
    decorate(stamp, spec);
    const host = document.createElement('div');
    host.className = 'stamp-host';
    stamp.appendChild(host);
    await fillStamp(stamp, entry);
    const size = measureStamp(stamp, spec);
    stamp.dataset.minWidth = String(spec.minWidth ?? size.width);
    stamp.dataset.minHeight = String(spec.minHeight ?? size.height);
    const origin = originFor(size.width, size.height);
    if (spec.axis !== 'none') addHandles(stamp, spec.axis);
    const hit = document.createElement('div');
    hit.className = 'stamp-hit';
    stamp.appendChild(hit);
    board.appendChild(stamp);
    applyBox(stamp, { left: origin.left, top: origin.top, width: size.width, height: size.height });
    if (spec.chart) await paintChart(stamp, entry.componentId);
    select(stamp);
    remember({ type: 'add', node: stamp });
  } catch (error) {
    setStatus(error.message);
  } finally {
    button.disabled = false;
  }
}

function appendPaletteButton(palette, entry) {
  const button = document.createElement('button');
  button.type = 'button';
  const spec = resolveSizing(entry.sizing);
  button.textContent = entry.label;
  button.title = entry.id + ' · ' + AXIS_LABEL[spec.axis];
  button.addEventListener('click', () => placeComponent(entry, button));
  palette.appendChild(button);
}

function renderPalette(entries, categoryOrder) {
  const palette = document.getElementById('palette');
  palette.replaceChildren();
  BASIC_TOOLS.forEach(([id, label]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.tool = id;
    button.textContent = label;
    button.classList.toggle('is-active', id === tool);
    palette.appendChild(button);
  });
  const groups = new Map();
  const loose = [];
  entries.forEach((entry) => {
    if (!entry.category) {
      loose.push(entry);
      return;
    }
    if (!groups.has(entry.category)) groups.set(entry.category, []);
    groups.get(entry.category).push(entry);
  });
  loose.forEach((entry) => appendPaletteButton(palette, entry));
  const order = categoryOrder || [];
  const categories = [...groups.keys()].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  categories.forEach((category) => {
    const heading = document.createElement('h2');
    heading.textContent = category;
    palette.appendChild(heading);
    groups.get(category).forEach((entry) => appendPaletteButton(palette, entry));
  });
}

function beginPointer(event) {
  if (event.button !== 0) return;
  const handle = event.target.closest('.handle');
  const stamp = tool === 'select' ? event.target.closest('.stamp') : null;
  if (stamp) {
    const already = stamp.classList.contains('is-selected');
    select(stamp);
    if (handle && (handle.dataset.edge === 'p1' || handle.dataset.edge === 'p2')) {
      drag = {
        mode: 'endpoint',
        stamp,
        edge: handle.dataset.edge,
        before: geomOf(stamp),
        x1: Number(stamp.dataset.x1),
        y1: Number(stamp.dataset.y1),
        x2: Number(stamp.dataset.x2),
        y2: Number(stamp.dataset.y2)
      };
    } else if (handle) {
      drag = { mode: 'resize', stamp, edge: handle.dataset.edge, box: boxOf(stamp), origin: point(event), before: geomOf(stamp) };
    } else if (stamp.dataset.kind === 'text' && already && event.target.closest('.text-body')) {
      return;
    } else if (stamp.dataset.kind === 'line') {
      drag = {
        mode: 'move-line',
        stamp,
        origin: point(event),
        before: geomOf(stamp),
        x1: Number(stamp.dataset.x1),
        y1: Number(stamp.dataset.y1),
        x2: Number(stamp.dataset.x2),
        y2: Number(stamp.dataset.y2)
      };
    } else {
      drag = { mode: 'move', stamp, origin: point(event), box: boxOf(stamp), before: geomOf(stamp) };
    }
    if (!(stamp.dataset.kind === 'text' && already)) event.preventDefault();
    if (board.setPointerCapture) {
      try { board.setPointerCapture(event.pointerId); } catch (error) { /* pointer already released */ }
    }
    return;
  }
  if (tool === 'select') {
    select(null);
    return;
  }
  const origin = point(event);
  let created = null;
  if (tool === 'line') created = createLine();
  else created = createShape(tool);
  board.appendChild(created);
  select(created);
  if (tool === 'line') layoutLine(created, origin.x, origin.y, origin.x, origin.y);
  else applyBox(created, boxFromDrag(origin, origin, tool));
  drag = { mode: 'draw', stamp: created, kind: tool, origin };
  if (board.setPointerCapture) {
    try { board.setPointerCapture(event.pointerId); } catch (error) { /* pointer already released */ }
  }
  event.preventDefault();
}

function movePointer(event) {
  if (!drag) return;
  const current = point(event);
  if (drag.mode === 'move') {
    applyBox(drag.stamp, {
      left: drag.box.left + current.x - drag.origin.x,
      top: drag.box.top + current.y - drag.origin.y,
      width: drag.box.width,
      height: drag.box.height
    });
  } else if (drag.mode === 'resize') {
    const dx = current.x - drag.origin.x;
    const dy = current.y - drag.origin.y;
    applyBox(drag.stamp, resizeBox(drag.box, drag.edge, dx, dy, drag.stamp));
  } else if (drag.mode === 'move-line') {
    const dx = current.x - drag.origin.x;
    const dy = current.y - drag.origin.y;
    layoutLine(drag.stamp, drag.x1 + dx, drag.y1 + dy, drag.x2 + dx, drag.y2 + dy);
  } else if (drag.mode === 'endpoint') {
    if (drag.edge === 'p1') layoutLine(drag.stamp, current.x, current.y, drag.x2, drag.y2);
    else layoutLine(drag.stamp, drag.x1, drag.y1, current.x, current.y);
  } else if (drag.mode === 'draw') {
    if (drag.kind === 'line') layoutLine(drag.stamp, drag.origin.x, drag.origin.y, current.x, current.y);
    else applyBox(drag.stamp, boxFromDrag(drag.origin, current, drag.kind));
  }
}

function endPointer() {
  if (!drag) return;
  const ended = drag;
  drag = null;
  if (ended.mode === 'draw' && ended.kind === 'line') {
    const length = Math.hypot(Number(ended.stamp.dataset.x2) - Number(ended.stamp.dataset.x1), Number(ended.stamp.dataset.y2) - Number(ended.stamp.dataset.y1));
    if (length < 4) {
      ended.stamp.remove();
      selected = null;
    }
  }
  if (ended.mode === 'draw' && ended.stamp.isConnected) remember({ type: 'add', node: ended.stamp });
  else if (ended.before && ended.stamp.isConnected && !sameGeom(ended.before, geomOf(ended.stamp))) {
    remember({ type: 'geom', node: ended.stamp, before: ended.before });
  }
  if (ended.mode === 'draw' && ended.kind === 'text') {
    const body = ended.stamp.querySelector('.text-body');
    body.focus();
    const range = document.createRange();
    range.selectNodeContents(body);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

document.getElementById('palette').addEventListener('click', (event) => {
  const button = event.target.closest('[data-tool]');
  if (!button) return;
  setTool(button.dataset.tool);
});

board.addEventListener('pointerdown', beginPointer);
board.addEventListener('pointermove', movePointer);
board.addEventListener('pointerup', endPointer);
board.addEventListener('pointercancel', endPointer);

function typingTarget(node) {
  return node && (node.isContentEditable || (node.closest && node.closest('input, textarea')));
}

window.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 'z') {
    const active = document.activeElement;
    const editingText = active && active.isContentEditable && active.closest('.stamp') && active.closest('.stamp').dataset.edited === '1';
    if (drag || editingText || (active && active.closest && active.closest('input, textarea'))) return;
    event.preventDefault();
    undo();
    return;
  }
  if (event.key === 'Escape') {
    const active = document.activeElement;
    if (active && active.isContentEditable && active.closest('.stamp')) {
      active.blur();
      window.getSelection().removeAllRanges();
      return;
    }
    if (tool !== 'select') {
      setTool('select');
      return;
    }
    if (window.parent !== window) {
      window.parent.postMessage({ source: 'sketch-board', type: 'close' }, window.location.origin);
    }
    return;
  }
  if ((event.key === ']' || event.key === '[') && !event.ctrlKey && !event.metaKey && !event.altKey) {
    if (!selected || drag || typingTarget(document.activeElement)) return;
    event.preventDefault();
    restack(selected, event.key === ']');
    return;
  }
  if (event.key !== 'Delete' && event.key !== 'Backspace') return;
  if (typingTarget(document.activeElement)) return;
  if (!selected) return;
  event.preventDefault();
  removeSelected();
});

const underlay = document.createElement('img');
underlay.className = 'board-underlay';
underlay.alt = '';
underlay.hidden = true;
board.appendChild(underlay);

document.getElementById('underlay-file').addEventListener('change', (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  event.target.value = '';
  const reader = new FileReader();
  reader.onload = () => {
    remember({ type: 'underlay', before: underlay.hidden ? '' : underlay.src });
    setUnderlay(String(reader.result));
  };
  reader.readAsDataURL(file);
});

document.getElementById('clear-board').addEventListener('click', () => {
  const nodes = [...board.querySelectorAll('.stamp')];
  const previous = underlay.hidden ? '' : underlay.src;
  if (!nodes.length && !previous) return;
  nodes.forEach((node) => node.remove());
  selected = null;
  setUnderlay('');
  remember({ type: 'clear', nodes, underlay: previous });
  setStatus('Cleared');
});

document.getElementById('export').addEventListener('click', async () => {
  const button = document.getElementById('export');
  button.disabled = true;
  setStatus('Capturing…');
  try {
    await copyBoardPng(board);
    setStatus('Copied to clipboard');
  } catch (error) {
    setStatus(error.message || 'Screenshot failed');
  } finally {
    button.disabled = false;
  }
});

fitBoard();
new ResizeObserver(fitBoard).observe(board.parentElement.parentElement);

async function renderPackPicker() {
  const picker = document.getElementById('pack-select');
  const packs = await loadPackList();
  const ids = packs.map((pack) => pack.id);
  if (!ids.includes(packId)) ids.unshift(packId);
  picker.replaceChildren(...ids.map((id) => {
    const option = document.createElement('option');
    const pack = packs.find((item) => item.id === id);
    option.value = id;
    option.textContent = pack && pack.name ? pack.name : id;
    option.selected = id === packId;
    return option;
  }));
  picker.addEventListener('change', () => {
    if (board.querySelector('.stamp') && !window.confirm('Switching packs clears the canvas. Continue?')) {
      picker.value = packId;
      return;
    }
    const params = new URLSearchParams(location.search);
    params.set('pack', picker.value);
    location.search = params.toString();
  });
}

renderPackPicker();

loadManifest().then(async (manifest) => {
  await loadFoundation(manifest);
  const page = getComputedStyle(document.body).backgroundColor;
  if (page && page !== 'rgba(0, 0, 0, 0)') board.style.backgroundColor = page;
  const palette = paletteEntries(manifest);
  renderPalette(palette.entries, palette.categoryOrder);
}).catch((error) => {
  renderPalette([], []);
  setStatus(error.message);
});
