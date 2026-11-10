# Prototype Handoff

This directory contains product prototype information only; it is not a production code template. Implementation must follow the conventions of the target frontend/backend projects.

## Priority and fallback

Use the steps below in order. Prefer earlier sources for interaction and business rules. Later steps **supplement** earlier ones; they do not replace annotation cards unless cards are silent or incomplete for a scenario.

**Product surface scope:** For each scenario you implement, the **product area** shown in `screenshots/<scenario-id>.png` (product-only captures) defines the full UI surface to restore—regions, copy, fields, columns, controls, and layout relationships—not only elements that have formal annotation cards or connectors.

## Reading order

1. Read `prototype/notes.snapshot.js` first (highest priority for behavior):
   - `state`: base state;
   - `activeScenario`, `scenarios`: default scenario and scenario differences;
   - `cards[].when`: states the card applies to;
   - `cards[].title`, `cards[].body`: feature, interaction, and result;
   - `cards[].target.anchor`: local page anchor (does not limit implementation scope).
2. Then look at the screenshots for the current scenario in `screenshots/` to understand page regions, hierarchy, visible content, and relative relationships.
3. When steps 1–2 are insufficient for copy, field relationships, or local structure, locate the minimal local scope of `prototype.html` by `target.anchor` (or the matching region in the product area) to verify details.
4. **Fallback — screenshot and HTML reconciliation:** When steps 1–3 still leave gaps, **or** when card-linked targets do not cover everything required to implement the scenario, reconcile against **both**:
   - `screenshots/<scenario-id>.png` for each relevant scenario (recover visible product-surface elements not explained in cards), and
   - the corresponding product area in `prototype.html` (visible text, labels, tables, and control groupings only—do not treat the page as a code template).

   Ask for clarification when reconciliation surfaces behavior that is not described in cards, screenshots, or requirements materials; do not invent business rules.

Business rules not covered by the current scenario description are considered undefined; consult the requirements materials or ask for clarification, do not infer them.

## Do not reference

Do not read, copy, or port the prototype implementation:

- The overall DOM, class, and attribute organization of `prototype.html`;
- `prototype/prototype.css`, `prototype/prototype.js`;
- Runtime files, mock data, mock interactions, and the state model under `prototype/`.

Screenshots express visual and structural intent only; components, styles, responsiveness, accessibility, interfaces, validation, permissions, state management, and tests all follow the target project conventions.
