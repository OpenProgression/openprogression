# RM-008 — Fix Pulling category coverage (hinge-only) — add a vertical pull or rename

| | |
|---|---|
| **Status** | ⬜ Todo |
| **Horizon** | Near-term |
| **Priority** | P2 |
| **Effort** | M |
| **Core value** | Research-backed (accuracy) + adoption |

**Field source.** Jonas/Berlin (raised in review, dropped from the first roadmap synthesis — restored here).

## Problem
The Pulling category contains only Deadlift + Sumo Deadlift — it is a hinge category with no vertical/horizontal pull. The actual pull (pull-ups) lives under Gymnastics, so 'Pulling' is a misnomer.

## Proposal
Either rename the category to 'Hinge' / 'Posterior Chain', or add a true pulling movement (e.g. a weighted/strict pull or row) with sourced standards. Decide which preserves the cleanest category taxonomy.

## Acceptance criteria
- [ ] Category name matches its contents, OR a sourced pulling movement is added.
- [ ] Calculator + benchmarks + spec consistent.

## Files likely touched
- `data/benchmarks/pulling.json`
- `data/categories.json`
- `spec/categories.md`
- `website/app/calculator/page.tsx`

## Notes
Low-cost credibility fix; coordinate naming with RM-005.
