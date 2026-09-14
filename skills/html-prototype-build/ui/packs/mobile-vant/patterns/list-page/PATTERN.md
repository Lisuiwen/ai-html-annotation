---
id: pattern.list-page
---

# List Page Pattern

Page composition for a mobile list: nav bar, a scrollable list body, and a
fixed bottom tab bar.

## Slots

- `navigation.nav-bar` — back and centered title.
- `body` — repeated `data.cell` rows (each may carry a `data.tag` in its value)
  and a `data.empty` placeholder when the list is empty.
- `navigation.tab-bar` — fixed bottom navigation.

## Boundaries

- This Pattern owns layout only; cell rows and tags are inserted into
  `<!-- slot: -->` markers at generation time through the manifest dependency
  closure.
- Cell and tag copy is generic; replace with business content.
- The final prototype projects the active tab through the tab-bar adapter and
  renames example ids to stable page ids.
