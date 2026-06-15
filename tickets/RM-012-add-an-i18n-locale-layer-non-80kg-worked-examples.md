# RM-012 — Add an i18n / locale layer + non-80kg worked examples

| | |
|---|---|
| **Status** | ⬜ Todo |
| **Horizon** | Mid-term |
| **Priority** | P2 |
| **Effort** | M |
| **Core value** | Open + Community-driven |

**Field source.** ~5 coaches (Yuki, Rafael, Diego, Seo-yeon) plus the emerging-market cohort.

## Problem
Every doc example is an 80kg man; movement/level names are English-only, blocking non-Anglophone adoption and contribution.

## Proposal
Add a per-locale name/description field to the benchmark and level JSON, seeded with Japanese, Portuguese, Spanish, Korean. Add at least one sub-reference-bodyweight worked example to the docs. Translations come from community contributors; no numbers change.

## Acceptance criteria
- [ ] Locale field in the schema with seeded translations.
- [ ] At least one non-80kg-male worked example in the docs.
- [ ] Contribution path documented.

## Files likely touched
- `data/benchmarks/*.json`
- `data/levels.json`
- `README.md`
- `CONTRIBUTING.md`
