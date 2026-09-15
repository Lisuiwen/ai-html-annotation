---
id: feedback.toast
category: feedback
---

# Toast

Vant-style transient message toast. Visibility and copy are projected by the
adapter; timeout dismiss is the final prototype's business responsibility.

## States

Confirmed:

- `visible` — boolean.
- `message` — text content.
- `type` — `text | success | fail | loading`; selects the leading glyph.

Provisional (`ponytail:`): success/fail glyphs are unicode symbols until a real
icon source is confirmed; loading uses a CSS spinner.

## Adapter

`state-adapter.js` exposes `window.PrototypeUiAdapters['feedback.toast']` with
`render(root, state)`:

```js
{ visible?: boolean, message?: string, type?: 'text'|'success'|'fail'|'loading' }
```

The adapter only syncs visibility, copy, and the leading glyph on the given
`[data-mv-key="toast"]` root. Auto-dismiss timing belongs to the final
prototype's business Adapter.
