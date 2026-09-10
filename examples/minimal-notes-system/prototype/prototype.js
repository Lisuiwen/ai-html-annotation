(() => {
  /* Product DOM is only a state output target; all combined state lives in PrototypeViewers. */
  const viewers = window.PrototypeViewers;
  if (!viewers) throw new Error('PrototypeViewers state coordinator not loaded');

  const layerNames = ['create', 'edit', 'strategy'];
  const modalByLayer = {
    create: document.getElementById('createModal'),
    edit: document.getElementById('editModal'),
    strategy: document.getElementById('strategyModal')
  };
  const selectById = {
    strategyName: {
      root: document.getElementById('strategyNameSelect'),
      trigger: document.querySelector('#strategyNameSelect [data-action="select-toggle"]'),
      value: document.getElementById('strategyNameValue'),
      options: [...document.querySelectorAll('#strategyNameOptions [data-action="select-option"]')]
    },
    strategyCondition: {
      root: document.getElementById('strategyConditionSelect'),
      trigger: document.querySelector('#strategyConditionSelect [data-action="select-toggle"]'),
      value: document.getElementById('strategyConditionValue'),
      options: [...document.querySelectorAll('#strategyConditionOptions [data-action="select-option"]')]
    }
  };
  let lastOpenLayers = [];

  /* Normalize external scenarios or partial updates into complete, predictable product state. */
  function normalizeProductState(value) {
    const source = value && typeof value === 'object' ? value : {};
    const sourceSelects = source.selects && typeof source.selects === 'object' ? source.selects : {};
    const layers = Array.isArray(source.layers)
      ? source.layers.filter((layer) => layerNames.includes(layer))
      : [];
    return {
      ...source,
      page: 'list',
      layers,
      selects: Object.fromEntries(Object.keys(selectById).map((id) => {
        const select = sourceSelects[id] && typeof sourceSelects[id] === 'object' ? sourceSelects[id] : {};
        return [id, {
          open: Boolean(select.open),
          value: typeof select.value === 'string' ? select.value : ''
        }];
      }))
    };
  }

  function layersSignature(layers) {
    return layers.join('|');
  }

  function isLayerOpen(product, layerName) {
    return product.page === 'list' && product.layers.includes(layerName);
  }

  /* Adapter projects a single JS state into hidden, visual classes, and ARIA. */
  function applyProductState(value) {
    const product = normalizeProductState(value);
    layerNames.forEach((layerName) => {
      const modal = modalByLayer[layerName];
      const active = isLayerOpen(product, layerName);
      modal.hidden = !active;
      modal.classList.toggle('is-open', active);
      modal.setAttribute('aria-hidden', String(!active));
    });

    Object.entries(selectById).forEach(([id, elements]) => {
      const select = product.selects[id];
      elements.root.classList.toggle('is-open', select.open);
      elements.trigger.setAttribute('aria-expanded', String(select.open));
      elements.value.textContent = select.value || 'Please select';
      elements.options.forEach((option) => {
        option.setAttribute('aria-selected', String(Boolean(select.value) && option.textContent.trim() === select.value));
      });
    });

    const openLayers = product.layers.filter((layer) => layerNames.includes(layer));
    const nextSignature = layersSignature(openLayers);
    const prevSignature = layersSignature(lastOpenLayers);
    if (openLayers.length && nextSignature !== prevSignature) {
      const focusLayer = openLayers[openLayers.length - 1];
      const focusTarget = modalByLayer[focusLayer].querySelector('input, button, textarea');
      if (focusTarget) window.requestAnimationFrame(() => focusTarget.focus());
    }
    lastOpenLayers = openLayers;
  }

  viewers.registerState('product', {
    normalize: normalizeProductState,
    apply: applyProductState
  });

  /* Merge nested product-state dimensions so one Select update does not overwrite open layers or other selects. */
  function patchProductState(partial) {
    const current = normalizeProductState(viewers.getState().product);
    viewers.patchState({
      product: {
        ...current,
        ...partial,
        layers: partial.layers ? [...partial.layers] : current.layers,
        selects: partial.selects ? { ...current.selects, ...partial.selects } : current.selects
      }
    });
  }

  /* Activate a stable scenario name; coordinator restores combined product state and matching notes. */
  function activateLayerScenario(id) {
    viewers.activateScenario(id);
  }

  /* Update one Select open/selected state while leaving other combined state unchanged. */
  function patchSelectState(id, partial) {
    const current = normalizeProductState(viewers.getState().product);
    patchProductState({
      selects: {
        [id]: { ...current.selects[id], ...partial }
      }
    });
  }

  /* Locate a registered Select from the event node without inferring identity from style classes. */
  function findSelectId(node) {
    return Object.keys(selectById).find((id) => selectById[id].root.contains(node));
  }

  /* Close dropdowns outside the click target and commit combined state in one transaction. */
  function closeOtherSelects(target) {
    const current = normalizeProductState(viewers.getState().product);
    let changed = false;
    const nextSelects = { ...current.selects };
    Object.entries(selectById).forEach(([id, elements]) => {
      if (current.selects[id].open && !elements.root.contains(target)) {
        nextSelects[id] = { ...current.selects[id], open: false };
        changed = true;
      }
    });
    if (changed) patchProductState({ selects: nextSelects });
  }

  /* Show brief result feedback; currently only for prototype action closure. */
  function showToast(message) {
    const region = document.getElementById('toastRegion');
    const toast = document.createElement('div');
    toast.className = 'ui-toast';
    toast.textContent = message;
    region.replaceChildren(toast);
    window.setTimeout(() => toast.remove(), 1800);
  }

  document.getElementById('createButton').addEventListener('click', () => activateLayerScenario('create'));
  document.getElementById('resetButton').addEventListener('click', () => {
    document.getElementById('filterName').value = '';
    document.getElementById('filterCode').value = '';
  });
  document.getElementById('queryButton').addEventListener('click', () => showToast('Search complete'));

  document.addEventListener('click', (event) => {
    const actionTarget = event.target.closest('[data-action]');
    if (!actionTarget) {
      closeOtherSelects(event.target);
      return;
    }

    const action = actionTarget.dataset.action;
    if (action === 'edit') activateLayerScenario('edit');
    if (action === 'delete' && window.confirm('delete this configuration item?')) showToast('deleted');
    if (action === 'close') activateLayerScenario('base');
    if (action === 'save') {
      activateLayerScenario('base');
      showToast('saved');
    }
    if (action === 'select-toggle') {
      const id = findSelectId(actionTarget);
      const current = normalizeProductState(viewers.getState().product);
      if (id) patchSelectState(id, { open: !current.selects[id].open });
    }
    if (action === 'select-option') {
      const id = findSelectId(actionTarget);
      if (id) patchSelectState(id, { open: false, value: actionTarget.textContent.trim() });
    }
    closeOtherSelects(event.target);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const current = normalizeProductState(viewers.getState().product);
    if (current.layers.length) {
      activateLayerScenario('base');
      return;
    }
    patchProductState({
      selects: Object.fromEntries(Object.entries(current.selects).map(([id, select]) => [id, { ...select, open: false }]))
    });
  });

  /* ponytail: currently only reproduces screenshot-confirmed static state and review flow; replace mock behavior after real APIs, validation, and full-page capture. */
})();