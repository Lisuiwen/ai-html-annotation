# UI Pack Contract

## Pack structure

Each UI pack uses this structure:

```text
packs/<pack-id>/
├── PACK.md
├── manifest.json
├── design-system.md
├── foundation/
│   ├── FOUNDATION.md
│   ├── tokens.css
│   └── base.css
├── components/
│   └── <category>/<component-id>/
│       ├── COMPONENT.md
│       ├── component.html
│       └── state-adapter.js    # optional: stateless projection interface
├── patterns/
│   └── <pattern-id>/
│       ├── PATTERN.md
│       └── pattern.html
└── presets/
    └── <preset-id>/
        ├── PRESET.md
        └── seed.html
```

Categories, Patterns, and Presets that are not provided may be omitted, but must be declared accurately in `manifest.json`.

## Asset responsibilities

- `manifest.json` is the sole index for components, Patterns, Presets, paths, and dependencies.
- The foundation must be unique and DOM-free; it only provides cross-component Tokens and document-level CSS baseline.
- `COMPONENT.md` and `component.html` are the sole sources for component contract and static implementation; stateful components may additionally provide `state-adapter.js`.
- Patterns compose only components and layout slots; they must not duplicate component implementations.
- Presets provide only business-fact-free page starting points; they must not carry business names, fields, or data that could be mistaken for real content.
- Do not keep category-aggregated component implementation files; AI must read leaf resources through the manifest.

## Composition constraints

- The foundation must be unique and only provide cross-component Tokens and CSS baseline; it must not contain page shells, components, example DOM, or scripts.
- At most one provider per component category; never load two component sets in the same category.
- Providers may reference only Tokens explicitly provided by the current foundation, private Tokens declared by the current component, or dependencies listed in the manifest.
- Internal components may be depended on only by public components; Patterns and Presets must not select internal components directly.
- UI packs must not reference the author server, html-mark, Inspector, screenshot tools, or the formal notes Viewer.
- `state-adapter.js` receives external state only and renders component DOM; it must not persist business state, parse URLs, register global click handlers, or call `PrototypeViewers`.
- Addons must not override product component visuals, Tokens, or component behavior.

## Freedom within a pack

- Different UI Packs are not required to share DOM, CSS class names, or JS APIs.
- Each Pack need only satisfy this contract's manifest, foundation, component, and adapter boundaries.
- Plain HTML, CSS, and JavaScript; zero build and no external CDN by default.
- Component assets must be readable per leaf component; at generation time recursively expand `requires`; add `optional` dependencies only when the need is real.
- Component contracts declare only local state shape (e.g. Select `open/value`); the final prototype maps business state to that interface and commits state through `PrototypeViewers`.
- Example `id` values in `component.html` express required anchors only; when copying multiple instances, replace with unique, stable page ids and pass the corresponding root to the state Adapter.
- The final prototype must map `PrototypeViewers` state to component Adapters through a business Adapter.
- UI Pack Adapters consume passed-in state only; they must not access `PrototypeViewers` directly or infer business state from the DOM.
- Implement only states confirmed in user materials; use `ponytail:` for intentional simplification.
- Meet semantic, accessibility, comment, and dependency requirements in the shared generation contract.

## Minimum `PACK.md` content

`PACK.md` stores only the "why" and special constraints an Agent needs (when to choose, design intent, known composition limits, usage notes). Machine facts such as `version`, prefix, `provides`, and compatible foundations are determined entirely by `manifest.json` and must not be duplicated in `PACK.md`.

- Unique `id` and human-readable name.
- Provided foundation and component categories (for human understanding; machines use the manifest).
- `manifest.json` entry point and known composition limits.
