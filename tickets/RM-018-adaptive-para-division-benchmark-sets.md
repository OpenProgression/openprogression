# RM-018 — Adaptive / para division benchmark sets

| | |
|---|---|
| **Status** | ⬜ Todo |
| **Horizon** | Long-term |
| **Priority** | P3 |
| **Effort** | L |
| **Core value** | Open + Community-driven (inclusion) |

**Field source.** Marcus/Toronto (strongest), Wayne/Sydney.

## Problem
OP has no adaptive/para divisions; the N/A flag (RM-014) is only a partial answer. No one else builds this.

## Proposal
Build sourced benchmark sets for adaptive/para divisions (seated, upper/lower-extremity, neuro, vision, short-stature), each with its own cited standards (e.g. WheelWOD / adaptive-community data). Pair with RM-014 as the near-term partial answer.

## Acceptance criteria
- [ ] At least one division shipped with cited standards.
- [ ] Each division's numbers are source-traced before publishing.

## Files likely touched
- `data/benchmarks/*.json`
- `data/sources.json`
- `spec/categories.md`

## Notes
Large, data-hungry; needs a community contributor per division.
