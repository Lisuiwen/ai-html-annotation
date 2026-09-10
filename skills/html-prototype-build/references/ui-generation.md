# UI Generation

## Scope

Use this entry when the user asks to generate a prototype, rebuild a UI, restore an underlying image/mock, or heavily change page structure, layout, menus, or business state.

## Minimal path

1. Pick exactly one foundation, then select at most one compatible provider per action / navigation / form / data / feedback category, and resolve the minimal dependency closure with `node <skill-root>/scripts/resolve-pack.mjs --select=<id[,id...]>`.
2. Generate the snapshot + Client Runtime; every prototype manages scenarios and state through `PrototypeViewers` from `runtime/client/core/state.js`, and Notes Viewer only consumes state.
3. Before delivery, verify against the [delivery checklist](delivery-checklist.md) item by item.

The current complete UI pack is `../ui/packs/admin-desktop/`, which provides a foundation and providers for all categories (action / navigation / form / data / feedback), for admin-desktop style prototypes.

## Generation flow

1. When the business materials are incomplete, confirm first; do not fabricate business rules.
2. The UI pack only provides components and local adapters; the business Adapter maps `PrototypeViewers` state to the components.
3. Declare foundation and Case colors as tokens up front; describe unconfirmed visuals and behaviors in place with `ponytail:`.

## After completion

- Viewer, scenarios, and annotations: read [product-annotations.md](product-annotations.md).
- When the user asks for review, pinning, review pins, or exporting For AI: read [review-mark.md](review-mark.md).
- When the user explicitly wants no pinning or review layer: go straight to [delivery.md](delivery.md).
