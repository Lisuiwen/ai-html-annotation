/* Unified prototype state coordinator: JS state is the single source of truth; product DOM and viewers consume committed state only. */
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

  /* Detect plain objects so arrays and DOM nodes are not treated as recursively mergeable state. */
  function isPlainObject(value) {
    return !!value && Object.prototype.toString.call(value) === '[object Object]';
  }

  /* Deep-clone public state so adapters, viewers, or callers cannot bypass setState and mutate the source of truth. */
  function cloneValue(value) {
    if (Array.isArray(value)) return value.map(cloneValue);
    if (!isPlainObject(value)) return value;
    var copy = {};
    Object.keys(value).forEach(function (key) { copy[key] = cloneValue(value[key]); });
    return copy;
  }

  /* Recursively merge state fragments; arrays replace wholesale to avoid stale combined entries after multiple patches. */
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

  /* Normalize each namespace in registration order so product state has a stable shape. */
  function normalizeState(nextState) {
    var normalized = isPlainObject(nextState) ? cloneValue(nextState) : {};
    Object.keys(stateAdapters).forEach(function (name) {
      var adapter = stateAdapters[name];
      if (!adapter || typeof adapter.normalize !== 'function') return;
      try {
        var normalizedValue = adapter.normalize(cloneValue(normalized[name]), cloneValue(normalized));
        if (normalizedValue !== undefined) normalized[name] = normalizedValue;
      } catch (error) {
        console.error('[prototype-viewers] State normalization failed: ' + name, error);
      }
    });
    return normalized;
  }

  /* Optionally sync scenario to URL; default skips history so routine state patches do not pollute browser history. */
  function syncSceneUrl(scene, historyMode) {
    if (!historyMode || !window.history || !window.URL) return;
    try {
      var url = new URL(window.location.href);
      if (scene) url.searchParams.set('scene', scene);
      else url.searchParams.delete('scene');
      if (historyMode === 'push') window.history.pushState(null, '', url.toString());
      else if (historyMode === 'replace') window.history.replaceState(null, '', url.toString());
    } catch (_) {
      /* State commit should still succeed when file:// or older browsers cannot update the URL. */
    }
  }

  /* Perform one atomic commit in strict order: normalize → adapter apply → viewer render. */
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
        console.error('[prototype-viewers] State apply failed: ' + name, error);
      }
    });
    Object.keys(viewers).forEach(function (name) {
      var viewer = viewers[name];
      if (!viewer || typeof viewer.render !== 'function') return;
      try {
        viewer.render(cloneValue(currentState));
      } catch (error) {
        console.error('[prototype-viewers] Viewer render failed: ' + name, error);
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

  /* Register a top-level state namespace adapter; post-init registration joins the full commit pipeline immediately. */
  function registerState(name, adapter) {
    if (!name) throw new Error('[prototype-viewers] registerState missing name.');
    stateAdapters[name] = typeof adapter === 'function' ? { apply: adapter } : (adapter || {});
    if (hasCommitted) commit(currentState, { scene: activeScenario });
    return function () { delete stateAdapters[name]; };
  }

  /* Register a state consumer; post-init registration receives the current full state immediately. */
  function registerViewer(name, viewer) {
    if (!name) throw new Error('[prototype-viewers] registerViewer missing name.');
    viewers[name] = typeof viewer === 'function' ? { render: viewer } : (viewer || {});
    if (hasCommitted && typeof viewers[name].render === 'function') {
      try {
        viewers[name].render(getState());
      } catch (error) {
        console.error('[prototype-viewers] Viewer initial render failed: ' + name, error);
      }
    }
    return function () { delete viewers[name]; };
  }

  /* Return a copy of the single source of truth. */
  function getState() {
    return cloneValue(currentState);
  }

  /* Return the active explicit scenario ID; manual set/patch exits the scenario by default. */
  function getActiveScenario() {
    return activeScenario;
  }

  /* Shallow-copy commit options so internal default filling does not mutate caller objects. */
  function copyOptions(options) {
    var copy = {};
    Object.keys(options || {}).forEach(function (key) { copy[key] = options[key]; });
    return copy;
  }

  /* Replace current state with a full snapshot. */
  function setState(nextState, options) {
    var opts = copyOptions(options);
    if (!Object.prototype.hasOwnProperty.call(opts, 'scene')) opts.scene = '';
    return commit(nextState, opts);
  }

  /* Deep-merge partial state; arrays and primitives replace wholesale. */
  function patchState(partial, options) {
    var opts = copyOptions(options);
    if (!Object.prototype.hasOwnProperty.call(opts, 'scene')) opts.scene = '';
    return commit(mergeState(currentState, partial), opts);
  }

  /* Register an explicit scenario; standard shape is { extends, state }, with direct state objects also accepted. */
  function registerScenario(id, configOrState) {
    if (!id) throw new Error('[prototype-viewers] registerScenario missing id.');
    scenarios[id] = cloneValue(configOrState || {});
  }

  /* Resolve scenario inheritance recursively and block cyclic extends. */
  function resolveScenario(id, chain) {
    var config = scenarios[id];
    if (!config) return null;
    var visited = chain || [];
    if (visited.indexOf(id) !== -1) {
      console.error('[prototype-viewers] Scenario inheritance cycle: ' + visited.concat(id).join(' -> '));
      return null;
    }
    var standard = Object.prototype.hasOwnProperty.call(config, 'state') || Object.prototype.hasOwnProperty.call(config, 'extends');
    var ownState = standard ? config.state || {} : config;
    if (!standard || !config.extends) return cloneValue(ownState);
    var parentState = resolveScenario(config.extends, visited.concat(id));
    return parentState ? mergeState(parentState, ownState) : null;
  }

  /* Activate a scenario on top of snapshot default state to avoid leaking state from the previous scenario. */
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
