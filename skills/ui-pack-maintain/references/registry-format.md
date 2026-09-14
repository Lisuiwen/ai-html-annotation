# Registry Format

`registry.json` is the publish catalog for downloadable UI packs. Consumers read it through
`install-pack.mjs --list-remote`; `ui-pack-maintain` owns the schema and generation rules.

## Location

```text
.html-prototype/packs/registry.json
```

This file is not a pack directory. Pack discovery ignores it because only directories with a
child `manifest.json` qualify as packs.

## Schema

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-09-14T00:00:00.000Z",
  "source": {
    "repository": "owner/repo",
    "defaultRef": "v0.4.1",
    "packPath": ".html-prototype/packs"
  },
  "packs": [
    {
      "id": "admin-desktop",
      "name": "Admin Desktop UI",
      "description": "Human-readable one-line summary",
      "version": 5,
      "schemaVersion": 2,
      "ref": "v0.4.1",
      "foundation": "admin-desktop.default",
      "providers": ["action", "navigation", "form", "data", "feedback"],
      "counts": { "components": 51, "patterns": 3, "presets": 2 }
    }
  ]
}
```

## Generation

```bash
node skills/ui-pack-maintain/scripts/generate-registry.mjs
node skills/ui-pack-maintain/scripts/generate-registry.mjs --check
```

Generation rules:

- scan sibling pack directories under `--pack-root`
- skip non-directories and entries without `manifest.json`
- read `PACK.md` frontmatter for `name` and optional `summary`
- pin each pack entry to the same `ref` unless overridden later per entry
- never hand-edit `registry.json`; regenerate it after pack changes

## Bundled fallback

`skills/html-prototype-build/ui/pack-registry.fallback.json` is regenerated together with
`registry.json` when generation runs without a custom `--output`. CI checks both files with
`generate-registry.mjs --check --output=<path>`.

## Ref pinning and install fallback

Each pack entry records a release `ref` for reproducible installs. `install-pack.mjs` downloads
that ref first; when the tarball or pack path is missing, it falls back to `master` so merged
pack changes remain installable before a release tag exists.

Tagging is still recommended for release notes and long-term provenance, but no longer blocks
day-to-day installs while a tag is pending.

## Publication checklist

1. `validate-pack.mjs --pack=<dir> --strict`
2. resolver smoke test with `--pack=<id> --select=<id>`
3. bump `manifest.version` when pack content changes; bump `--default-ref` / tag when publishing
4. `node skills/ui-pack-maintain/scripts/generate-registry.mjs` (writes registry + fallback)
5. tag the repository at the recorded `ref` (must include `.html-prototype/packs/<id>/`)
6. commit pack changes and both registry files together

Only project developers publish official packs from the repository. End-user downloads land in
`~/.html-prototype/packs/` and are never committed.
