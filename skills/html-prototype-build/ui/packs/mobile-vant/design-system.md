# Mobile Vant — Design System

## Role

This pack implements a Vant-style mobile H5 visual language: touch-friendly
targets, cell-based form/list composition, and overlay feedback. Tokens are
declared once in `foundation/tokens.css` and consumed by every component;
components may declare private tokens in their own `<style>`.

## Color roles

| Role | Token | Value | Usage |
|---|---|---|---|
| Primary | `--mv-primary` | `#1989fa` | accent, active tab, switch on, confirm |
| Success | `--mv-success` | `#07c160` | positive tags |
| Danger | `--mv-danger` | `#ee0a24` | destructive actions, error fields |
| Warning | `--mv-warning` | `#ff976a` | caution tags |
| Text | `--mv-text-color` | `#323233` | primary copy |
| Text secondary | `--mv-text-secondary` | `#969799` | cell values, hints |
| Text tertiary | `--mv-text-3` | `#c8c9cc` | placeholders, control borders |
| Border | `--mv-border-color` | `#ebedf0` | hairlines between rows |
| Background | `--mv-background` | `#f7f8fa` | page canvas |
| Surface | `--mv-white` | `#ffffff` | cards and controls |

## Shape, motion, type

- Radius: `--mv-radius` 4px for small controls; `--mv-radius-lg` 8px for cards
  and overlay surfaces.
- Motion: `--mv-duration` 0.2s with `--mv-easing` `cubic-bezier(0.4, 0, 0.2, 1)`.
- Type: `--mv-font-family` is a system stack with PingFang SC / Microsoft YaHei;
  body size `--mv-font-size` 14px.

## Layout tokens

- `--mv-viewport-width` 375px is the default mobile canvas reference; page
  patterns use `width: min(100%, var(--mv-viewport-width))` so narrower
  devices still fit without horizontal scrolling.
- `--mv-frame-radius` 16px is the page frame radius used by mobile Patterns.
- `--mv-nav-bar-height` 46px; `--mv-tab-bar-height` 50px; `--mv-touch-target`
  44px.
- `--mv-safe-area-top` and `--mv-safe-area-bottom` project the device safe
  areas through `env(safe-area-inset-*, 0px)`.
- `--mv-overlay-color` rgba(0, 0, 0, 0.7) for overlay dim.
- Inline spacing (16px cell padding, 12px page gaps) is kept per-component
  pending token consolidation (`ponytail:`).

## Provisional facts (`ponytail:`)

All color and dimension values above are a first pass based on the Vant
library's public design tokens; no screenshots or computed styles were provided
for this Pack.

- confirmed limit: generic Vant-style palette, 44px touch targets, 375px
  reference canvas, rounded page frame, safe-area-aware top/bottom navigation.
- evidence required: screenshots or computed styles of the actual target mobile
  UI before the exact canvas width, frame radius, or spacing is promoted to a
  confirmed product fact.
