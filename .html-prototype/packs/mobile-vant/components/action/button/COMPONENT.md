---
id: action.button
category: action
---

# Button

Primary touch action control in Vant style: full-width or inline, colored by
type, with loading and disabled states.

## States

Confirmed:

- `type`: `default | primary | success | danger | warning` — surface color.
- `size`: `normal | small | large`.
- `block`: boolean — full-width row.
- `round`: boolean — fully rounded corners.
- `plain`: boolean — outlined surface.
- `disabled`: boolean — reduced contrast, no interaction.
- `loading`: boolean — a CSS spinner is shown beside the label and clicks are
  suppressed.

Provisional (`ponytail:`): the loading spinner is a generic CSS circle shown
beside the label; the exact icon source is unconfirmed.

## Adapter

`state-adapter.js` exposes `window.PrototypeUiAdapters['action.button']` with a
`render(root, state)` entry. Local state is:

```js
{
  type?: 'default'|'primary'|'success'|'danger'|'warning',
  size?: 'normal'|'small'|'large',
  block?: boolean,
  round?: boolean,
  plain?: boolean,
  disabled?: boolean,
  loading?: boolean,
  text?: string
}
```

The adapter only projects classes, text, and disabled semantics onto the given
`[data-mv-key="button"]` root. Click handling and business behavior belong to
the final prototype's business Adapter.
