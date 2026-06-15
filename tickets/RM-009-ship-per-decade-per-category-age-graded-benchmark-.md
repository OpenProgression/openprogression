# RM-009 — Ship per-decade, per-category age-graded benchmark tables (data)

| | |
|---|---|
| **Status** | ⬜ Todo |
| **Horizon** | Mid-term |
| **Priority** | P1 |
| **Effort** | L |
| **Core value** | Research-backed + Community-driven (masters) |

**Field source.** 17 of 20 coaches — the most universal gap.

## Problem
The flat 0.81x for everyone 50+ is too coarse: a 51- and a 71-year-old get the same handicap, and strength/power/gymnastics/aerobic decline at different rates.

## Proposal
Derive per-decade (50-59 / 60-69 / 70+), ideally gender-specific and per-category decline curves from citable public sources (Cooper/ACSM, Rikli & Jones, Concept2/RunningLevel age bands, masters competition cut-lines) and ship them as inspectable JSON, replacing the flat scalar.

## Acceptance criteria
- [ ] Age brackets live in versioned JSON with source citations per bracket.
- [ ] Calculator consumes the tables instead of the flat multiplier.
- [ ] No number ships without a cited source.

## Files likely touched
- `data/benchmarks/*.json`
- `data/sources.json`
- `website/app/calculator/page.tsx`
- `spec/methodology.md`

## Notes
Blocks on the sourcing work — do not ship interpolated numbers.
