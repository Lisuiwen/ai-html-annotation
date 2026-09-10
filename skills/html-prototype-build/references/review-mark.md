# Review Mark

## Scope

Use this entry when you need to write change feedback on existing HTML, hand off feedback via pins, or export For AI locating information.

Mark is a temporary review tool in `runtime/author/tools/mark/`, in the `Mark` tab of the Author Tools panel alongside Direct edit; it is not the formal product annotations on the right rail, and it never writes to the snapshot or the source HTML. It is dynamically loaded through the local authoring service.

## Steps

1. Start the authoring service following [local authoring service](local-authoring.md#start) and open the page.
2. Open Author Tools and switch to the `Mark` tab (or press `M`).
3. Hold `Ctrl` / `⌘` and click a target element to add a pin.
4. In the Mark panel, locate, delete, or clear pins, or use `Copy all → For AI` to export feedback, selectors, and HTML snapshots.

Mark data is only kept in the browser localStorage scoped to the current page pathname; it never modifies `prototype.html` or the snapshot, so no extra "remove Mark injection" step is required before delivery.

## Agent boundaries

- When the user asks for review, pinning, review pins, or For AI export, start the authoring service and enter the Mark tab.
- Pin data is saved to localStorage by page pathname; when a major DOM change makes selectors invalid, clear that page's pins and re-pin.
- The For AI selectors and HTML snapshots are used to locate the source HTML; Inspector temporary tokens must not become exported selectors.
- Mark needs no pre-delivery "remove injection", because the authoring tools never write to the formal HTML.

## Platform differences

Direct edit and Mark share the element-picking logic in `author/core/picker.js`:

- **Windows / Linux**: hold `Ctrl` + left-click to pin or select; a normal click does not intercept the page.
- **macOS**: prefer `⌘` + left-click; a `Control` + left-click that triggers the context menu also handles the gesture (applies to both edit and Mark).

## Boundaries with other tools

- Write text feedback for an agent to modify the source: Mark.
- Change styles or plain text directly in the browser and write back to the source file: Direct edit.
- edit formal annotation cards on the right rail: Notes editor.
- Inspect and jump to an element's source: Inspector.
