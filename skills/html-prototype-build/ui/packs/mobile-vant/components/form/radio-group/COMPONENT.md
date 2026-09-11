---
id: form.radio-group
category: form
---

# Radio Group

Vant-style single-choice group rendered as stacked cell rows. The adapter
projects the selected option.

## States

Confirmed:

- `value` — the `data-mv-key` id of the selected option.
- `options` — optional array of `{ key, label }`; when provided the adapter
  rebuilds the option rows.

## Adapter

`state-adapter.js` exposes `window.PrototypeUiAdapters['form.radio-group']`
with `render(root, state)`:

```js
{ value?: string, options?: [{ key, label }] }
```

The adapter rebuilds rows from `options` when present and syncs the
`mv-radio-group__item--checked` class plus `aria-checked` on every row.
Selection handling and state commits belong to the final prototype's business
Adapter.
