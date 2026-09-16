# UI packs — stable visuals for agent-built HTML prototypes

[中文](ui-packs.zh-CN.md)

A UI pack is a reusable visual system (tokens, components, patterns, presets) that prototype generation **consumes**. It is not the Skill, not a production component library, and not a third-party design-system implementation.

The collaboration loop (annotate, Author Tools, copy to an AI, multi-state screenshots) is in the [product guide](guide.md). This page is install / switch / customize.

## Why packs

Without a pack, an agent invents layout and color each time. Screens drift even when the product language did not change. A pack gives a shared foundation so the notes-system sample, and the next admin page, can look like the same system.

Official packs are **prototype visual simulations**. Use them to get to an openable HTML page quickly. Do not drop them into an app as the production kit.

## Official packs

| Id | Use when |
| --- | --- |
| `admin-desktop` | Desktop admin: forms, tables, navigation, dashboard charts. Default for [`examples/minimal-notes-system`](../examples/minimal-notes-system). |
| `mobile-vant` | Phone-width H5, Vant-style simulation: touch targets, cells, overlays. Alternate sample: [`examples/mobile-work-order`](../examples/mobile-work-order). |

`admin-desktop` vendors Apache ECharts inside the pack ([NOTICE](../NOTICE)); that is still not a commercial UI-library compatibility promise.

Choose from **installed** packs. When the UI type is unclear, ask — never silently default.

## Install

End-user default: home cache `~/.html-prototype/packs/<id>/`. Ask the agent to install `admin-desktop` or `mobile-vant`.

Missing pack is a user-action state. Do not hand-write a fake kit to unblock generation.

| Role | Default location | Git |
| --- | --- | --- |
| End user (download or self-created) | `~/.html-prototype/packs/<id>/` | No |
| Project / official packs in this repo | `<repo>/.html-prototype/packs/<id>/` | Yes |

Project packs win over user cache. Self-created ids should be namespaced (`mycompany-admin`) so they do not shadow `admin-desktop` or `mobile-vant`.

## When to switch vs customize

| Situation | Do |
| --- | --- |
| Desktop admin vs phone H5 (or materials name a different installed pack) | **Switch** pack id, then generate |
| Official simulation is the wrong language, but you still want agent-built HTML | **Customize** or author a pack with `ui-pack-maintain`, then rebuild the prototype |
| You already have an agreed **production** UI kit and need app code | Use that kit — not this Skill |

Customize or author a pack with the `ui-pack-maintain` skill, then rebuild the prototype. Product pages for that flow are planned: [customize a pack](ui-pack-customize.md), [maintain a pack](ui-pack-maintain.md).

Prototype generation consumes packs. Do not use `ui-pack-maintain` to generate business pages, and do not use prototype generation to invent pack contracts.

## Next

- First page after a pack → [quickstart](quickstart.md)
- Rebuild after a pack change → [product guide](guide.md#end-to-end-steps)
- vs production libraries → [comparison](comparison.md)

## For agents

```bash
node <skill-root>/scripts/install-pack.mjs --pack=admin-desktop
```

Flags, overwrite protection, and `--dest=project`: [Pack install](../skills/html-prototype-build/references/pack-install.md). Consumer catalog: [catalog](../skills/html-prototype-build/ui/catalog.md). Pack contract and registry: [ui-pack-maintain](../skills/ui-pack-maintain/SKILL.md). Landing: [Pack authoring](../skills/ui-pack-maintain/references/pack-authoring.md).
