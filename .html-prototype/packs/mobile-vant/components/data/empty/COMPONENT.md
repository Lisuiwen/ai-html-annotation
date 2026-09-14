---
id: data.empty
category: data
---

# Empty

Empty-state placeholder for lists and searches: a simple glyph and a hint
message. Static component.

## States

Confirmed:

- `image` — optional glyph rendered above the message (defaults to a generic
  "∅" symbol).
- `description` — hint text under the glyph.

No state projection is required; the final prototype copies this leaf and edits
the `data-mv-key` text directly.
