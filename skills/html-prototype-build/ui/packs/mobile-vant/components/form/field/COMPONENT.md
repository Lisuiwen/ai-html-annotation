---
id: form.field
category: form
---

# Field

Vant-style cell input field: label on the left, value/placeholder on the right,
with optional error text and a `required` mark. Local state is projected by the
adapter.

## States

Confirmed:

- `label` — left label text.
- `value` — current input value.
- `placeholder` — empty-state hint.
- `type` — input `type` (default `text`; `number`, `tel`, `password` allowed).
- `required` — boolean; red asterisk next to the label.
- `error` — string; when present, error styling and the message below the field.
- `disabled` — boolean.

Provisional (`ponytail:`): error message copy is placeholder text.

## Adapter

`state-adapter.js` exposes `window.PrototypeUiAdapters['form.field']` with
`render(root, state)`:

```js
{
  label?: string, value?: string, placeholder?: string,
  type?: string, required?: boolean, error?: string, disabled?: boolean
}
```

The adapter writes label, value, placeholder, type, error, required, and
disabled attributes/classes onto the given `[data-mv-key="field"]` root. Input
events and business validation belong to the final prototype.
