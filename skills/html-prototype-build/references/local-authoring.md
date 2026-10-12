# Local Authoring Service

## Scope

Use this entry when you need to modify prototype styles/text directly in the browser, edit formal annotations, add/remove or reorder cards, re-bind targets, use the Inspector to jump to source, or open the module sketch board.

The authoring service binds only to `127.0.0.1`, dynamically injects the `runtime/author/` tools, and does not modify the prototype source HTML's load structure.

## Start

```bash
node <skill-root>/runtime/server/index.mjs <prototype.html> --snapshot=prototype/notes.snapshot.js
```

Open the `http://127.0.0.1:4178/...` URL printed by the terminal. Without `--snapshot`, Direct edit, Mark, and Inspector still work, but formal annotation cards cannot be saved.

If that port is already serving the same HTML and snapshot, the new process prints the existing URL and exits. If it is serving a different page, it prints that page and exits; stop the running session from its page before starting another.

The page shows a red **Stop** button in the notes toolbar, beside the other authoring controls. Stop shuts the process down immediately. Closing the tab does not: the process waits 3 minutes, and a tab that is still open or opened again cancels that wait. With no requests for 2 hours, the process exits on its own.

The IDE jump configuration lives in `<skill-root>/.env`, with the template at [.env.example](../.env.example).

## In-page authoring tools

In the Author Tools overlay, `edit` and `Mark` are two tabs of the same panel; the right-rail formal annotations and the Inspector are each independent.

| Goal | Page operation |
|---|---|
| Direct edit | Open Author Tools → `edit`, hold `Ctrl` (macOS: `⌘`) and click a page element; save after modifying to write back to the source HTML. |
| Mark review | Open Author Tools → `Mark`, or press `M`; hold `Ctrl` (macOS: `⌘`) and click an element to add a pin. |
| edit formal annotations | Double-click an annotation title, body, or header copy; press `Enter` to save title/header, `Ctrl + Enter` (macOS: `⌘ + Enter`) to save body, `Esc` to cancel. |
| Manage formal annotations | Use `+`, edit, target binding, delete, and drag-to-reorder. |
| Inspector | Hold `Alt + Shift`, hover and click a target to jump to the IDE source location. |
| Sketch board | Click the sketch button in Author Tools. Place pack atoms, draw a frame, and copy a canvas-only image to the clipboard. Adding an atom is a pack change: [Sketch board components](sketch-board.md). |
| Switch page scenario | Use the right-side scenario buttons, or `?scene=<scenario-id>`. |

## Platform differences

Direct edit and Mark share the element-picking logic in `author/core/picker.js`:

- **Windows / Linux**: hold `Ctrl` + left-click to select an element; a normal click does not intercept the page.
- **macOS**: prefer `⌘` + left-click; a `Control` + left-click that triggers the context menu also selects (applies to both edit and Mark).

Formal annotation body save shortcuts:

- **Windows / Linux**: `Ctrl + Enter`
- **macOS**: `⌘ + Enter` or `Control + Enter`

## Agent boundaries

- The service entry is `runtime/server/index.mjs`; the IDE configuration lives in `<skill-root>/.env`.
- Double-clicking under `file://` is for read-only preview of formal annotations only; editing cards requires starting the authoring service with `--snapshot` configured.
- Direct style/plain-text changes → `author/tools/direct-edit/`, written back to the source HTML via `/__prototype-author/edit`.
- Formal annotations → `author/tools/notes-editor/`, written back to the snapshot.
- Temporary review pins → `author/tools/mark/`, writing only to localStorage.
- Source location → `author/tools/inspector/`.
- The dynamically injected `data-insp-target` from the Inspector is only for line-number mapping in the current authoring session; it must not be saved as a formal selector or a For-AI selector.
- `<skill-root>/.env` is local-only; do not commit or distribute it.
