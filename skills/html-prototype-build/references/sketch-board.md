# Sketch Board Components

## Scope

Use this entry when adding or changing a placeable item on the module sketch board (`sketch/`). The board is a layout reference for screenshots. It is not a prototype page and it does not write a layout file.

## Decision

Add atoms, not composite demos.

A pack `component.html` is a demo. It often groups several controls (a button row, a labeled field, a full header, a menu). The sketch palette must not mount that demo as one item. Each palette control is one atom: one button, one input, one menu item, one tab, placed and sized on its own.

A region that is already one layout block may mount the whole sample. That list is table, filter bar, card, modal, drawer, and chart. Do not split those into inner cells, columns, or series.

Do not edit pack files to make an atom. Read `component.html` and copy a node into the board. Sample labels, hidden panels, and id prefixes change only on that copy.

## How to add one

Declare the atom in `sketch/atoms.js`. `sketch/mount.js` clones it; do not add a second extractor.

| Field | Use |
|---|---|
| `componentId` | Manifest component whose `component.html` and CSS are read. |
| `selector` | Node to clone. `null` only for a whole-sample block. |
| `piece` | Keep one descendant and a shallow parent so group CSS still applies. |
| `strip` | Drop an open layer such as a menu or date panel. |
| `text` / `textSelector` | Change the visible label on the copy. Do not set `textContent` on a node that contains an input. |
| `sizing` or `sizingKey` | `none` drag only, `x` width only, `y` height only, `both` both axes. Never `transform: scale()`. |

`visibility: internal` components such as `_echarts-core` are not palette items. Their CSS still loads through `requires`. Charts are the only atoms that load a pack script, and they paint the pack sample series onto the stamp.
