---
id: navigation.nav-bar
category: navigation
---

# Nav Bar

Top navigation bar for mobile pages: back affordance, centered title, and an
optional right action slot. Static component; business navigation is handled by
the final prototype.

## States

Confirmed:

- `title` — centered page title text.
- `show-back` — boolean; the back affordance renders only when present. The
  leaf ships with the back button; remove the node at generation time when a
  page needs no back affordance.
- `right-text` — optional right-side action text (e.g. "保存"). The leaf ships
  with a right action; remove the node at generation time when not needed.

No state projection is required; the final prototype copies this leaf and edits
the `data-mv-key` text directly. `show-back` and `right-text` are structural
(copy-time), not runtime state.

## Notes

- The back affordance is a `<button>` with a chevron glyph so it is focusable
  and labeled; business back behavior is wired by the final prototype.
- Height uses `--mv-nav-bar-height`; the bar is intended to sit above a
  `position: sticky` page body in a Pattern.
