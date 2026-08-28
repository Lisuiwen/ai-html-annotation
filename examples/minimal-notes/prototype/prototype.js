(() => {
      /* 业务 DOM 只作为状态输出目标，所有组合状态统一存入 PrototypeViewers。 */
      const viewers = window.PrototypeViewers;
      if (!viewers) throw new Error('PrototypeViewers 状态协调器未加载');

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
      let lastAppliedLayer = 'base';

      /* 将外部场景或局部更新归一为完整、可预测的产品状态。 */
      function normalizeProductState(value) {
        const source = value && typeof value === 'object' ? value : {};
        const sourceSelects = source.selects && typeof source.selects === 'object' ? source.selects : {};
        const allowedLayers = new Set(['base', 'create', 'edit', 'strategy']);
        return {
          ...source,
          layer: allowedLayers.has(source.layer) ? source.layer : 'base',
          selects: Object.fromEntries(Object.keys(selectById).map((id) => {
            const select = sourceSelects[id] && typeof sourceSelects[id] === 'object' ? sourceSelects[id] : {};
            return [id, {
              open: Boolean(select.open),
              value: typeof select.value === 'string' ? select.value : ''
            }];
          }))
        };
      }

      /* Adapter 负责把单一 JS 状态投影为 hidden、视觉 class 与 ARIA。 */
      function applyProductState(value) {
        const product = normalizeProductState(value);
        Object.entries(modalByLayer).forEach(([layerName, modal]) => {
          const active = product.layer === layerName;
          modal.hidden = !active;
          modal.classList.toggle('is-open', active);
          modal.setAttribute('aria-hidden', String(!active));
        });

        Object.entries(selectById).forEach(([id, elements]) => {
          const select = product.selects[id];
          elements.root.classList.toggle('is-open', select.open);
          elements.trigger.setAttribute('aria-expanded', String(select.open));
          elements.value.textContent = select.value || '请选择';
          elements.options.forEach((option) => {
            option.setAttribute('aria-selected', String(Boolean(select.value) && option.textContent.trim() === select.value));
          });
        });

        /* 仅在用户或场景真正切换浮层时移动焦点，避免普通状态补丁打断输入。 */
        if (product.layer !== 'base' && product.layer !== lastAppliedLayer) {
          const focusTarget = modalByLayer[product.layer].querySelector('input, button, textarea');
          if (focusTarget) window.requestAnimationFrame(() => focusTarget.focus());
        }
        lastAppliedLayer = product.layer;
      }

      viewers.registerState('product', {
        normalize: normalizeProductState,
        apply: applyProductState
      });

      /* 合并产品状态的嵌套维度，避免一次 Select 更新覆盖当前浮层或其他选择器。 */
      function patchProductState(partial) {
        const current = normalizeProductState(viewers.getState().product);
        viewers.patchState({
          product: {
            ...current,
            ...partial,
            selects: partial.selects ? { ...current.selects, ...partial.selects } : current.selects
          }
        });
      }

      /* 激活稳定场景名，由协调器同时恢复业务组合状态与对应说明。 */
      function activateLayerScenario(id) {
        viewers.activateScenario(id);
      }

      /* 更新一个 Select 的展开或选中状态，其余组合状态保持不变。 */
      function patchSelectState(id, partial) {
        const current = normalizeProductState(viewers.getState().product);
        patchProductState({
          selects: {
            [id]: { ...current.selects[id], ...partial }
          }
        });
      }

      /* 根据事件节点定位已注册的 Select，不读取样式 class 推断业务身份。 */
      function findSelectId(node) {
        return Object.keys(selectById).find((id) => selectById[id].root.contains(node));
      }

      /* 关闭点击目标之外的下拉框，并以一次事务提交组合状态。 */
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

      /* 显示简短结果反馈；当前仅服务于原型操作闭环。 */
      function showToast(message) {
        const region = document.getElementById('toastRegion');
        const toast = document.createElement('div');
        toast.className = 'ui-toast';
        toast.textContent = message;
        region.replaceChildren(toast);
        window.setTimeout(() => toast.remove(), 1800);
      }

      /* 唯一入口按钮直接绑定稳定 id，不需要额外动作标签。 */
      document.getElementById('createButton').addEventListener('click', () => activateLayerScenario('create'));
      document.getElementById('resetButton').addEventListener('click', () => {
        document.getElementById('filterName').value = '';
        document.getElementById('filterCode').value = '';
      });
      document.getElementById('queryButton').addEventListener('click', () => showToast('查询完成'));

      /* 重复的表格、浮层与 Select 操作统一使用一个 data-action 入口。 */
      document.addEventListener('click', (event) => {
        const actionTarget = event.target.closest('[data-action]');
        if (!actionTarget) {
          closeOtherSelects(event.target);
          return;
        }

        const action = actionTarget.dataset.action;
        if (action === 'edit') activateLayerScenario('edit');
        if (action === 'delete' && window.confirm('确认删除该配置项吗？')) showToast('删除成功');
        if (action === 'close') activateLayerScenario('base');
        if (action === 'save') {
          activateLayerScenario('base');
          showToast('保存成功');
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

      /* Escape 优先关闭当前浮层，否则收起所有下拉框。 */
      document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        const current = normalizeProductState(viewers.getState().product);
        if (current.layer !== 'base') {
          activateLayerScenario('base');
          return;
        }
        patchProductState({
          selects: Object.fromEntries(Object.entries(current.selects).map(([id, select]) => [id, { ...select, open: false }]))
        });
      });

      /* ponytail: 当前只还原截图确认的静态状态和评审流程；取得真实接口、校验和完整页面截图后替换 mock 行为。 */
    })();
