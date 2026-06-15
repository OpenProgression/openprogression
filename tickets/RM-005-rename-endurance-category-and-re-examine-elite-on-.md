# RM-005 — Rename 'Endurance' category and re-examine 'elite' on Rx

| | |
|---|---|
| **Status** | ⬜ Todo |
| **Horizon** | Near-term |
| **Priority** | P1 |
| **Effort** | S |
| **Core value** | Research-backed (naming honesty / accuracy) |

**Field source.** Magnus/Oslo (rename); Kristín/Reykjavik, Tony/Chicago ('elite' wording).

## Problem
The 'Endurance' category contains Fran/Grace/Murph/Cindy — mixed-modal sprints and a barbell test (Grace). It is not endurance. Separately, labelling Rx 'elite, top 5%' overstates it: Rx is the top of the general trained population, not Games-level.

## Proposal
Rename the category to 'Benchmark WODs' / 'Mixed-Modal' across data, calculator, spec, and site copy (keep the stable JSON id; change display name). Soften/clarify 'elite' wording on the Rx level to 'top of the trained general population'.

## Acceptance criteria
- [ ] Display name updated everywhere it surfaces; JSON category id unchanged for back-compat.
- [ ] Rx-level copy no longer implies Games-elite.
- [ ] validate-data + audit scripts still pass.

## Files likely touched
- `data/benchmarks/endurance.json`
- `data/categories.json`
- `website/app/calculator/page.tsx`
- `spec/categories.md`
- `spec/levels.md`
- `README.md`

## Notes
Scope the id-vs-display-name split carefully to avoid breaking consumers.
