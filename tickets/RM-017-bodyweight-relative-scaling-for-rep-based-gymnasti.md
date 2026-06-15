# RM-017 — Bodyweight-relative scaling for rep-based gymnastics/bodyweight movements

| | |
|---|---|
| **Status** | ⬜ Todo |
| **Horizon** | Long-term |
| **Priority** | P3 |
| **Effort** | L |
| **Core value** | Research-backed (must be derived) + Gym-agnostic |

**Field source.** ~6 coaches (Anjali, Sofia, Marcus, Jonas, Cillian).

## Problem
Pull-ups/HSPU/pistols are strength-to-weight gated, so heavier athletes are penalized — but unlike barbell lifts there is no shipped multiplier and no clean published allometric model for bodyweight-skill rep counts.

## Proposal
Derive and cite a defensible strength-to-weight adjustment for rep-based movements, then ship it the way barbell bwMultiplier already ships (RM-001).

## Acceptance criteria
- [ ] Sourced/derived adjustment model published.
- [ ] Calculator applies it to rep-based gymnastics/bodyweight movements.

## Files likely touched
- `data/benchmarks/gymnastics.json`
- `data/benchmarks/bodyweight.json`
- `spec/methodology.md`
- `website/app/calculator/page.tsx`

## Notes
Blocks on deriving a defensible model — do not invent numbers.
