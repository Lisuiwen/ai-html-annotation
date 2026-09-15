# schemaVersion Contract

`manifest.schemaVersion` is the machine contract between pack authors and consumer resolvers.
`ui-pack-maintain` owns this document; `html-prototype-build/scripts/resolve-pack.mjs` enforces it.

## Supported versions

| schemaVersion | Status | Notes |
|---|---|---|
| `1` | supported | Initial mobile/admin shared contract |
| `2` | supported | Adds root `manifest.delivery` for pack-local `vendor` / `runtime` / `assets` copy-out |

Current consumer support is defined in `scripts/_pack-schema.mjs` (`SUPPORTED_SCHEMA_VERSIONS`).

## Authoring rules

- Bump `manifest.version` for pack content changes.
- Bump `manifest.schemaVersion` only when the manifest contract itself changes.
- Never publish a pack whose `schemaVersion` is outside the supported set.
- `validate-pack.mjs --strict` must reject unsupported `schemaVersion` values before release.

## Consumer behavior

When a resolver sees an unsupported `schemaVersion`, it exits with code `4` and JSON:

```json
{ "error": "invalid-manifest", "detail": "unsupported schemaVersion: 3" }
```

Authors should treat that as a release-coordination problem, not a generation-time workaround.
