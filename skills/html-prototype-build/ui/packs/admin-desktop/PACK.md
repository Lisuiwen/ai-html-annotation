---
id: admin-desktop
name: Admin Desktop UI
---

# Admin Desktop UI Pack

## Entry points

- Design facts: `design-system.md`
- Route index: `manifest.json`
- Foundation contract: `foundation/FOUNDATION.md`
- Foundation Tokens: `foundation/tokens.css`
- CSS baseline: `foundation/base.css`

After reading `manifest.json`, choose Component, Pattern, or Preset based on user needs, recursively expand `requires`, then read the matched contracts and implementation files. When component interaction is needed, read the `adapter` declared in the manifest. Add `optional` dependencies only when the current page actually needs them; never traverse or load all components by category.

## Composition limits

- All components in this pack default to the `admin-desktop.default` foundation.
- Do not load another provider in the same category at the same time.
- Other packs may replace a component category in this pack only after explicitly declaring compatibility with the `admin-desktop.default` foundation.
- `feedback._overlay-core` is a private component and may be loaded only indirectly through Modal or Drawer.
- This pack provides admin-desktop prototype visuals; it does not bundle third-party design system code and does not promise compatibility with any commercial UI library version.
