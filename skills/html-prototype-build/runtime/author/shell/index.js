/* Author Tools Shell：统一入口、Drawer、Tab 生命周期与公共 Toast。 */
(function () {
  'use strict';

  if (window.AuthorTools && window.AuthorTools.__ready) return;

  var tools = {};
  var activeName = '';
  var open = false;
  var pendingTab = '';
  var panel;
  var toast;
  var dirtyBar;

  var launch;

  function toastMsg(msg) {
    toast.textContent = msg;
    toast.classList.add('is-show');
    clearTimeout(toastMsg._t);
    toastMsg._t = setTimeout(function () { toast.classList.remove('is-show'); }, 2000);
  }

  function hideDirtyBar() {
    dirtyBar.classList.remove('is-show');
    pendingTab = '';
  }

  function currentTool() {
    return tools[activeName] || null;
  }

  function activateTool(name) {
    var next = tools[name];
    if (!next) return;
    var prev = currentTool();
    if (prev && prev !== next && typeof prev.deactivate === 'function') prev.deactivate();
    activeName = name;
    panel.querySelectorAll('.at-tab').forEach(function (tab) {
      tab.classList.toggle('is-active', tab.getAttribute('data-tab') === name);
    });
    panel.querySelectorAll('.at-tool-pane').forEach(function (pane) {
      pane.classList.toggle('is-active', pane.getAttribute('data-pane') === name);
    });
    if (window.PrototypeAuthor) window.PrototypeAuthor.activate(name);
    if (typeof next.activate === 'function') next.activate();
  }

  function requestTab(name) {
    if (!open) openDrawer();
    if (name === activeName) {
      activateTool(name);
      return;
    }
    var prev = currentTool();
    if (prev && typeof prev.isDirty === 'function' && prev.isDirty()) {
      pendingTab = name;
      dirtyBar.classList.add('is-show');
      return;
    }
    hideDirtyBar();
    activateTool(name);
  }

  function discardAndSwitch() {
    var prev = currentTool();
    if (prev && typeof prev.discard === 'function') prev.discard();
    var next = pendingTab || '';
    hideDirtyBar();
    if (next) activateTool(next);
  }

  function ensureNotesExpanded() {
    var page = document.querySelector('.pn-page');
    var toggle = document.querySelector('.pn-toggle');
    if (page && page.classList.contains('pn-collapsed') && toggle) toggle.click();
  }

  function attachShell() {
    var notes = document.querySelector('.pn-notes');
    var actions = document.querySelector('.pn-panel-actions');
    if (!notes || !actions || !launch) return;
    if (window.PrototypeNotesViewer && typeof window.PrototypeNotesViewer.ensureActionsStart === 'function') {
      window.PrototypeNotesViewer.ensureActionsStart();
    }
    var start = actions.querySelector('.pn-panel-actions-start');
    if (start) {
      if (launch.parentElement !== start) start.appendChild(launch);
    } else if (launch.parentElement !== actions) {
      var before = actions.querySelector('.pn-toggle');
      actions.insertBefore(launch, before || null);
    }
    if (window.PrototypeNotesViewer && typeof window.PrototypeNotesViewer.syncPanelActions === 'function') {
      window.PrototypeNotesViewer.syncPanelActions();
    }
    if (panel.parentElement !== notes) {
      if (actions.parentElement === notes) notes.insertBefore(panel, actions);
      else notes.appendChild(panel);
    }
  }

  function openDrawer() {
    ensureNotesExpanded();
    attachShell();
    open = true;
    panel.classList.add('is-open');
    if (launch) launch.classList.add('is-open');
    document.body.classList.add('at-drawer-open');
  }

  function closeDrawer() {
    var prev = currentTool();
    if (prev && typeof prev.isDirty === 'function' && prev.isDirty()) {
      pendingTab = '__close__';
      dirtyBar.classList.add('is-show');
      return;
    }
    hideDirtyBar();
    open = false;
    if (prev && typeof prev.deactivate === 'function') prev.deactivate();
    if (window.AuthorToolsPicker) window.AuthorToolsPicker.release();
    if (window.PrototypeAuthor && (window.PrototypeAuthor.getMode() === 'edit' || window.PrototypeAuthor.getMode() === 'mark')) {
      window.PrototypeAuthor.activate('');
    }
    panel.classList.remove('is-open');
    if (launch) launch.classList.remove('is-open');
    document.body.classList.remove('at-drawer-open');
  }

  function confirmClose() {
    var prev = currentTool();
    pendingTab = '';
    hideDirtyBar();
    open = false;
    if (prev && typeof prev.discard === 'function') prev.discard();
    if (prev && typeof prev.deactivate === 'function') prev.deactivate();
    if (window.AuthorToolsPicker) window.AuthorToolsPicker.release();
    if (window.PrototypeAuthor) window.PrototypeAuthor.activate('');
    panel.classList.remove('is-open');
    if (launch) launch.classList.remove('is-open');
    document.body.classList.remove('at-drawer-open');
  }

  function register(name, tool) {
    tools[name] = tool;
    var pane = panel.querySelector('[data-pane="' + name + '"]');
    if (pane && typeof tool.mount === 'function') {
      tool.mount(pane, {
        picker: window.AuthorToolsPicker,
        toast: toastMsg,
        isOpen: function () { return open; },
        getActive: function () { return activeName; }
      });
    }
  }

  function handleKey(event) {
    var inField = event.target.matches && event.target.matches('input, textarea, select, [contenteditable="true"]');
    if (!inField && (event.key === 'm' || event.key === 'M') && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      requestTab('mark');
      return;
    }
    if (event.key === 'Escape' && open && !inField) {
      if (document.querySelector('.mm-note-pop')) return;
      closeDrawer();
    }
  }

  function build() {
    launch = document.createElement('button');
    launch.type = 'button';
    launch.id = 'at-launch';
    launch.className = 'at-launch at-ui';
    launch.title = '原型工具';
    launch.setAttribute('aria-label', '原型工具');
    launch.innerHTML =
      '<svg class="at-launch-icon" viewBox="0 0 16 16" aria-hidden="true">' +
      '<path d="M11.2 2.2a2.4 2.4 0 0 0-2.2 3.8L4.2 10.8a1.5 1.5 0 1 0 2.1 2.1l4.8-4.8a2.4 2.4 0 0 0 3.8-2.2" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';

    panel = document.createElement('div');
    panel.className = 'at-panel at-ui';
    panel.innerHTML =
      '<div class="at-panel-open">' +
      '  <div class="at-panel-head" id="at-head">' +
      '    <span class="at-panel-title">原型工具</span>' +
      '    <button type="button" class="at-iconbtn" id="at-close" title="关闭">×</button>' +
      '  </div>' +
      '  <div class="at-tabs">' +
      '    <button type="button" class="at-tab is-active" data-tab="edit">Edit</button>' +
      '    <button type="button" class="at-tab" data-tab="mark">Mark</button>' +
      '  </div>' +
      '  <div class="at-panel-body">' +
      '    <div class="at-tool-pane is-active" data-pane="edit"></div>' +
      '    <div class="at-tool-pane" data-pane="mark"></div>' +
      '  </div>' +
      '  <div class="at-dirty-bar" id="at-dirty">' +
      '    <span>当前有未保存的修改</span>' +
      '    <button type="button" class="at-btn" id="at-dirty-keep">继续编辑</button>' +
      '    <button type="button" class="at-btn primary" id="at-dirty-drop">放弃修改</button>' +
      '  </div>' +
      '</div>';

    toast = document.createElement('div');
    toast.className = 'at-toast at-ui';

    document.body.appendChild(toast);
    dirtyBar = panel.querySelector('#at-dirty');
    attachShell();

    launch.addEventListener('click', function () {
      if (open) closeDrawer();
      else requestTab(activeName || 'edit');
    });
    panel.querySelector('#at-close').addEventListener('click', closeDrawer);
    panel.querySelectorAll('.at-tab').forEach(function (tab) {
      tab.addEventListener('click', function () { requestTab(tab.getAttribute('data-tab')); });
    });
    panel.querySelector('#at-dirty-keep').addEventListener('click', hideDirtyBar);
    panel.querySelector('#at-dirty-drop').addEventListener('click', function () {
      if (pendingTab === '__close__') confirmClose();
      else discardAndSwitch();
    });
    document.addEventListener('keydown', handleKey);

    // 只响应 Viewer 渲染完成事件；不要 MutationObserver 监听 notes，
    // 否则 attachShell 搬 DOM 会再次触发观察者，造成重排抖动甚至丢按钮。
    window.addEventListener('prototype-notes:rendered', attachShell);
    var page = document.querySelector('.pn-page');
    if (page) {
      new MutationObserver(function () {
        if (open && page.classList.contains('pn-collapsed')) closeDrawer();
      }).observe(page, { attributes: true, attributeFilter: ['class'] });
    }

    window.addEventListener('prototype-author:mode-change', function (event) {
      if (!open) return;
      var mode = event.detail && event.detail.mode;
      if (mode === 'edit' || mode === 'mark' || mode === 'inspector') return;
      if (!mode && activeName && tools[activeName] && typeof tools[activeName].activate === 'function') {
        tools[activeName].activate();
      }
    });
  }

  function init() {
    if (window.PrototypeAuthorChrome && window.PrototypeAuthorChrome.isProductOnly()) return;
    build();
    if (window.AuthorToolsEditTool) register('edit', window.AuthorToolsEditTool);
    if (window.AuthorToolsMarkTool) register('mark', window.AuthorToolsMarkTool);
    if (window.PrototypeAuthor) {
      window.PrototypeAuthor.register('edit', function () {
        if (tools.edit && typeof tools.edit.deactivate === 'function') tools.edit.deactivate();
      });
      window.PrototypeAuthor.register('mark', function () {
        if (tools.mark && typeof tools.mark.deactivate === 'function') tools.mark.deactivate();
      });
    }
  }

  window.AuthorTools = {
    __ready: true,
    register: function (name, tool) {
      if (!panel) {
        tools[name] = tool;
        return;
      }
      register(name, tool);
    },
    toast: function (msg) { if (toast) toastMsg(msg); },
    open: openDrawer,
    close: closeDrawer,
    requestTab: requestTab,
    init: init
  };

  window.__AUTHOR_TOOLS_LOADED__ = true;
})();
