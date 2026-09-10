# Plain HTML Prototype Design Tokens

## 1. Authority and boundaries

- This file provides repository-wide generic visual Tokens and component constraints only; it does not record any specific project's system names, business fields, page structure, coordinates, measured dimensions, or state copy.
- Screenshots, requirements, page states, business data, and confirmed special visual facts for the current project must be supplied explicitly in project materials; do not treat this file as a design spec for a specific business page.
- Prototypes should follow materials confirmed in the current task. CSS variable names here are for plain HTML prototypes only and do not imply identically named Tokens in production source.
- `ant-*` class names or framework-like visuals on a page prove technical characteristics only; do not infer uncollected theme config, component states, or exact dependency versions from them.
- This document serves plain HTML prototypes. Components should be treated as review implementations, not full framework behavior.
- Hover, focus, active, disabled, loading, error, collapse, expand, scroll, validation, and complex component states not confirmed in current materials must not be filled in from framework convention.

## 2. Token authority

`foundation/tokens.css` is the sole source of truth for cross-component base Token values. This document explains design boundaries only; it does not duplicate the full value table. When generating a single-file HTML prototype, read and merge that file verbatim.

Component- or Pattern-specific dimensions do not belong in the foundation. For example, Header, Sider, Search, Filter, Toolbar, Table, Button, and Page Header dimensions and shadows are declared in their respective `component.html` or `pattern.html`. When the current project provides confirmed overrides, keep the same named references consistent in the final prototype; do not substitute "close enough" color values.

Composite approximations of text color on white are for understanding and contrast review only; they must not replace the rgba Tokens above:

- Primary text ≈ `#1F1F1F`.
- Secondary text ≈ `#595959`.
- Tertiary text ≈ `#8C8C8C`.
- Disabled or weak hint text ≈ `#BFBFBF`.

## 3. Generic component static rules

### 3.1 Top navigation

- When a page has top navigation, read `navigation.app-header`; do not rebuild the component from this document alone.
- Top navigation height, brand area width, nav item states, and overflow behavior must come from the current project materials; when not provided, keep a minimal static structure.

### 3.2 Side navigation, tree, and tabs

- Sidebar width, menu hierarchy, tree node size, search placement, and tab states must come from the current project materials.
- Do not invent unconfirmed hover, focus, active, disabled, loading, empty, or error states for tree and tabs.

### 3.3 Inputs, search, and selectors

- Default state may use `--ui-control-height`, `--ui-border`, `--ui-radius-control`, `--ui-control-padding-inline`, and generic text Tokens.
- Regular filter control widths and filter item counts must be confirmed in current project materials.
- Placeholders use `--ui-text-tertiary`.
- Combined search, Select, and Field structure and component-specific Tokens follow each `component.html`.
- Unconfirmed hover, focus, active, disabled, loading, and error states.

### 3.4 Buttons

- Read `action.button`; Button-specific padding, icon size, and shadows are declared by the component, not the foundation.
- Primary buttons use `--ui-primary` background, `--ui-text-on-primary` text, and the primary button shadow Token declared by Button.
- Secondary buttons use `--ui-bg` background, `--ui-border` border, and `--ui-text`.
- Text buttons use transparent background, transparent border, and secondary text color.
- Icon buttons use icon size Tokens declared by Button.
- Unconfirmed hover, focus, active, disabled, and loading states.

### 3.5 Filter bar and toolbar

- Read `data.filter-bar` and `data.toolbar` separately; their specific dimensions are declared by each component.
- Filter fields, row count, expand/collapse, action order, and transitions must come from current project materials.

### 3.6 Tables and empty states

- Tables must read `data.data-table`; header height and cell padding are declared by the component.
- Table containers use `--ui-bg`, `--ui-border-soft`, and `--ui-radius-container`.
- Empty state copy, illustration, trigger conditions, column widths, and layout must come from current project materials.
- Unconfirmed row hover, selection, loading, and error states.

### 3.7 Content containers

- Admin page containers must read `pattern.application-shell`; read `pattern.page-header` for the page title area when needed.
- Content surfaces use `--ui-bg`, `--ui-radius-container`, and `--ui-border-subtle` to establish base hierarchy.
- Whether to use elevated shadow should be confirmed in current project materials.

## 4. Accessibility hard constraints

Later AI-generated prototypes must satisfy:

- Use clear landmarks: `header` for top bar, `nav` for global navigation and sidebar menus, `main` for business content.
- Search icon buttons, filter expand buttons, sidebar collapse buttons, and other icon-only buttons must have understandable accessible names, e.g. `aria-label`.
- If using a tree, keep `tree` / `treeitem` semantics and support keyboard arrow navigation; if a static prototype does not implement that behavior, do not label an ordinary nested list as an interactive tree.
- DOM order should support a natural focus path from global nav, sidebar, filters, primary actions, to table actions on the current page.
- Tertiary text color ≈ `#8C8C8C` on white is ≈ 3.4:1 contrast; it must not carry must-read 14 px body text.
- White text on `#1677FF` is ≈ 4.1:1, close to but below 4.5:1 for normal text; do not unconditionally claim that combination meets normal text contrast. Re-check against actual size, weight, and applicable standards before formal delivery.
- `#D9D9D9` borders on white are below 3:1 contrast; keyboard focus cannot rely on that border alone.
- If a prototype does not implement keyboard behavior for an operable component, downgrade it to non-operable static display to avoid faking accessibility.

## 5. `ponytail:` rules for unconfirmed states

All unconfirmed content must use in-place `ponytail:` comments stating current limits and upgrade paths; do not hide empirical invention in ordinary comments.

```html
<!-- ponytail: Current limit is the collected static default; after state screenshots or computed styles, add hover, focus, active, disabled, loading, and error. -->
<button class="ui-button ui-button--primary">Search</button>
```

```css
/* ponytail: No framework-guessed focus ring yet; after collecting real keyboard focus, add dedicated tokens and verify at least 3:1 non-text contrast. */
.ui-button:focus-visible {
  outline: revert;
}
```

```js
// ponytail: Only commits confirmed static page state for now; after state transitions, animation, and scroll evidence, upgrade scenarios and Adapter.
function applyConfirmedState(partialState) {
  window.PrototypeViewers.patchState(partialState);
}
```

Labeling requirements:

1. "Current limit" must state which confirmed state is implemented today.
2. "Upgrade path" must name evidence still needed, e.g. state screenshots, computed styles, keyboard behavior records, or more page collection.
3. Do not write unconfirmed values into tokens first and then claim "pending adjustment" with `ponytail:`.
4. Collapsed sidebar, expanded filters, independent scroll, form validation, modals, drawers, pagination, toasts, and date pickers may use prototype interactions for review workflows, but uncollected visuals and behavior must be marked in place with `ponytail:` as prototype approximations, with replacement paths after real state evidence.

## 6. Prohibitions

- Do not use `#165DFF` to override confirmed primary `#1677FF`.
- Do not use an 8 px baseline to override the generic 4 px spacing baseline; common values are 4, 8, 12, 16, 24 px.
- Do not treat legacy skill example colors `#F5F7FA`, `#333333`, `#00B42A`, `#F53F3F`, or amber note areas as confirmed Tokens for this project.
- Do not invent default hover, focus, active, disabled, loading, error, pagination, modal, drawer, overlay, or validation styles because the page looks framework-like.
- Do not write any framework visual system as confirmed exact dependency versions or production source config.
- Do not claim full replication of a framework's interaction, keyboard, or accessibility behavior for static plain HTML placeholder components.
- Do not replace hierarchy confirmed in current project materials with floating card shadows.
- Do not write responsive breakpoints, mobile layout, animation duration, or collapsed widths as formal system spec without current project confirmation; if the prototype must show them, mark with `ponytail:` as prototype tolerance and replace after real evidence.
- Do not write white-background composite text approximations back into CSS tokens; keep confirmed rgba values.
- Do not use unauthorized official brand logos, real login credentials, tokens, APIs, or business data; prototypes use local mock and lawful placeholders only.
