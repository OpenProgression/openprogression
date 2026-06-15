# RM-002 — Fix the README-vs-methodology age-adjustment contradiction

| | |
|---|---|
| **Status** | ✅ Done |
| **Horizon** | Near-term |
| **Priority** | P0 |
| **Effort** | S |
| **Core value** | Research-backed (trust / statistical defensibility) |

**Field source.** Wayne/Sydney, Astrid/Stockholm, Yuki/Tokyo and masters-heavy coaches; accepted by all 3 stewards.

## Problem
README listed 'Age-adjusted benchmarks' as unshipped ([ ]) while methodology.md and the live calculator already apply a flat 0.96/0.89/0.81 multiplier. A research-backed standard that disagrees with itself about whether a core feature exists undermines trust.

## Proposal
Mark age adjustment as interim-shipped in the README, describe the live flat multiplier honestly, and name per-decade per-category tables as the planned replacement. Mirror the interim language in methodology.md.

## Acceptance criteria
- [ ] README roadmap reflects that the flat age multiplier is live and interim.
- [ ] methodology.md flags the flat multiplier as a coarse interim approximation.
- [ ] No remaining claim that age adjustment is entirely unshipped.

## Files likely touched
- `README.md`
- `spec/methodology.md`

## Notes
Implemented.
