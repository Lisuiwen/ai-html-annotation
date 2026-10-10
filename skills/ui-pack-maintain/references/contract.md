# UI Pack Contract

This document is the single authoritative, human-readable contract for a UI Pack.
The machine-readable rules live in `scripts/validate-pack.mjs`; this file explains
them and adds the responsibility boundaries the validator cannot judge.

When `validate-pack.mjs` and this document disagree, fix `validate-pack.mjs` first,
then this document. Do not create a second copy of either file inside a consumer
skill: this file and the validator are the only two authoritative sources.

## Pack anatomy

A Pack is a directory containing at minimum:

```
<pack-directory>/
├── PACK.md                  # pack contract: id, name (frontmatter) + prose
├── manifest.json            # the only machine-readable index and dependency source
├── design-system.md         # human-readable token and visual language explanation
├── foundation/              # shared tokens + document-level CSS baseline (DOM-free)
└── components/              # reusable leaf controls, grouped by category
```

Optional registries, present only when the matching object in `manifest.json` is non-empty:

```
<pack-directory>/
├── patterns/                # reusable component order, layout, and slots
└── presets/                 # business-fact-free page starting points
```

Optional resource directories, present when components declare `vendor`, `runtime`, or `assets`:

```
<pack-directory>/
├── vendor/                  # third-party libraries (for example ECharts)
├── runtime/                 # pack-local runtime helpers (for example chart bridge)
└── assets/                  # static files delivered into prototypes
```

Every such referenced file must appear in root `manifest.delivery` (schema v2) with a
prototype-relative target path.

## Layer responsibilities

| Layer | Holds | Must NOT contain |
|---|---|---|
| Foundation | Cross-component tokens and a document-level CSS baseline | Component classes, page shells, DOM, scripts, HTML |
| Component | One reusable control or visual unit per leaf | Business state ownership, page-specific data, scripts that persist/acquire state |
| Pattern | Reusable composition order, layout, slots | Copied component CSS/scripts, business content |
| Preset | Business-fact-free page starting point | Real system names, fields, columns, records |

## manifest.json shape

Required top-level fields:

- `schemaVersion` — positive integer.
- `id` — lowercase hyphen-case, e.g. `vant-h5`.
- `version` — positive integer.
- `classPrefix` — non-empty string ending in `-`. Every `class="..."` value in
  component/pattern/preset HTML and in JS must start with this prefix.
- `tokenPrefix` — non-empty string ending in `-`. Every declared custom property
  and every `var(--...)` reference must use this prefix.
- `foundation` — object with `id`, `contract` (path to the foundation contract),
  and `sources` (non-empty array of CSS paths inside `foundation/`).
- `providers` — object keyed by component category; each provider declares
  `compatibleFoundations` (array of foundation ids) and must include the Pack's
  own foundation id.
- `components` — object keyed by component id.
- `patterns` — optional object keyed by pattern id.
- `presets` — optional object keyed by preset id.
- `delivery` — optional object (schema v2) mapping pack-relative resource paths to
  prototype delivery paths. Required for every `vendor` / `runtime` / `assets` entry
  declared on components. Example: `"vendor/echarts/echarts.min.js": "assets/echarts.min.js"`.

Registry entry fields (`components`, `patterns`, `presets`):

- `contract` — conventional path to the entry contract (see below).
- `source` — conventional path to the entry implementation (see below).
- `requires` / `optional` / `uses` / `assets` / `vendor` / `runtime` — arrays of
  strings when present. `requires` lists required dependencies; `optional` lists
  conditional capabilities; `uses` is for Presets referencing Patterns.
- `adapter` — Components only. Path to a local state adapter.
- `atoms` — Components only, optional. Placeable sketch pieces; see [Sketch atoms](#sketch-atoms).

Conventional paths (the validator enforces these exactly):

- Component `category.<leaf>` → `components/<category>/<leaf>/COMPONENT.md` and
  `components/<category>/<leaf>/component.html`.
- Pattern `pattern.<leaf>` → `patterns/<leaf>/PATTERN.md` and
  `patterns/<leaf>/pattern.html`.
- Preset `preset.<leaf>` → `presets/<leaf>/PRESET.md` and
  `presets/<leaf>/seed.html`.

## Entry contract frontmatter

Every `COMPONENT.md`, `PATTERN.md`, `PRESET.md`, and the foundation contract must
start with YAML frontmatter:

- `id` — must equal the registry key (or foundation id).
- `category` — Components only; must equal the component's category.

## Foundation boundaries

- A Foundation source must be CSS only, inside `foundation/`, and contain no HTML.
- It must not define any class that starts with the Pack's `classPrefix`.
- It owns document-level baseline only; keep it free of component and page-shell CSS.

## Component boundaries

- One leaf implementation per component; keep data, empty, loading, selection, and
  similar states in the same component lifecycle rather than splitting them out.
- A static component `component.html` must not register global events and must not
  use the stateful `data-ui-*` protocol.
- Add `state-adapter.js` only when local state projection is required.

## Sketch atoms

An atom is a node that the module sketch board (`html-prototype-build`, `sketch/`) can copy out of
`component.html` and place by itself: one button, one input, one menu item, one tab. When the
whole sample is already one layout block (table, card, chart, modal panel), mark that block as the
atom. Do not mark a composite demo, such as a button row or a full header, as one atom; mark
each control inside it. The board builds its palette from these declarations only. It groups
atoms by component `category` in `providers` order, then by manifest order, so no separate
grouping field exists.

### Manifest

`components[<id>].atoms` is an object keyed by atom key. A key uses lowercase hyphen-case and
is unique within its component. Key order is palette order.

| Field | Required | Meaning |
|---|---|---|
| `label` | yes | Palette name shown to the user. |
| `resize` | yes | `none` (move only), `x` (width only), `y` (height only), `both`. |
| `width` | no | Seed width in px. Without it, the atom starts at its content width. |
| `height` | no | Seed height in px. On an `x` atom, this fixes the height; without it, the height follows the content. |
| `minWidth` / `minHeight` | no | Smallest size. Defaults to the starting size. |

With `resize: none`, the atom keeps its content size, and the size fields do not apply.
`visibility: internal` components must not declare atoms.

### Markers in `component.html`

| Attribute | Placement |
|---|---|
| `data-pack-atom="<key>"` | Exactly one element per declared key. Every marker value must be declared. |
| `data-pack-atom-scope` | An ancestor kept as an empty wrapper around the copied atom, because component CSS selects through it (for example `.ui-checkbox-group label`). |
| `data-pack-atom-strip` | A descendant removed from the copy, such as an open menu or date panel. |

- The copy always drops `[hidden]` descendants and clears `hidden` / `aria-hidden` on the atom root.
- The board resets fixed, sticky, and transformed atom roots to normal flow. Do not add wrappers to
  work around overlay positioning; mark the visible panel instead.
- Markers carry no style or behavior. CSS and scripts must not select them. When consumers copy
  component markup into a prototype, they drop these markers.

## State adapter contract

An adapter only projects passed local state. It must:

- expose an entry under `PrototypeUiAdapters` (see `render` below),
- define a `render` entry,
- live in its own component leaf or come from a declared dependency,
- never: access `PrototypeViewers`, persist state (`localStorage`, `sessionStorage`,
  `indexedDB`, `document.cookie`), acquire network state (`fetch`,
  `XMLHttpRequest`, `WebSocket`), parse URLs (`location`, `URLSearchParams`), or
  register global event handlers (`window`/`document` `addEventListener`/`on*`).

## Tokens and classes

- Every custom property declaration (`--x:`) must use `--<tokenPrefix>`.
- Every `var(--x)` use must use `--<tokenPrefix>`, and a token that has no
  declaration inside the Pack is reported as a warning.
- No Pack implementation file may reference external `http(s)://` URLs.

## Dependencies

- Declare only required dependencies in `requires`; keep conditional capabilities
  in `optional`.
- Every referenced id in `requires`/`optional`/`uses` must exist in the same Pack's
  registries.
- Dependency cycles are forbidden.
- Patterns and Presets must not select a component whose `visibility` is `internal`.
- A component category must have a corresponding `providers` entry.

## File hygiene

- No UTF-8 BOM; all files valid UTF-8.
- No category-aggregate `components/*.html` files.
- Every conventional resource must be referenced in `manifest.json` (no orphans).
