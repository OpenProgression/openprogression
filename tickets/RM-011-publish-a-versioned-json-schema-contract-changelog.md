# RM-011 — Publish a versioned JSON schema contract + changelog

| | |
|---|---|
| **Status** | ⬜ Todo |
| **Horizon** | Mid-term |
| **Priority** | P1 |
| **Effort** | M |
| **Core value** | Open (the defining differentiator) + Community-driven |

**Field source.** Jonas/Berlin explicit; Eleanor/Rafael/Hemi adjacent.

## Problem
Developers and boxes will only build dashboards / self-tracking on OP if the data schema is stable and breaking changes are versioned.

## Proposal
Define a documented, versioned JSON schema with a changelog and a stable data endpoint. Sequence it so the bodyweight-field, i18n, and age-bracket changes are versioned once together.

## Acceptance criteria
- [ ] Published schema doc + version + changelog.
- [ ] Stable, documented data URLs.
- [ ] validate-data checks data against the published schema.

## Files likely touched
- `data/README.md`
- `spec/versioning.md`
- `scripts/validate-data.mjs`

## Notes
Coordinate timing with RM-009 and RM-012 to avoid double-versioning.
