# HTML Prototype Build

[中A](README.zh-CN.md)

An HTML product-prototype Skill for AI agents: generate pages from UI packs, maintain formal notes on the real DOM, review and jump to source, and output scenario screenshots for delivery.

Installation, product demo, and repository-level overview live in the [repository README](../../README.md). This file covers how to use the Skill; concrete commands and step-by-step operations live in `references/`.

## Who it is for

- **Collaborate with an agent**: hand requirements, screenshots, or an existing page to an agent and let it generate or modify the prototype with this Skill.
- **Review and iterate yourself**: use the authoring server to open the generated prototype, view notes, switch scenarios, add review feedback, and tweak styles or copy directly — without re-describing the page structure every time.
- **Prepare deliverables**: keep "formal prototype files" and "authoring-session tools" separate, and produce clean multi-state page screenshots.

It is not meant as a general frontend scaffold or production code generator; its goal is **reviewable, annotatable, screenshotable prototype delivery**.

## What you get

A complete task typically yields three outputs:

| Output | Role |
| ------ | ---- |
| Runnable HTML prototype | Native page; double-click to preview, or open via the local authoring server |
| `notes.snapshot.js` | Single source of truth for formal notes, scenario states, and the screenshot manifest |
| Per-scenario PNGs | Clean page screenshots without the notes rail, connectors, or author tools |

Formal prototypes keep only semantic DOM, stable anchors, and the read-only Viewer; Mark, Direct Edit, Notes Editor, Inspector, and the local authoring server all belong to the **authoring layer** and never enter the delivered HTML.

## Typical usage

No need to memorize commands — work by intent:

1. **Create or heavily change a page**
   Enable this Skill in Cursor, Claude Code, Codex, or other clients, describe the requirement in natural language or attach materials, and let the agent generate `prototype.html` and `prototype/`. Constraints and task routing: [SKILL.md](SKILL.md).
2. **Keep working on the page**
   To change styles or notes, drop review pins, or jump from an element back to source, operate through the local authoring server in the browser. Direct Edit and Mark share the Author Tools panel; capabilities are described in [Local authoring](references/local-authoring.md) and [Review mark](references/review-mark.md).
3. **Capture scenarios or deliver**
   For batch clean-page screenshots or final file assembly, see [Scenario screenshots](references/screenshots.md) and [Delivery & iteration](references/delivery.md).

The [`examples/minimal-notes-system`](../../examples/minimal-notes-system) sample inside the repo is a minimal runnable reference.

## Capability overview

```text
Native HTML prototype
   │
   ├── Viewer: formal notes on the right, scenario switching, SVG connectors
   ├── Direct Edit / Mark: tweak page styles or drop review pins, export selectors and element snapshots for AI
   ├── Notes Editor: edit formal note cards
   ├── Inspector: jump from a page element to local IDE source
   └── Screenshot: output clean page PNGs per snapshot scenario
```

The same business state drives page notes and scenario switching as well as multi-state screenshots, so there is no drift between the "visual mock" and the "runnable page".

## Environment & optional configuration

- Requires **Node.js 18+**; the Skill ships its own runtime and scripts with no extra npm packages.
- Batch screenshots need **Microsoft Edge or Google Chrome** on your machine.
- To use Inspector source-jump, configure your local IDE in this directory following [.env.example](.env.example); that file is for personal environments only — do not commit it.

## Where to look next

| To understand… | See |
| -------------- | --- |
| What to make the agent do, hard constraints | [SKILL.md](SKILL.md) |
| Task-specific instructions (with commands) | Matching entry under [references/](references/) |
| How to pick UI packs | [ui/catalog.md](ui/catalog.md) |
| Repository install and feature overview | [Repository README](../../README.md) |

This file only explains what the Skill is for and how to collaborate; concrete commands, step-by-step operations, and agent contracts are maintained per-task in the documents above.
