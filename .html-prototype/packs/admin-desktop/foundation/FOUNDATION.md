---
id: admin-desktop.default
sources: [tokens.css, base.css]
---

# Admin Desktop Foundation

The foundation is a DOM-free dependency that every prototype using this pack must load; it provides only global design Tokens and a CSS baseline.

## Read order

1. `tokens.css`
2. `base.css`

The foundation must not contain component classes, page shells, example DOM, or interaction scripts. Component-specific dimensions are declared by each component; page structure is provided by Patterns.
