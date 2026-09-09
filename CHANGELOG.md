# Changelog

All notable changes to AI HTML Annotation will be documented in this file.

## v0.3.0 — 2026-09-09

### Added

- Final prototype deliveries now use a self-contained named parent directory with `AGENTS.md`, the runnable HTML, supporting files, and scenario screenshots.
- A concise Coding Agent handoff template directs implementation work to product annotations and screenshots, with anchor-scoped HTML lookup only when necessary.

### Changed

- The delivery contract and checklist now require copying the handoff template into every final prototype package.
- The minimal example includes the same handoff file and verifies it stays synchronized with the Skill template.

### Install / update

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

## v0.2.1 — 2026-09-08

### Fixed

- macOS shortcut compatibility across Author Tools: shared `author/core/platform.js` for `⌘` vs `Ctrl` labels and modifier detection.
- Notes Editor multiline save now accepts `⌘ + Enter` (and `Control + Enter`) on macOS, not only `Ctrl + Enter`.

### Changed

- Direct Edit and Mark empty-state hints show `⌘` on macOS instead of always `Ctrl`.
- Root README and Skill references document macOS shortcuts for Edit, Mark, and Notes Editor.

### Install / update

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

## v0.2.0 — 2026-09-08

### Added

- **Author Tools** shell with `Edit` and `Mark` tabs in one panel.
- **Direct Edit** for in-browser style and copy changes that save back to `prototype.html` through the localhost authoring server.
- **Mark** review pins with macOS `⌘`+click support and `Copy all → For AI` export.
- Claude Code plugin marketplace entry (`.claude-plugin/marketplace.json`).
- `skills.sh` and Claude Code install paths in the root README.
- GitHub Pages landing page (`index.html`).
- Chinese README (`README.zh-CN.md`) and delivery checklist reference.
- Runtime unit and contract tests across `client/`, `author/`, `server/`, and `cli/`.

### Changed

- Runtime reorganized by execution boundary: `client/`, `author/`, `server/`, `cli/`.
- `PrototypeViewers` state model v2 with split `display-mode.js`, `state.js`, `model.js`, and `viewer.js`.
- Authoring server moved to `runtime/server/index.mjs`; screenshot CLI to `runtime/cli/screenshot.mjs`.
- IDE config (`.env`) moved to the Skill root (`skills/html-prototype-build/.env`).
- Skill references split by task (local authoring, review mark, screenshots, delivery).
- Viewer action area: fixed scene switch / add note / author tools order; solid primary scene buttons.
- Root README demo GIFs updated for Viewer and Author Tools (Direct Edit + Mark).

### Fixed

- Direct Edit source writes hardened with atomic patches and selector validation.
- Notes Editor toolbar pinned to the left of the action area.
- Example snapshot anchors aligned with DOM ids.

### Migration

- Update local Skill copies or reinstall:

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

- Replace old runtime paths:
  - `runtime/serve.mjs` → `runtime/server/index.mjs`
  - `runtime/shoot.mjs` → `runtime/cli/screenshot.mjs`
  - `runtime/html-mark.js` → `runtime/author/tools/mark/`

## v0.1.0 — Initial public release

AI HTML Annotation introduces a native-HTML workflow for building, reviewing, annotating, and iterating UI prototypes with coding agents.

### Highlights

- Reusable UI packs for stable HTML prototype generation.
- DOM-bound product annotations with grouped notes and SVG connectors.
- Review pins that export selectors, element HTML snapshots, and AI-ready feedback context.
- Local Inspector workflow for locking a live element and jumping back to source.
- Explicit prototype state handling through `PrototypeViewers`.
- Scenario-based clean screenshots for create, edit, empty, linked, and other declared UI states.
- Local authoring tools kept separate from the final HTML deliverable.
- Agent Skill packaging under `skills/html-prototype-build/`.
- Zero npm runtime dependencies.

### Install the Agent Skill

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

### Status

This is an experimental 0.x release. APIs, file layout, and authoring workflows may change while the project evolves.
