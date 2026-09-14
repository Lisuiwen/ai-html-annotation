# Consuming UI Packs

Pack anatomy, manifest rules, and validation live in the **ui-pack-maintain** skill:

- `references/contract.md` — authoritative human-readable contract
- `scripts/validate-pack.mjs` — machine-readable enforcement

Do not duplicate those rules here. This file records **consumer-only** obligations when generating prototypes.

## Consumer rules

1. **Business Adapter** — map `PrototypeViewers` state to component Adapters; Adapters must not read `PrototypeViewers` directly.
2. **Confirmed state only** — implement states present in user materials; mark intentional gaps with `ponytail:`.
3. **Example ids** — `component.html` example `id` values are anchors only; when copying multiple instances, replace with unique stable page ids and pass the matching root to each Adapter.
4. **Generation contract** — meet semantic, accessibility, comment, and dependency requirements in [generation-contract.md](../references/generation-contract.md).
5. **Pack independence** — different packs need not share DOM, class names, or JS APIs; choose one foundation and compatible providers per category via [catalog.md](catalog.md).

## Resolution workflow

```bash
node <skill-root>/scripts/resolve-pack.mjs --list
node <skill-root>/scripts/resolve-pack.mjs --pack=<pack-id> --select=<id[,id...]>
```

Read only the returned `read[]` closure and copy `deliver[]` (`from` → `to`) into the prototype. When no pack is installed, follow [Pack install](../references/pack-install.md).
