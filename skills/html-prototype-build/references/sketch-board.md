# Sketch Board Components

## Scope

Use this entry when adding or changing a placeable item on the module sketch board (`sketch/` inside this skill). The board is a free canvas for a rough reference screenshot that the AI uses to implement an increment. **Copy image** puts that canvas on the clipboard and does not download a file. The board is not a prototype page, and it does not write a layout file. It loads atoms from the installed UI pack (project `.html-prototype/packs/`, then `~/.html-prototype/packs/`).

## Where items come from

The board builds its palette from the selected UI pack. It does not keep its own component list. Every item is an atom that the pack declares:

- `manifest.json` → `components[<id>].atoms`: palette label and resize behavior.
- `component.html` → `data-pack-atom="<key>"`: the node to copy.

The palette groups atoms by component `category` in `providers` order. The pack picker in the dock switches packs (`?pack=<id>`, default `admin-desktop`). Switching packs clears the canvas.

To add or change an item, edit the pack, not `sketch/`. The format and rules belong to `ui-pack-maintain`: [Sketch atoms](../../ui-pack-maintain/references/contract.md#sketch-atoms). Validate with `validate-pack.mjs --strict`, which checks that every declared atom is marked exactly once.

## Decision

Add atoms, not composite demos. Mark one button, one input, one menu item, or one tab, not the button row or the whole header. A sample that is already one layout block (table, filter bar, card, modal panel, drawer, chart) is marked as a whole. Do not split it into cells, columns, or series.

For a mobile screen, the board stays free-form. Draw the phone frame with the rectangle tool, then place the pack atoms inside it.

## Board-side behavior

- `sketch/mount.js` is the only extractor. It copies the marked node, keeps `data-pack-atom-scope` ancestors as empty wrappers, drops `data-pack-atom-strip` and `[hidden]` descendants, and prefixes ids per stamp.
- The board resets fixed, sticky, and transformed atom roots to normal flow.
- Resizing never uses `transform: scale()`.
- Charts are the only atoms that load a pack script (`sketch/charts.js`, admin-desktop ECharts bridge). They paint the pack sample series onto the stamp.
- `visibility: internal` components such as `_echarts-core` are never palette items. Their CSS still loads through `requires`.
