# UI Pack Install

Use this entry when `resolve-pack.mjs` exits with code `2` (`pack-not-found`) or when `--list` returns no packs.

## Who stores packs where

| Role | Default write location | Read priority | Synced to remote |
|---|---|---|---|
| End user | `~/.html-prototype/packs/<id>/` | user-cache | No |
| Project developer | `<repo>/.html-prototype/packs/<id>/` | project (when present) | Yes |

The lookup chain already prefers project packs over user-cache. End users normally have no
`<repo>/.html-prototype/packs/`, so their downloaded or self-created packs resolve from home.

## Empty workspace behavior

- `resolve-pack --list` returns `{ "packs": [] }` with exit code `0` when no pack is installed.
- That JSON does **not** include `remediation`. Treat an empty list as a signal to follow this
  document, not as permission to invent UI from scratch.
- `resolve-pack --pack=<id> --select=...` exits with code `2` and includes `remediation` when the
  requested pack is missing.

## Agent protocol

1. Run `node <skill-root>/scripts/resolve-pack.mjs --list`.
2. If the requested pack is already listed, ask the user to confirm the pack id and retry resolution.
3. If no suitable pack is installed, run `node <skill-root>/scripts/install-pack.mjs --list-remote`.
4. Present the remote options (`id`, `name`, `description`, `providers`) and **wait for the user to choose**. Do not auto-download.
5. After the user chooses, run `node <skill-root>/scripts/install-pack.mjs --pack=<id>`.
6. Tell the user the install target path printed by the command, then re-run `--list`.
7. If `--list-remote` fails (offline or internal mirror), show the manual placement instructions below and stop. Do not invent components from scratch.

## Commands

```bash
# List downloadable packs
node <skill-root>/scripts/install-pack.mjs --list-remote

# Install to user home (default): ~/.html-prototype/packs/<id>/
node <skill-root>/scripts/install-pack.mjs --pack=admin-desktop

# Install into the current project (team-committed packs only)
node <skill-root>/scripts/install-pack.mjs --pack=admin-desktop --dest=project

# Preview without writing files
node <skill-root>/scripts/install-pack.mjs --pack=admin-desktop --dry-run
```

## Overwrite protection

Downloaded packs write `.pack-source.json` as provenance. Install refuses to overwrite a
**local** pack directory that lacks this marker, because user-created packs are not backed up
remotely. Re-run with `--force` only after the user explicitly accepts data loss.

`resolve-pack.mjs --list` reports `origin: installed | local` so users can see which packs are
downloaded versus hand-authored.

## Manual placement

When network install is unavailable, place a pack directory so it contains `manifest.json` at the root:

```text
~/.html-prototype/packs/<pack-id>/manifest.json
<project>/.html-prototype/packs/<pack-id>/manifest.json
```

Do not add `.pack-source.json` to hand-authored packs.

## Environment overrides

| Variable | Purpose |
|---|---|
| `HTML_PROTOTYPE_PACK_REGISTRY` | Registry URL or local path |
| `HTML_PROTOTYPE_PACK_SOURCE` | Tarball base URL override |

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `1` | Usage error |
| `2` | Pack not in registry, or `--pack` does not match the local manifest id |
| `3` | Install blocked (local pack overwrite protection) |

`resolve-pack.mjs` uses code `2` for `pack-not-found` and code `3` for `unknown-resource`; treat the script name when interpreting code `3`.

## Ref fallback

Registry entries pin a release `ref` (for example `v0.4.1`). When that tarball is missing or
does not contain `.html-prototype/packs/<id>/`, `install-pack.mjs` automatically retries from
`master` before failing.

Successful installs record both refs in `.pack-source.json` (`requestedRef`, `refFallback`) and
emit a `warning` in JSON output. Explicit `--ref=master` skips fallback.

When both the pinned ref and `master` lack the new pack layout, install fails with a thrown
error and exit code `1` (not structured JSON). In that case show the manual placement paths
above or install from a branch that contains `.html-prototype/packs/` using `--ref=<branch>`.

## Boundaries

- `install-pack.mjs` is the only html-prototype-build script that performs network I/O.
- Downloads prefer the `ref` recorded in the registry entry; missing refs fall back to `master`.
- Pack missing is a user-action state, not a reason to hand-write UI components.
