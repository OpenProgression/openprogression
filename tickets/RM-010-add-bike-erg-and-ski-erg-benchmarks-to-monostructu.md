# RM-010 — Add bike-erg and ski-erg benchmarks to Monostructural

| | |
|---|---|
| **Status** | ⬜ Todo |
| **Horizon** | Mid-term |
| **Priority** | P2 |
| **Effort** | M |
| **Core value** | Gym-agnostic + Research-backed |

**Field source.** ~8 coaches (Bubba, Thandeka, Anjali, Putu, Magnus, Cillian, Diego, Hemi).

## Problem
Monostructural assumes a rower; many equipment-light and non-rower gyms own a bike or ski erg instead, so they cannot assess the category.

## Proposal
Add bike-erg and ski-erg standards using public Concept2 ranking data, anchored to the same trained population as existing monostructural benchmarks. Additive — existing numbers untouched.

## Acceptance criteria
- [ ] Bike-erg and ski-erg benchmarks added with Concept2 source refs.
- [ ] Surfaced as alternative monostructural movements.

## Files likely touched
- `data/benchmarks/monostructural.json`
- `data/sources.json`
- `website/app/benchmarks/page.tsx`
