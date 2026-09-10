# Isolated Semantic Review

Use a context-free subagent after creating a Pack or making substantial changes to resource boundaries, state models, dependencies, or shared tokens. A small copy or confirmed-value correction does not require independent review.

## Context isolation

Start the reviewer without inherited conversation history when the client supports it. Create a clean temporary review directory containing only the approved read-only bundle, direct the reviewer not to access files outside it, and remove the directory after collecting the report.

Give the reviewer only:

- complete changed Pack files
- the target `ui/contract.md`
- the current `PACK.md`, `manifest.json`, and relevant sections of `design-system.md`
- the minimum unchanged dependency and dependent closure needed to evaluate the change
- relevant screenshots, source evidence, or computed styles
- the checklist below

Do not provide the author's reasoning, expected findings, suspected defects, or defenses of the implementation. The reviewer must not modify files.

## Review prompt

```text
Review these UI Pack changes against the supplied contract and evidence. Return findings only, ordered by severity. For every finding, identify the file, violated boundary or unsupported claim, concrete evidence, and smallest safe correction. Do not edit files. Do not assume framework defaults or infer facts absent from the supplied evidence.
```

## Checklist

- Is each resource placed in the correct Foundation, Component, Pattern, or Preset layer?
- Are component boundaries reusable without being artificially fragmented?
- Do Patterns or Presets duplicate component implementation?
- Are provisional visual facts presented as confirmed?
- Do related states remain in the same component lifecycle?
- Does an Adapter exceed local state projection?
- Does reusable material contain business-specific content?
- Does the change conflict with established Pack conventions or evidence?

## Reconciliation

Verify each finding against the raw artifacts before changing files. Reject findings that rely on unstated conventions. Apply supported fixes, rerun deterministic validation, and use at most two review-and-fix rounds. Report unresolved findings instead of looping.
