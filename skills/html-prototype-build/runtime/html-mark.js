/*!
 * HTML Mark — drop-in click-to-annotate overlay for HTML prototypes.
 *
 * Derived from https://github.com/xuxinmaxen/html-mark (MIT-0,
 * Copyright 2026 Maxen Xu / @xuxinmaxen), with local integration changes
 * for this skill (theme, author-tool mutual exclusion, Ctrl+Click pins).
 *
 * Click any element to drop a numbered pin, then write what you'd change.
 * Copy out as Markdown / Plain / JSON for review handoff — or "For AI",
 * a format with unique CSS selectors + HTML snapshots built to paste
 * straight into a coding agent for one-pass fixes.
 *
 * Pins anchor to their target element (they survive resizes and responsive
 * reflows) and persist in localStorage per page, restoring on reload.
 *
 * Keyboard:
 *   M           toggle mark mode (when not typing)
 *   Ctrl+Click  drop a pin (mark mode must be on; plain click keeps page usable)
 *   Esc         exit mark mode / close note popup
 *   Backspace   delete last pin (when not typing)
 *   Enter       save note  ·  Shift+Enter = newline
 *
 * Optional attribute: `data-mm-label="My Card"` on any element.
 */
(function () {
  'use strict';
  if (window.__markModeLoaded) return;
  window.__markModeLoaded = true;

  let markMode = false;
  let annotations = [];
  let nextId = 1;
  let activePinId = null;
  let lastHlEl = null;
  let hoverHlEl = null;
  let notePop = null;
  let noteOutsideHandler = null;
  let noteOutsideTimer = 0;
  let undoStash = null;

  const STORE_KEY = 'html-mark:' + location.pathname;

  // ---------- Styles ----------
  /* html-mark 为 drop-in 评审层，刻意使用紫罗兰 #9333ea，与 admin-desktop 主色 #1677ff 区分。 */
  const css = `
.mm-ui, .mm-ui *, .mm-pin, .mm-pin *, .mm-note-pop, .mm-note-pop * {
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}
/* 仅按住 Ctrl 时切换十字光标，避免开启标注后普通点击被抢。 */
body.mm-on.mm-armed, body.mm-on.mm-armed * { cursor: crosshair !important; }
body.mm-on.mm-armed .mm-ui, body.mm-on.mm-armed .mm-ui *,
body.mm-on.mm-armed .mm-note-pop, body.mm-on.mm-armed .mm-note-pop * { cursor: default !important; }
body.mm-on.mm-armed .mm-note-pop textarea { cursor: text !important; }
body.mm-on.mm-armed .mm-pin { cursor: pointer !important; }

/* 评审紫高亮：实线=已打点，虚线=悬停预览。 */
.mm-target-hl, .mm-hover-hl {
  outline: 2px solid #9333ea !important;
  outline-offset: 2px !important;
  box-shadow: 0 0 0 6px rgba(147,51,234,0.12) !important;
  transition: outline 0.15s ease, box-shadow 0.15s ease !important;
}
.mm-hover-hl {
  outline-style: dashed !important;
  box-shadow: 0 0 0 6px rgba(147,51,234,0.08) !important;
}

/* ---------- Toggle: 默认填充色块，开启后加深并加外环 ---------- */
.mm-toggle {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 0 14px;
  height: 32px;
  background: #9333ea;
  color: #ffffff;
  border: 1px solid #9333ea;
  border-radius: 16px;
  font-size: 12.5px; font-weight: 500; letter-spacing: 0.02em;
  cursor: pointer; user-select: none;
  box-shadow: 0 2px 0 rgba(109,40,217,0.12), 0 4px 12px rgba(147,51,234,0.28);
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  font-family: inherit;
}
.mm-toggle:hover {
  color: #ffffff;
  background: #7e22ce;
  border-color: #7e22ce;
}
.mm-toggle-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: rgba(255,255,255,0.92);
  transition: background 0.2s ease, box-shadow 0.2s ease;
  flex-shrink: 0;
}
.mm-toggle.on {
  background: #7e22ce;
  border-color: #7e22ce;
  color: #ffffff;
  box-shadow:
    0 0 0 2px #ffffff,
    0 0 0 4px rgba(147,51,234,0.45),
    0 4px 14px rgba(109,40,217,0.35);
}
.mm-toggle.on:hover { color: #ffffff; background: #6b21a8; border-color: #6b21a8; }
.mm-toggle.on .mm-toggle-dot { background: #ffffff; box-shadow: 0 0 0 2px rgba(255,255,255,0.35); }
.mm-toggle.on .mm-toggle-txt { color: #ffffff; text-shadow: none; }

/* ---------- Pin: 评审紫数字圆点 ---------- */
@keyframes mm-pin-in {
  0%   { opacity: 0; transform: scale(0); }
  55%  { opacity: 1; transform: scale(1.22); }
  100% { opacity: 1; transform: scale(1); }
}
.mm-pin {
  position: absolute;
  width: 22px; height: 22px;
  background: #9333ea;
  color: #fff;
  border: 2px solid #ffffff;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11.5px; font-weight: 600; line-height: 1;
  z-index: 2147483500;
  box-shadow: 0 2px 0 rgba(109,40,217,0.1), 0 4px 10px rgba(147,51,234,0.25);
  transition: transform 0.18s cubic-bezier(0.22,1,0.36,1), box-shadow 0.18s ease, border-color 0.18s ease;
  user-select: none;
  text-shadow: none;
  animation: mm-pin-in 0.42s cubic-bezier(0.22,1,0.36,1);
}
.mm-pin:hover, .mm-pin.mm-pin-hl {
  transform: scale(1.22);
  box-shadow: 0 4px 12px rgba(147,51,234,0.35);
}
.mm-pin.mm-pin-active {
  box-shadow:
    0 0 0 4px rgba(147,51,234,0.25),
    0 4px 12px rgba(147,51,234,0.35);
}
.mm-pin-del {
  position: absolute; top: -7px; right: -7px;
  width: 16px; height: 16px;
  background: #ffffff; color: rgba(0,0,0,0.65);
  border-radius: 50%;
  display: none;
  align-items: center; justify-content: center;
  font-size: 10px; line-height: 1;
  border: 1px solid #d9d9d9;
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
}
.mm-pin-del:hover { color: #9333ea; border-color: #9333ea; }
.mm-pin:hover .mm-pin-del { display: flex; }

/* ---------- Note popup: 白底卡片 ---------- */
@keyframes mm-pop-in {
  from { opacity: 0; transform: scale(0.94) translateY(-2px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.mm-note-pop {
  position: absolute;
  width: 300px;
  background: #ffffff;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  padding: 12px;
  z-index: 2147483520;
  display: flex; flex-direction: column; gap: 8px;
  overflow: hidden;
  transform-origin: top left;
  animation: mm-pop-in 0.22s cubic-bezier(0.22,1,0.36,1);
}
.mm-note-pop > * { position: relative; z-index: 1; }
.mm-note-pop-head {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 400;
  color: rgba(0,0,0,0.45);
}
.mm-note-pop-head b { color: rgba(0,0,0,0.88); font-weight: 600; }
.mm-note-pop-head .mm-np-text {
  flex: 1; text-align: right;
  font-weight: 400;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  color: rgba(0,0,0,0.45);
}
.mm-note-pop textarea {
  width: 100%; min-height: 68px; max-height: 200px;
  resize: vertical;
  background: #ffffff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 9px 11px;
  font-size: 13px; line-height: 1.5;
  color: rgba(0,0,0,0.88);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  font-family: inherit;
}
.mm-note-pop textarea:focus {
  border-color: #9333ea;
  box-shadow: 0 0 0 2px rgba(147,51,234,0.14);
}
.mm-note-pop textarea::placeholder { color: rgba(0,0,0,0.45); }
.mm-note-pop-hint {
  font-size: 10.5px; color: rgba(0,0,0,0.45);
  display: flex; justify-content: space-between; align-items: center;
}
.mm-note-pop-hint kbd {
  font-family: ui-monospace, 'JetBrains Mono', monospace;
  background: #fafafa; color: rgba(0,0,0,0.65);
  padding: 1px 5px; border-radius: 3px;
  font-size: 10px;
  border: 1px solid #f0f0f0;
}

/* ---------- Panel: 关=胶囊，开=卡片（与 toggle 一体） ---------- */
.mm-panel {
  position: fixed; right: 20px; bottom: 20px;
  width: auto; max-height: none;
  background: #ffffff;
  border: 1px solid #d9d9d9;
  border-radius: 16px;
  box-shadow: 0 2px 0 rgba(0,0,0,0.02);
  z-index: 2147483550;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: rgba(0,0,0,0.88);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.mm-panel:not(.on) {
  background: transparent;
  border-color: transparent;
  box-shadow: none;
}
.mm-panel:not(.on):hover { border-color: transparent; }
.mm-panel:not(.on) .mm-panel-body,
.mm-panel:not(.on) .mm-panel-count,
.mm-panel:not(.on) .mm-panel-iconbtn { display: none; }
.mm-panel:not(.on) .mm-panel-head {
  border-bottom: none;
  padding: 0;
}
.mm-panel.on {
  width: 348px; max-height: 60vh;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
.mm-panel.on.collapsed { width: auto; max-height: none; }
.mm-panel.on.collapsed .mm-panel-body { display: none; }
.mm-panel.on.collapsed .mm-panel-head { border-bottom: none; padding: 7px 10px 7px 8px; }

.mm-panel-head {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px 8px 8px;
  border-bottom: 1px solid #f0f0f0;
  cursor: grab;
  user-select: none;
  position: relative;
  touch-action: none;
}
.mm-panel-head.dragging { cursor: grabbing; }
.mm-panel-head .mm-toggle { flex: 0 0 auto; }
.mm-panel:not(.on) .mm-panel-head .mm-toggle { flex: 1 1 auto; }
.mm-panel-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px;
  background: #9333ea;
  color: #fff;
  border-radius: 9px;
  font-size: 10px; font-weight: 600;
  margin-right: auto;
}
.mm-panel-iconbtn {
  width: 26px; height: 26px;
  background: transparent; color: rgba(0,0,0,0.65);
  border: 1px solid transparent;
  border-radius: 6px;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 14px; line-height: 1; font-weight: 600;
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease;
  flex-shrink: 0;
}
.mm-panel-iconbtn:hover {
  color: #9333ea;
  background: #fafafa;
}

.mm-panel-body {
  display: flex; flex-direction: column;
  flex: 1; min-height: 0;
}
.mm-list {
  padding: 10px;
  overflow-y: auto;
  flex: 1; min-height: 60px;
  max-height: calc(60vh - 110px);
}
.mm-list::-webkit-scrollbar { width: 6px; }
.mm-list::-webkit-scrollbar-thumb { background: #d9d9d9; border-radius: 3px; }
.mm-list::-webkit-scrollbar-thumb:hover { background: #bfbfbf; }

.mm-item {
  display: flex; gap: 10px;
  padding: 10px 12px;
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  margin-bottom: 7px;
  font-size: 12.5px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}
.mm-item:hover {
  border-color: #9333ea;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}
.mm-item.active {
  border-color: #9333ea;
  box-shadow: 0 0 0 2px rgba(147,51,234,0.14);
}
.mm-item.has-note::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0;
  width: 3px;
  background: #9333ea;
}
.mm-item-num {
  width: 22px; height: 22px;
  background: #9333ea; color: #fff;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font: 600 11px/1 inherit;
  flex-shrink: 0;
}
.mm-item.has-note .mm-item-num {
  background: #9333ea;
}
.mm-item-body { flex: 1; min-width: 0; }
.mm-item-note {
  font-size: 13px; font-weight: 500; color: rgba(0,0,0,0.88);
  line-height: 1.45;
  margin-bottom: 3px;
  white-space: pre-wrap;
  word-break: break-word;
}
.mm-item-note-empty {
  font-size: 12px; color: rgba(0,0,0,0.45); font-style: italic;
  margin-bottom: 3px;
}
.mm-item-meta {
  font-size: 11px; color: rgba(0,0,0,0.45);
  line-height: 1.4;
  word-break: break-word;
}
.mm-item-meta b { color: rgba(0,0,0,0.65); font-weight: 600; }
.mm-item-del {
  width: 22px; height: 22px;
  background: transparent; color: rgba(0,0,0,0.45);
  border: none;
  border-radius: 5px;
  font-size: 15px; line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
  align-self: flex-start;
  display: none;
  padding: 0;
  transition: color 0.15s ease, background 0.15s ease;
}
.mm-item:hover .mm-item-del { display: block; }
.mm-item-del:hover {
  color: #9333ea;
  background: #fafafa;
}

.mm-empty {
  padding: 30px 16px; text-align: center;
  color: rgba(0,0,0,0.45); font-size: 12.5px;
  line-height: 1.7;
}
.mm-empty kbd {
  font-family: ui-monospace, 'JetBrains Mono', monospace;
  background: #fafafa; color: rgba(0,0,0,0.65);
  padding: 1px 6px; border-radius: 3px;
  font-size: 10.5px;
  border: 1px solid #f0f0f0;
  margin: 0 2px;
}

/* ---------- Panel footer ---------- */
.mm-panel-foot {
  display: flex; gap: 7px;
  padding: 10px 12px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  flex-shrink: 0;
}
.mm-fmt-select {
  background: #ffffff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 0 8px;
  font-size: 12px;
  color: rgba(0,0,0,0.65);
  height: 32px;
  cursor: pointer;
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s ease;
}
.mm-fmt-select:focus, .mm-fmt-select:hover { border-color: #9333ea; }
.mm-btn {
  height: 32px; padding: 0 14px;
  border-radius: 6px;
  font-size: 12px; font-weight: 400;
  cursor: pointer;
  border: 1px solid #d9d9d9;
  background: #ffffff; color: rgba(0,0,0,0.88);
  box-shadow: 0 2px 0 rgba(0,0,0,0.02);
  transition: color 0.15s ease, border-color 0.15s ease;
  font-family: inherit;
}
.mm-btn:hover {
  color: #9333ea;
  border-color: #9333ea;
}
.mm-btn.primary {
  background: #9333ea;
  color: #fff;
  border-color: #9333ea;
  flex: 1;
  box-shadow: 0 2px 0 rgba(109,40,217,0.1);
  text-shadow: none;
}
.mm-btn.primary:hover {
  background: #9333ea;
  color: #fff;
  border-color: #9333ea;
}

/* ---------- Toast: 白底中性提示 ---------- */
.mm-toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: #ffffff;
  color: rgba(0,0,0,0.88);
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 12.5px; font-weight: 400;
  z-index: 2147483640;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  border: 1px solid #d9d9d9;
}
.mm-toast.show { opacity: 1; transform: translate(-50%, -4px); }
.mm-toast.mm-undoable { pointer-events: auto; }
.mm-undo-btn {
  background: none; border: none; cursor: pointer;
  color: #9333ea; font-weight: 600; font-size: 12.5px;
  font-family: inherit; padding: 0; margin-left: 12px;
  text-decoration: underline; text-underline-offset: 2px;
}
.mm-undo-btn:hover { color: #9333ea; }

@media (prefers-reduced-motion: reduce) {
  .mm-pin, .mm-toggle, .mm-item, .mm-btn, .mm-panel-iconbtn, .mm-toast,
  .mm-note-pop, .mm-note-pop textarea, .mm-toggle-dot, .mm-target-hl {
    transition: none !important;
    animation: none !important;
  }
}
`;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ---------- Build UI ----------
  /* 一体 shell：关=胶囊，开=面板；模式开关嵌在 head 内。 */
  const panel = document.createElement('div');
  panel.className = 'mm-panel mm-ui';
  panel.innerHTML =
    '<div class="mm-panel-head" id="mm-head">' +
    '  <button type="button" class="mm-toggle" id="mm-toggle" title="切换标注模式 · 按 M 切换 · Esc 退出">' +
    '    <span class="mm-toggle-dot"></span><span class="mm-toggle-txt">标注</span>' +
    '  </button>' +
    '  <span class="mm-panel-count" id="mm-count">0</span>' +
    '  <button type="button" class="mm-panel-iconbtn" id="mm-collapse" title="收起">−</button>' +
    '</div>' +
    '<div class="mm-panel-body">' +
    '  <div class="mm-list" id="mm-list"></div>' +
    '  <div class="mm-panel-foot">' +
    '    <select class="mm-fmt-select" id="mm-fmt" title="导出格式">' +
    '      <option value="md">Markdown</option>' +
    '      <option value="txt">纯文本</option>' +
    '      <option value="json">JSON</option>' +
    '      <option value="ai">AI 定位</option>' +
    '    </select>' +
    '    <button type="button" class="mm-btn" id="mm-clear">清空</button>' +
    '    <button type="button" class="mm-btn primary" id="mm-copy">复制全部</button>' +
    '  </div>' +
    '</div>';

  const toggle = panel.querySelector('#mm-toggle');

  const toast = document.createElement('div');
  toast.className = 'mm-toast mm-ui';

  function init() {
    document.body.appendChild(panel);
    document.body.appendChild(toast);

    toggle.addEventListener('click', toggleMarkMode);
    document.getElementById('mm-clear').addEventListener('click', clearAll);
    document.getElementById('mm-copy').addEventListener('click', copyAll);
    document.getElementById('mm-collapse').addEventListener('click', togglePanelCollapse);

    setupPanelDrag();
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKey);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleHover, true);
    window.addEventListener('blur', function () { setArmed(false); });
    window.addEventListener('resize', scheduleReposition);
    if (window.ResizeObserver) {
      new ResizeObserver(scheduleReposition).observe(document.documentElement);
    }
    render();
    restore();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ---------- Behavior ----------
  function toggleMarkMode() {
    markMode = !markMode;
    document.body.classList.toggle('mm-on', markMode);
    panel.classList.toggle('on', markMode);
    toggle.classList.toggle('on', markMode);
    toggle.querySelector('.mm-toggle-txt').textContent = markMode ? '标注中' : '标注';
    if (!markMode) {
      setArmed(false);
      closeNotePop();
      clearHoverHl();
      panel.classList.remove('collapsed');
      document.getElementById('mm-collapse').textContent = '−';
      document.getElementById('mm-collapse').title = '收起';
    }
    clampShellPosition();
  }

  /* Mark 开启后仅 Ctrl 按下时进入「可打点」态（光标 + 悬停预览）。 */
  function setArmed(on) {
    document.body.classList.toggle('mm-armed', !!on);
    if (!on) clearHoverHl();
  }

  function syncArmedFromEvent(e) {
    setArmed(markMode && !!(e && e.ctrlKey));
  }

  function togglePanelCollapse() {
    const collapsed = panel.classList.toggle('collapsed');
    document.getElementById('mm-collapse').textContent = collapsed ? '+' : '−';
    document.getElementById('mm-collapse').title = collapsed ? '展开' : '收起';
    clampShellPosition();
  }

  /* 说明栏 / Viewer chrome：Mark 不可在此区域打点或悬停预览（不依赖 author-chrome 是否已加载）。 */
  var NOTES_PANEL_SELECTOR = [
    '.pn-notes', '.pn-panel-actions', '.pn-toggle', '.pn-mobile-toggle',
    '.pn-card', '.pn-head', '.pn-overview', '.pn-connections'
  ].join(',');

  function isNotesPanel(el) {
    if (!el || !el.closest) return false;
    return !!el.closest(NOTES_PANEL_SELECTOR);
  }

  /* 与 Inspector 对齐：从点击点向上找最近可标注语义单元，td/th 优先于外层 id。 */
  function resolveMarkTarget(el) {
    if (isNotesPanel(el)) return null;
    var cur = el;
    while (cur && cur.nodeType === 1 && cur !== document.body && cur !== document.documentElement) {
      if (isNotesPanel(cur)) return null;
      if (window.PrototypeAuthorChrome && window.PrototypeAuthorChrome.isOverlay(cur)) return null;
      if (cur.getAttribute && cur.getAttribute('data-mm-label')) return cur;
      if (cur.getAttribute && cur.getAttribute('data-prototype-note-target')) return cur;
      if (cur.matches) {
        if (cur.matches('button, [role="button"], a[href], input, select, textarea')) return cur;
        if (cur.matches('h1, h2, h3, h4, h5, h6')) return cur;
        if (cur.matches('td, th')) return cur;
      }
      if (cur.id) return cur;
      if (cur.getAttribute && cur.getAttribute('aria-label')) return cur;
      cur = cur.parentElement;
    }
    return el && el.nodeType === 1 ? el : null;
  }

  function describeElement(el) {
    if (isNotesPanel(el)) return { label: 'unknown', selector: '', text: '', target: null };
    const target = resolveMarkTarget(el);
    if (!target) return { label: 'unknown', selector: '', text: '', target: null };

    if (target.getAttribute && target.getAttribute('data-mm-label')) {
      return { label: target.getAttribute('data-mm-label'), selector: cssPath(target), text: textOf(target), target: target };
    }
    if (target.getAttribute && target.getAttribute('data-prototype-note-target')) {
      var noteTarget = target.getAttribute('data-prototype-note-target');
      return { label: noteTarget, selector: '[data-prototype-note-target="' + noteTarget + '"]', text: textOf(target), target: target };
    }
    if (target.id) return { label: '#' + target.id, selector: '#' + target.id, text: textOf(target), target: target };
    if (target.getAttribute && target.getAttribute('aria-label')) {
      return { label: target.getAttribute('aria-label'), selector: target.tagName.toLowerCase(), text: textOf(target), target: target };
    }
    if (target.matches) {
      if (target.matches('button, [role="button"]')) return { label: 'Button', selector: 'button', text: textOf(target), target: target };
      if (target.matches('a[href]')) return { label: 'Link', selector: 'a', text: textOf(target), target: target };
      if (target.matches('input, select, textarea')) {
        const v = target.placeholder || target.value || '';
        return { label: target.tagName.toLowerCase(), selector: target.tagName.toLowerCase(), text: v.slice(0, 80), target: target };
      }
      if (target.matches('h1, h2, h3, h4, h5, h6')) {
        return { label: target.tagName.toLowerCase(), selector: target.tagName.toLowerCase(), text: textOf(target), target: target };
      }
      if (target.matches('td, th')) {
        return { label: target.tagName.toLowerCase(), selector: cssPath(target), text: textOf(target), target: target };
      }
    }
    const tag = target.tagName ? target.tagName.toLowerCase() : 'unknown';
    const cls = (target.className && typeof target.className === 'string') ? target.className.split(' ').filter(Boolean)[0] : '';
    const sel = tag + (cls ? '.' + cls : '');
    return { label: sel, selector: sel, text: textOf(target), target: target };
  }

  function textOf(el) {
    return (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  }

  // Unique, reproducible CSS path — precise enough for an AI agent (or
  // querySelector) to find exactly this element, unlike the human label.
  function cssPath(el) {
    if (!el || el.nodeType !== 1) return '';
    const parts = [];
    let cur = el;
    while (cur && cur.nodeType === 1 && cur !== document.body && cur !== document.documentElement) {
      if (cur.id) {
        parts.unshift('#' + (window.CSS && CSS.escape ? CSS.escape(cur.id) : cur.id));
        return parts.join(' > ');
      }
      let sel = cur.tagName.toLowerCase();
      const parent = cur.parentElement;
      if (parent) {
        const sameTag = Array.prototype.filter.call(parent.children, function (c) {
          return c.tagName === cur.tagName;
        });
        if (sameTag.length > 1) sel += ':nth-of-type(' + (sameTag.indexOf(cur) + 1) + ')';
      }
      parts.unshift(sel);
      cur = parent;
    }
    return parts.length ? 'body > ' + parts.join(' > ') : '';
  }

  // ---------- Pin positioning (anchored to target element) ----------
  // Pins remember their position as a fraction of the target's box, so they
  // stay glued to the element through resizes and responsive reflows.
  // Absolute page coords are kept only as a fallback for detached targets.
  function positionPin(ann) {
    const t = ann.targetEl;
    if (t && t.nodeType === 1 && t.isConnected && typeof ann.relX === 'number') {
      const r = t.getBoundingClientRect();
      if (r.width || r.height) {
        ann.pageX = r.left + window.scrollX + ann.relX * r.width;
        ann.pageY = r.top + window.scrollY + ann.relY * r.height;
      }
    }
    ann.pinEl.style.left = (ann.pageX - 11) + 'px';
    ann.pinEl.style.top = (ann.pageY - 11) + 'px';
  }

  let repoRaf = 0;
  function scheduleReposition() {
    if (repoRaf) return;
    repoRaf = requestAnimationFrame(function () {
      repoRaf = 0;
      annotations.forEach(positionPin);
    });
  }

  function buildPin(ann) {
    const pin = document.createElement('div');
    pin.className = 'mm-pin';
    pin.dataset.id = ann.id;
    pin.appendChild(document.createTextNode(String(ann.id)));

    const del = document.createElement('span');
    del.className = 'mm-pin-del';
    del.textContent = '×';
    del.addEventListener('click', function (ev) {
      ev.stopPropagation();
      removeAnn(parseInt(pin.dataset.id, 10));
    });
    pin.appendChild(del);

    pin.addEventListener('click', function (ev) {
      ev.stopPropagation();
      if (ev.target === del) return;
      const aid = parseInt(pin.dataset.id, 10);
      const a = annotations.find(function (x) { return x.id === aid; });
      if (a) openNotePop(a);
    });

    document.body.appendChild(pin);
    ann.pinEl = pin;
    positionPin(ann);
    return pin;
  }

  // ---------- Persistence ----------
  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(annotations.map(function (a) {
        return {
          id: a.id, note: a.note, label: a.label, selector: a.selector,
          path: a.path, text: a.text, html: a.html,
          relX: a.relX, relY: a.relY, pageX: a.pageX, pageY: a.pageY
        };
      })));
    } catch (e) { /* storage unavailable or full — annotations stay in-memory */ }
  }

  function restore() {
    let stored;
    try { stored = JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch (e) { return; }
    if (!Array.isArray(stored) || stored.length === 0) return;
    stored.forEach(function (s) {
      let target = null;
      if (s.path) {
        try { target = document.querySelector(s.path); } catch (e) { /* stale path */ }
      }
      const ann = {
        id: s.id, ctx: getContext(),
        label: s.label, selector: s.selector, path: s.path,
        text: s.text, html: s.html, note: s.note || '',
        relX: s.relX, relY: s.relY, pageX: s.pageX, pageY: s.pageY,
        targetEl: target, pinEl: null
      };
      annotations.push(ann);
      buildPin(ann);
    });
    nextId = annotations.reduce(function (m, a) { return Math.max(m, a.id); }, 0) + 1;
    render();
    showToast('已从上次会话恢复 ' + annotations.length + ' 条标注');
  }

  function getContext() {
    const url = location.pathname + (location.hash || '');
    const title = document.title || '';
    return title ? title + ' (' + url + ')' : url;
  }

  function handleClick(e) {
    if (!markMode) return;
    if (!e.ctrlKey) return;
    if (isNotesPanel(e.target)) return;
    if (window.PrototypeAuthorChrome && window.PrototypeAuthorChrome.isOverlay(e.target)) return;
    if (e.target.closest('.mm-ui')) return;
    if (e.target.closest('.mm-pin')) return;
    if (e.target.closest('.mm-note-pop')) return;

    e.preventDefault();
    e.stopPropagation();
    clearHoverHl();

    const desc = describeElement(e.target);
    if (!desc.target) return;
    const id = nextId++;

    const ann = {
      id: id, ctx: getContext(),
      label: desc.label, selector: desc.selector, text: desc.text,
      path: cssPath(desc.target),
      html: desc.target && desc.target.outerHTML ? desc.target.outerHTML.replace(/\s+/g, ' ').slice(0, 200) : '',
      note: '', pinEl: null, targetEl: desc.target,
      pageX: e.pageX, pageY: e.pageY
    };
    if (desc.target && desc.target.getBoundingClientRect) {
      const r = desc.target.getBoundingClientRect();
      ann.relX = r.width ? (e.clientX - r.left) / r.width : 0.5;
      ann.relY = r.height ? (e.clientY - r.top) / r.height : 0.5;
    }

    buildPin(ann);
    annotations.push(ann);
    render();
    save();
    openNotePop(ann);
  }

  // ---------- Note popup ----------
  function openNotePop(ann) {
    closeNotePop();
    activePinId = ann.id;
    ann.pinEl.classList.add('mm-pin-active');
    document.querySelectorAll('.mm-item').forEach(function (it) {
      it.classList.toggle('active', parseInt(it.dataset.id, 10) === ann.id);
    });

    notePop = document.createElement('div');
    notePop.className = 'mm-note-pop';
    notePop.innerHTML =
      '<div class="mm-note-pop-head">' +
      '  <span><b>#' + ann.id + '</b> · ' + esc(ann.label) + '</span>' +
      '  <span class="mm-np-text">' + (ann.text ? esc(ann.text) : '') + '</span>' +
      '</div>' +
      '<textarea placeholder="这里需要改什么？（可选）"></textarea>' +
      '<div class="mm-note-pop-hint">' +
      '  <span><kbd>↵</kbd> 保存 · <kbd>⇧↵</kbd> 换行 · <kbd>Esc</kbd> 关闭</span>' +
      '  <span style="color:rgba(0,0,0,0.45)">' + (ann.note ? '编辑中' : '新建') + '</span>' +
      '</div>';

    document.body.appendChild(notePop);

    const pinRect = ann.pinEl.getBoundingClientRect();
    const popW = notePop.offsetWidth;
    const popH = notePop.offsetHeight;
    let popX = pinRect.right + 10 + window.scrollX;
    let popY = pinRect.top + window.scrollY;
    if (popX + popW > window.scrollX + window.innerWidth - 8) {
      popX = pinRect.left - popW - 10 + window.scrollX;
    }
    if (popX < window.scrollX + 8) popX = window.scrollX + 8;
    if (popY + popH > window.scrollY + window.innerHeight - 8) {
      popY = window.scrollY + window.innerHeight - popH - 8;
    }
    if (popY < window.scrollY + 8) popY = window.scrollY + 8;
    notePop.style.left = popX + 'px';
    notePop.style.top = popY + 'px';

    const ta = notePop.querySelector('textarea');
    ta.value = ann.note || '';
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);

    ta.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' && !ev.shiftKey) {
        ev.preventDefault();
        ann.note = ta.value.trim();
        closeNotePop();
        render();
        save();
      } else if (ev.key === 'Escape') {
        ev.preventDefault();
        closeNotePop();
      }
    });

    noteOutsideTimer = setTimeout(function () {
      noteOutsideTimer = 0;
      if (!notePop) return;
      noteOutsideHandler = outsideHandler;
      document.addEventListener('mousedown', noteOutsideHandler, true);
    }, 0);

    function outsideHandler(ev) {
      if (!notePop) {
        document.removeEventListener('mousedown', outsideHandler, true);
        return;
      }
      if (notePop.contains(ev.target)) return;
      if (ev.target.closest && ev.target.closest('.mm-pin')) return;
      const val = ta.value.trim();
      if (val !== (ann.note || '')) { ann.note = val; render(); save(); }
      closeNotePop();
    }
  }

  /* 统一清理弹窗和全局点击监听，避免键盘关闭后残留 handler。 */
  function closeNotePop() {
    if (noteOutsideTimer) {
      clearTimeout(noteOutsideTimer);
      noteOutsideTimer = 0;
    }
    if (noteOutsideHandler) {
      document.removeEventListener('mousedown', noteOutsideHandler, true);
      noteOutsideHandler = null;
    }
    if (notePop) { notePop.remove(); notePop = null; }
    if (activePinId !== null) {
      const a = annotations.find(function (x) { return x.id === activePinId; });
      if (a && a.pinEl) a.pinEl.classList.remove('mm-pin-active');
      document.querySelectorAll('.mm-item.active').forEach(function (it) { it.classList.remove('active'); });
      activePinId = null;
    }
  }

  // ---------- Hover preview ----------
  // Only while Ctrl is held in mark mode: dashed outline on the element a
  // Ctrl+Click would annotate, so "what will I pin?" is clear before click.
  let hoverRaf = 0;
  function handleHover(e) {
    syncArmedFromEvent(e);
    if (!markMode || !e.ctrlKey || notePop) { if (hoverHlEl) clearHoverHl(); return; }
    const raw = e.target;
    if (isNotesPanel(raw)) { clearHoverHl(); return; }
    if (hoverRaf) return;
    hoverRaf = requestAnimationFrame(function () {
      hoverRaf = 0;
      if (!markMode || !document.body.classList.contains('mm-armed') || notePop) {
        clearHoverHl();
        return;
      }
      if (!raw || !raw.closest || raw.closest('.mm-ui, .mm-pin, .mm-note-pop')) {
        clearHoverHl();
        return;
      }
      if (isNotesPanel(raw)) {
        clearHoverHl();
        return;
      }
      if (window.PrototypeAuthorChrome && window.PrototypeAuthorChrome.isOverlay(raw)) {
        clearHoverHl();
        return;
      }
      const target = describeElement(raw).target;
      if (target === hoverHlEl) return;
      clearHoverHl();
      if (target && target !== document.body && target.nodeType === 1) {
        hoverHlEl = target;
        target.classList.add('mm-hover-hl');
      }
    });
  }

  function clearHoverHl() {
    if (hoverHlEl) {
      hoverHlEl.classList.remove('mm-hover-hl');
      hoverHlEl = null;
    }
  }

  // ---------- Keyboard ----------
  function handleKey(e) {
    if (e.key === 'Control') syncArmedFromEvent(e);
    const inField = e.target.matches && e.target.matches('input, textarea, [contenteditable="true"]');
    if (!inField && (e.key === 'm' || e.key === 'M') && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      toggleMarkMode();
      return;
    }
    if (e.key === 'Escape') {
      if (notePop) return;
      if (markMode) toggleMarkMode();
      return;
    }
    if (markMode && e.key === 'Backspace' && !inField) {
      if (annotations.length > 0) {
        e.preventDefault();
        removeAnn(annotations[annotations.length - 1].id);
      }
    }
  }

  /* keyup 也要同步，否则松开 Ctrl 后仍停在十字光标态。 */
  function handleKeyUp(e) {
    if (e.key === 'Control' || e.key === 'Meta' || e.key === 'Alt') syncArmedFromEvent(e);
  }

  // ---------- Mutations ----------
  function removeAnn(id) {
    if (activePinId === id) closeNotePop();
    const a = annotations.find(function (x) { return x.id === id; });
    if (a && a.pinEl) a.pinEl.remove();
    annotations = annotations.filter(function (x) { return x.id !== id; });
    annotations.forEach(function (a, i) {
      const n = i + 1;
      a.pinEl.firstChild.nodeValue = String(n);
      a.pinEl.dataset.id = n;
      a.id = n;
    });
    nextId = annotations.length + 1;
    render();
    save();
  }

  function clearAll() {
    if (annotations.length === 0) return;
    closeNotePop();
    undoStash = annotations;
    annotations.forEach(function (a) { a.pinEl && a.pinEl.remove(); });
    annotations = [];
    nextId = 1;
    render();
    save();
    showUndoToast('已清空 ' + undoStash.length + ' 条标注');
  }

  function undoClear() {
    if (!undoStash) return;
    annotations = undoStash;
    undoStash = null;
    annotations.forEach(function (a) {
      if (a.pinEl) { document.body.appendChild(a.pinEl); positionPin(a); }
    });
    nextId = annotations.reduce(function (m, a) { return Math.max(m, a.id); }, 0) + 1;
    render();
    save();
    showToast('✓ 已恢复标注');
  }

  // ---------- Render ----------
  function render() {
    document.getElementById('mm-count').textContent = annotations.length;
    const list = document.getElementById('mm-list');
    if (annotations.length === 0) {
      list.innerHTML =
        '<div class="mm-empty">' +
        '按住 <kbd>Ctrl</kbd> 并点击页面元素，即可落下 pin。<br/>' +
        '<kbd>M</kbd> 切换模式 · <kbd>Esc</kbd> 退出 · <kbd>⌫</kbd> 删除上一条' +
        '</div>';
      return;
    }
    list.innerHTML = annotations.map(function (a, i) {
      const hasNote = !!a.note;
      const n = i + 1;
      return '<div class="mm-item ' + (hasNote ? 'has-note' : '') + '" data-id="' + a.id + '">' +
        '<div class="mm-item-num">' + n + '</div>' +
        '<div class="mm-item-body">' +
          (hasNote
            ? '<div class="mm-item-note">' + esc(a.note) + '</div>'
            : '<div class="mm-item-note-empty">暂无反馈 · 点击补充</div>') +
          '<div class="mm-item-meta">' +
            '<b>' + esc(a.label) + '</b>' +
            (a.text ? ' · ' + esc(a.text).slice(0, 50) : '') +
          '</div>' +
        '</div>' +
        '<button class="mm-item-del" data-del="' + a.id + '" title="删除">×</button>' +
      '</div>';
    }).join('');

    list.querySelectorAll('.mm-item').forEach(function (it) {
      const id = parseInt(it.dataset.id, 10);
      const ann = annotations.find(function (a) { return a.id === id; });
      if (!ann) return;
      it.addEventListener('click', function (e) {
        if (e.target.matches('[data-del]')) return;
        if (ann.pinEl) ann.pinEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(function () { openNotePop(ann); }, 80);
      });
      it.addEventListener('mouseenter', function () {
        if (ann.pinEl) ann.pinEl.classList.add('mm-pin-hl');
        if (ann.targetEl && ann.targetEl !== document.body && document.body.contains(ann.targetEl)) {
          lastHlEl = ann.targetEl;
          ann.targetEl.classList.add('mm-target-hl');
        }
      });
      it.addEventListener('mouseleave', function () {
        if (ann.pinEl) ann.pinEl.classList.remove('mm-pin-hl');
        if (lastHlEl) { lastHlEl.classList.remove('mm-target-hl'); lastHlEl = null; }
      });
    });
    list.querySelectorAll('[data-del]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        removeAnn(parseInt(btn.dataset.del, 10));
      });
    });

    annotations.forEach(function (a) {
      if (a.pinEl) a.pinEl.classList.toggle('mm-has-note', !!a.note);
    });
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ---------- Copy ----------
  function copyAll() {
    if (annotations.length === 0) {
      showToast('还没有标注 — 先按住 Ctrl 点击打一个 pin。');
      return;
    }
    const fmt = document.getElementById('mm-fmt').value;
    const ctx = getContext();
    let txt = '';

    if (fmt === 'md') {
      txt = '# Annotations — ' + ctx + '\n\n' + annotations.map(function (a, i) {
        const n = i + 1;
        const note = a.note || '_(no note)_';
        const meta = a.label + (a.text ? ' · "' + a.text + '"' : '') + ' · `' + a.selector + '`';
        return '**' + n + '.** ' + note + '\n   <sub>' + meta + '</sub>';
      }).join('\n\n');
    } else if (fmt === 'json') {
      txt = JSON.stringify({
        context: ctx,
        annotations: annotations.map(function (a, i) {
          return {
            id: i + 1,
            note: a.note,
            label: a.label,
            text: a.text,
            selector: a.selector,
            path: a.path || '',
            html: a.html || ''
          };
        })
      }, null, 2);
    } else if (fmt === 'ai') {
      // Built to paste straight into a coding agent: unique selector +
      // HTML snapshot per item, so the agent edits the right element
      // without guessing from the human-readable label.
      txt = 'Apply the following ' + annotations.length + ' review annotation' +
        (annotations.length > 1 ? 's' : '') + ' to this page: ' + ctx + '\n' +
        'Each item has the reviewer\'s note, the exact CSS selector of the annotated element, ' +
        'and an HTML snapshot of that element at review time (for disambiguation if the DOM has changed). ' +
        'Make the requested changes.\n\n' +
        annotations.map(function (a, i) {
          const note = a.note || '(no written note — the reviewer flagged this element for attention)';
          return (i + 1) + '. ' + note + '\n' +
            '   selector: ' + (a.path || a.selector) + '\n' +
            (a.html ? '   element: ' + a.html + '\n' : '') +
            '   label: ' + a.label + (a.text ? ' · "' + a.text + '"' : '');
        }).join('\n\n');
    } else {
      txt = annotations.map(function (a, i) {
        const n = i + 1;
        const noteStr = a.note ? ': ' + a.note : '';
        return n + '. [' + a.label + (a.text ? ' "' + a.text + '"' : '') + ']' + noteStr;
      }).join('\n') + '\n\n@ ' + ctx;
    }

    navigator.clipboard.writeText(txt).then(function () {
      const n = annotations.length;
      showToast('✓ 已复制 ' + n + ' 条标注（' + fmt.toUpperCase() + '）');
    }).catch(function () {
      showToast('复制失败 — 请检查剪贴板权限。');
    });
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove('mm-undoable');
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () { toast.classList.remove('show'); }, 2000);
  }

  function showUndoToast(msg) {
    toast.textContent = msg;
    const btn = document.createElement('button');
    btn.className = 'mm-undo-btn';
    btn.textContent = '撤销';
    btn.addEventListener('click', function () {
      undoClear();
      toast.classList.remove('show', 'mm-undoable');
      clearTimeout(showToast._t);
    });
    toast.appendChild(btn);
    toast.classList.add('show', 'mm-undoable');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toast.classList.remove('show', 'mm-undoable');
      undoStash = null;
    }, 5000);
  }

  // ---------- Panel drag ----------
  /* 一体 shell 拖拽：关/开共用同一锚点，位置写入 localStorage。 */
  function setupPanelDrag() {
    const head = document.getElementById('mm-head');
    const storageKey = 'html-mark:panel-position';
    let start = null;
    let dragged = false;

    /* 把坐标限制在当前视口内。 */
    function place(left, top) {
      const maxLeft = Math.max(0, window.innerWidth - panel.offsetWidth);
      const maxTop = Math.max(0, window.innerHeight - panel.offsetHeight);
      panel.style.left = Math.min(Math.max(0, left), maxLeft) + 'px';
      panel.style.top = Math.min(Math.max(0, top), maxTop) + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    }

    /* 从稳定 key 恢复；无效数据沿用默认右下角。 */
    function restorePos() {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey));
        if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) place(saved.left, saved.top);
      } catch (_) {
        /* localStorage 不可用时仍保留本次会话拖拽。 */
      }
    }

    function onMove(event) {
      if (!start || event.pointerId !== start.pointerId) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (!dragged) {
        if (Math.hypot(dx, dy) <= 6) return;
        dragged = true;
        head.classList.add('dragging');
      }
      place(start.left + dx, start.top + dy);
    }

    function onUp(event) {
      if (!start || event.pointerId !== start.pointerId) return;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      if (dragged) {
        const rect = panel.getBoundingClientRect();
        try {
          localStorage.setItem(storageKey, JSON.stringify({ left: rect.left, top: rect.top }));
        } catch (_) {
          /* 不阻断 Mark。 */
        }
        window.setTimeout(function () { dragged = false; }, 0);
      }
      head.classList.remove('dragging');
      start = null;
    }

    head.addEventListener('pointerdown', function (event) {
      if (event.button !== undefined && event.button !== 0) return;
      if (event.target.closest('.mm-panel-iconbtn')) return;
      const rect = panel.getBoundingClientRect();
      start = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
      dragged = false;
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);
    });
    /* 拖过之后吞掉 click，避免误开关模式。 */
    toggle.addEventListener('click', function (event) {
      if (!dragged) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      dragged = false;
    }, true);

    window.addEventListener('resize', function () {
      if (panel.style.left) place(panel.getBoundingClientRect().left, panel.getBoundingClientRect().top);
    });
    restorePos();
  }

  /* 开合/收起后尺寸变化时把 shell 夹回视口。 */
  function clampShellPosition() {
    if (!panel.style.left) return;
    const left = parseFloat(panel.style.left);
    const top = parseFloat(panel.style.top);
    if (!Number.isFinite(left) || !Number.isFinite(top)) return;
    const maxLeft = Math.max(0, window.innerWidth - panel.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - panel.offsetHeight);
    panel.style.left = Math.min(Math.max(0, left), maxLeft) + 'px';
    panel.style.top = Math.min(Math.max(0, top), maxTop) + 'px';
  }
})();
