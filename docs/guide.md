# Product guide

[中文](guide.zh-CN.md)

AI HTML Annotation is for people who review native HTML with a coding agent. The **page** is what you annotate, copy from, and screenshot — not a picture of one.

Default walkthrough: [`examples/minimal-notes-system`](../examples/minimal-notes-system) (desktop). Phone-width: [`examples/mobile-work-order`](../examples/mobile-work-order).

First run: [quickstart](quickstart.md). Vs screenshots / Figma / bare HTML: [comparison](comparison.md). Short answers: [FAQ](faq.md). Official visuals: [UI packs](ui-packs.md).

## Why it fails

Most prototype workflows break after the mock looks “good enough.” The picture cannot keep working with an agent.

| Who | Old way | What fails |
| --- | --- | --- |
| Reviewer / PM | Screenshot + chat (“move this left”) | The comment has no element. The agent guesses, and the next edit drifts. |
| Author / agent | Rebuild HTML from pixels | No shared UI pack. Visuals reinvent themselves every pass. |
| Anyone verifying a fix | Spec in a doc, notes in chat, change in source | Nothing is bound to the same element, so checking is slow. |

The reconnection is native HTML: **annotate** on the real DOM, use **Author Tools**, **copy to an AI**, and ship **multi-state screenshots**. Mark, Direct Edit, and Inspector are parallel options after Viewer, not a required sequence.

```text
generate HTML from a UI pack
        │
        ▼
     Viewer
        │
        ├── Mark → Copy for AI   (optional)
        ├── Direct Edit          (optional)
        └── Inspector            (optional)
        │
        ▼
   scenarios
```

## Four scenarios

### 1. PM review — pin it, then copy to an AI

You are reviewing an already-open page. You do not want to rewrite a spec. You want the agent to change **this** control.

1. Start Author Tools on the page.
2. Author Tools → **Mark** (or press `M`). Hold `Ctrl` (macOS: `⌘`) and click the element.
3. Write the note on the pin. Collect several if needed.
4. `Copy all → For AI` copies selectors, element HTML, and your text.

Pins are session review marks. They are not formal annotations, and they do not change the HTML file. Formal right-rail copy stays in Viewer.

### 2. Author iterate — UI pack + Direct Edit + Inspector

You are producing or tightening the page, not only commenting on it.

1. Generate from an installed UI pack (`admin-desktop` or `mobile-vant`) so later pages match. See [UI packs](ui-packs.md).
2. For a local style or copy tweak: Author Tools → **edit**, hold `Ctrl` / `⌘`, change, save. Saved CSS/copy become source; the editor UI does not.
3. To confirm the right node: **Inspector** — hold `Alt + Shift`, hover, click — open that location in the local IDE.

Direct Edit changes source; Mark does not. Inspector highlighting is session-only — do not copy it as a For-AI selector.

### 3. Delivery — multi-state screenshots

Handoff needs more than one shot of the happy path. Create, edit, empty, linked (and any state you declare) should be explicit and repeatable.

1. Declare page states with the formal annotations.
2. Switch them with the right-rail control (or `?scene=<id>`).
3. Capture clean PNGs: product page only — no annotation rail, connectors, Mark, or Author Tools.

Formal HTML may still include the read-only Viewer. The PNG is a clean product capture. The delivery folder also carries `AGENTS.md` so a later coding agent reads annotations and screenshots rather than prototype implementation.

### 4. Pack owner — own UI pack for stable visuals

You want the next admin or H5 page to match the last.

- **Install** official `admin-desktop` or `mobile-vant` (or a downloaded pack). Packs are not bundled inside the prototype skill.
- If official visuals are the wrong language, **customize or author** a pack rather than hand-writing CSS on every page. Pack authoring is a different skill, not prototype generation.
- Self-created packs live under `~/.html-prototype/packs/<id>/` with a namespaced id so they do not shadow official ids.

Product docs for customize / maintain are still [planned](README.md#planned). Until then: [UI packs](ui-packs.md).

## Capability table

| Need | Use | Layer |
| --- | --- | --- |
| Formal annotations, scenario switch, SVG connectors | Viewer | Formal page |
| Review pins → copy to an AI | Mark, `Copy all → For AI` | Author session |
| Tweak style or copy on the page | Direct Edit | Author session |
| Lock element → IDE | Inspector | Author session |
| Stable visuals | UI pack | Pack, not the Skill |
| Clean create / edit / empty / … PNGs | Multi-state screenshots | Delivery |

### Author layer vs formal deliverable

Mark, Direct Edit, Inspector, and Author Tools load only while you are authoring. What you ship is semantic HTML, stable anchors, read-only Viewer, optional clean PNGs, and `AGENTS.md`. Do not treat Mark pins as formal annotations. Do not inject Author Tools into delivered HTML.

## End-to-end steps

You do not have to run every step every time. Review-only sessions start at Mark. Direct Edit and Inspector are optional and can run in any order after Viewer. Pack work is optional. First commands: [quickstart](quickstart.md).

1. **Materials to openable HTML.** Confirm page type from materials (ask if the UI type is unclear). Install a UI pack if none is present (`admin-desktop` for the notes-system sample; `mobile-vant` for mobile-work-order). Enable the prototype skill and let the agent generate the page. Double-click the HTML for a read-only Viewer preview; Author Tools are required to edit.

2. **Review → agent fix.** Start Author Tools. Mark elements. `Copy all → For AI` and paste into the agent. Re-open and switch states to confirm. Formal right-rail copy is Viewer, not Mark.

3. **On-page tweak + source verify.** Author Tools → **edit**. Hold `Ctrl` / `⌘`, change, save. Then Inspector (`Alt + Shift`) to jump to the IDE. Large structure or state changes belong in a new generation pass. Formal annotation cards: double-click in the rail during Author Tools.

4. **Multi-state screenshot delivery.** Declare page states (ids must be safe as file names). Spot-check them on the page. Capture clean product-only PNGs. Assemble the folder with `AGENTS.md` so later agents read annotations and PNGs — not prototype implementation. Author Tools never go in that package.

5. **Optional: customize the UI pack, then rebuild.** Switch pack when the product surface changes (desktop admin vs phone H5). Customize when the visual language is yours ([UI packs](ui-packs.md)). Rebuild from the new pack. Do not treat pack authoring as a business-page task. Customize / maintain product pages are [planned](README.md#planned).

## Next

- First commands → [quickstart](quickstart.md)
- Official packs → [UI packs](ui-packs.md)
- Vs Figma / screenshots → [comparison](comparison.md)
- Short answers → [FAQ](faq.md)

## For agents

Script names, snapshot files, and localhost commands live in Skill references — not in the product copy above.

- Start Author Tools → [Local authoring](../skills/html-prototype-build/references/local-authoring.md)
- Install a UI pack → [Pack install](../skills/html-prototype-build/references/pack-install.md)
- Pin and copy for AI → [Review mark](../skills/html-prototype-build/references/review-mark.md)
- Multi-state PNGs → [Screenshots](../skills/html-prototype-build/references/screenshots.md)
- Handoff folder → [Delivery](../skills/html-prototype-build/references/delivery.md) / [checklist](../skills/html-prototype-build/references/delivery-checklist.md)
- Generation rules → [UI generation](../skills/html-prototype-build/references/ui-generation.md), [Generation contract](../skills/html-prototype-build/references/generation-contract.md)
- Agent routing → [SKILL.md](../skills/html-prototype-build/SKILL.md)
- Skill how-to → [html-prototype-build README](../skills/html-prototype-build/README.md)
- Pack authoring → [ui-pack-maintain](../skills/ui-pack-maintain/SKILL.md)
