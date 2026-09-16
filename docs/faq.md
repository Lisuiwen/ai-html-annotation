# FAQ — AI HTML Annotation

[中文](faq.zh-CN.md)

Short answers for people choosing a review method or installing for the first time. Deeper comparison: [AI HTML Annotation vs screenshots, Figma, hand-written HTML](comparison.md).

## 1. Is this a design tool or for coding agents?

**For coding agents** — and for people who review HTML with them. It is not a design canvas.

It is an Agent Skill for Claude Code, Codex, Cursor, and other coding agents: annotate and iterate native HTML prototypes on the real DOM. The page is the deliverable, not a picture of one. See [how it compares](comparison.md) and [pain points and scenarios](pain-points-and-scenarios.md) (planned). Install: [quickstart](quickstart.md) (planned).

## 2. How does it relate to Figma?

**Complementary, not a Figma replacement.**

Figma stays the design source. This Skill turns UI materials into executable HTML with notes bound to the DOM. The agent gets selectors and element HTML snapshots, not a design file. See the [Figma row](comparison.md#figma).

## 3. Do Mark / Direct Edit pollute the formal HTML deliverable?

**No.** They are authoring aids, not part of the formal page load.

Formal HTML keeps semantic DOM, stable anchors, and the read-only Viewer. Mark pins live in page-scoped `localStorage` and export via `Copy all → For AI` (selectors plus element HTML snapshots). Direct Edit can write style and copy back to source through the localhost server; the tool itself is not injected into the deliverable. See [workflows](workflows.md) (planned) and [features](features.md) (planned).

## 4. Why is a localhost authoring server needed? Is it safe?

**Needed for in-page authoring; it binds to `127.0.0.1` only.**

Direct Edit, Mark, Notes editor, and Inspector load only in that session. Do not run authoring or screenshots against untrusted HTML or snapshot files. Keep Skill-root `.env` local for IDE selection; never commit it. How to start: [quickstart](quickstart.md) (planned).

## 5. Official packs vs my own design system / third-party packs?

**Official packs are prototype visual simulations, not your production design system.**

`admin-desktop` and `mobile-vant` live in the repo and you download them with `install-pack`; they are not bundled inside `html-prototype-build`. They do not implement a third-party design system. For your own look, author a pack rather than treating official packs as app components. See [UI packs](ui-packs.md) (planned) and [customize a pack](ui-pack-customize.md) (planned).

## 6. skills.sh vs Claude Code plugin — which should I use?

**skills.sh for Cursor, Codex, and other Agent Skills clients; the Claude Code plugin if you work in Claude Code.**

Both load `html-prototype-build` (and `ui-pack-maintain` for pack authors) from this repository — there is no second copy of `SKILL.md`. After install, download a UI pack. Commands live in [quickstart](quickstart.md) (planned) and the [Skill README](../skills/html-prototype-build/README.md).

## 7. Is 0.x stable? Will APIs change?

**Experimental 0.x — APIs, file layout, and authoring workflows may change.**

That is the stability statement for this project; there is no separate compatibility guarantee. Read [CHANGELOG.md](../CHANGELOG.md) before you upgrade.

## 8. Why can screenshots exclude the annotation chrome?

**Scenario screenshots capture the product page, not the authoring UI.**

`PrototypeViewers` plus `scenarios` declare explicit states (create, edit, empty, linked, and others you define). The screenshot CLI hides the notes rail, SVG connectors, Mark, and author tools. Formal HTML can still include Viewer; the PNG is a clean capture. See [workflows](workflows.md) (planned) and the [AI HTML Annotation row](comparison.md#ai-html-annotation).

## 9. Can I use my own UI pack?

**Yes.** Install a downloaded pack or author one.

Put a self-created pack at `~/.html-prototype/packs/<id>/` with `manifest.json`, and use a namespaced id so you do not shadow `admin-desktop` or `mobile-vant`. Pack authoring is the `ui-pack-maintain` skill, not prototype generation. See [UI packs](ui-packs.md) (planned) and [customize a pack](ui-pack-customize.md) (planned).

## Still stuck?

Open a [GitHub Issue](https://github.com/Lisuiwen/ai-html-annotation/issues) or [Discussion](https://github.com/Lisuiwen/ai-html-annotation/discussions). Say what you tried and what you expected.
