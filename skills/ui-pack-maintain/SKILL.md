---
name: ui-pack-maintain
description: Creates, extends, repairs, and validates reusable UI Packs. Use when adding or changing UI Pack Foundations, Components, Patterns, Presets, design tokens, state adapters, or manifests, or when extracting a reusable visual system from screenshots, existing pages, or computed styles. Creating a Pack relies only on the self-contained contract plus user intent; maintenance may additionally read existing Packs. Do not use for generating business prototypes, editing production frontend code, or ordinary page styling.
---

# UI Pack Maintain

Self-contained authoring for UI Packs. This skill owns the authoritative
contract, catalog format, resolver, and validator; it never requires reading a
consumer skill's files to create or validate a Pack.

## Quick start

Create a Pack, then validate and resolve it:

```bash
node scripts/validate-pack.mjs --pack=<pack-directory> --strict
node scripts/resolve-pack.mjs --pack=<pack-directory> --entry=<id>[,<id>...]
```

## Workflow

1. Read `references/contract.md` for structure and responsibility boundaries.
   In **creation** mode, stop here for evidence. In **maintenance** mode,
   continue to step 2.
2. Read the target Pack's `PACK.md` and `manifest.json`, plus only the resource
   entries this task touches (maintenance only).
3. Classify the change as Pack creation, Foundation, Component, Pattern, Preset,
   or repair.
4. Read [Pack authoring](references/pack-authoring.md) and implement the smallest
   reusable change.
5. Update `manifest.json`, then run deterministic validation.
6. For a new Pack or substantial semantic change, run the isolated review in
   [Isolated semantic review](references/semantic-review.md).
7. Apply only verified findings, then rerun validation and the resolver smoke test.

Evidence priority is documented in [Evidence authority](references/evidence.md).

## Hard boundaries

- Keep a UI Pack inside the directory passed as `--pack=`; this skill owns only
  the workflow, contract, catalog format, resolver, and validator. It does not
  hard-code a consumer's `ui/packs/` path.
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

## Deterministic validation

```bash
node scripts/validate-pack.mjs --pack=<pack-directory> --strict
```

By default `--skill-root` resolves to the Pack itself, so no consumer skill is
needed. Pass `--skill-root=<dir>` only when a consumer supplies shared skill-level
resources (assets/vendor/runtime) of its own.

Fix every error before semantic review. Warnings must be resolved or explicitly
reported as evidence gaps.

The validator checks:

- required documents and manifest shape
- provider compatibility and conventional paths
- frontmatter alignment, referenced and orphan files
- dependency validity and cycles, offline resources
- common prefix violations and Foundation boundaries
- forbidden adapter behavior

It cannot judge whether a component boundary is useful or whether visual evidence
is sufficient; delegate those questions to the semantic reviewer.

## Resolver smoke test

```bash
node scripts/resolve-pack.mjs --pack=<pack-directory> --entry=<id>[,<id>...] [--optional=<id>[,<id>...]]
```

The resolver covers in-pack `requires`/`uses` closures and optional selection.
Cross-pack references are out of scope and must be reported as a `ponytail:`
evidence gap.

## Completion report

Report:

- changed Pack entries
- evidence used
- provisional decisions and missing evidence
- validator and resolver test results
- unresolved independent-review findings
