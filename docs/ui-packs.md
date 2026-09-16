# UI packs — stable visuals for agent-built HTML prototypes

[中文](ui-packs.zh-CN.md)

A UI pack is a reusable visual system (tokens, components, patterns, presets) that `html-prototype-build` **consumes**. It is not the Skill, not a production component library, and not a third-party design-system implementation.

This is capability line **B** (install / customize / maintain). Line **A** is the prototype collaboration loop ([features](features.md), [workflows](workflows.md)).

## Why packs

Without a pack, an agent invents layout and color each time. Screens drift even when the product language did not change. A pack gives a shared foundation so the notes-system sample, and the next admin page, can look like the same system.

Official packs are **prototype visual simulations**. Use them to get to an openable HTML page quickly. Do not drop them into an app as the production kit.

## Official packs

Shipped in this repository under `.html-prototype/packs/`:

| Id | Use when |
| --- | --- |
| `admin-desktop` | Desktop admin: forms, tables, navigation, dashboard charts. Default for [`examples/minimal-notes-system`](../examples/minimal-notes-system). |
| `mobile-vant` | Phone-width H5, Vant-style simulation: touch targets, cells, overlays. Alternate sample: [`examples/mobile-work-order`](../examples/mobile-work-order). |

Summaries come from each pack’s `PACK.md` / registry. `admin-desktop` vendors Apache ECharts inside the pack ([NOTICE](../NOTICE)); that is still not a commercial UI-library compatibility promise.

Choose from **installed** packs (`resolve-pack --list`). When the UI type is unclear, ask — never silently default ([catalog](../skills/html-prototype-build/ui/catalog.md)).

## Install

End-user default: home cache.

```bash
node <skill-root>/scripts/install-pack.mjs --pack=admin-desktop
```

`--list-remote`, `--dest=project`, `--dry-run`, overwrite protection, and env overrides: [pack install](../skills/html-prototype-build/references/pack-install.md). `install-pack.mjs` is the only `html-prototype-build` script that performs network I/O.

Missing pack is a user-action state. Do not hand-write a fake kit to unblock generation.

## Relation to `.html-prototype/packs`

| Role | Default location | Git |
| --- | --- | --- |
| End user (download or self-created) | `~/.html-prototype/packs/<id>/` | No |
| Project / official packs in this repo | `<repo>/.html-prototype/packs/<id>/` | Yes; source for `registry.json` |

Resolver prefers project packs over user cache, then other overrides listed in the [catalog](../skills/html-prototype-build/ui/catalog.md). Downloaded packs write `.pack-source.json`. Hand-authored packs must not add that file; they need `manifest.json` at the pack root.

Self-created ids should be namespaced (`mycompany-admin`) so they do not shadow `admin-desktop` or `mobile-vant`.

## When to switch vs customize

| Situation | Do |
| --- | --- |
| Desktop admin vs phone H5 (or materials name a different installed pack) | **Switch** pack id, then generate |
| Official simulation is the wrong language, but you still want agent-built HTML | **Customize** or author a pack, then rebuild the prototype |
| You already have an agreed **production** UI kit and need app code | Use that kit — not this Skill |

Customize / maintain product pages are planned: [customize a pack](ui-pack-customize.md), [maintain a pack](ui-pack-maintain.md). Until they ship, follow the pack skill below.

## Division of labor

| Owns `html-prototype-build` | Owns `ui-pack-maintain` |
| --- | --- |
| Lookup chain, `install-pack.mjs`, `deliver[]` copy-out, prototype generation | Pack contract, `schemaVersion`, `validate-pack.mjs`, registry generation |
| Consumer `resolve-pack.mjs` (`--list` / `--select`) | In-pack `resolve-pack.mjs` (`--pack=<dir> --entry=`) |
| Page collaboration loop (Viewer, Mark, Direct Edit, Inspector, scenarios) | Pack lifecycle: create → validate → version → publish |

Do not use `ui-pack-maintain` to generate business prototypes or to install packs for end users. Do not use `html-prototype-build` to invent pack contract or registry format.

Authoring skill: [`skills/ui-pack-maintain/SKILL.md`](../skills/ui-pack-maintain/SKILL.md). Landing paths: [pack authoring](../skills/ui-pack-maintain/references/pack-authoring.md).

## Next

- Consumer install protocol → [pack install](../skills/html-prototype-build/references/pack-install.md)
- First page after a pack → [quickstart](quickstart.md)
- Rebuild after a pack change → [workflows](workflows.md#5-optional-customize-pack-then-rebuild)
- vs production libraries → [comparison](comparison.md)
