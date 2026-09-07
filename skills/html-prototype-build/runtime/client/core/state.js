/* 原型统一状态协调器：JS state 是唯一状态源，业务 DOM 与各 Viewer 都只消费提交后的状态。 */
(function () {
  'use strict';

  if (window.PrototypeViewers) return;

  var currentState = {};
  var scenarioBaseState = {};
  var activeScenario = '';
  var stateAdapters = {};
  var viewers = {};
  var scenarios = {};
  var hasCommitted = false;
  var isCommitting = false;
  var pendingCommit = null;

  /* 判断普通对象，避免把数组和 DOM 对象当作可递归状态处理。 */
  function isPlainObject(value) {
    return !!value && Object.prototype.toString.call(value) === '[object Object]';
  }

  /* 深复制公开状态，防止 Adapter、Viewer 或调用方绕过 setState 直接改写唯一状态源。 */
  function cloneValue(value) {
    if (Array.isArray(value)) return value.map(cloneValue);
    if (!isPlainObject(value)) return value;
    var copy = {};
    Object.keys(value).forEach(function (key) { copy[key] = cloneValue(value[key]); });
    return copy;
  }

  /* 递归合并状态片段；数组按完整值替换，避免多次 patch 后残留旧组合项。 */
  function mergeState(base, patch) {
    var result = isPlainObject(base) ? cloneValue(base) : {};
    if (!isPlainObject(patch)) return result;
    Object.keys(patch).forEach(function (key) {
      result[key] = isPlainObject(patch[key]) && isPlainObject(result[key])
        ? mergeState(result[key], patch[key])
        : cloneValue(patch[key]);
    });
    return result;
  }

  /* 依注册顺序归一化各命名空间，保证业务状态具有稳定结构。 */
  function normalizeState(nextState) {
    var normalized = isPlainObject(nextState) ? cloneValue(nextState) : {};
    Object.keys(stateAdapters).forEach(function (name) {
      var adapter = stateAdapters[name];
      if (!adapter || typeof adapter.normalize !== 'function') return;
      try {
        var normalizedValue = adapter.normalize(cloneValue(normalized[name]), cloneValue(normalized));
        if (normalizedValue !== undefined) normalized[name] = normalizedValue;
      } catch (error) {
        console.error('[prototype-viewers] 状态归一化失败：' + name, error);
      }
    });
    return normalized;
  }

  /* 可选同步场景到 URL；默认不改历史，避免普通状态 patch 污染浏览记录。 */
  function syncSceneUrl(scene, historyMode) {
    if (!historyMode || !window.history || !window.URL) return;
    try {
      var url = new URL(window.location.href);
      if (scene) url.searchParams.set('scene', scene);
      else url.searchParams.delete('scene');
      if (historyMode === 'push') window.history.pushState(null, '', url.toString());
      else if (historyMode === 'replace') window.history.replaceState(null, '', url.toString());
    } catch (_) {
      /* file:// 或旧浏览器不支持 URL 更新时，状态提交本身仍应成功。 */
    }
  }

  /* 执行一次原子提交，严格保持 normalize → adapter apply → viewer render 顺序。 */
  function commit(nextState, options) {
    var opts = options || {};
    if (isCommitting) {
      pendingCommit = { state: cloneValue(nextState), options: opts };
      return getState();
    }
    isCommitting = true;
    currentState = normalizeState(nextState);
    if (opts.baseline) scenarioBaseState = cloneValue(currentState);
    if (Object.prototype.hasOwnProperty.call(opts, 'scene')) activeScenario = opts.scene || '';
    Object.keys(stateAdapters).forEach(function (name) {
      var adapter = stateAdapters[name];
      if (!adapter || typeof adapter.apply !== 'function') return;
      try {
        adapter.apply(cloneValue(currentState[name]), cloneValue(currentState));
      } catch (error) {
        console.error('[prototype-viewers] 状态应用失败：' + name, error);
      }
    });
    Object.keys(viewers).forEach(function (name) {
      var viewer = viewers[name];
      if (!viewer || typeof viewer.render !== 'function') return;
      try {
        viewer.render(cloneValue(currentState));
      } catch (error) {
        console.error('[prototype-viewers] Viewer 渲染失败：' + name, error);
      }
    });
    hasCommitted = true;
    syncSceneUrl(activeScenario, opts.history);
    isCommitting = false;
    if (pendingCommit) {
      var queued = pendingCommit;
      pendingCommit = null;
      return commit(queued.state, queued.options);
    }
    return getState();
  }

  /* 注册一个顶层状态命名空间 Adapter；初始化后注册会立即纳入完整提交流程。 */
  function registerState(name, adapter) {
    if (!name) throw new Error('[prototype-viewers] registerState 缺少 name。');
    stateAdapters[name] = typeof adapter === 'function' ? { apply: adapter } : (adapter || {});
    if (hasCommitted) commit(currentState, { scene: activeScenario });
    return function () { delete stateAdapters[name]; };
  }

  /* 注册状态消费者；初始化后注册立即收到当前完整状态。 */
  function registerViewer(name, viewer) {
    if (!name) throw new Error('[prototype-viewers] registerViewer 缺少 name。');
    viewers[name] = typeof viewer === 'function' ? { render: viewer } : (viewer || {});
    if (hasCommitted && typeof viewers[name].render === 'function') {
      try {
        viewers[name].render(getState());
      } catch (error) {
        console.error('[prototype-viewers] Viewer 初次渲染失败：' + name, error);
      }
    }
    return function () { delete viewers[name]; };
  }

  /* 返回唯一状态源的副本。 */
  function getState() {
    return cloneValue(currentState);
  }

  /* 返回当前激活的显式场景 ID；手动 set/patch 默认会退出场景。 */
  function getActiveScenario() {
    return activeScenario;
  }

  /* 浅复制提交选项，避免内部补默认值时修改调用方对象。 */
  function copyOptions(options) {
    var copy = {};
    Object.keys(options || {}).forEach(function (key) { copy[key] = options[key]; });
    return copy;
  }

  /* 用完整状态替换当前状态。 */
  function setState(nextState, options) {
    var opts = copyOptions(options);
    if (!Object.prototype.hasOwnProperty.call(opts, 'scene')) opts.scene = '';
    return commit(nextState, opts);
  }

  /* 深合并局部状态；数组与原始值按完整值替换。 */
  function patchState(partial, options) {
    var opts = copyOptions(options);
    if (!Object.prototype.hasOwnProperty.call(opts, 'scene')) opts.scene = '';
    return commit(mergeState(currentState, partial), opts);
  }

  /* 注册显式场景；标准结构为 { extends, state }，同时宽容兼容直接状态对象。 */
  function registerScenario(id, configOrState) {
    if (!id) throw new Error('[prototype-viewers] registerScenario 缺少 id。');
    scenarios[id] = cloneValue(configOrState || {});
  }

  /* 递归解析场景继承，并拦截循环 extends。 */
  function resolveScenario(id, chain) {
    var config = scenarios[id];
    if (!config) return null;
    var visited = chain || [];
    if (visited.indexOf(id) !== -1) {
      console.error('[prototype-viewers] 场景继承存在循环：' + visited.concat(id).join(' -> '));
      return null;
    }
    var standard = Object.prototype.hasOwnProperty.call(config, 'state') || Object.prototype.hasOwnProperty.call(config, 'extends');
    var ownState = standard ? config.state || {} : config;
    if (!standard || !config.extends) return cloneValue(ownState);
    var parentState = resolveScenario(config.extends, visited.concat(id));
    return parentState ? mergeState(parentState, ownState) : null;
  }

  /* 激活场景并以 snapshot 默认 state 为基础应用组合，避免从上一场景泄漏状态。 */
  function activateScenario(id, options) {
    var scenarioState = resolveScenario(id, []);
    if (!scenarioState) return false;
    var opts = copyOptions(options);
    opts.scene = id;
    commit(mergeState(scenarioBaseState, scenarioState), opts);
    return true;
  }

  window.PrototypeViewers = {
    registerState: registerState,
    registerViewer: registerViewer,
    getState: getState,
    getActiveScenario: getActiveScenario,
    setState: setState,
    patchState: patchState,
    registerScenario: registerScenario,
    activateScenario: activateScenario
  };
})();
