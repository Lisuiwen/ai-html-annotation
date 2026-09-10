# UI Pack Catalog

## Available packs

- `admin-desktop`: Admin desktop-style UI providing foundation, action, navigation, form, data, feedback, plus optional Patterns and Presets.

## Selection rules

1. Each prototype must choose exactly one foundation.
2. At most one provider per category such as action, navigation, form, data, and feedback.
3. A provider must declare compatibility with the current foundation in its own `PACK.md`.
4. When user materials identify the UI type, choose the matching pack; when unclear, ask first — never default to any visual system.
5. Addons are not UI providers and may be layered on demand without changing product visual Tokens.
6. After choosing a pack, run `node <skill-root>/scripts/resolve-pack.mjs --pack=<pack-id> --select=<id[,id...]>` and read only the minimal dependency closure it outputs; read the full `manifest.json` only when maintaining the index or debugging the resolver — never load all components by category.

## Current combination

There is currently one complete pack:

```text
foundation: admin-desktop.default
action: admin-desktop
navigation: admin-desktop
form: admin-desktop
data: admin-desktop
feedback: admin-desktop
addons: choose as needed
```

When adding a new UI pack, register only capabilities and compatibility; do not change the shared generation flow.
