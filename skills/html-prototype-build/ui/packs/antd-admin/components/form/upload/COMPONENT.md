---
id: form.upload
category: form
requires: []
optional: [form.field]
states:
  confirmed: [empty]
  provisional: [file-list, uploading, error, disabled]
---

# form.upload

文件上传控件，含按钮与拖拽两种变体。Adapter 只投影文件列表与上传进度；真实文件选择、拖拽与上传请求由页面处理。

## 状态 Adapter

`state-adapter.js` 暴露 `window.PrototypeUiAdapters['form.upload']`，局部 state 为 `{ variant: 'button'|'dragger', disabled?: boolean, files: [{ uid, name, status: 'done'|'uploading'|'error', percent?: number }] }`。最终原型负责把业务字段映射到该 state；组件 Adapter 仅输出变体、列表与进度样式。
