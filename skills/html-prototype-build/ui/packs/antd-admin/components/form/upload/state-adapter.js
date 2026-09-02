/* 上传控件局部状态投影：只同步变体、禁用与文件列表，不处理选择与上传请求。 */
(function () {
  'use strict';
  var adapters = window.PrototypeUiAdapters = window.PrototypeUiAdapters || {};
  /* 归一化单个文件项，过滤未知状态。 */
  function normalizeFile(file) {
    var item = file && typeof file === 'object' ? file : {};
    var status = ['done', 'uploading', 'error'].indexOf(item.status) !== -1 ? item.status : 'done';
    return {
      uid: typeof item.uid === 'string' ? item.uid : '',
      name: typeof item.name === 'string' ? item.name : '',
      status: status,
      percent: typeof item.percent === 'number' ? item.percent : 0
    };
  }
  /* 归一化上传控件状态，未知变体回退按钮模式。 */
  function normalize(value) {
    var state = value && typeof value === 'object' ? value : {};
    return {
      variant: state.variant === 'dragger' ? 'dragger' : 'button',
      disabled: !!state.disabled,
      files: Array.isArray(state.files) ? state.files.map(normalizeFile).filter(function (file) { return file.uid && file.name; }) : []
    };
  }
  /* 根据文件状态创建列表项 DOM。 */
  function createFileItem(file) {
    var item = document.createElement('li');
    item.className = 'ui-upload-list-item is-' + file.status;
    item.setAttribute('data-uid', file.uid);
    var name = document.createElement('span');
    name.className = 'ui-upload-list-item-name';
    name.textContent = file.name;
    item.appendChild(name);
    if (file.status === 'uploading') {
      var progress = document.createElement('div');
      progress.className = 'ui-upload-list-item-progress';
      var bar = document.createElement('span');
      bar.style.width = Math.max(0, Math.min(100, file.percent)) + '%';
      progress.appendChild(bar);
      item.appendChild(progress);
    }
    if (file.status === 'error') {
      var status = document.createElement('span');
      status.className = 'ui-upload-list-item-status';
      status.textContent = '上传失败';
      item.appendChild(status);
    }
    return item;
  }
  /* 同步变体修饰类、禁用态与文件列表投影。 */
  function render(root, value) {
    if (!root) return;
    var state = normalize(value);
    var button = root.querySelector('.ui-upload-button');
    var list = root.querySelector('.ui-upload-list');
    root.classList.toggle('ui-upload--button', state.variant === 'button');
    root.classList.toggle('ui-upload--dragger', state.variant === 'dragger');
    root.classList.toggle('is-disabled', state.disabled);
    if (button) button.disabled = state.disabled;
    if (list) {
      list.innerHTML = '';
      state.files.forEach(function (file) {
        list.appendChild(createFileItem(file));
      });
    }
  }
  adapters['form.upload'] = { normalize: normalize, render: render };
})();
