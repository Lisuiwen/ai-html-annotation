---
name: ui-pack-maintain
description: Create, extend, repair, and validate reusable UI Packs for html-prototype-build. Use when adding or changing UI Pack foundations, design tokens, components, patterns, presets, state adapters, manifests, or when extracting a reusable visual system from screenshots, existing pages, or computed styles. Do not use for generating business prototypes, editing production frontend code, or ordinary page styling.
---

# UI Pack Maintain

## Start here

1. Locate the target `html-prototype-build` skill and its `ui/contract.md`.
2. Read the target Pack's `PACK.md`, `manifest.json`, and only the entries affected by the task.
3. Classify the change as Pack creation, foundation, component, Pattern, Preset, or repair.
4. Read [Pack authoring](references/pack-authoring.md) and implement the smallest reusable change.
5. Update `manifest.json`, then run deterministic validation.
6. For a new Pack or substantial semantic change, run the isolated review in [Semantic review](references/semantic-review.md).
7. Apply only verified findings, then rerun validation and the target repository tests.

Keep UI Packs inside the consumer skill's `ui/packs/` directory. This maintenance skill owns the workflow and tools, not the Pack assets.

## Evidence authority

Apply evidence in this order:

1. The target `ui/contract.md` for structure and responsibility boundaries.
2. User-provided screenshots, source pages, computed styles, and interaction records for visual and interaction facts.
3. Existing confirmed Pack tokens and entry contracts.
4. Explicit user decisions.
5. Provisional approximations marked in place with `ponytail:`.

Do not infer exact framework versions, tokens, dimensions, states, or behavior from visual similarity.

## Hard boundaries

- Keep the foundation DOM-free; include only shared tokens and document-level CSS baseline.
- Keep each Component as one leaf implementation with a local contract.
- Let Patterns compose components without copying their implementations.
- Keep Presets business-fact-free.
- Let state adapters project passed local state only. Do not access `PrototypeViewers`, persist state, parse URLs, or register global event handlers.
- Treat `manifest.json` as the only machine-readable index and dependency source.
- Declare only required dependencies in `requires`; keep conditional capabilities in `optional`.
- Do not let Patterns or Presets select internal components directly.

## Deterministic validation

Run:

```bash
node <skill-root>/scripts/validate-pack.mjs --pack=<pack-directory> --strict
```

Fix every error before semantic review. Warnings must be resolved or explicitly reported as evidence gaps.

The validator checks required documents, manifest shape, provider compatibility, conventional paths, frontmatter alignment, referenced and orphan files, dependency validity and cycles, offline resources, common prefix violations, foundation boundaries, and forbidden adapter behavior. It cannot judge whether a component boundary is useful or whether visual evidence is sufficient; delegate those questions to the semantic reviewer.

## Completion report

Report:

- changed Pack entries
- evidence used
- provisional decisions and missing evidence
- validator and repository test results
- unresolved independent-review findings
