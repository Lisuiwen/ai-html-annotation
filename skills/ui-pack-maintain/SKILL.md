---
name: ui-pack-maintain
description: Creates, extends, repairs, validates, versions, and publishes reusable UI Packs. Use when adding or changing UI Pack Foundations, Components, Patterns, Presets, design tokens, state adapters, manifests, or registry metadata, or when extracting a reusable visual system from screenshots, existing pages, or computed styles. Creating a Pack relies only on the self-contained contract plus user intent; maintenance may additionally read existing Packs. Do not use for generating business prototypes, editing production frontend code, installing packs for end users, or ordinary page styling.
---

# UI Pack Maintain

Self-contained authoring and publication workflow for UI Packs. This skill owns the pack
contract, schema version rules, registry format, validator, and release metadata. It does not
own consumer-side discovery, download, or prototype generation.

## Quick start

Create a Pack, then validate and resolve it:

```bash
node scripts/validate-pack.mjs --pack=<pack-directory> --strict
node scripts/resolve-pack.mjs --pack=<pack-directory> --entry=<id>[,<id>...]
```

Before publishing pack changes:

```bash
node scripts/generate-registry.mjs
node scripts/generate-registry.mjs --check
```

## Responsibility split

| Owns `ui-pack-maintain` | Owns `html-prototype-build` |
|---|---|
| pack structure and contract | pack lookup chain |
| `schemaVersion` rules | `resolve-pack.mjs --list` |
| `registry.json` schema and generation | `install-pack.mjs` download flow |
| `validate-pack.mjs` | shared `vendor/` and `runtime/` provision |
| pack lifecycle: create → validate → version → publish | prototype generation and delivery |

Landing paths by role:

- End user self-created packs: `~/.html-prototype/packs/<id>/` (local only, never committed)
- Project developer official packs: `<repo>/.html-prototype/packs/<id>/` (committed, feeds `registry.json`)

## Workflow

1. Read `references/contract.md` for structure and responsibility boundaries.
   In **creation** mode, stop here for evidence. In **maintenance** mode,
   continue to step 2.
2. Read the target Pack's `PACK.md` and `manifest.json`, plus only the resource
   entries this task touches (maintenance only).
3. Classify the change as Pack creation, Foundation, Component, Pattern, Preset,
   registry/publication, or repair.
4. Read [Pack authoring](references/pack-authoring.md) and implement the smallest
   reusable change.
5. Update `manifest.json`, then run deterministic validation.
6. For a new Pack or substantial semantic change, run the isolated review in
   [Isolated semantic review](references/semantic-review.md).
7. Regenerate `registry.json` when publishing or changing downloadable metadata.
8. Apply only verified findings, then rerun validation and the resolver smoke test.

Evidence priority is documented in [Evidence authority](references/evidence.md).

Publication references:

- [Registry format](references/registry-format.md)
- [schemaVersion contract](references/schema-version.md)

## Hard boundaries

- Keep a UI Pack inside the directory passed as `--pack=`; this skill owns only
  the workflow, contract, registry format, resolver, and validator. It does not
  hard-code a consumer's pack install location.
- Keep the Foundation DOM-free; include only shared tokens and a document-level
  CSS baseline.
- Keep each Component as one leaf implementation with a local contract.
- Compose Components through Patterns without copying their implementations.
- Keep Presets business-fact-free.
- Keep state adapters to projecting passed local state only; never access
  `PrototypeViewers`, persist state, parse URLs, or register global event handlers.
- Treat `manifest.json` as the only machine-readable index and dependency source.
- Declare only required dependencies in `requires`; keep conditional capabilities
  in `optional`.
- Patterns and Presets must not select internal components directly.
- Do not implement consumer download flows here; point users to
  `html-prototype-build/scripts/install-pack.mjs`.

## Deterministic validation

```bash
node scripts/validate-pack.mjs --pack=<pack-directory> --strict
```

All `vendor`, `runtime`, and `assets` paths must exist inside the pack and
declare `manifest.delivery` targets for prototype copy-out.

Fix every error before semantic review. Warnings must be resolved or explicitly
reported as evidence gaps.

The validator checks:

- required documents and manifest shape
- supported `schemaVersion`
- provider compatibility and conventional paths
- frontmatter alignment, referenced and orphan files
- dependency validity and cycles, offline resources
- common prefix violations and Foundation boundaries
- forbidden adapter behavior
- pack-local `vendor` / `runtime` / `assets` files and `manifest.delivery` targets

It cannot judge whether a component boundary is useful or whether visual evidence
is sufficient; delegate those questions to the semantic reviewer.

## Resolver smoke test

```bash
node scripts/resolve-pack.mjs --pack=<pack-directory> --entry=<id>[,<id>...] [--optional=<id>[,<id>...]]
```

The maintain resolver covers in-pack `requires`/`uses` closures and optional
selection only. Cross-pack references are out of scope and must be reported as a
`ponytail:` evidence gap. Consumer discovery and lookup chains belong to
`html-prototype-build/scripts/resolve-pack.mjs`.

## Completion report

Report:

- changed Pack entries
- evidence used
- provisional decisions and missing evidence
- validator and resolver test results
- registry regeneration status
- unresolved independent-review findings
