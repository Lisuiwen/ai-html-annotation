# Product Annotations

## Scope

Every prototype maintains its Viewer through this entry; feature descriptions, right-rail annotations, SVG connectors, interaction intent, open questions, and business interaction lightnings are all defined here.

Product annotations are formal prototype documentation; they are not the same as the temporary authoring operations of Direct Edit or Mark in Author Tools.

## Required reading

1. The "State & scenarios", "Annotations", "Overlays", and "Delivery files" sections of [generation-contract.md](generation-contract.md) — file structure, runtime copies, anchors, lightnings, and overlay rules all follow that file.
2. `../addons/annotations/ADDON.md` and `../addons/annotations/ui-annotations.html`.
3. When annotating a Modal or Drawer, pick `feedback.modal` or `feedback.drawer` from the current pack manifest and fully expand its dependencies.

## Annotation flow

This entry only explains how to do the work; the concrete formats and prohibitions are not repeated here:

1. Maintain `header / cards / scenarios` in `prototype/notes.snapshot.js`, and make each card's `when` match the current composed state.
2. Choose one stable target per card by semantic unit: prefer reusing an existing `id`; only fall back to a selector when an id is genuinely unsuitable.
3. Check state restoration, card visibility, and connectors with `?scene=<id>`; the read-only rendering behavior is uniformly provided by the Client Runtime and must not be re-implemented in the business page.

## Next steps

- Edit styles/copy directly in the browser, edit cards, or re-bind targets: [local-authoring.md](local-authoring.md).
- Page review feedback or export For AI: [review-mark.md](review-mark.md).
- Screenshots by scenario: [screenshots.md](screenshots.md).
- Final check before delivery: [delivery-checklist.md](delivery-checklist.md).
