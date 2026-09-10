# Prototype Handoff

This directory contains product prototype information only; it is not a production code template. Implementation must follow the conventions of the target frontend/backend projects.

## Reading order

1. Read `prototype/notes.snapshot.js` first:
   - `state`: base state;
   - `activeScenario`, `scenarios`: default scenario and scenario differences;
   - `cards[].when`: states the card applies to;
   - `cards[].title`, `cards[].body`: feature, interaction, and result;
   - `cards[].target.anchor`: local page anchor.
2. Then look at the screenshots for the current scenario in `screenshots/` to understand page regions, hierarchy, visible content, and relative relationships.
3. Only when the first two steps are insufficient, locate the minimal local scope of `prototype.html` by `target.anchor` to verify visible copy, field relationships, or local structure.

Business rules not covered by the current scenario description are considered undefined; consult the requirements materials or ask for clarification, do not infer them.

## Do not reference

Do not read, copy, or port the prototype implementation:

- The overall DOM, class, and attribute organization of `prototype.html`;
- `prototype/prototype.css`, `prototype/prototype.js`;
- Runtime files, mock data, mock interactions, and the state model under `prototype/`.

Screenshots express visual and structural intent only; components, styles, responsiveness, accessibility, interfaces, validation, permissions, state management, and tests all follow the target project conventions.
