# WOD Generation Playbook

This document is the single source of truth for generating metcons and programming sessions. Read this before generating any WODs. For detailed schema and scaling rules, see `spec/programming.md`.

## Quick Start Checklist

When asked to generate WODs or programming:

1. **Check existing state** (see Step 1 below)
2. **Confirm scope with user** (overwrite, fill gaps, or new months)
3. **Design metcons first** (the building blocks)
4. **Write sessions per week** (the schedule that uses metcons)
5. **Validate everything**
6. **Commit, PR, merge to main/test/prod**

## File Locations

| File | Purpose |
|------|---------|
| `data/metcons.json` | All metcon definitions (the WOD library) |
| `data/sessions.json` | Daily programming sessions referencing metcons by code |
| `spec/programming.md` | Full schema, scaling rules, session structure |
| `scripts/audit-metcons.mjs` | Automated scaling integrity validation |
| `scripts/validate-data.mjs` | General data validation (levels, benchmarks, etc.) |
| `website/app/programming/page.tsx` | Renderer (reads from public/data/) |

## Step 1: Check Existing State

Always run this before generating anything:

```bash
node -e "
const m = require('./data/metcons.json');
const s = require('./data/sessions.json');
console.log('Metcons:', m.metcons.length, '(codes:', m.metcons[0]?.code, 'to', m.metcons[m.metcons.length-1]?.code + ')');
console.log('Sessions:', s.sessions.length);
const dates = s.sessions.map(x => x.date).sort();
console.log('Date range:', dates[0], 'to', dates[dates.length-1]);
const months = [...new Set(dates.map(d => d.slice(0,7)))];
console.log('Months covered:', months.join(', '));
"
```

Report findings to the user before proceeding. Ask whether to:
- **Overwrite** existing months (replace sessions, keep or replace metcons)
- **Fill gaps** (add sessions for missing days in existing months)
- **Extend** (add new months only, keeping everything existing)

## Step 2: Design Metcons

Metcons are the building blocks. Create them before sessions.

### How Many

A typical month needs ~30 sessions (7 days/week x ~4.3 weeks). Not every session needs a unique metcon. Plan for:
- ~16-20 new metcons per month (solo + team)
- Reuse 8-10 existing metcons as retests for progress tracking
- Target ~28 total metcon slots per month of programming

### Naming Convention

Format: `OP-XXXX "Descriptive Noun"`

**Descriptive words** (first word signals the workout character):
- Quick = short sprint, sub-5 min
- Long = 20+ min grind
- Heavy = barbell-forward
- Light = low/no weight, high rep speed
- Spicy = high intensity
- Dark = gymnastics-heavy
- Thick = grinding, high volume
- Sharp = interval-based
- Sweet = balanced, approachable
- Loud = big movements, explosive

**Noun** = concrete, visual, 1-2 syllables. No repeats across the library.

### Load Calibration

All Rx loads are derived from benchmark 1RM data. The percentage depends on rep volume:

| Rep Volume | % of 1RM | Example |
|-----------|---------|---------|
| Low (3-5 reps, EMOM) | 50-55% | Squat Clean 4r EMOM @ 80/55 |
| Moderate (8-12 reps) | 40-50% | HPC 10r @ 70/50 |
| High (15+ reps or 21-15-9) | 35-44% | Thruster 15r @ 55/40, DL 21-15-9 @ 100/70 |
| Long AMRAP (6-10 reps, 20+ min) | 44-50% | PS 6r AMRAP @ 55/40 |

**Reference 1RM benchmarks (Rx level):**

| Movement | Male 1RM | Female 1RM |
|----------|---------|-----------|
| Back Squat | 180 | 120 |
| Front Squat | 153 | 102 |
| Deadlift | 240 | 170 |
| Strict Press | 95 | 57 |
| Power Clean | 135 | 95 |
| Snatch | 125 | 80 |
| Clean and Jerk | 150 | 105 |

### Equipment Rules

- **Barbell**: All loads in multiples of 5 kg. Never use imperial-converted numbers (43, 61, etc.)
- **Kettlebell**: Standard sizes only: 6, 8, 12, 16, 20, 24, 28, 32 kg. Rx male 32, female 24. All KB swings are Russian (to eye level). Never American.
- **Wall Ball**: Standard sizes only: 3, 4, 6, 9 kg. Rx male 9, female 6. Int and up always 9/6. Beg+ = 6/4, Beg = 4/3.
- **Box**: Heights: 30, 40, 50, 60 cm. Rx male 60, female 50.

### Scaling Rules

Every scaled movement MUST have all 6 non-Rx levels. Each level entry MUST be fully explicit with all relevant field values repeated, even when identical to Rx. Never use empty `{}` objects. Never use gender-specific object `sub` fields (always use a string).

**Scaling chains** (hardest to easiest):
- Pulling: Bar Muscle-up > C2B > Pull-up > Jumping C2B > Jumping Pull-up > Ring Row
- Core (hanging): TTB > Hanging Leg Raise > Hanging Knee Raise > Laying Knee Raise
- Squatting: Pistol > Pistol to Box > Air Squat
- Rope: Double-Under > Single-Under
- Box: Box Jump > Box Step-up
- Burpee to Target: Beg+ = Burpee, Beg = Bodybuilder (Rx through Int do Burpee to Target)
- Bar-facing Burpee: Beg = Bodybuilder (all other levels do Bar-facing Burpees)
- Burpee: Beg = Bodybuilder (all other levels do Burpees)
- Lunge: Jumping Lunge > Walking Lunge
- Press (vertical): HSPU > Pike Push-up > Dumbbell Push Press
- Push-up: Push-up > Knee Push-up > Box Push-up
- Wall Walk: Wall Walk (full) > Wall Walk (partial) > Inch Worm
- Rope Climb: Rope Climb (15ft) > Rope Climb (12ft) > 4 Strict Pull-ups (Rx through Adv). Not programmed below Intermediate+.
- Core (GHD): GHD Sit-up > Butterfly Sit-up > Sit-up. GHD only at Rx/Adv+, Butterfly from Advanced down.
- Olympic: Squat Clean > Power Clean; Power Snatch > Power Clean; C&J > PC & Push Press

**Integrity rules:**
1. No placeholders ("-", "N/A", empty strings, empty `{}` objects)
2. Every level must be fully self-describing (repeat Rx values when unchanged)
3. Monotonic difficulty (movement subs only get easier going down)
4. Monotonic load (same movement, load only decreases going down)
5. Monotonic reps (same movement, reps only decrease going down)
6. Reps MAY increase when subbing to an easier movement (to preserve stimulus)
7. `sub` must always be a string, never a gender-specific object

### Writing Metcons Incrementally

To avoid output token limits, add metcons in batches of 2-3 using the Edit tool. Insert before the closing `]}` of metcons.json.

**Do NOT rewrite the entire file with Write.** Use Edit to append.

### Team Metcons

Team metcons (Teams of 2) use the same movement/scaling structure as solo metcons but add a `team` field. Each partner scales independently to their own OP level. See `spec/programming.md` for the full team schema.

**Design guidelines:**
- Longer time caps (20-30 min) since partners rest between turns
- YGIG: Use clear round boundaries. Works great with barbell + bodyweight combos.
- Partition: Best for high-rep bodyweight or monostructural work (row, run, bike).
- Sync: Partners work simultaneously on different stations. Good for EMOMs.
- Each partner can use their own bar with their own load. No need for matching weights.
- Include a mix of barbell + gymnastics + monostructural movements.

**Format reference:**
- `"ygig"` = You Go, I Go. Partners alternate rounds. One works, one rests.
- `"partition"` = Total work split between partners however they choose.
- `"sync"` = Partners work simultaneously on different movements/stations.

## Step 3: Design Sessions

### Weekly Template (7 days, no rest days)

| Day | Focus | Strength | Metcon Style |
|-----|-------|----------|-------------|
| Monday | Heavy lower body | Back Squat / Front Squat + accessory pull | Sprint or interval (TC 8-16) |
| Tuesday | **Teams of 2** | Skill work 10 min | Team YGIG or partition (TC 20-30) |
| Wednesday | Press / upper body | Strict Press / Push Press + Rows | Moderate metcon (TC 16-18) |
| Thursday | Gymnastics / conditioning | Gymnastics skill (HS, MU, DU) | Mixed modal (TC 14-20) |
| Friday | Pull / posterior chain | Deadlift (build heavy) | Grind (TC 18-22) |
| Saturday | **Teams of 2** | Light skill or null | Team grinder (TC 20-30) |
| Sunday | Active recovery / engine | None or light skill | Long easy effort or bodyweight (TC 20-30) |

**Permanent rules:**
- Programming runs 7 days per week (Monday through Sunday). No gaps, no scheduled rest days.
- Tuesday and Saturday are always Teams of 2 partner workouts.
- Sunday is intentionally lighter to manage weekly training load.
- **Single-focus strength:** Each strength block has exactly one primary movement. No pairing two heavy compounds in one block. Put secondary work in accessories.
- **Consecutive-day variety:** Back-to-back days must not repeat more than one movement. If Monday has KB Swings, Burpees, and Rowing, Tuesday should share at most one of those. Plan the weekly schedule holistically.

### Time Budget

```
estimatedMinutes = warmup + strength + metcon.timeCap + accessory
```

| Part | Max | Typical |
|------|-----|---------|
| Warmup | 10 min | 8-10 |
| Strength | 20 min | 10-18 |
| Metcon | 40 min | 8-30 |
| Accessory | 15 min | 5-12 |
| **Session total** | | **45-58 min** |

**Constraints:**
- If metcon TC > 25 min, strength must be short (skill work) or null
- If metcon TC = 40 min, strength must be null
- estimatedMinutes MUST exactly equal the sum of parts

### Retest Strategy

In a 4-week cycle:
- Weeks 1-2: Introduce new metcons
- Weeks 3-4: Retest key metcons from weeks 1-2 (and from previous months) for progress tracking
- Aim for 6-8 retests per month

### Writing Sessions Incrementally

Sessions can be written per week. Write the full sessions.json using the Write tool (replacing previous content), or build it up incrementally with Edit.

## Step 4: Validate

Run all three validations:

```bash
# 1. Metcon scaling integrity (loads, levels, chains)
node scripts/audit-metcons.mjs

# 2. General data validation (levels, benchmarks, sources)
node scripts/validate-data.mjs

# 3. Session time budget verification
node -e "
const m = require('./data/metcons.json');
const s = require('./data/sessions.json');
for (const sess of s.sessions) {
  const w = sess.warmup?.durationMinutes || 0;
  const st = sess.strength?.durationMinutes || 0;
  const mc = m.metcons.find(x => x.code === sess.metcon);
  const tc = mc ? mc.timeCap : 0;
  const a = sess.accessory?.durationMinutes || 0;
  const sum = w + st + tc + a;
  const ok = sum === sess.estimatedMinutes ? 'ok' : 'MISMATCH ' + sum;
  console.log(sess.date, sess.metcon, 'est:' + sess.estimatedMinutes, ok);
}
"
```

Then copy data to public:

```bash
cd website && node scripts/copy-data.mjs
```

## Step 5: Ship

```bash
# Create branch and commit
git checkout -b feature/MONTH-programming
git add data/metcons.json data/sessions.json website/public/data/metcons.json website/public/data/sessions.json website/public/data/openprogression.json
git commit -m "Add MONTH programming: N new metcons + N sessions"

# Push, PR, merge
git push -u origin feature/MONTH-programming
gh pr create --title "Add MONTH programming" --body "..."
gh pr merge N --merge

# Sync all branches
git checkout main && git pull
git checkout test && git merge main --ff-only && git push
git checkout prod && git merge main --ff-only && git push
git checkout main

# Release
gh release create vX.Y.Z --title "vX.Y.Z - MONTH Programming" --notes "..."
```

## Things to Never Do

- Never use em dashes anywhere
- Never use imperial units or imperial-converted loads (43, 61, 48, etc.)
- Never use "American Kettlebell Swing"
- Never use "Kipping Pull-up" as a scaling sub (Pull-up includes kipping)
- Never use "Good mornings with bar" (complex exercise, unsuited below Advanced)
- Never skip levels in scaling (all 6 must be present if scaling exists)
- Never use "Up-Down" (use "Bodybuilder" instead)
- Never create sessions where estimatedMinutes does not equal the sum of parts
