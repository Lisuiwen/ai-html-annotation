---
id: data.cell
category: data
---

# Cell

Vant-style list row: optional leading title, main content, right value or
arrow. Static component; list content is business copy supplied by the final
prototype.

## States

Confirmed:

- `title` — left label text.
- `value` — right-aligned value text.
- `label` — optional secondary line under the title.
- `is-link` — boolean; adds the chevron arrow and pointer cursor.
- `center` — boolean; vertically centers content.

No state projection is required; the final prototype copies this leaf per row
and edits the `data-mv-key` text directly. Remove the `.mv-cell--is-link`
class when the row has no arrow.
