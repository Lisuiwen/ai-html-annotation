# UI Pack Catalog

## Discover packs at runtime

Packs are external to the core skill. Before choosing a foundation or provider, list what is installed:

```bash
node <skill-root>/scripts/resolve-pack.mjs --list
```

Use the returned `packs[].id`, `foundation`, and `providers` to choose exactly one foundation and at most one compatible provider per action / navigation / form / data / feedback category. When user materials identify the UI type, choose the matching pack; when unclear, ask first — never default to any visual system.

If `--list` returns no packs, follow [Pack install](../references/pack-install.md).

`--list` reports `origin: installed | local` so downloaded packs can be distinguished from hand-authored ones.

## Selection rules

1. Each prototype must choose exactly one foundation.
2. At most one provider per category such as action, navigation, form, data, and feedback.
3. A provider must declare compatibility with the current foundation in its own `PACK.md`.
4. Addons are not UI providers and may be layered on demand without changing product visual Tokens.
5. After choosing a pack, run `node <skill-root>/scripts/resolve-pack.mjs --pack=<pack-id> --select=<id[,id...]>` and read only the minimal dependency closure it outputs; read the full `manifest.json` only when maintaining the index or debugging the resolver — never load all components by category.

## Pack locations

This skill does not bundle pack files. Official packs (`admin-desktop`, `mobile-vant`) live in the repository under `.html-prototype/packs/`. Write locations and download steps are in [Pack install](../references/pack-install.md). Pack authoring belongs to `ui-pack-maintain`.

The resolver searches installed packs, in order:

1. `--pack-dir` / `--pack-root`
2. `HTML_PROTOTYPE_PACK_ROOT`
3. `.html-prototype/packs/` from the current working directory upward (project)
4. `~/.html-prototype/packs/` (user cache)
5. `<skill-root>/ui/packs/` (optional legacy fallback; not shipped)
