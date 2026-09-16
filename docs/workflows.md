# End-to-end workflows

[中文](workflows.zh-CN.md)

Five jobs on one loop. Default page in this repo: [`examples/minimal-notes-system`](../examples/minimal-notes-system). Mobile alternate: [`examples/mobile-work-order`](../examples/mobile-work-order).

Author session vs formal files: [features — author vs formal](features.md#author-layer-vs-formal-deliverable). Why these jobs exist: [pain points](pain-points-and-scenarios.md).

## Loop

```text
materials → generate HTML from a UI pack
        → Viewer (formal notes)
        → Mark → Copy for AI → agent edits source
        → Direct Edit (optional on-page tweak)
        → Inspector (verify in source)
        → scenarios (clean PNGs)
        → optional: customize pack, then rebuild
```

You do not have to run every step every time. Review-only sessions start at Mark. Pack work is optional and uses a different skill.

## 1. Materials to openable HTML

**Goal:** an HTML page you can open, not a stack of screenshots.

1. Confirm page type and business facts from materials. If a UI type is unclear, ask — do not default to a visual system ([catalog](../skills/html-prototype-build/ui/catalog.md)).
2. Install a pack if none is present (`admin-desktop` for the notes-system sample; `mobile-vant` for mobile-work-order). Short commands: [quickstart](quickstart.md); full protocol: [pack install](../skills/html-prototype-build/references/pack-install.md).
3. Enable `html-prototype-build` and let the agent generate `<prototype-name>/` with `prototype.html` and `prototype/`, routing state through `PrototypeViewers`. Constraints: [SKILL.md](../skills/html-prototype-build/SKILL.md), [UI generation](../skills/html-prototype-build/references/ui-generation.md), [generation contract](../skills/html-prototype-build/references/generation-contract.md).

Double-click `prototype.html` for a read-only Viewer preview (`file://`). Editing notes, Mark, Direct Edit, and Inspector need the authoring server.

## 2. Review → agent fix

**Goal:** feedback that names a DOM node.

1. Start authoring with snapshot ([local authoring](../skills/html-prototype-build/references/local-authoring.md)).
2. Mark the elements ([review mark](../skills/html-prototype-build/references/review-mark.md)).
3. `Copy all → For AI` and paste into the agent. It should locate source from selectors and HTML snapshots — not from a screenshot.
4. Re-open the page and switch scenarios to confirm the fix. Formal right-rail copy is Viewer / Notes editor, not Mark.

## 3. On-page tweak + source verify

**Goal:** a small visual or copy change without describing the whole tree again.

1. Author Tools → `edit`. Hold `Ctrl` / `⌘`, change style or text, save. The server writes source HTML.
2. Inspector: `Alt + Shift`, click, jump to the IDE. Use this after an agent edit or a Direct Edit save.
3. Large structure, layout, or state changes belong in [UI generation](../skills/html-prototype-build/references/ui-generation.md), not in a string of Direct Edit saves.

Formal note cards: double-click in the rail (authoring session + `--snapshot`). That updates `notes.snapshot.js`, not Mark storage.

## 4. Multi-state screenshot delivery

**Goal:** clean PNGs for each declared state, plus a handoff folder.

1. Keep `schemaVersion: 2` snapshot with explicit `scenarios`. Ids must be safe as file names.
2. Spot-check `?scene=<id>` in the authoring URL.
3. Run the screenshot CLI ([screenshots](../skills/html-prototype-build/references/screenshots.md)). It always adds `collapsed=1&product-only=1`.
4. Assemble the standalone directory and walk [delivery](../skills/html-prototype-build/references/delivery.md) / [checklist](../skills/html-prototype-build/references/delivery-checklist.md). `AGENTS.md` stays the template: later agents read notes and PNGs; they must not port prototype implementation.

Author Tools are never part of that package. Direct Edit may have already changed source HTML; Mark pins are not in the files.

## 5. Optional: customize pack then rebuild

**Goal:** the next page looks like this one on purpose.

Switch pack when the **product surface** changes (desktop admin vs phone H5). Customize or author a pack when the **visual language** is yours and official packs are the wrong simulation.

1. Install or copy a pack; use a namespaced id for local packs ([UI packs](ui-packs.md)).
2. Pack contract, validate, registry: [`ui-pack-maintain`](../skills/ui-pack-maintain/SKILL.md). Product pages [customize a pack](ui-pack-customize.md) and [maintain a pack](ui-pack-maintain.md) are planned.
3. Rebuild the prototype from the new pack ([UI generation](../skills/html-prototype-build/references/ui-generation.md)). Do not treat pack authoring as a business-page task.

## Next

- First commands → [quickstart](quickstart.md)
- Tool map → [features](features.md)
- vs Figma / screenshots → [comparison](comparison.md)
