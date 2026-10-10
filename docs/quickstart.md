# 5-minute quickstart

[中文](quickstart.zh-CN.md)

Install the skill, install a UI pack, open the desktop sample, start Author Tools. That is enough to see Viewer, copy once to an AI, and switch a page state.

Needs **Node.js 18+**. Batch multi-state screenshots (optional) need Microsoft Edge or Google Chrome on the machine.

Default sample: [`examples/minimal-notes-system`](../examples/minimal-notes-system). Phone-width: [`examples/mobile-work-order`](../examples/mobile-work-order) with pack `mobile-vant`.

Why this loop exists, and what to do after first success: [product guide](guide.md).

## Install the skill

**Primary — skills.sh** (Claude Code, Cursor, Codex-compatible clients, other Agent Skills):

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

The CLI prints the skill directory. Pack authors also add `--skill ui-pack-maintain`.

**Secondary — Claude Code plugin marketplace:**

```text
/plugin marketplace add Lisuiwen/ai-html-annotation
/plugin install ai-html-annotation@lisuiwen-agent-skills
```

Both load the prototype skill from this repository; there is no second `SKILL.md`. The same plugin also loads the pack-author skill.

## Install a UI pack

Packs are not inside the Skill. After install, ask the agent to install `admin-desktop` (desktop) or `mobile-vant` (phone). Default location: `~/.html-prototype/packs/<id>/`.

## Open the example

From a clone of this repository, open `examples/minimal-notes-system/prototype.html` in a browser (double-click is fine).

You should see the admin page **and** the right-hand Viewer (annotations, scenario controls, connectors). Double-click is read-only: you can read annotations and switch states; you cannot save cards, Mark, Direct Edit, or Inspector.

If you are not using this repo, install a UI pack, enable the skill, and ask the agent to generate a page from your materials ([product guide](guide.md#end-to-end-steps)).

## Start Author Tools

Author Tools listen on `127.0.0.1` only. Open the localhost URL the process prints. Without formal annotation data, Direct Edit, Mark, and Inspector still work; annotation cards cannot be saved.

Inspector IDE jump: copy the Skill-root `.env.example` to `.env`. Do not commit `.env`.

## First success

You are done with the five-minute path when all three work:

1. **Viewer** — annotations on the notes-system page; switching a state changes which cards (and page) you see.
2. **Copy to AI** — Author Tools → Mark, pin one element, `Copy all → For AI` places selectors + HTML on the clipboard.
3. **Page state** — the rail control matches a declared scenario. Optional: clean multi-state PNGs.

Mark, Direct Edit, and Inspector are author-session only. They do not ship in the formal HTML. Boundary: [product guide](guide.md#capability-table).

## Next

- After first success → [product guide](guide.md)
- Packs → [UI packs](ui-packs.md)
- Vs other review methods → [comparison](comparison.md)
- FAQ → [FAQ](faq.md)

## For agents

`<skill-root>` is the directory printed by `npx skills add`.

```bash
node <skill-root>/scripts/install-pack.mjs --pack=admin-desktop
node <skill-root>/runtime/server/index.mjs examples/minimal-notes-system/prototype.html --snapshot=prototype/notes.snapshot.js
```

Flags, overwrite rules, and `--dest=project`: [Pack install](../skills/html-prototype-build/references/pack-install.md). Gestures and tabs: [Local authoring](../skills/html-prototype-build/references/local-authoring.md). Clean PNGs: [Screenshots](../skills/html-prototype-build/references/screenshots.md). Agent routing: [SKILL.md](../skills/html-prototype-build/SKILL.md).
