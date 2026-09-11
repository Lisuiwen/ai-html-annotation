---
id: mobile-vant.default
---

# Mobile Vant Foundation

## Role

Document-level baseline and cross-component tokens for the Mobile Vant pack.
The foundation is DOM-free: it owns no page shell, component classes, HTML, or
scripts. It provides the visual contract every provider and component depends
on.

## Scope

- `tokens.css` declares every shared custom property under the `--mv-` token
  prefix. `base.css` provides the document-level reset that relies on those
  tokens.
- Shared mobile viewport tokens include a 375px reference width, page-frame
  radius, and top/bottom safe-area insets. Page Patterns consume these tokens
  for the rounded frame and status-bar/navigation spacing.
- Components may declare private tokens in their own leaf `<style>` using the
  same `--mv-` prefix; shared values must live here, not in a component.

## Boundaries

- No component classes (`.mv-*`) are defined here.
- No HTML or `<style>`/`<script>` content — CSS only.
- No business values; every color and dimension is a generic Vant-style
  approximation marked `ponytail:` in `design-system.md` until screenshot
  evidence exists.
