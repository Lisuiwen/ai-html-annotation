---
id: preset.mobile-form
---

# Mobile Form Preset

Business-fact-free mobile form page starting point. Declares composition order
only; component implementations are loaded through the manifest dependency
closure.

## Composition

- `uses`: `pattern.form-page` (nav bar, group card, submit area).
- `requires`: `form.field`, `form.switch`, `action.button`.
- Slot fill: two `form.field` rows and one `form.switch` row into `group`; one
  block `action.button` into `action`.

## Boundaries

- No business names, fields, or validation copy.
- Field rows are generic; the final prototype renames ids and wires state
  through the field/switch/button adapters.
