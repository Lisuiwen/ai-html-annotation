# Delivery Review Checklist

## Scope

Use this checklist for a final check before generating a prototype, making heavy changes, accepting screenshots, or organizing the formal delivery package. It applies to both agents and maintainers.

Hard constraints are in [generation-contract.md](generation-contract.md); the boundary between authoring sessions and the formal delivery package is in [delivery.md](delivery.md).

## Checklist items

### 1. Scenarios

- [ ] `prototype/notes.snapshot.js` uses `schemaVersion: 2` and contains `state`, `activeScenario`, `scenarios`, `header`, `cards`
- [ ] `scenarios` explicitly declares every restorable scenario and its composed `state`
- [ ] `?scene=<id>` restores the corresponding page state, and annotation card `when` matches correctly
- [ ] List-state annotation cards also constrain `product.layers` to an empty array

### 2. Anchors & annotation cards

- [ ] Every card has a stable `target.anchor` that uniquely resolves to a DOM `id`
- [ ] Modal / Drawer `target.anchor` binds the inner panel id, not the overlay layer `.ui-overlay`
- [ ] Nodes that already have an `id` do not get a duplicate `data-prototype-note-target`
- [ ] The right rail, SVG connectors, and card numbers are generated dynamically by the Viewer; the HTML does not hard-code them
- [ ] Annotations are kept by semantic unit: only card what needs explaining — no padding for the sake of coverage, and no missing key interactions

### 3. Interaction lightning (`data-ui-interactive`)

Rules are defined in [generation-contract.md §5](generation-contract.md#5-annotations). Verify before delivery:

- [ ] Only this iteration's business entry points are marked; do not mark shell/layout layers, close, cancel, pagination, or unrelated controls; repeated operations of the same kind are marked once
- [ ] Marked elements are visible, with the lightning at the inner top-right corner of the element
- [ ] Lightning and annotation cards are independent and may coexist on the same element
- [ ] Hidden in pure page states (`product-only=1` or `?collapsed=1&product-only=1`); the coral color `#ff8d6b` is not written into the UI pack product tokens

### 4. File structure

- [ ] The final product lives in a standalone `<prototype-name>/` parent directory with a stable, filesystem-safe name
- [ ] `<prototype-name>/AGENTS.md` is copied verbatim from `templates/AGENTS.md`
- [ ] `<prototype-name>/` keeps only `AGENTS.md`, `prototype.html`, `prototype/`, `screenshots/`, and `assets/` when needed
- [ ] Page CSS, business JS, snapshot, and Client Runtime are all collected into `prototype/`
- [ ] Script load order: `notes.snapshot.js` → `display-mode.js` → `state.js` → `model.js` → `viewer.js` → `prototype.js`
- [ ] Asset paths are relative so `file://` opens directly; `assets/` is not an empty directory if present

### 5. Client Runtime

- [ ] `display-mode.js`, `state.js`, `model.js`, and `viewer.js` are each copied verbatim from the skill runtime, with separated responsibilities (see [generation-contract.md §7](generation-contract.md#7-delivery-files))
- [ ] Business state is submitted only through `PrototypeViewers`; the UI pack Adapter neither subscribes to the Viewer directly nor reverse-engineers business state from the DOM

### 6. Visuals, dependencies & overlays

- [ ] Colors use named tokens consistent with the current foundation `tokens.css`; where evidence is insufficient, `ponytail:` marks the current ceiling
- [ ] No unapproved external CDN, Tailwind visual classes, Font Awesome, React, or other extra dependencies
- [ ] Modal overlay covers only the left product area; `.ui-overlay` sits inside `.ui-preview`; the inner `.ui-modal` / `.ui-drawer` have stable `id`s

### 7. Screenshots (when delivery screenshots are needed)

- [ ] Scenario ids come from `snapshot.scenarios` and output to `screenshots/<scene-id>.png`
- [ ] Screenshots contain no right-rail annotations, SVG connectors, Mark, author tools, or interaction lightning

### 8. Author tools & data boundaries

- [ ] The formal HTML contains no Author Bootstrap, Direct edit, Notes editor, Inspector, source-locating tokens, or inline annotation editing logic
- [ ] Formal annotations exist only in `notes.snapshot.js`; there is no `notes.json`, inline HTML copy, or formal-annotation localStorage copy; only Mark pins may write to localStorage
- [ ] System names, menus, fields, states, and business data come from the current task materials, with nothing fabricated; no real credentials, tokens, API addresses, production data, or unauthorized brand assets

### 9. Automated verification

- [ ] `npm test` passes at the repository root
