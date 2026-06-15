# RM-020 — Single source of truth: calculator reads thresholds + constants from JSON

| | |
|---|---|
| **Status** | ⬜ Todo |
| **Horizon** | Mid-term |
| **Priority** | P1 |
| **Effort** | M |
| **Core value** | Research-backed (no drift) + Open |

**Field source.** iOS data-as-API audit. The website calculator hardcodes per-category thresholds and bwMultiplier arrays instead of reading the canonical JSON.

## Problem
website/app/calculator/page.tsx duplicates the benchmark thresholds, the bwMultiplier arrays, and the calculator constants (age multipliers, reference bodyweights, deviation threshold, category-to-movement map). They match the JSON today (audit verified 0 drift), but every future data edit must be made in two places, so drift is inevitable. An iOS app reading JSON and a website reading code will eventually disagree.

## Proposal
Refactor the calculator to read benchmark thresholds/bwMultiplier from data/benchmarks/*.json and the calculator-layer constants from data/calculator.json, so the JSON is the single source of truth for web, iOS, and integrations.

## Acceptance criteria
- [ ] Calculator derives thresholds and bwMultiplier from the benchmark JSON at build/runtime.
- [ ] Age multipliers, reference bodyweights, deviation threshold, and category-to-movement map come from data/calculator.json.
- [ ] No benchmark numbers remain hardcoded in page.tsx; results unchanged for the same input.

## Files likely touched
- `website/app/calculator/page.tsx`
- `data/calculator.json`
- `website/scripts/copy-data.mjs`

## Notes
data/calculator.json already exists. Mind the static-export import path (data lives outside website/).
