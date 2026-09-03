# Changelog

All notable changes to AI HTML Annotation will be documented in this file.

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
