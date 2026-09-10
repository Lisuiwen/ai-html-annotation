# Pack Authoring

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
7. Register the Pack in the consumer skill's `ui/catalog.md`.
8. Run strict validation and resolver smoke tests before rendering examples.

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

## Consumer smoke test

After changing public entries, run the consumer skill's resolver for every changed Component, Pattern, and Preset. Check the required closure and at least one representative optional selection. A new Pack is incomplete until it is registered in `ui/catalog.md` and the consumer can resolve it.

## Evidence gaps

Use `ponytail:` beside every provisional value or behavior. State both:

1. the confirmed limit implemented now
2. the evidence required to replace the approximation

Do not first encode guessed values as tokens and then label them as pending adjustment.
