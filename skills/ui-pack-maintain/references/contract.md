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

Optional directories, present only when the matching registry is non-empty:

```
<pack-directory>/
├── patterns/                # reusable component order, layout, and slots
└── presets/                 # business-fact-free page starting points
```

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

Registry entry fields (`components`, `patterns`, `presets`):

- `contract` — conventional path to the entry contract (see below).
- `source` — conventional path to the entry implementation (see below).
- `requires` / `optional` / `uses` / `assets` / `vendor` / `runtime` — arrays of
  strings when present. `requires` lists required dependencies; `optional` lists
  conditional capabilities; `uses` is for Presets referencing Patterns.
- `adapter` — Components only. Path to a local state adapter.

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
