---
id: mobile-vant
name: Mobile Vant
---

# Mobile Vant

Mobile-first H5 UI pack in the Vant visual language: touch-friendly hit areas
(at least 44px), bottom tab navigation, cell-based form and list composition,
and overlay feedback (dialog, toast).

## When to choose

Choose this pack when the prototype targets a phone-width H5 app and the user
materials describe a Vant-style mobile interface. For desktop admin screens use
another pack; for non-mobile visual systems ask first.

## Design intent

- Touch targets are at least 44px tall; controls are sized for thumbs.
- Forms and lists compose from cell-style rows on a light grey page canvas.
- A fixed bottom tab bar carries primary navigation; the top nav bar carries
  the back affordance and title.
- Feedback overlays (dialog, toast) are single-leaf components whose visibility
  is projected by their adapters; dismissal timing is the prototype's business
  responsibility, not the Pack's.

## Composition limits

- Overlay components ship hidden; the final prototype must project `visible`
  through the adapter and commit state through `PrototypeViewers`.
- Tab bar items are keyed by `data-mv-key`; the adapter projects only `active`.
- Copy in components and presets is generic placeholder text; replace it with
  business copy from user materials.
- All visual tokens are provisional (no screenshot evidence was provided); see
  `design-system.md` for the `ponytail:` notes.

## Usage

- `manifest.json` is the only machine-readable index and dependency source.
- Resolve with the consumer tool:
  `node <skill-root>/scripts/resolve-pack.mjs --pack=mobile-vant --select=<id[,id...]>`.
