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

File upload control with button and drag-and-drop variants. The Adapter only projects the file list and upload progress; real file selection, drag-and-drop, and upload requests are handled by the page.

## State Adapter

`state-adapter.js` exposes `window.PrototypeUiAdapters['form.upload']`; local state is `{ variant: 'button'|'dragger', disabled?: boolean, files: [{ uid, name, status: 'done'|'uploading'|'error', percent?: number }] }`. The final prototype maps business fields to this state; the component Adapter only outputs variant, list, and progress styling.
