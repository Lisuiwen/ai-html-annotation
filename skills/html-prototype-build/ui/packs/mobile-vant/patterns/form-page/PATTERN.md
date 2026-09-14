---
id: pattern.form-page
---

# Form Page Pattern

Page composition for a mobile form: nav bar on top, a group of fields on a
card surface, and a block primary submit button.

## Slots

- `navigation.nav-bar` — back, centered title, optional right action.
- `group` — one or more `form.field` and `form.switch` rows on a card surface.
- `action` — one block `action.button`.

## Boundaries

- This Pattern owns layout only; it does not copy component implementations.
  Components are inserted into `<!-- slot: -->` markers at generation time
  through the manifest dependency closure.
- No business labels or validation copy; field and button text is placeholder.
- The final prototype renames example `data-mv-key` ids to stable page ids and
  wires state through the field/switch/button adapters.
