# AI HTML Annotation

[中文](README.zh-CN.md)

[![skills.sh](https://skills.sh/b/Lisuiwen/ai-html-annotation)](https://skills.sh/Lisuiwen/ai-html-annotation)

> Agent Skill for native HTML prototypes with real-DOM annotations — for Claude Code, Codex, Cursor, and other coding agents.

**The page is the deliverable, not just a picture of one.** Build from a UI pack, annotate on the live DOM, copy feedback to an AI, and ship clean multi-state screenshots.

Experimental 0.x · zero npm dependencies · MIT · [Changelog](CHANGELOG.md)

## Why it exists

Chat comments never hit an element, screenshot-based HTML drifts, and spec / chat / source stay disconnected. The [product guide](docs/guide.md) covers why that fails, four jobs on the loop, and the numbered workflow.

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

Mark, Direct Edit, and Inspector are parallel options after Viewer, not a required sequence.

## See it first

Walkthrough video: [media/hero-main.mp4](media/hero-main.mp4) (GitHub may not autoplay — open the file).

### Review the page the way a PM would

Formal annotations sit on the real DOM. Add, edit, or browse them, switch page states, and follow SVG connectors to the matching modules — same page, not a separate spec.

![Formal notes on the live page: browse annotations and switch scenarios](media/viewer.gif)

### Pin a problem and copy it to the AI

Hold `Ctrl` (macOS: `⌘`) and click an element to drop a removable review pin. Then `Copy all → For AI` exports selectors plus element HTML.

![Pin feedback on a real element and copy selector + HTML snapshot for the agent](media/mark.gif)

### Tweak style or copy on the live page

Author Tools → **edit**. Hold `Ctrl` (macOS: `⌘`), change copy or styles (for example a background color), and save. The editor UI stays in the authoring session; it is not injected into the deliverable.

![Change copy or styles on the page and write them back to source](media/direct-edit.gif)

### Lock the thing that looks wrong and jump to source

Hold `Alt + Shift`, hover to see the selector, click to open that location in your local IDE.

![Lock an element and jump from the page to its source](media/inspector.gif)

### Deliver clean multi-state screenshots

Multi-state screenshots hide the annotation rail, connectors, and Author Tools. Formal HTML can still show Viewer; the PNGs are the product page only.

![Notes rail versus product-only output for the same mobile page](media/scenarios-mobile.gif)

### Generate from a UI pack so pages stay visually consistent

Installable visual systems — tokens, components, patterns — not bundled inside the Skill. Official packs: `admin-desktop` (desktop admin) and `mobile-vant` (phone-width H5).

![Official packs at a glance: admin desktop and mobile H5](media/ui-pack.gif)

## Fit / not fit

**Fit** when you need to:

- turn UI materials into openable HTML quickly;
- review on the real page and copy precise feedback to an AI;
- iterate structure, copy, and state while keeping reproducible screenshots;
- keep admin, config, or interaction prototypes visually stable across tasks.

**Not a fit** as a production component library, a Figma replacement, a third-party design-system implementation, or a general frontend scaffold / production code generator.

## Install

skills.sh is the default. Then install a UI pack (`admin-desktop` for desktop, `mobile-vant` for phone) and open Author Tools — steps in [5-minute quickstart](docs/quickstart.md).

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

Open [`examples/minimal-notes-system/prototype.html`](examples/minimal-notes-system) (desktop sample in this repo).

Claude Code marketplace is secondary: `/plugin marketplace add Lisuiwen/ai-html-annotation` then `/plugin install ai-html-annotation@lisuiwen-agent-skills`. Pack authors also install `ui-pack-maintain`.

## Examples

- Default walkthrough: [`examples/minimal-notes-system`](examples/minimal-notes-system) (admin desktop).
- Alternate: [`examples/mobile-work-order`](examples/mobile-work-order) (mobile H5, `mobile-vant`).

## Where to go next

- [Product guide](docs/guide.md) — why it fails, four scenarios, capabilities, numbered steps
- [Quickstart](docs/quickstart.md) · [UI packs](docs/ui-packs.md) · [Comparison](docs/comparison.md) · [FAQ](docs/faq.md)
- [Docs index](docs/README.md)
- Skill overview → [html-prototype-build README](skills/html-prototype-build/README.md) ([中文](skills/html-prototype-build/README.zh-CN.md))

Skill references, UI pack contracts, and addon docs are in English.

## For agents

Local Author Tools, pack install, and screenshot commands: [Local authoring](skills/html-prototype-build/references/local-authoring.md), [Pack install](skills/html-prototype-build/references/pack-install.md), [Screenshots](skills/html-prototype-build/references/screenshots.md). Agent routing: [SKILL.md](skills/html-prototype-build/SKILL.md).

## Distribution layout

```text
.claude-plugin/marketplace.json  Claude Code marketplace catalog
.html-prototype/packs/           Official UI packs
skills/html-prototype-build/     Prototype build Agent Skill
skills/ui-pack-maintain/         UI pack authoring Agent Skill
examples/                        Runnable samples
media/                           README demo assets
docs/                            Product docs
```

## Security

- Author Tools bind to `127.0.0.1` only. Do not run authoring or screenshots against untrusted HTML.
- Author writes require same-origin localhost JSON. Keep the Skill-root `.env` local for IDE selection; never commit it.
- Direct Edit and Mark load only in the authoring session. Direct Edit writes style/copy through localhost; Mark stores pins in page-scoped `localStorage` and may copy to the clipboard. Neither is injected into source HTML.
- Do not put real credentials, production data, personal information, or unauthorized brand assets in prototypes.

## Contributing

Experimental 0.x; APIs and layout may change. See [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md) and [`.github/CODE_OF_CONDUCT.md`](.github/CODE_OF_CONDUCT.md). Report vulnerabilities privately per [`.github/SECURITY.md`](.github/SECURITY.md).

UI packs are original native-HTML visual simulations. They do not bundle third-party design-system code; vendored libraries (for example Apache ECharts in `admin-desktop`) ship inside the pack and are listed in [NOTICE](NOTICE).

## License

[MIT](LICENSE). Third-party attribution is in [NOTICE](NOTICE) (html-mark credit and Apache ECharts).
