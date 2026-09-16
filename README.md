# AI HTML Annotation

[中文](README.zh-CN.md)

[![skills.sh](https://skills.sh/b/Lisuiwen/ai-html-annotation)](https://skills.sh/Lisuiwen/ai-html-annotation)

> Agent Skill for native HTML prototypes with real-DOM notes — for Claude Code, Codex, Cursor, and other coding agents.

**The page is the deliverable, not just a picture of one.** Build from a UI pack, review on the live DOM, hand the agent selectors instead of pixels, and ship clean multi-state screenshots.

Experimental 0.x · zero npm dependencies · MIT · [Changelog](CHANGELOG.md)

## Where the old loop fails

Three people, three old habits, three breaks. Detail: [Pain points and scenarios](docs/pain-points-and-scenarios.md).

- **Reviewer / PM** × comments in chat or a doc (“move this left”) × the note never maps to an element, so the agent guesses.
- **Author / agent** × iterating from screenshots × there is no DOM, so the next HTML rewrite drifts.
- **Anyone verifying a fix** × spec, chat thread, and source stay disconnected × checking the change is slow.

## Collaboration loop

```text
generate HTML from a UI pack
        │
        ▼
   Viewer          formal notes on the real page
        │
        ▼
   Mark → Copy for AI     pins, selectors, element HTML snapshots
        │
        ▼
   Direct Edit     tweak style or copy on localhost, write back to source
        │
        ▼
   Inspector       lock an element → open that location in the IDE
        │
        ▼
   scenarios       clean multi-state PNGs (no author chrome)
```

Author tools (Mark, Direct Edit, Inspector, localhost authoring) load only in the authoring session. Formal HTML keeps the read-only Viewer and semantic DOM. Scenario PNGs omit that chrome.

## See it first

### Review the page the way a PM would

Formal notes sit on the real DOM. Add, edit, or browse them, switch page scenarios, and follow SVG connectors to the matching modules — same page, not a separate spec.

![Formal notes on the live page: browse annotations and switch scenarios](media/viewer.gif)

### Pin a problem and hand it to the agent

Hold `Ctrl` (macOS: `⌘`) and click an element to drop a removable review pin, or switch to Direct Edit to tweak style or copy and save back to source. Then `Copy all → For AI` exports selectors plus element HTML snapshots.

![Pin feedback on a real element and copy selector + HTML snapshot for the agent](media/mark.gif)

### Lock the thing that looks wrong and jump to source

Hold `Alt + Shift`, hover to see the selector, click to open that location in your local IDE.

![Lock an element and jump from the page to its source](media/inspector.gif)

## Two capabilities

1. **Prototype collaboration** (`html-prototype-build`) — generate an openable HTML page, review it on the DOM, copy agent-ready context, tweak in place, and deliver scenario screenshots. See [workflows](docs/workflows.md).
2. **UI packs** — install, customize, or maintain a reusable visual system so agent-built pages stay consistent. Official packs are `admin-desktop` and `mobile-vant`. See [UI packs](docs/ui-packs.md).

## Fit / not fit

**Fit** when you need to:

- turn UI materials into openable HTML quickly;
- review on the real page and hand precise feedback to an AI;
- iterate structure, copy, and state while keeping reproducible screenshots;
- keep admin, config, or interaction prototypes visually stable across tasks.

**Not a fit** as a production component library, a Figma replacement, a third-party design-system implementation, or a general frontend scaffold / production code generator.

## 5-minute Quickstart

skills.sh is the default install. After it prints `<skill-root>`:

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
node <skill-root>/scripts/install-pack.mjs --pack=admin-desktop
```

Open [`examples/minimal-notes-system/prototype.html`](examples/minimal-notes-system) (desktop sample in this repo). For authoring (Mark, Direct Edit, Inspector), start the localhost server — command in [5-minute quickstart](docs/quickstart.md).

Claude Code marketplace is secondary: `/plugin marketplace add Lisuiwen/ai-html-annotation` then `/plugin install ai-html-annotation@lisuiwen-agent-skills`. Pack authors also install `ui-pack-maintain`.

## Capability cheat sheet

| Need | Use | Layer |
| --- | --- | --- |
| Formal notes, scenario switch, SVG connectors | Viewer | Formal page |
| Review pins → selectors + HTML snapshots | Mark, `Copy all → For AI` | Author session |
| Tweak style or copy on the page | Direct Edit | Author session |
| Lock element → IDE | Inspector | Author session |
| Stable visuals | UI pack (`install-pack`) | Pack, not the Skill |
| Clean create / edit / empty / … PNGs | `scenarios` + screenshot CLI | Delivery |

Full map: [Capability map](docs/features.md). Author vs formal boundary stays in that page.

## Examples

- Default walkthrough: [`examples/minimal-notes-system`](examples/minimal-notes-system) (admin desktop).
- Alternate: [`examples/mobile-work-order`](examples/mobile-work-order) (mobile H5, `mobile-vant`).

## Where to go next

- [Docs index](docs/README.md) — pain points, features, workflows, quickstart, UI packs, [comparison](docs/comparison.md), [FAQ](docs/faq.md)
- Skill overview → [`skills/html-prototype-build/README.md`](skills/html-prototype-build/README.md) ([中文](skills/html-prototype-build/README.zh-CN.md))
- Agent routing → [`skills/html-prototype-build/SKILL.md`](skills/html-prototype-build/SKILL.md)
- Task commands → [`skills/html-prototype-build/references/`](skills/html-prototype-build/references/) ([pack install](skills/html-prototype-build/references/pack-install.md), [local authoring](skills/html-prototype-build/references/local-authoring.md), [review mark](skills/html-prototype-build/references/review-mark.md), [screenshots](skills/html-prototype-build/references/screenshots.md))

Skill references, UI pack contracts, and addon docs are in English.

## Distribution layout

```text
.claude-plugin/marketplace.json  Claude Code marketplace catalog
.html-prototype/packs/           Official UI packs + registry.json
skills/html-prototype-build/     Prototype build Agent Skill
skills/ui-pack-maintain/         UI pack authoring Agent Skill
examples/                        Runnable samples
media/                           README demo assets
scripts/                         Validation entry
tests/                           Runtime, pack, and contract tests
```

Inside the Skill, runtime splits by boundary: `client/` formal browser runtime, `author/` browser authoring tools, `server/` localhost Node service, `cli/` standalone commands.

## Security

- Authoring server binds to `127.0.0.1` only. Do not run authoring or screenshots against untrusted HTML or snapshot files.
- Author writes require same-origin localhost JSON. Keep `skills/html-prototype-build/.env` local for IDE selection; never commit it.
- Direct Edit and Mark load only in the authoring session. Direct Edit writes style/copy through localhost; Mark stores pins in page-scoped `localStorage` and may copy to the clipboard. Neither is injected into source HTML.
- Do not put real credentials, production data, personal information, or unauthorized brand assets in prototypes.

## Contributing

Experimental 0.x; APIs and layout may change. See [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md) and [`.github/CODE_OF_CONDUCT.md`](.github/CODE_OF_CONDUCT.md). Report vulnerabilities privately per [`.github/SECURITY.md`](.github/SECURITY.md).

UI packs are original native-HTML visual simulations. They do not bundle third-party design-system code; vendored libraries (for example Apache ECharts in `admin-desktop`) ship inside the pack and are listed in [NOTICE](NOTICE).

## License

[MIT](LICENSE). Third-party attribution is in [NOTICE](NOTICE) (html-mark credit and Apache ECharts).
