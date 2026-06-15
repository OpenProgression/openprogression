# RM-004 — Make the per-category radar the primary calculator view

| | |
|---|---|
| **Status** | ⬜ Todo |
| **Horizon** | Near-term |
| **Priority** | P0 |
| **Effort** | M |
| **Core value** | Community-driven (adoption) — preserves the weakest-link model |

**Field source.** 14 of 20 coaches (Rafael, Eleanor, Layla, Marcus, Jonas, Diego, Sofia, Seo-yeon, Anjali, Hemi, Cillian, Bubba, Wayne, Astrid). Accepted by all 3 stewards.

## Problem
The single weakest-link number reads as failure to the broad base (a 5-Advanced athlete with one skill gap is stamped Intermediate), driving churn. Coaches want strengths surfaced first.

## Proposal
Lead the results with a per-category profile/radar; keep the weakest-link level as a clearly-labeled secondary 'overall'. PRESENTATION ONLY — the rollup math and every benchmark number stay exactly as-is. Name the weak link as the target to improve.

## Acceptance criteria
- [ ] Results section leads with a per-category visual (radar or profile bars).
- [ ] Weakest-link overall remains, labeled as the overall and naming the limiting category.
- [ ] No change to determineLevel / overall computation.

## Files likely touched
- `website/app/calculator/page.tsx`

## Notes
Hard line: do NOT change the overall to a weighted average (see WONT-DO).
