---
id: form.switch
category: form
---

# Switch

Vant-style on/off toggle. Local state is projected by the adapter.

## States

Confirmed:

- `checked` — boolean.
- `disabled` — boolean.
- `loading` — boolean; dims the track and adds an inner ring to the node.

## Adapter

`state-adapter.js` exposes `window.PrototypeUiAdapters['form.switch']` with
`render(root, state)`:

```js
{ checked: boolean, disabled?: boolean, loading?: boolean }
```

The adapter only syncs the checked class, `aria-checked`, `disabled`, and the
loading class on the given `[data-mv-key="switch"]` root. Toggle interaction
and state commits belong to the final prototype's business Adapter.
