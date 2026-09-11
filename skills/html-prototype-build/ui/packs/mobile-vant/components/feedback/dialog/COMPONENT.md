---
id: feedback.dialog
category: feedback
---

# Dialog

Vant-style modal dialog with title, message, and confirm/cancel actions.
Overlay visibility is projected by the adapter; dismissal timing is the final
prototype's business responsibility.

## States

Confirmed:

- `visible` — boolean; renders the overlay surface.
- `title` — header text (optional).
- `message` — body text.
- `show-cancel` — boolean; whether the cancel action renders.
- `confirm-text` — confirm action label.
- `cancel-text` — cancel action label.

Provisional (`ponytail:`): overlay dim color uses `--mv-overlay-color`; the
leaf ships `role="dialog" aria-modal="true" aria-labelledby` already. Focus
management and escape-key handling are left to the final prototype.

## Adapter

`state-adapter.js` exposes `window.PrototypeUiAdapters['feedback.dialog']` with
`render(root, state)`:

```js
{
  visible?: boolean, title?: string, message?: string,
  showCancel?: boolean, confirmText?: string, cancelText?: string
}
```

The adapter only syncs visibility, copy, and the cancel action row on the given
`[data-mv-key="dialog"]` root. Button click handling and state commits belong
to the final prototype's business Adapter.
