---
id: navigation.tab-bar
category: navigation
---

# Tab Bar

Fixed bottom tab bar for primary navigation between up to five destinations.
Each item carries a `data-mv-key` id; the adapter projects the active item.

## States

Confirmed:

- `active` — the `data-mv-key` id of the currently selected item.
- `items` — optional array of `{ key, label, icon? }`; when provided the
  adapter rebuilds the item list so a prototype can drive the tabs from state.

Provisional (`ponytail:`): item glyphs are emoji placeholders (`icon` field,
fallback `•`) because no icon source was confirmed; replace with business icons
once evidence exists.

## Adapter

`state-adapter.js` exposes `window.PrototypeUiAdapters['navigation.tab-bar']`
with `render(root, state)`:

```js
{ active: string, items?: [{ key, label, icon? }] }
```

When `items` is provided the adapter rebuilds the item list, then syncs
`aria-selected` and the `mv-tab-bar__item--active` class on the matching item;
tab switching and routing belong to the final prototype's business Adapter.
