---
id: pattern.device-frame
---

# Device Frame Pattern

Desktop preview shell for mobile prototypes: a centered phone frame with a
decorative status bar. On real phone widths the chrome hides and the page goes
full-bleed against the OS status bar.

## Slots

- `page` — one or more page Patterns (e.g. `pattern.list-page`,
  `pattern.form-page`) plus in-frame overlays such as dialog/toast.

## Boundaries

- This Pattern owns preview chrome only (frame geometry, fake status icons).
  It does not implement nav-bar, tab-bar, or page body content.
- Status icons are decorative (`aria-hidden`); they are not interactive product
  UI.
- Desktop breakpoint is `min-width: 420px`; narrower viewports hide the fake
  status bar and drop the phone shadow/radius.
- Copy `9:41` is placeholder chrome; prototypes may leave it unchanged.
