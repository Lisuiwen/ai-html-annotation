# Pack Authoring

## Pack landing paths

`--pack=<dir>` stays required. Choose the landing path by role:

| Role | Recommended location | Synced to remote |
|---|---|---|
| End user download or self-created pack | `~/.html-prototype/packs/<pack-id>/` | No, local only |
| Project developer maintaining official packs | `<repo>/.html-prototype/packs/<pack-id>/` | Yes, via git |

End-user packs should stay in the home cache. Only project developers commit packs under
`<repo>/.html-prototype/packs/`. That directory is the source of truth for `registry.json`.

## Pack id naming

- Official packs use unprefixed ids such as `admin-desktop` and `mobile-vant`.
- User-created packs should use a distinguishing prefix or namespace, for example
  `mycompany-admin`, to avoid shadowing an official pack with the same id.

## Resource placement
| Change | Destination | Must not contain |
|---|---|---|
| Cross-component token or document baseline | `foundation/` | Component classes, page shells, DOM, scripts |
| Reusable control or visual unit | `components/<category>/<component-id>/` | Business state ownership, page-specific data |
| Reusable composition order and slots | `patterns/<pattern-id>/` | Copied component CSS, scripts, or business content |
| Business-free page starting point | `presets/<preset-id>/` | Real system names, fields, columns, or records |

## Create a Pack

1. Create `PACK.md`, `manifest.json`, `design-system.md`, `foundation/`, and `components/`.
2. Define exactly one foundation and register its contract and CSS sources.
3. Extract shared tokens only from repeated or explicitly confirmed evidence.
4. Add only components supported by the intended Pack capability and available evidence.
5. Register provider categories and compatible foundations.
6. Add Patterns and Presets only after reusable composition exists.
7. Run strict validation and resolver smoke tests before rendering examples.
8. Add a one-line `summary` to `PACK.md` frontmatter for registry publication.
9. Regenerate `registry.json` with `node scripts/generate-registry.mjs` before release.
   See `references/registry-format.md`; consumers discover packs through
   `resolve-pack.mjs --list` and `install-pack.mjs --list-remote`, not a Markdown catalog.

## Add or update a Component

1. Confirm that the responsibility is not already part of an existing component lifecycle.
2. Create or update `COMPONENT.md` and `component.html` in one leaf directory.
3. Add `state-adapter.js` only when local state projection is required.
4. Declare confirmed and provisional states in the contract.
5. Register paths, dependencies, visibility, and assets in `manifest.json`.
6. Verify isolated use and composition with its direct dependents.

Keep data, empty, loading, selection, and similar states together when they belong to one component lifecycle.

## Add a Pattern or Preset

- Use a Pattern for reusable component order, layout, and slots.
- Use a Preset for a business-fact-free page skeleton.
- Let Patterns reference component IDs. Let Presets reference Patterns through `uses` and direct required Components through `requires`.
- Never duplicate leaf implementation code.

## Resolver smoke test

After changing public entries, run the self-contained resolver for every changed
Component, Pattern, and Preset:

```bash
node scripts/resolve-pack.mjs --pack=<pack-directory> --entry=<id>[,<id>...] [--optional=<id>[,<id>...]]
```

Check the required closure and at least one representative optional selection. A
new Pack is complete once it validates with `--strict` and the resolver can resolve
every public entry. Cross-pack references are out of scope for the resolver; report
them as a `ponytail:` evidence gap until a consumer defines cross-pack wiring.

## Evidence gaps

Use `ponytail:` beside every provisional value or behavior. State both:

1. the confirmed limit implemented now
2. the evidence required to replace the approximation

Do not first encode guessed values as tokens and then label them as pending adjustment.
