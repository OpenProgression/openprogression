# RM-006 — Add a kipping rep column alongside strict for pull-ups and HSPU

| | |
|---|---|
| **Status** | ⬜ Todo |
| **Horizon** | Near-term |
| **Priority** | P1 |
| **Effort** | M |
| **Core value** | Research-backed (sourced, labeled) + Gym-agnostic |

**Field source.** 12 of 20 coaches (incl. Bubba, Anjali). Accepted by all 3 stewards.

## Problem
Benchmarks test STRICT pull-ups/HSPU while the metcon library programs kipping — an internal inconsistency. Most general-pop, masters, and class athletes train kipping, so Gymnastics becomes the universal weakest link.

## Proposal
Add a clearly-labeled kipping variant column next to strict for pull-ups and HSPU, calibrated from the CrossFit Open / Mangine datasets already cited. Keep strict as the rigor anchor. (Muscle-ups already credit kipping.)

## Acceptance criteria
- [ ] Gymnastics benchmark JSON has separate, labeled strict and kipping standards for pull-ups and HSPU, each source-traced.
- [ ] Calculator/benchmarks UI can surface the kipping variant.
- [ ] No blending of strict and kipping into one number.

## Files likely touched
- `data/benchmarks/gymnastics.json`
- `website/app/calculator/page.tsx`
- `website/app/benchmarks/page.tsx`
- `spec/categories.md`

## Notes
Numbers must be sourced, not estimated.
