(() => {
  'use strict';
  /* Product DOM is only a state output target; all combined state lives in PrototypeViewers. */
  const viewers = window.PrototypeViewers;
  if (!viewers) throw new Error('PrototypeViewers state coordinator not loaded');

  const pages = {
    list: document.getElementById('listPage'),
    form: document.getElementById('formPage')
  };
  const dialogRoot = document.getElementById('submitDialog');
  const toastRoot = document.getElementById('toast');
  const urgentSwitch = document.getElementById('urgentSwitch');
  const priorityCell = document.getElementById('priorityCell');
  const priorityValue = document.getElementById('priorityValue');
  const submitButton = document.getElementById('submitButton');
  const formTitle = document.getElementById('formTitle');
  const formDescription = document.getElementById('formDescription');
  const adapters = window.PrototypeUiAdapters;

  const priorities = ['普通', '紧急', '加急'];
  let toastTimer = 0;

  /* Normalize external scenario or partial updates into complete, predictable product state. */
  function normalizeProductState(value) {
    const source = value && typeof value === 'object' ? value : {};
    const page = source.page === 'form' ? 'form' : 'list';
    const form = source.form && typeof source.form === 'object' ? source.form : {};
    return {
      page,
      form: {
        title: typeof form.title === 'string' ? form.title : '',
        description: typeof form.description === 'string' ? form.description : '',
        priority: priorities.includes(form.priority) ? form.priority : '普通',
        urgent: !!form.urgent,
        errors: {
          title: typeof form.errors?.title === 'string' ? form.errors.title : '',
          description: typeof form.errors?.description === 'string' ? form.errors.description : ''
        }
      },
      dialog: {
        visible: !!(source.dialog && source.dialog.visible),
        confirm: !!(source.dialog && source.dialog.confirm)
      },
      toast: {
        visible: !!(source.toast && source.toast.visible),
        message: source.toast && typeof source.toast.message === 'string' ? source.toast.message : '',
        type: ['text', 'success', 'fail', 'loading'].includes(source.toast && source.toast.type) ? source.toast.type : 'text'
      }
    };
  }

  /* Project business state onto the page shell and the UI pack leaf adapters. */
  function applyProductState(value) {
    const state = normalizeProductState(value);

    Object.entries(pages).forEach(([name, page]) => {
      page.classList.toggle('is-active', state.page === name);
      page.hidden = state.page !== name;
    });

    /* Leaf adapters: each maps local state onto a [data-mv-key] root. */
    if (adapters['navigation.tab-bar'] && state.page === 'list') {
      adapters['navigation.tab-bar'].render(pages.list, { active: 'home' });
    }
    const fieldRows = [...document.querySelectorAll('#formPage .mv-form-page__group .mv-field')];
    if (adapters['form.field']) {
      adapters['form.field'].render(fieldRows[0], {
        label: '标题', required: true, value: state.form.title,
        placeholder: '请输入工单标题', error: state.form.errors.title
      });
      adapters['form.field'].render(fieldRows[1], {
        label: '描述', required: false, value: state.form.description,
        placeholder: '请描述问题现象', error: state.form.errors.description
      });
    }
    if (adapters['form.switch']) {
      adapters['form.switch'].render(urgentSwitch.parentElement, { checked: state.form.urgent });
    }
    if (adapters['action.button']) {
      adapters['action.button'].render(submitButton.parentElement, { type: 'primary', block: true, text: '提交工单' });
    }
    if (adapters['feedback.dialog']) {
      adapters['feedback.dialog'].render(dialogRoot.parentElement, {
        visible: state.dialog.visible,
        title: '确认提交',
        message: '确定提交这条工单吗？',
        showCancel: true,
        confirmText: '确认',
        cancelText: '取消'
      });
    }
    if (adapters['feedback.toast']) {
      adapters['feedback.toast'].render(toastRoot.parentElement, {
        visible: state.toast.visible,
        message: state.toast.message || '加载中...',
        type: state.toast.type
      });
    }

    priorityValue.textContent = state.form.priority;
  }

  viewers.registerState('product', {
    normalize: normalizeProductState,
    apply: applyProductState
  });

  /* Merge nested product-state dimensions so one update does not overwrite the page or other fields. */
  function patchProductState(partial) {
    const current = normalizeProductState(viewers.getState().product);
    viewers.patchState({
      product: {
        ...current,
        ...partial,
        form: partial.form ? { ...current.form, ...partial.form, errors: partial.form.errors ? { ...current.form.errors, ...partial.form.errors } : current.form.errors } : current.form,
        dialog: partial.dialog ? { ...current.dialog, ...partial.dialog } : current.dialog,
        toast: partial.toast ? { ...current.toast, ...partial.toast } : current.toast
      }
    });
  }

  /* Show a transient toast via PrototypeViewers; dismissal timing is business-owned. */
  function showToast(message, type) {
    patchProductState({ toast: { visible: true, message, type: type || 'text' } });
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      patchProductState({ toast: { visible: false } });
    }, 1800);
  }

  /* Page navigation. */
  function goToPage(page) {
    patchProductState({ page });
  }

  document.getElementById('listPage').querySelector('.mv-nav-bar__right').addEventListener('click', () => {
    patchProductState({
      page: 'form',
      dialog: { visible: false, confirm: false },
      toast: { visible: false }
    });
  });
  document.querySelector('#formPage .mv-nav-bar__back').addEventListener('click', () => goToPage('list'));
  document.querySelector('#formPage .mv-nav-bar__right').addEventListener('click', () => {
    submitButton.click();
  });

  urgentSwitch.addEventListener('click', () => {
    const current = normalizeProductState(viewers.getState().product);
    patchProductState({ form: { urgent: !current.form.urgent } });
  });

  priorityCell.addEventListener('click', () => {
    const current = normalizeProductState(viewers.getState().product);
    const index = priorities.indexOf(current.form.priority);
    const next = priorities[(index + 1) % priorities.length];
    patchProductState({ form: { priority: next } });
  });

  submitButton.addEventListener('click', () => {
    const current = normalizeProductState(viewers.getState().product);
    const errors = {
      title: current.form.title.trim() ? '' : '请输入工单标题',
      description: current.form.description.trim() ? '' : '请描述问题现象'
    };
    if (errors.title || errors.description) {
      patchProductState({ form: { errors } });
      showToast('请完善必填项', 'fail');
      return;
    }
    patchProductState({ form: { errors } });
    patchProductState({ dialog: { visible: true, confirm: false } });
  });

  dialogRoot.querySelector('[data-mv-key="cancel"]').addEventListener('click', () => {
    patchProductState({ dialog: { visible: false, confirm: false } });
  });
  dialogRoot.querySelector('[data-mv-key="confirm"]').addEventListener('click', () => {
    patchProductState({ dialog: { visible: false, confirm: true } });
    showToast('提交成功', 'success');
    window.setTimeout(() => goToPage('list'), 250);
  });

  const fieldInputs = [...document.querySelectorAll('#formPage .mv-form-page__group .mv-field input[data-mv-key="input"]')];
  fieldInputs[0].addEventListener('input', (event) => {
    patchProductState({ form: { title: event.target.value } });
  });
  fieldInputs[1].addEventListener('input', (event) => {
    patchProductState({ form: { description: event.target.value } });
  });

  /* Close dialog on Escape; overlay click is a dialog cancel. */
  dialogRoot.querySelector('[data-mv-key="mask"]').addEventListener('click', () => {
    patchProductState({ dialog: { visible: false, confirm: false } });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const current = normalizeProductState(viewers.getState().product);
    if (current.dialog.visible) patchProductState({ dialog: { visible: false, confirm: false } });
  });

  /* ponytail: priority selection and order statuses are static demo data; wire real APIs and validation after evidence. */
})();
