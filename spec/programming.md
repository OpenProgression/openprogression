# OpenProgression Programming Specification

**Version:** 0.4.0 (Draft)

## Session Structure

A standard OP session follows four parts:

| Part | Purpose | Example |
|------|---------|---------|
| **Warmup** | Prepare for the session's demands | 3 rounds: 200m row, 10 PVC pass-throughs, 10 air squats |
| **Strength / Skill** | Build capacity in a specific domain | 5x3 Weighted Ring Dips, building |
| **Metcon** | The named workout — metabolic conditioning | OP-047 "Thick Smoke" |
| **Extras** | Optional accessory / cool-down work | 3x12 GHD sit-ups, 3x20 banded pull-aparts |

The metcon is the only part that carries a name and code. Warmup, strength, and extras are described but not named.

## Metcon Naming Convention

Every metcon has two identifiers:

### 1. Code (canonical reference)

Format: `OP-XXX` (zero-padded, three digits)

- Sequential, never reused
- The permanent, unambiguous identifier
- Used in data, APIs, tracking, and leaderboards
- Example: `OP-001`, `OP-047`, `OP-312`

### 2. Name (two words)

Format: `"{Descriptive} {Noun}"`

- **First word (descriptive):** Signals the character of the workout — intensity, duration, feel
- **Second word (noun):** A memorable, concrete thing — food, weather, animal, object, etc.
- Together they create a vivid, speakable identity

#### Descriptive Words (first word)

These become a loose vocabulary that athletes learn over time:

| Word | Signals |
|------|---------|
| **Quick** | Short sprint, sub-5 minutes |
| **Long** | 20+ minute grind |
| **Heavy** | Barbell-forward, load is the challenge |
| **Light** | Low/no weight, high rep speed |
| **Spicy** | High intensity, uncomfortable |
| **Dark** | Gymnastics-heavy, skill-demanding |
| **Thick** | Grinding, high volume, slow pace |
| **Sharp** | Interval-based, on/off efforts |
| **Sweet** | Balanced, approachable, well-rounded |
| **Loud** | Big movements, explosive |

This list is not exhaustive — new descriptive words can be added as the library grows. The goal is a consistent-enough vocabulary that the first word alone gives athletes an expectation.

#### Noun Words (second word)

No strict rules. Should be:
- One syllable preferred (but not required)
- Concrete and visual (food, weather, animals, objects)
- Easy to say and remember
- No profanity or trademarked terms

Examples: Rain, Smoke, Honey, Lemon, Pretzel, Thunder, Copper, Frost, Ember, Salt, Iron, Moss, Gravel, Oatmeal, Brick

### Full Format Example

```
OP-047 "Thick Smoke"
3 Rounds For Time:
  15 Thrusters (50/35kg)
  12 Pull-ups
  9 Box Jumps (60/50cm)
```

```
OP-112 "Quick Honey"
For Time:
  21-15-9
  Kettlebell Swings (32/24kg)
  Burpees
```

```
OP-203 "Long Oatmeal"
30min AMRAP:
  400m Run
  15 Wall Balls (9/6kg)
  10 Toes-to-Bar
  5 Power Cleans (60/45kg)
```

## Metcon Types

| Type | Format | Scoring | `timeCap` meaning |
|------|--------|---------|-------------------|
| **For Time** | Complete the work as fast as possible | Time (lower is better) | Maximum allowed time (cap) |
| **AMRAP** | As many rounds/reps as possible in a fixed duration | Rounds + reps (higher is better) | The workout duration itself |
| **EMOM** | Every minute on the minute | Completion (pass/fail per round) | Total working time |
| **For Load** | Build to a max within a workout structure | Weight (higher is better) | Maximum allowed time (cap) |
| **Intervals** | Repeated efforts with prescribed rest | Time per interval or total | Total working time |

Note: `timeCap` is used across all types for consistency, but its meaning differs. For **For Time** and **For Load**, it's an upper bound — athletes may finish before the cap. For **AMRAP**, **EMOM**, and **Intervals**, it IS the workout duration — athletes always work the full time.

## Scaling Levels

Metcons provide scaling for all 7 OP levels. The level keys match the canonical identifiers used across the OP data model:

| Level Key | Display Name | Description |
|-----------|-------------|-------------|
| `rx` | Rx | The default prescribed workout. Top-level values in the data. |
| `advanced_plus` | Advanced+ | Near-Rx loads, full movement complexity |
| `advanced` | Advanced | Moderate load reduction, same movements where possible |
| `intermediate_plus` | Intermediate+ | Lighter loads, some movement substitutions |
| `intermediate` | Intermediate | Accessible loads, standard substitutions |
| `beginner_plus` | Beginner+ | Light loads, fundamental movement patterns |
| `beginner` | Beginner | Entry-level loads, full movement substitutions |

**Rx is always the default** -- the top-level values on each movement represent Rx. The `scaling` object provides values for all 6 levels below Rx.

**Every movement with a `scaling` object must include explicit entries for all 6 non-Rx levels** (`advanced_plus`, `advanced`, `intermediate_plus`, `intermediate`, `beginner_plus`, `beginner`), even when the values are identical to Rx. This ensures every level is fully self-describing and prevents rendering issues where missing data could produce blank cells or dashes. The trade-off is slightly more verbose data, but the gain is that each level can be read in isolation without resolving an inheritance chain.

Movements that are identical across all levels (e.g., Run 200m, Row 1000m) may omit the `scaling` object entirely. The rule is: if `scaling` exists, all 6 levels must be present.

## Level Targeting

Metcons are not named by level, but each metcon should specify:

- **Rx weights** (the default prescribed load)
- **Scaling guidance** for all 7 OP levels
- **Intended stimulus** — time domain, feel, target effort
- **Coach notes** — practical tips for execution and pacing

The OP level system determines how athletes scale, not which metcons they do. All athletes do the same metcon, scaled to their level.

## Scaling Integrity Rules

These rules ensure that scaling across levels is consistent, logical, and never produces broken or confusing output.

### 1. No placeholder values

Never use `"-"`, `"N/A"`, `"none"`, empty strings, or similar as movement names or substitutions. Every level must resolve to a real, performable movement.

### 2. Monotonic movement difficulty (Rx down to Beginner)

The movement at each level must be **equal to or harder than** the level below it. Difficulty never increases as you go down levels. For example:

- Rx: Bar Muscle-up
- Advanced+: Chest-to-Bar Pull-up
- Advanced: Chest-to-Bar Pull-up
- Intermediate+: Pull-up
- Intermediate: Pull-up
- Beginner+: Jumping Pull-up
- Beginner: Ring Row

A movement may stay the same across adjacent levels (the difficulty change comes from load/reps instead), but it must never get harder at a lower level.

### 3. Monotonic load (same movement, Rx down to Beginner)

When the same movement appears at multiple levels, load must **decrease or stay the same** as you go down. For example, if Advanced and Advanced+ both use Chest-to-Bar Pull-up with load, Advanced's load must be less than or equal to Advanced+'s load.

### 4. Monotonic reps (same movement, Rx down to Beginner)

When the **same movement** appears at multiple adjacent levels, reps must **decrease or stay the same** as you go down. A higher-level athlete should do equal or more reps of the same movement.

### 5. Rep adjustment across movement substitutions

When a movement substitution occurs (e.g., Toes-to-Bar becomes Sit-up), reps may **increase** at the lower level to preserve the intended stimulus. This is the one case where a lower level does "more" -- but it's more reps of an easier movement, not more of the same movement.

### 6. Common metcon scaling chains

When substituting movements, follow these established difficulty orderings. Movements are listed hardest to easiest.

**Pulling (gymnastics)**
Bar Muscle-up > Chest-to-Bar Pull-up > Pull-up > Jumping Pull-up > Ring Row

**Core (hanging)**
Toes-to-Bar > Hanging Knee Raise > Sit-up

**Squatting (unilateral)**
Pistol Squat > Pistol Squat to Box > Air Squat

**Jumping rope**
Double-Under > Single-Under

**Box work**
Box Jump > Box Step-up (with decreasing heights)

**Burpee variations**
Bar-facing Burpee > Burpee to Target > Burpee > Bodybuilder

**Lunging**
Jumping Lunge > Walking Lunge

**Kettlebell swing**
Kettlebell Swing (Russian, to eye level) with decreasing loads. Standard KB sizes: 6, 8, 12, 16, 20, 24, 28, 32 kg.

**Push-up variations**
Push-up > Knee Push-up > Box Push-up

**Pressing (vertical)**
Handstand Push-up > Pike Push-up (feet on box) > Push-up

**Olympic lifting (catch depth)**
Squat Clean > Power Clean

**Olympic lifting (skill)**
Power Snatch > Power Clean (when snatch skill is the barrier)
Clean & Jerk > Power Clean & Push Press (when full lift skill is the barrier)

These chains are not exhaustive. When introducing new movements, establish the difficulty ordering and document it.

## Rep Schemes

Many workouts use descending, ascending, or custom rep patterns (21-15-9, 1-2-3-4-5, etc.). These are represented with `repScheme` at the metcon level:

```json
{
  "code": "OP-112",
  "name": "Quick Honey",
  "type": "for_time",
  "timeCap": 8,
  "repScheme": [21, 15, 9],
  "stimulus": {
    "duration": "4-8 min",
    "feel": "Fast couplet. Should be a sprint — go unbroken if possible.",
    "intent": "High-intensity, grip endurance, hip hinge under fatigue"
  },
  "coachNotes": "KB swings should stay unbroken through all three rounds at Rx. If you're breaking, go lighter. Burpees are the limiter — just keep moving.",
  "movements": [
    {
      "movement": "Kettlebell Swing",
      "load": { "male": 32, "female": 24 },
      "unit": "kg",
      "scaling": {
        "advanced_plus": { "load": { "male": 28, "female": 20 } },
        "advanced":      { "load": { "male": 24, "female": 16 } },
        "intermediate_plus": { "load": { "male": 20, "female": 12 } },
        "intermediate":  { "load": { "male": 16, "female": 12 } },
        "beginner_plus": { "load": { "male": 12, "female": 8 } },
        "beginner":      { "load": { "male": 8, "female": 6 } }
      }
    },
    {
      "movement": "Burpee",
      "scaling": {
        "advanced_plus":     {},
        "advanced":          {},
        "intermediate_plus": {},
        "intermediate":      {},
        "beginner_plus":     { "sub": "Bodybuilder" },
        "beginner":          { "sub": "Bodybuilder" }
      }
    }
  ]
}
```

When `repScheme` is present, it applies to **all movements** in the array — each round uses the next number in the scheme. Individual `reps` fields on movements are omitted since the scheme defines them.

This handles the vast majority of cases (21-15-9, 15-12-9, ascending ladders, etc.). For the rare workout where movements have different rep patterns, `reps` can be an array per movement to override the metcon-level scheme.

## Metcon Identity (Fingerprint)

A metcon's identity is its **structure**, not its loads. The fingerprint hashes:

- `type` (for_time, amrap, etc.)
- `timeCap`
- `rounds` and/or `repScheme` (whichever is present)
- Movement names (in order)
- Per-movement `reps`, `distance`, or `calories` (whichever defines the work)

Loads, heights, scaling options, and coach notes are **presentation**, not identity. This means "21-15-9 kettlebell swings and burpees, for time, 8min cap" is the same workout whether KB weight is 24kg or 20kg. If the structure changes (different movements, reps, scheme, or format), it's a new metcon with a new code.

## Metcon Data Structure

Each metcon in the library follows this schema. Top-level values are always Rx. Scaling overrides only what changes per level.

### For Time

```json
{
  "code": "OP-047",
  "name": "Thick Smoke",
  "type": "for_time",
  "timeCap": 14,
  "rounds": 3,
  "stimulus": {
    "duration": "8-14 min",
    "feel": "Moderate grind. Thrusters should be heavy but unbroken for Rx athletes. Pull-ups are the rest.",
    "intent": "Mixed modal, barbell cycling under fatigue"
  },
  "coachNotes": "Break thrusters at 8 if needed — don't go to failure in round 1. Pull-ups should be quick sets. Scale load to keep under the cap.",
  "movements": [
    {
      "movement": "Thruster",
      "reps": 15,
      "load": { "male": 50, "female": 35 },
      "unit": "kg",
      "scaling": {
        "advanced_plus": { "load": { "male": 45, "female": 30 } },
        "advanced":      { "load": { "male": 40, "female": 25 } },
        "intermediate_plus": { "load": { "male": 35, "female": 25 } },
        "intermediate":  { "load": { "male": 30, "female": 20 } },
        "beginner_plus": { "load": { "male": 25, "female": 15 } },
        "beginner":      { "load": { "male": 20, "female": 15 } }
      }
    },
    {
      "movement": "Pull-up",
      "reps": 12,
      "scaling": {
        "advanced_plus": {},
        "advanced":      {},
        "intermediate_plus": { "reps": 10 },
        "intermediate":  { "sub": "Jumping Pull-up", "reps": 10 },
        "beginner_plus": { "sub": "Ring Row", "reps": 10 },
        "beginner":      { "sub": "Ring Row", "reps": 8 }
      }
    },
    {
      "movement": "Box Jump",
      "reps": 9,
      "height": { "male": 60, "female": 50 },
      "unit": "cm",
      "scaling": {
        "advanced_plus": { "height": { "male": 60, "female": 50 } },
        "advanced":      { "height": { "male": 50, "female": 40 } },
        "intermediate_plus": { "height": { "male": 50, "female": 40 } },
        "intermediate":  { "sub": "Box Step-up", "height": { "male": 50, "female": 40 } },
        "beginner_plus": { "sub": "Box Step-up", "height": { "male": 50, "female": 40 } },
        "beginner":      { "sub": "Box Step-up", "height": { "male": 40, "female": 30 } }
      }
    }
  ]
}
```

Note: `advanced_plus` Pull-up has an empty override `{}`. This explicitly confirms the Rx movement and reps carry forward unchanged at that level. All 6 non-Rx levels must be present when a `scaling` object exists.

### AMRAP

```json
{
  "code": "OP-203",
  "name": "Long Oatmeal",
  "type": "amrap",
  "timeCap": 30,
  "stimulus": {
    "duration": "30 min",
    "feel": "Steady engine work. No single movement should gas you — find a rhythm and hold it.",
    "intent": "Aerobic capacity, pacing discipline"
  },
  "coachNotes": "This is a pacer, not a sprint. Athletes should be able to talk between movements. If the cleans slow you to singles, go lighter.",
  "movements": [
    { "movement": "Run", "distance": 400, "unit": "m" },
    {
      "movement": "Wall Ball",
      "reps": 15,
      "load": { "male": 9, "female": 6 },
      "unit": "kg",
      "scaling": {
        "advanced_plus": { "load": { "male": 9, "female": 6 } },
        "advanced":      { "load": { "male": 6, "female": 4 } },
        "intermediate_plus": { "load": { "male": 6, "female": 4 } },
        "intermediate":  { "load": { "male": 6, "female": 4 }, "reps": 12 },
        "beginner_plus": { "load": { "male": 4, "female": 3 }, "reps": 12 },
        "beginner":      { "load": { "male": 4, "female": 3 }, "reps": 10 }
      }
    },
    {
      "movement": "Toes-to-Bar",
      "reps": 10,
      "scaling": {
        "advanced_plus": {},
        "advanced":      { "sub": "Hanging Knee Raise" },
        "intermediate_plus": { "sub": "Hanging Knee Raise" },
        "intermediate":  { "sub": "Hanging Knee Raise", "reps": 8 },
        "beginner_plus": { "sub": "Sit-up", "reps": 15 },
        "beginner":      { "sub": "Sit-up", "reps": 12 }
      }
    },
    {
      "movement": "Power Clean",
      "reps": 5,
      "load": { "male": 60, "female": 45 },
      "unit": "kg",
      "scaling": {
        "advanced_plus": { "load": { "male": 55, "female": 40 } },
        "advanced":      { "load": { "male": 50, "female": 35 } },
        "intermediate_plus": { "load": { "male": 40, "female": 30 } },
        "intermediate":  { "load": { "male": 35, "female": 25 } },
        "beginner_plus": { "load": { "male": 25, "female": 20 } },
        "beginner":      { "load": { "male": 20, "female": 15 } }
      }
    }
  ]
}
```

### EMOM (alternating)

EMOMs use `pattern` and `groups` to support alternating formats (A/B, A/B/C, etc.). The `interval` field supports E2MOM, E90S, etc. For a straight EMOM (same work every minute), omit `pattern` and `groups` and use the top-level `movements` array directly — same as For Time or AMRAP.

```json
{
  "code": "OP-088",
  "name": "Sharp Frost",
  "type": "emom",
  "timeCap": 16,
  "interval": 1,
  "pattern": ["A", "B"],
  "stimulus": {
    "duration": "16 min",
    "feel": "Intervals — work hard, rest within the minute. Should have 15-20s rest each round.",
    "intent": "Power output under repeating time pressure"
  },
  "coachNotes": "If athletes can't finish within 40-45 seconds, reduce load or reps. The rest matters.",
  "groups": {
    "A": {
      "movements": [
        {
          "movement": "Power Snatch",
          "reps": 3,
          "load": { "male": 55, "female": 40 },
          "unit": "kg",
          "scaling": {
            "advanced_plus":     { "load": { "male": 50, "female": 35 } },
            "advanced":          { "load": { "male": 45, "female": 30 } },
            "intermediate_plus": { "load": { "male": 35, "female": 25 } },
            "intermediate":      { "load": { "male": 30, "female": 20 } },
            "beginner_plus":     { "sub": "Power Clean", "load": { "male": 25, "female": 15 } },
            "beginner":          { "sub": "Power Clean", "load": { "male": 20, "female": 15 } }
          }
        }
      ]
    },
    "B": {
      "movements": [
        {
          "movement": "Bar Muscle-up",
          "reps": 4,
          "scaling": {
            "advanced_plus":     { "sub": "Chest-to-Bar Pull-up", "reps": 6 },
            "advanced":          { "sub": "Chest-to-Bar Pull-up", "reps": 5 },
            "intermediate_plus": { "sub": "Pull-up", "reps": 7 },
            "intermediate":      { "sub": "Pull-up", "reps": 6 },
            "beginner_plus":     { "sub": "Jumping Pull-up", "reps": 8 },
            "beginner":          { "sub": "Ring Row", "reps": 10 }
          }
        }
      ]
    }
  }
}
```

### Metcon-Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | Yes | `OP-XXX` format identifier |
| `name` | string | Yes | Two-word name: `"Descriptive Noun"` |
| `type` | string | Yes | `for_time`, `amrap`, `emom`, `for_load`, `intervals` |
| `timeCap` | number | Yes | Time in minutes (cap for For Time, duration for AMRAP/EMOM) |
| `rounds` | number | No | Number of rounds (For Time only. Omit for AMRAP.) |
| `repScheme` | number[] | No | Rep pattern per round, e.g. `[21, 15, 9]`. Applies to all movements. |
| `stimulus` | object | Yes | `{ duration, feel, intent }` |
| `coachNotes` | string | Yes | Practical execution and pacing tips |
| `movements` | array | Yes | Movement array (or `groups` for EMOM) |
| `interval` | number | No | EMOM only: minutes per interval (1 = EMOM, 2 = E2MOM, 1.5 = E90S). Uses minutes for readability; E90S is the only common fractional case. |
| `pattern` | string[] | No | EMOM only: rotation pattern, e.g. `["A", "B"]` |
| `groups` | object | No | EMOM only: named movement groups |
| `team` | object | No | Team workout descriptor (see Team Metcons below) |

### Movement Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `movement` | string | Yes | Movement name (human-readable) |
| `reps` | number | No | Rep count. Omit when `repScheme` is set at metcon level, or for distance/cal movements. |
| `load` | `{ male, female }` | No | Weight in specified unit |
| `height` | `{ male, female }` | No | Height in specified unit (box jumps, wall balls) |
| `distance` | number | No | Distance (runs, rows, etc.) |
| `calories` | number | No | Calorie target (bike, row, ski) |
| `unit` | string | No | Unit for load/height/distance: `"kg"`, `"cm"`, `"m"` |
| `scaling` | object | No | Per-level overrides (see below) |

### Scaling Override Fields

Each level (`advanced_plus`, `advanced`, `intermediate_plus`, `intermediate`, `beginner_plus`, `beginner`) can override any movement field:

| Field | Description |
|-------|-------------|
| `sub` | Substitute movement name (replaces the movement entirely) |
| `load` | Override load `{ male, female }` |
| `height` | Override height `{ male, female }` |
| `reps` | Override rep count |
| `distance` | Override distance |
| `calories` | Override calorie target |

If a field is not present in a level's scaling override, the Rx value carries forward for that field. However, the level entry itself must always be present -- use `{}` to explicitly confirm Rx values are unchanged at that level.

## Team Metcons

A team metcon is a workout designed for partners (typically Teams of 2). The `team` field describes how the work is divided between partners. Movements, loads, and scaling remain identical to solo metcons. Each partner looks up their own OP level independently, meaning partners at different levels can work together seamlessly.

### Team Field Schema

```json
{
  "code": "OP-021",
  "name": "Sweet Storm",
  "type": "for_time",
  "timeCap": 24,
  "team": {
    "size": 2,
    "format": "ygig",
    "description": "Alternate full rounds. While one partner works, the other rests."
  },
  "rounds": 8,
  "movements": [ ... ]
}
```

### Team Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `size` | number | Yes | Number of partners (always `2` for Teams of 2) |
| `format` | string | Yes | `"ygig"`, `"partition"`, or `"sync"` |
| `description` | string | Yes | Human-readable explanation of how partners split the work |

### Team Formats

| Format | Name | Description |
|--------|------|-------------|
| `ygig` | You Go, I Go | Partners alternate rounds or sets. One works while the other rests. |
| `partition` | Partition | Total work is split between partners however they choose. |
| `sync` | Synchronized | Partners work simultaneously on different movements or stations. |

### Team Scaling

Each partner resolves their own scaling independently. A team of one Rx athlete and one Intermediate athlete will see different loads and movement substitutions for each partner, but the workout structure (rounds, reps, time cap) stays the same. The renderer shows two columns: "You" and "Partner" with their respective levels.

## Daily Session Structure

A daily session assembles a complete class hour: warmup, strength, metcon, and accessory work. Sessions are stored in `data/sessions.json` and reference metcons by code from the separate metcon library.

### Session Schema

```json
{
  "version": "1.0.0",
  "sessions": [
    {
      "date": "2026-02-24",
      "title": "Monday — Push/Pull",
      "estimatedMinutes": 60,
      "warmup": {
        "notes": "3 rounds: 200m row, 10 PVC pass-throughs, 10 air squats",
        "durationMinutes": 10
      },
      "strength": {
        "durationMinutes": 18,
        "movements": [
          {
            "movement": "Back Squat",
            "scheme": "5x3",
            "prescription": "Build to a heavy 3",
            "notes": "Rest 2:00 between sets. Reset at the top of each rep."
          }
        ]
      },
      "metcon": "OP-001",
      "accessory": {
        "notes": "3x15 GHD hip extensions, 3x20 banded pull-aparts",
        "durationMinutes": 10
      }
    }
  ]
}
```

### Session-Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date` | string | Yes | ISO date (`YYYY-MM-DD`) |
| `title` | string | Yes | Human-readable day title (e.g., "Monday — Push/Pull") |
| `estimatedMinutes` | number | Yes | Total session duration target (typically 45-60) |
| `warmup` | object \| null | No | Warmup block |
| `strength` | object \| null | No | Strength block with movements and duration |
| `metcon` | string \| null | No | Metcon code reference (e.g., `"OP-005"`) |
| `accessory` | object \| null | No | Accessory/cool-down block |

### Warmup Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `notes` | string | Yes | Free-text warmup description |
| `durationMinutes` | number | Yes | Duration in minutes (for display, e.g., "Warm-up (10 min)") |

### Strength Movement Fields

Strength is **prescription-based**, not absolute loads. Athletes use their own benchmark data (tested 1RM or OP level standards) to calculate working weights. This matches how real coaches program -- "build to a heavy 3" or "@ 70% 1RM" rather than fixed loads per level.

The strength block is an object with a `movements` array and a `durationMinutes` field, consistent with warmup and accessory.

### Strength Block Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `movements` | array | Yes | Array of strength movements (even a single lift is `[{ ... }]`) |
| `durationMinutes` | number | Yes | Total time for the strength block, including rest periods |

### Strength Movement Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `movement` | string | Yes | Movement name (e.g., "Back Squat", "Paused Front Squat") |
| `scheme` | string | Yes | Human-readable format (e.g., "5x3", "Build to 3RM", "E90S x 8") |
| `prescription` | string | Yes | Loading intent: "Build to a heavy 3", "@ 70% 1RM", "@ 60% 1RM -- 2s pause at bottom" |
| `notes` | string | No | Additional coach cues: rest periods, tempo, pacing |

**Common prescription patterns:**
- `"Build to a heavy 3"` — effort-based, athlete chooses weight
- `"@ 70% 1RM"` — percentage-based, calculated from tested or estimated 1RM
- `"@ 60% 1RM — 2s pause at bottom"` — variation with specific tempo
- `"Build across sets"` — ascending weight each set
- `"Moderate weight, focus on positions"` — technique/skill work

### Accessory Fields

### Accessory Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `notes` | string | Yes | Free-text accessory work description. Use `\n` for line breaks between exercises. |
| `durationMinutes` | number | No | Duration in minutes |

### Session Time Budget

Every session part has a `durationMinutes` field. The session's `estimatedMinutes` must equal the sum of all parts:

```
estimatedMinutes = warmup.durationMinutes
                 + strength.durationMinutes
                 + metcon.timeCap
                 + accessory.durationMinutes
```

This ensures strict accountability. No hidden transition buffers or unaccounted time.

**Maximum durations per part:**

| Part | Max Duration | Notes |
|------|-------------|-------|
| Warmup | 10 min | General preparation, movement prep |
| Strength / Skill | 20 min | Includes rest periods between sets |
| Metcon | 40 min | If metcon is 40 min, strength must be null |
| Accessory | 15 min | Cool-down and supplementary work |

**Constraint:** When a metcon's `timeCap` exceeds 25 minutes, the strength block should be kept short (skill work, movement practice) or omitted entirely. A 40-minute metcon requires `"strength": null`.

**Exception:** Hero workouts (e.g., Murph) may exceed normal time budgets. These should be explicitly flagged with a note.

### Session Design Principles

- **Sessions target 45-60 minutes** -- the sum of warmup + strength + metcon + accessory should fill a class hour.
- **All fields are nullable** -- pure engine days have `"strength": null`, long metcon days may have `"accessory": null`, rest days have no session entry.
- **Strength is prescription-based** -- "build to heavy", "@ 70% 1RM", "paused @ 60%" rather than absolute loads. Athletes calculate from their tested 1RM or OP level benchmarks.
- **Metcon is a code reference** -- `"metcon": "OP-005"` points to the metcon library. The session never duplicates metcon data.
- **Metcons are immutable** -- if a coach wants to modify a metcon, it becomes a new metcon with a new code. This keeps the library clean and results comparable.
- **Warmup and accessory are free-text** -- coach flavor that doesn't need per-level scaling. Use `\n` line breaks between exercises for readability. Both support `durationMinutes` for display.
- **7 days per week** -- programming runs Monday through Sunday with no gaps or rest days. Every day of the week has a scheduled session.
- **Tuesday and Saturday are Teams of 2** -- these days always use team metcons (metcons with a `team` field). All other days use solo metcons.

## Age Adjustment

Age adjustment is **not** part of the metcon data. The flat age multiplier (documented in the benchmark methodology) is applied at the presentation layer:

| Age Range | Multiplier |
|-----------|------------|
| 18–29 | 1.00x (baseline) |
| 30–39 | 0.96x |
| 40–49 | 0.89x |
| 50+ | 0.81x |

For load-based movements, multiply the prescribed weight by the age factor. This keeps the metcon data clean and avoids duplicating age variants across the entire library.
