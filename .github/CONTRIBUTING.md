# Contributing

Thank you for contributing to HTML Prototype Build. The project is in experimental 0.x; before contributing, confirm your changes will not bring internal business information, real personal data, or unauthorized brand assets into the repository. By participating, you agree to follow [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).

## Before you submit

- save files as UTF-8.
- Prefer Node.js built-in modules; do not add dependencies for small features.
- Use neutral or clearly fictional data in new prototype content.
- Prefer English comments for new code in runtime scripts, functions, and major code blocks (legacy Chinese may remain in untouched blocks).
- Use `ponytail:` comments for intentionally simplified interactions, uncollected states, and static placeholders, stating limits and upgrade paths.
- Formal deliverables must not include html-mark, Author Loader, editor, Inspector, or temporary tokens.

## How to submit

1. Describe the problem, use case, and expected behavior in an Issue or Discussion first.
2. Submit small, independent changes and explain how you validated them.
3. Changes to UI packs, examples, or delivery structure should update the matching references docs.
4. Do not post credentials, internal pages, customer data, or exploitable security details in public Issues.

Maintainers review contributions during the experimental phase for compatibility, privacy, accessibility, and security boundaries.
Run `npm test` before submitting (Skill metadata, links, UI pack, and runtime contracts).
