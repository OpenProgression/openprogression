# RM-016 — Re-anchor aerobic percentiles + add a long-aerobic test set

| | |
|---|---|
| **Status** | ⬜ Todo |
| **Horizon** | Long-term |
| **Priority** | P3 |
| **Effort** | L |
| **Core value** | Research-backed (cross-category statistical defensibility) |

**Field source.** Magnus/Oslo.

## Problem
The 5k aerobic anchor is drawn from a different (open-running) population than the strength benchmarks, so cross-category percentile equivalence does not hold at the aerobic end; there is also no test above 5k.

## Proposal
Add 10k run/row and 30-min row benchmarks and re-anchor aerobic percentiles to the same trained population as the strength benchmarks. Requires a real recalibration study before changing the standard.

## Acceptance criteria
- [ ] Long-aerobic benchmarks added with sources.
- [ ] Aerobic percentile anchors re-derived against the trained population, documented.

## Files likely touched
- `data/benchmarks/monostructural.json`
- `data/sources.json`
- `spec/methodology.md`

## Notes
Follows the higher-leverage fixes; do not change anchors without the study.
