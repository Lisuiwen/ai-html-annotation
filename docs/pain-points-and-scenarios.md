# Pain points and scenarios

[中文](pain-points-and-scenarios.zh-CN.md)

Most prototype workflows fail after the mock looks “good enough.” The break is not “it doesn’t look like the design”; it is that **the picture cannot keep working** with an agent. This page names the failure moments, then walks four jobs on the default sample [`examples/minimal-notes-system`](../examples/minimal-notes-system) (desktop). For phone-width H5, the same loop applies to [`examples/mobile-work-order`](../examples/mobile-work-order).

Capability detail: [features](features.md). Step-by-step: [workflows](workflows.md). First run: [quickstart](quickstart.md). Vs screenshots / Figma / bare HTML: [comparison](comparison.md).

## Three failure moments

| Who | Old way | What fails |
| --- | --- | --- |
| Reviewer / PM | Screenshot + chat (“move this left”) | The comment has no DOM target. The agent guesses structure and the next edit drifts. |
| Author / agent | Rebuild HTML from pixels or a one-off page | No shared tokens or notes runtime. Visuals and structure reinvent themselves every pass. |
| Anyone verifying a fix | Spec in a doc, notes in chat, change in source | Nothing is bound to the same element, so checking the result is slow. |

These are the same three breaks as the [root README](../README.md). AI HTML Annotation reconnects them on native HTML: the **page** is what you review, copy from, and screenshot.

## Scenario 1 — PM review: Mark + Copy for AI

You are reviewing an already-open page (the notes-system sample, or a page the agent just generated). You do not want to rewrite a spec. You want the agent to change **this** control.

1. Start the localhost authoring session ([local authoring](../skills/html-prototype-build/references/local-authoring.md)).
2. Open Author Tools → **Mark** (or press `M`). Hold `Ctrl` (macOS: `⌘`) and click the element.
3. Write the note on the pin. Collect several if needed.
4. `Copy all → For AI` exports stable selectors, element HTML snapshots, and the reviewer text.

Mark pins live in page-scoped `localStorage`. They are not formal notes and they never write to `prototype.html` or `notes.snapshot.js`. Formal right-rail copy stays in Viewer. How to pin: [Review mark](../skills/html-prototype-build/references/review-mark.md).

## Scenario 2 — Author iterate: pack + Direct Edit + Inspector

You are producing or tightening the page, not only commenting on it.

1. Generate from an installed UI pack so tokens, components, and patterns stay shared ([UI packs](ui-packs.md), [pack install](../skills/html-prototype-build/references/pack-install.md)).
2. For a local style or copy tweak, Author Tools → **edit**: hold `Ctrl` / `⌘`, change, save. The authoring server writes back to source HTML. The Direct Edit UI itself is not injected into the deliverable.
3. To confirm the agent (or you) edited the right node, **Inspector**: hold `Alt + Shift`, hover, click — open that location in the local IDE.

Viewer still shows formal notes on the same DOM. Direct Edit changes source; Mark does not. Inspector’s temporary `data-insp-target` is session-only — do not save it as a formal or For-AI selector. Commands: [local authoring](../skills/html-prototype-build/references/local-authoring.md).

## Scenario 3 — Delivery: scenarios, multi-state clean PNGs

Handoff needs more than one screenshot of the happy path. Create, edit, empty, linked (and any state you declare) should be explicit and repeatable.

1. `PrototypeViewers` owns product state. `notes.snapshot.js` declares `scenarios` as the screenshot list and composed state.
2. In the page, switch with the right-rail scenario control or `?scene=<id>`.
3. The screenshot CLI writes `screenshots/<scene-id>.png` with `collapsed=1&product-only=1`, hiding the notes rail, SVG connectors, Mark, and author tools.

Formal HTML may still include the read-only Viewer. The PNG is a clean product capture. The delivery folder also carries `AGENTS.md` so a later coding agent reads notes and screenshots rather than prototype implementation. See [scenario screenshots](../skills/html-prototype-build/references/screenshots.md) and [delivery](../skills/html-prototype-build/references/delivery.md).

## Scenario 4 — Pack owner: own pack for stable visuals

You are not only building one prototype. You want the next admin or H5 page to match the last.

- End users **install** official `admin-desktop` or `mobile-vant` (or a downloaded pack) with `install-pack.mjs`. Packs are not bundled inside `html-prototype-build`.
- If official visuals are the wrong language, **customize or author** a pack rather than hand-writing CSS beside every page. Pack authoring is the `ui-pack-maintain` skill, not prototype generation.
- Self-created packs live under `~/.html-prototype/packs/<id>/` with a namespaced id so they do not shadow official ids.

Product docs for customize / maintain are still [planned](README.md#planned). Until then: [UI packs](ui-packs.md) and [`ui-pack-maintain` SKILL.md](../skills/ui-pack-maintain/SKILL.md).

## Pain × capability

| Pain | Capability | Layer |
| --- | --- | --- |
| Chat comments never hit an element | Mark + `Copy all → For AI` | Author session |
| Screenshot-based HTML drifts | Generate from a UI pack; review on Viewer | Pack + formal page |
| Spec / chat / source disagree | Formal notes in `notes.snapshot.js` on the live DOM | Formal page |
| Small visual fixes need a file hunt | Direct Edit, then Inspector to verify | Author session |
| Delivery PNGs include notes chrome | `scenarios` + product-only screenshots | Delivery |
| Every prototype invents a new look | Install, customize, or maintain a pack | Pack skill |

## Next

- What each tool is → [Capability map](features.md)
- End-to-end steps → [Workflows](workflows.md)
- Install and first success → [5-minute quickstart](quickstart.md)
- Vs other review methods → [Comparison](comparison.md)
