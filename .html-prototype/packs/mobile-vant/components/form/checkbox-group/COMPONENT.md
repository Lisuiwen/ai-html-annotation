---
id: form.checkbox-group
category: form
---

# Checkbox Group

Vant-style multi-choice group rendered as stacked cell rows. The adapter
projects checked options.

## States

Confirmed:

- `value` — array of `data-mv-key` ids that are checked.
- `options` — optional array of `{ key, label }`; when provided the adapter
  rebuilds the option rows.

## Adapter

`state-adapter.js` exposes `window.PrototypeUiAdapters['form.checkbox-group']`
with `render(root, state)`:

```js
{ value?: string[], options?: [{ key, label }] }
```

The adapter rebuilds rows from `options` when present and syncs the
`mv-checkbox-group__item--checked` class plus `aria-checked` on every row.
Selection handling and state commits belong to the final prototype's business
Adapter.
