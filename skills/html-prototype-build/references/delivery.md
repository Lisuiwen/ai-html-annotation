# Delivery & Iteration

## Scope

Use this entry when you need to organize the final files, distinguish the authoring session from the formal delivery package, or keep iterating based on feedback.

## Authoring / review vs formal delivery package

| Scope | Rule |
|---|---|
| Authoring / review session | Author Tools are injected dynamically by `runtime/server/index.mjs`; Direct edit, Mark, Notes editor, and Inspector never write to the formal HTML. Direct edit writes back to the source HTML through the server; Mark pins exist only in browser localStorage. |
| Formal delivery package | Delivered as a standalone `<prototype-name>/` directory; `AGENTS.md` inside is copied verbatim from the template. The HTML must not contain Author Bootstrap, Direct edit, Notes editor, Inspector, source-locating tokens, or inline annotation editing scripts. Formal annotations come only from the snapshot + Client Runtime. |

The formal file structure and runtime copy rules follow [generation-contract.md §7](generation-contract.md#7-delivery-files). Before delivery, verify item by item against the [delivery checklist](delivery-checklist.md).

## Iteration routing

- Major changes to structure, layout, menus, or business state: [ui-generation.md](ui-generation.md).
- Changes to formal annotation content, order, or targets: [local-authoring.md](local-authoring.md).
- Style or copy tweaks written back to the source HTML: Direct edit ([local-authoring.md](local-authoring.md)).
- Text feedback from review: export For AI via [review-mark.md](review-mark.md), then modify the source HTML.
- Re-verify after visual state changes: [screenshots.md](screenshots.md).
