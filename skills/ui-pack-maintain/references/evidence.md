# Evidence Authority

Apply evidence in this order, by mode.

## Creation mode

New Pack; no existing Pack is assumed to be relevant.

1. `references/contract.md` for structure and responsibility boundaries.
2. User-provided screenshots, source pages, computed styles, and interaction
   records, plus explicit user decisions, for visual and interaction facts.
3. Provisional approximations marked in place with `ponytail:`.

Do not read any existing Pack (in this skill or a consumer) as a reference when
creating a new Pack: a fresh style has no useful prior art, and borrowing it risks
leaking another system's tokens or boundaries.

## Maintenance mode

Editing an existing Pack.

1. `references/contract.md` for structure and responsibility boundaries.
2. The Pack's own confirmed tokens and entry contracts (`PACK.md`, `manifest.json`,
   `design-system.md`, and the touched entries).
3. User-provided screenshots, source pages, computed styles, and interaction
   records for visual and interaction facts.
4. Existing confirmed Pack tokens and entry contracts, only when reading them is
   needed to stay consistent within that Pack.
5. Explicit user decisions.
6. Provisional approximations marked in place with `ponytail:`.

## Inference rules

Do not infer exact framework versions, tokens, dimensions, states, or behavior
from visual similarity. Reading another Pack for consistency is reference only;
never promote an unverified cross-pack value to a confirmed fact.
