# RM-011 — Publish a versioned JSON schema contract + manifest (iOS-ready)

| | |
|---|---|
| **Status** | ⬜ Todo |
| **Horizon** | Mid-term |
| **Priority** | P0 |
| **Effort** | M |
| **Core value** | Open (the defining differentiator) + Community-driven |

**Field source.** Jonas/Berlin explicit; Eleanor/Rafael/Hemi adjacent. Reinforced by the iOS data-as-API audit ahead of the native app build.

## Problem
Developers and the planned iOS app will only build on OP if the data is a stable, self-consistent contract. The audit found real parsing hazards: (a) `standards` is polymorphic — scalar for 1rm/time/amrap but a [min,max] array for max_reps, which breaks a naive typed decoder; (b) `bwMultiplier` / `lowerIsBetter` / `attribution` are conditionally present but read as always-present in spec/versioning.md; (c) metcon movements key on a display string with no stable `movementId`, and `categories.json` keyMovements is a superset of benchmarked movements (10 of 35 have no benchmark); (d) version fields drift across files (1.0.0 / 0.4.0 / 1.1.0 / 1.2.0) despite versioning.md promising they stay in sync — and there is no single manifest to pin to.

## Proposal
Publish a formal, versioned schema. Decide per item: normalize `standards` to a uniform shape OR codify the testType-to-shape contract a decoder switches on; mark optional fields explicit in the schema; add a stable `movementId` to metcon movements; document keyMovements as a superset (or backfill); add a `data/manifest.json` with one standard version + per-file versions and reconcile the drift to the v1.2.0 tag. The consumer-facing half is partly done in data/README.md (Schema contract for consumers) and data/calculator.json; this ticket formalizes and versions it.

## Acceptance criteria
- [ ] Published machine-readable schema (e.g. JSON Schema) per data file + a version manifest.
- [ ] standards shape is either uniform or has a documented testType branch contract; optional fields declared.
- [ ] metcon movements carry a stable movementId; keyMovements superset documented or backfilled.
- [ ] File version fields reconciled to the standard version; validate-data enforces the schema.

## Files likely touched
- `data/manifest.json`
- `data/README.md`
- `spec/versioning.md`
- `data/metcons.json`
- `scripts/validate-data.mjs`

## Notes
Sequence with RM-009 (age tables) and RM-012 (i18n) so the schema is versioned once. Partial groundwork already shipped: data/README.md consumer contract + data/calculator.json.
