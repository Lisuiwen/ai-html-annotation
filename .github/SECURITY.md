# Security Policy

## Supported scope

Only experimental 0.x code on the default public branch is supported. Runtime tools are for trusted local files only;
they must not be exposed on a LAN or the public internet, and must not process HTML, snapshots, or `.env` from unknown sources.

## Reporting vulnerabilities

Do not publish exploit code, sensitive files, or internal data for unfixed vulnerabilities in public Issues.
Send reports to:

suiwenli4@gmail.com

Include at minimum affected files, reproduction steps, impact, and suggested fix direction. If the hosting platform
supports private Security Advisories, you may use that channel instead.

## Known boundaries today

- `runtime/server/index.mjs` is a local authoring server, not a production web service; it should listen on `127.0.0.1` only.
- `runtime/cli/screenshot.mjs` should run only trusted local prototypes and annotation data.
- Author write APIs accept same-origin localhost JSON only; source and snapshot write-back should stay within the current prototype workflow.
- Inspector may launch a local IDE based on `CODE_EDITOR` in `skills/html-prototype-build/.env`.
- Author Tools Mark may store review content in browser localStorage or copy to the clipboard, but never injects into source HTML.

After a valid report, maintainers will confirm the issue, assess impact, and publish fix notes when appropriate.
