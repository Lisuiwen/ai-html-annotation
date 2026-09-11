# Changelog

All notable changes to AI HTML Annotation are documented here.

[中文](CHANGELOG.zh-CN.md)

## v0.3.2 — 2026-09-10

### Changed

- Completed English localization for Skill references, UI pack contracts, component templates, runtime messages, and validation scripts.
- Chinese README pairs remain for navigation; `CHANGELOG.md` keeps English release notes.

### Fixed

- Repaired corrupted mixed-language strings introduced during bulk translation (manifest keywords, README links, addon example, validate scripts, and test descriptions).
- Added a `ponytail:` glossary to `SKILL.md` and replaced ambiguous “Case” wording with “project materials”.

### Install / update

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

## v0.3.1 — 2026-09-10

### Changed

- Localized Viewer, Author Tools, and the minimal example UI to English (`lang="en"`), including scenario switching, the notes rail, Direct Edit, and Mark labels, hints, toasts, and error messages.
- Minimal example annotations and scenario labels now match the Skill template.

### Fixed

- Synced the Viewer contract test with localized runtime error messages.

### Install / update

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

## v0.3.0 — 2026-09-09

### Added

- Final prototype deliveries now use a self-contained named parent directory with `AGENTS.md`, runnable HTML, supporting files, and scenario screenshots.
- A concise Coding Agent handoff template directs implementation work to product annotations and screenshots, with anchor-scoped HTML lookup only when necessary.

### Changed

- The delivery contract and checklist require copying the handoff template into every final prototype package.
- The minimal example includes the same handoff file and verifies it stays synchronized with the Skill template.

### Install / update

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

## v0.2.1 — 2026-09-08

### Fixed

- macOS shortcut compatibility across Author Tools via shared `author/core/platform.js` for `⌘` vs `Ctrl` labels and modifier detection.
- Notes Editor multiline save accepts `⌘ + Enter` (and `Control + Enter`) on macOS, not only `Ctrl + Enter`.

### Changed

- Direct Edit and Mark empty-state hints show `⌘` on macOS instead of always `Ctrl`.
- Root README and Skill references document macOS shortcuts for Edit, Mark, and Notes Editor.

### Install / update

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

## v0.2.0 — 2026-09-08

### Added

- Author Tools shell with `Edit` and `Mark` tabs.
- Direct Edit for in-browser style and copy changes saved through the localhost authoring server.
- Mark review pins with macOS `⌘`+click and `Copy all → For AI` export.
- Claude Code plugin marketplace entry.
- `skills.sh` and Claude Code install paths.
- GitHub Pages landing page.
- Chinese README pair.
- Runtime unit and contract tests across `client/`, `author/`, `server/`, and `cli/`.

### Changed

- Runtime reorganized by execution boundary.
- `PrototypeViewers` state model v2 split across `display-mode.js`, `state.js`, `model.js`, and `viewer.js`.
- Authoring server and screenshot CLI moved to dedicated paths.
- IDE config moved to Skill-root `.env`.
- Skill references split by task.
- Viewer action area and README demo GIFs updated.

### Fixed

- Direct Edit source writes hardened.
- Notes Editor toolbar pinned left.
- Example snapshot anchors aligned with DOM ids.

### Migration

- Update local Skill copies or reinstall, and replace legacy runtime paths (`serve.mjs` → `server/index.mjs`, `shoot.mjs` → `cli/screenshot.mjs`, `html-mark.js` → `author/tools/mark/`).

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

## v0.1.0 — Initial public release

AI HTML Annotation introduces a native-HTML workflow for building, reviewing, annotating, and iterating UI prototypes with coding agents.

### Highlights

- Reusable UI packs.
- DOM-bound product annotations with SVG connectors.
- Review pins exporting selectors and element snapshots.
- Local Inspector workflow.
- Explicit `PrototypeViewers` state.
- Scenario-based clean screenshots.
- Agent Skill packaging under `skills/html-prototype-build/`.
- Zero npm runtime dependencies.

### Install the Agent Skill

```bash
npx skills add https://github.com/Lisuiwen/ai-html-annotation --skill html-prototype-build
```

### Status

- Experimental 0.x — APIs, file layout, and authoring workflows may change as the project evolves.
