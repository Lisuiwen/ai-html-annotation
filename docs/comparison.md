# AI HTML Annotation vs screenshots, Figma, hand-written HTML

[中文](comparison.zh-CN.md)

Agent Skill for native HTML prototypes with real-DOM notes — not a design canvas, not a UI kit for production.

Use the table to pick a review method. Demos of Viewer, Mark, and Inspector are on the [repository README](../README.md).

## Comparison

| Approach | Input | How you review | Context for the agent | Deliverable | Best stage |
| --- | --- | --- | --- | --- | --- |
| <span id="screenshot-chat">Screenshot + chat comments</span> | PNG/JPEG of a UI | Comments in chat or a doc (“move this left”) | Pixels only — no DOM, so the agent guesses structure and drifts | Image + chat thread | Quick visual check when you do not need a locatable page |
| <span id="figma">Figma (design source)</span> | Figma file / frames | Comments and inspect in Figma | Design source (layout, specs, assets) — not an executable DOM or HTML snapshot | Figma file | Visual design before (or beside) HTML |
| <span id="bare-html">Hand-written / AI bare HTML</span> | HTML with no UI pack and no annotation runtime | Open the file or browser; notes still live in chat unless you invent your own | HTML source only — no DOM-bound notes, Mark export, or pack tokens | HTML files | One-off pages when review pins and pack consistency do not matter |
| <span id="prod-library">Production component library (not us)</span> | Shared app components | Code review, Storybook, or the running app | Real component APIs and production source | Production code | After the prototype is agreed — **this product is not that library** |
| <span id="ai-html-annotation">AI HTML Annotation</span> | UI materials + optional UI pack (`admin-desktop` / `mobile-vant` via `install-pack`) | On the real DOM: Viewer for formal notes; Mark pins in the authoring session | Selectors + element HTML snapshots (`Copy all → For AI`); notes in `notes.snapshot.js` | Native HTML + notes + optional clean scenario PNGs; folder with `AGENTS.md` | When you need an openable HTML prototype, DOM-bound review, and AI-ready context |

Authoring aids — Mark, Direct Edit, Inspector, and the localhost authoring server — load only in the authoring session. Formal HTML keeps the read-only Viewer and semantic DOM. Scenario screenshots omit that author chrome.

## Fit / not fit

**Fit** when you need to turn UI materials into openable HTML quickly, review on the real page and hand precise feedback to an AI, or iterate structure, copy, and state while keeping reproducible screenshots. Typical surfaces: admin consoles, config pages, and interaction prototypes that change often.

**Not a fit** as a production component library, a Figma replacement, a third-party design-system implementation, or a general frontend scaffold / production code generator. If you already have an agreed production UI kit and need app code, use that kit — not this Skill.

Official packs (`admin-desktop`, `mobile-vant`) are prototype visual simulations you download with `install-pack`; they are not bundled inside the Skill. Pack details: [UI packs](ui-packs.md) (planned).

## Next

- Install and first run → [quickstart](quickstart.md) (planned)
- When the screenshot-and-chat loop breaks → [pain points and scenarios](pain-points-and-scenarios.md) (planned)
- Short answers → [FAQ](faq.md)
- Authoring vs delivery → [workflows](workflows.md) (planned)
