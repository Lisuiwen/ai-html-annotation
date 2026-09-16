# Capability map by collaboration loop

[中文](features.zh-CN.md)

How the tools sit on the loop in the [root README](../README.md): generate → Viewer → Mark / Copy for AI → Direct Edit → Inspector → scenarios.

Two capability lines:

- **A.** `html-prototype-build` collaboration loop (this page, plus [workflows](workflows.md)).
- **B.** UI pack install / customize / maintain ([UI packs](ui-packs.md)).

Why the loop exists: [pain points and scenarios](pain-points-and-scenarios.md). Default sample: [`examples/minimal-notes-system`](../examples/minimal-notes-system).

## Author layer vs formal deliverable

| | Formal deliverable | Author layer (localhost session only) |
| --- | --- | --- |
| What ships | Semantic DOM, stable anchors, read-only Viewer, Client Runtime, `notes.snapshot.js`, optional clean scenario PNGs, `AGENTS.md` | Mark, Direct Edit, Notes editor, Inspector, `runtime/server/index.mjs` |
| Where data lives | Snapshot + source HTML | Mark: page-scoped `localStorage`. Direct Edit: writes style/copy to source through the server. Inspector tokens: session only |
| In scenario PNGs | Product page | Hidden (`collapsed=1&product-only=1`) |

Do not treat Mark pins as formal notes. Do not inject author bootstrap into delivered HTML. Details: [delivery](../skills/html-prototype-build/references/delivery.md).

## Viewer

Formal product notes on the real DOM — not stickers on a screenshot.

- Data: `prototype/notes.snapshot.js` (`header`, `cards`, `when`, `scenarios`).
- UI: right-hand rail, scenario switching, SVG connectors to anchors.
- Interaction state and overlay rules follow the generation contract; the Client Runtime renders notes. Double-click under `file://` is read-only preview.

References: [product annotations](../skills/html-prototype-build/references/product-annotations.md), [generation contract](../skills/html-prototype-build/references/generation-contract.md).

## Mark

Temporary review pins in the Author Tools panel (tab beside Direct Edit).

- Hold `Ctrl` (macOS: `⌘`) and click to pin. `Copy all → For AI` exports selectors, element HTML snapshots, and reviewer notes.
- Pins never write to the snapshot or source HTML. No “strip Mark from the file” step before delivery.
- After a large DOM change, clear stale pins and re-pin.

Reference: [review mark](../skills/html-prototype-build/references/review-mark.md).

## Direct Edit

In-page style and plain-text tweaks, same Author Tools panel, `edit` tab.

- Hold `Ctrl` / `⌘`, preview in the browser, save to write `prototype.html` through `/__prototype-author/edit`.
- The tool loads only in the authoring session. Saved CSS/copy become part of source; the editor UI does not.

Reference: [local authoring](../skills/html-prototype-build/references/local-authoring.md).

## Inspector

Lock a live element and open its source in the local IDE.

- Hold `Alt + Shift`, hover for the selector, click to jump. IDE name lives in skill-root `.env` (see [`.env.example`](../skills/html-prototype-build/.env.example)); do not commit `.env`.
- Injected `data-insp-target` is for line mapping in this session only. Do not export it as a For-AI selector.

Reference: [local authoring](../skills/html-prototype-build/references/local-authoring.md).

## UI packs

Installable visual systems: shared tokens, components, patterns, presets. Official packs in this repository: `admin-desktop` (desktop admin) and `mobile-vant` (phone-width H5). They live in `.html-prototype/packs/` and are **not** bundled inside `html-prototype-build`. End users download with `install-pack.mjs`.

Packs are prototype visual simulations, not a production design system and not a third-party kit implementation.

References: [UI packs](ui-packs.md), [pack install](../skills/html-prototype-build/references/pack-install.md), [catalog](../skills/html-prototype-build/ui/catalog.md).

## Scenarios and PrototypeViewers

`PrototypeViewers` (Client Runtime `state.js`) is the single product-state source. UI pack adapters only project local component state; they do not own business state.

- `notes.snapshot.js` declares `state`, `activeScenario`, and `scenarios`.
- `?scene=<id>` activates a scenario. Screenshot CLI iterates `snapshot.scenarios` and hides author chrome.

References: [screenshots](../skills/html-prototype-build/references/screenshots.md), [generation contract](../skills/html-prototype-build/references/generation-contract.md).

## Deliverables

A typical `html-prototype-build` task yields:

- A named directory with native HTML, supporting files, and `AGENTS.md` (coding agents should read notes and screenshots, not port prototype implementation).
- Snapshot notes and `scenarios` as the baseline for later edits.
- Optional batch PNGs for declared states, without the notes rail, connectors, or author tools.

Authoring chrome stays out of that package. Checklist: [delivery checklist](../skills/html-prototype-build/references/delivery-checklist.md).

## Next

- Jobs on the loop → [pain points and scenarios](pain-points-and-scenarios.md)
- Ordered steps → [workflows](workflows.md)
- First run → [quickstart](quickstart.md)
