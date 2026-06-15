# RM-001 — Wire bodyweight-relative scoring into the calculator

| | |
|---|---|
| **Status** | ✅ Done |
| **Horizon** | Near-term |
| **Priority** | P0 |
| **Effort** | M |
| **Core value** | Research-backed + Gym-agnostic |

**Field source.** 8 coaches independently (Yuki/Tokyo, Thandeka/Cape Town, Putu/Bali, Anjali/Mumbai, Seo-yeon/Seoul, Astrid/Stockholm, Sofia/Madrid, Cillian/Dublin). #1 by all 3 stewards.

## Problem
Every strength benchmark JSON ships a `bwMultiplier` table, and methodology.md documents it, but the calculator (website/app/calculator/page.tsx) scored raw absolute kg against the 80kg male / 60kg female reference and never read the multipliers. Lighter, female, and non-Western athletes were under-rated by up to a full level; heavier athletes over-rated on strength-to-weight.

## Proposal
Add a bodyweight input and an Absolute / × Bodyweight scoring toggle. When × Bodyweight is active, the four strength lifts (Back Squat, Deadlift, Strict Press, Clean & Jerk) score against `bwMultiplier × bodyweight` (rounded to 0.5kg). Nudge the athlete toward relative scoring when they deviate >10% from the reference. No new fabricated numbers; ships data already in the repo.

## Acceptance criteria
- [ ] Calculator has a bodyweight input and a working Absolute / × Bodyweight toggle.
- [ ] A 60kg male with an 80kg back squat scores INT+ under × Bodyweight (was INT absolute).
- [ ] A 52kg female with a 50kg back squat scores INT under × Bodyweight (was BEG+ absolute).
- [ ] Toggle is disabled until a valid bodyweight is entered; age multiplier still applies on top.

## Files likely touched
- `website/app/calculator/page.tsx`

## Notes
Implemented. Verified by hand against the cited coach cases and tsc --noEmit clean.
