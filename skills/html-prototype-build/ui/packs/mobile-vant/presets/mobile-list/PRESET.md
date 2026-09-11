---
id: preset.mobile-list
---

# Mobile List Preset

Business-fact-free mobile list page starting point. Declares composition order
only; component implementations are loaded through the manifest dependency
closure.

## Composition

- `uses`: `pattern.list-page` (nav bar, list body, tab bar).
- `requires`: `data.cell`, `data.empty`.
- Slot fill: two `data.cell` rows and one `data.empty` placeholder into `body`.

## Boundaries

- No business names, records, or statuses.
- Cell rows are generic; the final prototype renames ids and wires the active
  tab through the tab-bar adapter.
