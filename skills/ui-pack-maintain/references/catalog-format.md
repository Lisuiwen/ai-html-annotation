# Catalog Format

A catalog registers UI Packs so a consumer skill can discover and resolve them.
`ui-pack-maintain` owns this format definition; a consumer may keep its own copy,
but this document is the authoritative shape for what a Pack publishes.

`ui-pack-maintain` does not write the consumer's catalog during Pack creation.
Creation produces a self-contained Pack directory; registering it in a consumer
catalog is a separate, consumer-side step performed only when the consumer exists
and the user has asked to wire it in.

## Where a catalog lives

A catalog is a single Markdown file. Its location is consumer-defined; this skill
does not assume one. When a consumer exists, prefer a `ui/catalog.md` next to the
consumer's `ui/contract.md`, but never hard-code that path from inside this skill.

## Catalog shape

Each Pack entry is a Markdown section. Minimal form:

```markdown
## <pack-id>

- **Path**: `<relative path to the pack directory>`
- **Foundation**: `<foundation id>`
- **Provider categories**: `<comma-separated category names>`
- **Public entries**: `<comma-separated component/pattern/preset ids>`
```

The `Path`, `Foundation`, and `Provider categories` fields are required. `Public
entries` may be omitted for a Pack that only exposes a foundation.

## Registration rules

- Register a Pack only after `validate-pack.mjs --strict` passes and the resolver
  smoke test succeeds.
- `Path` must point at the directory containing `manifest.json`.
- The `Foundation` value must equal `manifest.foundation.id`.
- `Provider categories` must be a subset of `manifest.providers` keys.
- Do not list components with `visibility: "internal"` in `Public entries`.
