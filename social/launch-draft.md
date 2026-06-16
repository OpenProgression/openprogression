# OpenProgression iOS - Launch Draft

Status: DRAFT for David's review. Nothing has been posted. Drafted by Saga (story),
fact-checked by Rut (claims). Every claim maps to a proof in the Claim Ledger below.

---

## 1. Launch thread (X / LinkedIn)

**1 (hook)**
You used to need a coach watching you for a month to know how fit you actually are, and which gap to close first.
I just put that on your phone. Offline, free, no account.
OpenProgression for iOS is live.

**2**
Most fitness scoring rewards your best lift. This does the opposite.
Your level is your *weakest* category, not your strongest. In the app it's one line: `let overall = levels.min()`.
You can't hide behind a big deadlift. You find the hole and fill it.

**3**
The grading isn't vibes. It's an open standard: 7 levels, 8 categories, 25 benchmarks, every number traced to published research.
The two largest peer-reviewed studies behind it cover over 1.3 million lifters (809,986 powerlifting entries + 569,607 CrossFit Open athletes). Sources ship with the data.

**4**
Enter one number per category, get your level. Add bodyweight and your lifts score relative to your size, not just absolute kg.
No sign-up. No upload. Nothing leaves the phone. The whole standard is baked into the app bundle, so it works on a plane with no signal.

**5**
Knowing your level is step one. The app also ships a full year of training, 365 days, August 1 2026 through July 31 2027, no gaps.
It's periodized: Volume, then Strength, then Peak, with deload weeks and 1RM test weeks built in. Strength climbs from 60% up to 91% of your max across the cycle.

**6**
Every session scales across all 7 levels with the exact loads and subs for each. Tuesday and Saturday are partner workouts, every week.
And it's measurable: benchmark workouts like Cindy, Helen and Grace come back months apart so you can see the number move, not guess.

**7**
Here's the part I care about most: all of it is open. MIT licensed.
The standard, the research, the year of programming, *and* the iOS app source are in one public repo. Only the name and logo are protected. Same model as Linux. Fork it, build on it, ship your own.

**8 (close)**
Free standard. Free app. A year of programming. Zero backend.
Built so a coach, a developer, or a person training alone in a garage all speak the same language about getting better.
App Store link + repo below. Tell me where it's wrong, that's the whole point of open.

---

## 2. App Store description

**Short (under 170 chars):**
Find your real fitness level across 7 levels and 8 categories, then train it. A full year of periodized workouts. Free, open, 100% offline.

**Long:**
OpenProgression turns "how fit am I, really?" into an answer you can act on.

It is built on a free, open standard for functional fitness: 7 levels, 8 categories, 25 benchmarks, every one traced to published research and public data. The two largest peer-reviewed studies behind it cover over 1.3 million lifters.

**Know where you stand.**
Enter one movement per category and the Level Calculator places you. Your overall level is your weakest category, not your best, so you train the gap instead of hiding it. Add your bodyweight and strength lifts score relative to your size.

**Then train, every day.**
A full year of programming is built in, 365 daily sessions with no gaps. It is properly periodized: Volume, Strength and Peak blocks, deload weeks, and 1RM test weeks so your percentages stay honest. Benchmark workouts like Cindy, Helen and Grace return across the year so you can measure real progress.

**Scaled for you.**
Every workout scales across all 7 levels with exact loads and substitutions. Tuesday and Saturday are partner workouts.

**Yours, fully.**
100% offline. No account, no backend, nothing leaves your phone. Everything is baked into the app.

And it is open source, MIT licensed: the standard, the data, the year of programming, and this app's code all live in one public repository. Learn more at openprogression.org.

---

## 3. Thirty-second demo script

| Time | On screen | Voiceover / caption |
|------|-----------|--------------------|
| 0:00-0:04 | Today screen: "Sweet Reef", 42 min, Teams of 2, level pills | "Open the app. Today's workout is already here." |
| 0:04-0:09 | Tap a level pill; warm-up / strength / metcon reflow | "Tap your level. Loads and subs adjust instantly, across all 7." |
| 0:09-0:14 | Calculator: type a number into Squatting, Pulling, Pressing; toggle Bodyweight | "Not sure of your level? Enter one lift per category." |
| 0:14-0:18 | Result resolves to "Overall Level / Weakest Link" | "Your score is your weakest category. Train the gap, not the strength." |
| 0:18-0:22 | Program month view; swipe across the calendar | "A full year of training is built in. 365 days, periodized, no gaps." |
| 0:22-0:26 | Detail: per-level Power Clean loads RX 60kg down to BEG 25kg, partner card | "Every workout, every level, exact loads. Partner days too." |
| 0:26-0:30 | Benchmarks, then airplane-mode icon, then GitHub repo | "Free. Open source. Works fully offline. OpenProgression. On the App Store now." |

**Strongest hook:** Post 1 (coach-in-your-pocket, true before/now beat).
**Weakest/at-risk claim:** "over 1.3 million data points" - true and conservative (1.38M from two named studies); always name the studies inline so the figure cashes itself.

---

## Claim Ledger (every claim -> proof)

- 7 levels / 8 categories / 25 benchmarks -> data/levels.json (7), data/categories.json (8), data/benchmarks/*.json (sum 25).
- over 1.3M lifters; 809,986 + 569,607 -> data/sources.json sampleSize fields (sum 1,379,593); README.md Research Foundation; spec/methodology.md.
- weakest-link `levels.min()` -> ios/OpenProgression/Features/Calculator/CalculatorView.swift (overall = levels.min()); README.md.
- bodyweight-relative scoring -> CalculatorView.swift (useBW + bwMultiplier, bw gated 30-300kg).
- 100% offline / no backend -> grep URLSession|URLRequest|dataTask|http in ios/**/*.swift = 0 matches; project.yml bundles Resources/data; no third-party deps.
- full year, 365 sessions, 2026-08-01..2027-07-31, no gaps -> data/sessions.json window = 365 unique days, 0 gaps.
- periodized phases + deloads + test weeks -> sessions.json phase field (Volume/Strength/Peak/Deload/Test) + deload boolean.
- strength 60% -> 91% -> sessions.json %1RM prescriptions.
- every workout scales 7 levels w/ loads+subs -> data/metcons.json per-level standards; app detail screen.
- Tue/Sat partner workouts -> 149/149 Tue/Sat sessions are team metcons; 0 team on other days.
- Cindy/Helen/Grace retests reused -> benchmark metcons reused at block start + test week.
- MIT; standard+data+programming+app all open in one public repo; only brand protected -> LICENSE; public GitHub repo; README trademark section.

## Cut for truth (not claimed)
- "Adversarial review by feedback agents until a ruthless reviewer signed off." That review did happen during development, but no artifact in the repo backs it, so it is not claimed here. (To make it cashable, commit a review log.)
- No rigid "deload every 4th week" cadence claimed; copy says "deload weeks built in."
