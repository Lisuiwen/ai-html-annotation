---
id: data.tag
category: data
---

# Tag

Small Vant-style status label with color type and optional outline/round
variants. Static component; status copy is business content supplied by the
final prototype.

## States

Confirmed:

- `type` — `default | primary | success | danger | warning`.
- `plain` — boolean; outlined surface.
- `round` — boolean; pill corners.
- `size` — `normal | small`.

No state projection is required; the final prototype copies this leaf per tag
and edits the `data-mv-key` text directly.
