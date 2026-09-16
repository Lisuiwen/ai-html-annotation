# 5-minute quickstart

[中文](quickstart.zh-CN.md)

Install the skill, install a pack, open the desktop sample, start authoring. That is enough to see Viewer, copy a Mark export, and switch a scenario. Longer protocol lives in Skill references — this page stays short.

Needs **Node.js 18+**. Batch screenshots (optional) need Microsoft Edge or Google Chrome on the machine.

Default sample: [`examples/minimal-notes-system`](../examples/minimal-notes-system). Phone-width alternate: [`examples/mobile-work-order`](../examples/mobile-work-order) with pack `mobile-vant`.

## Install the skill

**Primary — skills.sh** (Claude Code, Cursor, Codex-compatible clients, other Agent Skills):

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

The CLI prints the skill directory. That path is `<skill-root>` below.

**Secondary — Claude Code plugin marketplace:**

```text
/plugin marketplace add Lisuiwen/ai-html-annotation
/plugin install ai-html-annotation@lisuiwen-agent-skills
```

Both load `html-prototype-build` from this repository; there is no second `SKILL.md`. Pack authors add `--skill ui-pack-maintain` (or the same plugin, which also loads that skill).

## Install a UI pack

Packs are not inside the Skill. After install:

```bash
node <skill-root>/scripts/install-pack.mjs --pack=admin-desktop
```

That writes `~/.html-prototype/packs/admin-desktop/` by default. List remotes first with `--list-remote` if you need to choose. Full flags, overwrite rules, and `--dest=project`: [pack install](../skills/html-prototype-build/references/pack-install.md).

For the mobile sample, use `--pack=mobile-vant` instead.

## Open the example

From a clone of this repository, open `examples/minimal-notes-system/prototype.html` in a browser (double-click is fine).

You should see the admin page **and** the right-hand Viewer (formal notes, scenario controls, connectors). Under `file://` this is read-only: you can read notes and switch scenarios; you cannot save cards, Mark, Direct Edit, or Inspector.

If you are not using this repo, install a pack, enable the skill, and ask the agent to generate a page from your materials ([workflows](workflows.md#1-materials-to-openable-html)).

## Local authoring (shortest path)

```bash
node <skill-root>/runtime/server/index.mjs examples/minimal-notes-system/prototype.html --snapshot=prototype/notes.snapshot.js
```

Run it so the HTML path is correct for your cwd (or pass an absolute path). Open the `http://127.0.0.1:4178/...` URL the process prints. The server binds to `127.0.0.1` only.

Without `--snapshot`, Direct Edit, Mark, and Inspector still work; formal note cards cannot be saved.

Inspector IDE jump: copy [`skills/html-prototype-build/.env.example`](../skills/html-prototype-build/.env.example) to `<skill-root>/.env`. Do not commit `.env`. Gesture table and tabs: [local authoring](../skills/html-prototype-build/references/local-authoring.md).

## First success

You are done with the five-minute path when all three work:

1. **Viewer** — formal notes on the notes-system page; switching a scenario changes which cards (and page state) you see.
2. **Mark copy** — Author Tools → Mark, pin one element, `Copy all → For AI` places selectors + HTML snapshots on the clipboard ([review mark](../skills/html-prototype-build/references/review-mark.md)).
3. **Scenario** — `?scene=<id>` or the rail control matches a key in `prototype/notes.snapshot.js` `scenarios`. Optional: screenshot CLI for clean PNGs ([screenshots](../skills/html-prototype-build/references/screenshots.md)).

Mark, Direct Edit, and Inspector are author-session only. They do not ship in the formal HTML. Boundary: [features](features.md#author-layer-vs-formal-deliverable).

## Next

- What to do after first success → [workflows](workflows.md)
- Tool map → [features](features.md)
- Packs → [UI packs](ui-packs.md)
- Agent routing → [SKILL.md](../skills/html-prototype-build/SKILL.md)
- Skill usage → [html-prototype-build README](../skills/html-prototype-build/README.md)
- FAQ → [FAQ](faq.md)
