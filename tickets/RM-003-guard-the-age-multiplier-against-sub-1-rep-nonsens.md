# RM-003 — Guard the age multiplier against sub-1-rep nonsense on low-rep skills

| | |
|---|---|
| **Status** | ✅ Done |
| **Horizon** | Near-term |
| **Priority** | P1 |
| **Effort** | S |
| **Core value** | Research-backed (defensibility) |

**Field source.** Wayne/Sydney; accepted by Standard Integrity steward.

## Problem
Multiplying a low-rep skill threshold (e.g. a 1-rep strict HSPU or 0-rep muscle-up standard) by 0.81 silently produces a meaningless sub-1-rep threshold.

## Proposal
In the calculator's threshold adjustment, never discount a positive standard below 1 (keep 0 as 0). Document the guard in methodology.md.

## Acceptance criteria
- [ ] adjustThresholds floors positive higher-is-better thresholds at 1 after the age multiplier.
- [ ] Guard documented in methodology.md age-adjustment note.

## Files likely touched
- `website/app/calculator/page.tsx`
- `spec/methodology.md`

## Notes
Implemented. The deeper data-side guard lands with RM-009.
