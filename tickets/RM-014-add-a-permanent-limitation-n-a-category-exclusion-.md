# RM-014 — Add a permanent-limitation N/A category-exclusion flag to the rollup

| | |
|---|---|
| **Status** | ⬜ Todo |
| **Horizon** | Mid-term |
| **Priority** | P1 |
| **Effort** | M |
| **Core value** | Open / Community-driven (inclusion) — protects the weakest-link model |

**Field source.** Marcus/Toronto (adaptive), Wayne/Sydney (joint replacements), Sofia, Eleanor, Cillian.

## Problem
Weakest-link permanently floors an athlete who physically cannot perform one category (e.g. a lower-limb-difference para athlete advanced everywhere else), making OP's inclusion claim hollow.

## Proposal
Add a schema flag distinguishing permanent impairment from temporary scaling, and a coach-set 'not applicable' option that excludes a physically-inapplicable category from the weakest-link minimum (building on the existing import-spec rule that untested categories are excluded). Include a guard against gaming the overall.

## Acceptance criteria
- [ ] Schema field for permanent vs temporary exclusion.
- [ ] Rollup excludes N/A categories from the minimum.
- [ ] Abuse guard / documentation so it cannot be used to inflate the overall.

## Files likely touched
- `spec/import-mapping.md`
- `spec/methodology.md`
- `website/app/calculator/page.tsx`

## Notes
Needs schema + rollup design before build.
