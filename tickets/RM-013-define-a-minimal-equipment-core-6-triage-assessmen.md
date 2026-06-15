# RM-013 — Define a minimal-equipment / core-6 triage assessment path

| | |
|---|---|
| **Status** | ⬜ Todo |
| **Horizon** | Mid-term |
| **Priority** | P1 |
| **Effort** | L |
| **Core value** | Gym-agnostic + Community-driven |

**Field source.** Minimal-equipment (Thandeka, Anjali, Bubba, Putu, Hemi, Diego) + fast-triage (Putu, Thandeka, Sofia, Eleanor).

## Problem
Every benchmark is a max test; a one-rig, no-rower box (or a drop-in coach with 5 minutes) cannot place a member, so OP's gym-agnostic claim currently breaks.

## Proposal
Specify a run-and-bodyweight-only assessment path plus a blessed 'core-6' triage subset (one movement per key domain) that yields a PROVISIONAL level with an explicit low-confidence flag until full benchmarks are tested.

## Acceptance criteria
- [ ] Documented minimal-equipment substitution path.
- [ ] Core-6 subset defined; calculator can run it and label the result provisional.
- [ ] Provisional results clearly flagged, never presented as an official level.

## Files likely touched
- `spec/methodology.md`
- `spec/progressions.md`
- `website/app/calculator/page.tsx`

## Notes
A validated short-form estimator (correlated to full benchmarks) is deferred until data exists.
