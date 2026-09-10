# Scenario Screenshots

## Scope

Use this entry when you need to batch-generate clean page screenshots per explicit scenario, or verify that a URL scene corresponds to the composed business state.

The implementation lives in `runtime/cli/screenshot.mjs`.

## Command

```bash
node <skill-root>/runtime/cli/screenshot.mjs <prototype.html> --snapshot=prototype/notes.snapshot.js
```

The tool writes `screenshots/<scene-id>.png` into the delivery directory next to the HTML, iterating over `snapshot.scenarios`; the screenshot URL automatically carries `collapsed=1&product-only=1`, hiding annotations and author UI.

## Agent prerequisites

- The snapshot uses `schemaVersion: 2` and explicitly declares the screenshot list and each scenario's composed state via the `scenarios` object.
- The HTML supports `?scene=<id>`; `PrototypeViewers` activates the scenario and the business Adapter restores the DOM state.
- Screenshots always append `collapsed=1&product-only=1`, hiding the right rail, SVG connectors, Mark, and author UI.
- Screenshot scenarios must come from `snapshot.scenarios`; scenario ids must be safe to use as file names.
- If any group fails, keep the already-generated screenshots and return a failure status; do not report partial success as complete.
