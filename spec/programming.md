# OpenProgression Programming Specification

**Version:** 0.3.0 (Draft)

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
  15 Thrusters (43/30kg)
  12 Pull-ups
  9 Box Jumps (60/50cm)
```

```
OP-112 "Quick Honey"
For Time:
  21-15-9
  Kettlebell Swings (24/16kg)
  Burpees
```

```
OP-203 "Long Oatmeal"
30min AMRAP:
  400m Run
  15 Wall Balls (9/6kg)
  10 Toes-to-Bar
  5 Power Cleans (61/43kg)
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

## Scaling Tiers

Rather than writing 7 separate versions, metcons use 3 scaling tiers:

| Tier | OP Levels | Description |
|------|-----------|-------------|
| **Rx** | Advanced+, Rx | The default prescribed workout. Top-level values in the data. |
| **Scaled** | Intermediate, Intermediate+, Advanced | Reduced loads, simpler movement variations |
| **Foundation** | Beginner, Beginner+ | Accessible loads, fundamental movement substitutions |

Rx is always the default — scaling tiers only override what changes (loads, movement substitutions, occasionally reps). This keeps the data DRY.

## Level Targeting

Metcons are not named by level, but each metcon should specify:

- **Rx weights** (the default prescribed load)
- **Scaling guidance** via the 3-tier system
- **Intended stimulus** — time domain, feel, target effort
- **Coach notes** — practical tips for execution and pacing

The OP level system determines how athletes scale, not which metcons they do. All athletes do the same metcon, scaled to their level.

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
      "load": { "male": 24, "female": 16 },
      "unit": "kg",
      "scaling": {
        "scaled": { "load": { "male": 16, "female": 12 } },
        "foundation": { "sub": "Russian Kettlebell Swing", "load": { "male": 12, "female": 8 } }
      }
    },
    {
      "movement": "Burpee"
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

Each metcon in the library follows this schema. Top-level values are always Rx. Scaling overrides only what changes per tier.

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
      "load": { "male": 43, "female": 30 },
      "unit": "kg",
      "scaling": {
        "scaled": { "load": { "male": 30, "female": 20 } },
        "foundation": { "load": { "male": 20, "female": 15 } }
      }
    },
    {
      "movement": "Pull-up",
      "reps": 12,
      "scaling": {
        "scaled": { "sub": "Jumping Pull-up" },
        "foundation": { "sub": "Ring Row" }
      }
    },
    {
      "movement": "Box Jump",
      "reps": 9,
      "height": { "male": 60, "female": 50 },
      "unit": "cm",
      "scaling": {
        "scaled": { "height": { "male": 50, "female": 40 } },
        "foundation": { "sub": "Box Step-up", "height": { "male": 50, "female": 40 } }
      }
    }
  ]
}
```

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
        "scaled": { "load": { "male": 6, "female": 4 } },
        "foundation": { "load": { "male": 4, "female": 3 }, "reps": 12 }
      }
    },
    {
      "movement": "Toes-to-Bar",
      "reps": 10,
      "scaling": {
        "scaled": { "sub": "Hanging Knee Raise" },
        "foundation": { "sub": "Sit-up", "reps": 15 }
      }
    },
    {
      "movement": "Power Clean",
      "reps": 5,
      "load": { "male": 61, "female": 43 },
      "unit": "kg",
      "scaling": {
        "scaled": { "load": { "male": 43, "female": 30 } },
        "foundation": { "load": { "male": 30, "female": 20 } }
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
          "load": { "male": 52, "female": 35 },
          "unit": "kg",
          "scaling": {
            "scaled": { "load": { "male": 35, "female": 25 } },
            "foundation": { "load": { "male": 25, "female": 15 } }
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
            "scaled": { "sub": "Chest-to-Bar Pull-up", "reps": 6 },
            "foundation": { "sub": "Pull-up", "reps": 6 }
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
| `scaling` | object | No | Per-tier overrides (see below) |

### Scaling Override Fields

Each tier (`scaled`, `foundation`) can override any movement field:

| Field | Description |
|-------|-------------|
| `sub` | Substitute movement name (replaces the movement entirely) |
| `load` | Override load `{ male, female }` |
| `height` | Override height `{ male, female }` |
| `reps` | Override rep count |
| `distance` | Override distance |
| `calories` | Override calorie target |

If a field is not present in the scaling override, the Rx value carries forward.

## Daily Session Structure

A daily session references a metcon by code and provides the surrounding programming. The metcon library is a separate, reusable dataset.

```json
{
  "date": "2026-02-23",
  "warmup": {
    "notes": "3 rounds: 200m row, 10 PVC pass-throughs, 10 air squats"
  },
  "strength": {
    "movement": "Weighted Ring Dip",
    "scheme": "5x3",
    "sets": 5,
    "reps": 3,
    "notes": "Building. Rest 2:00 between sets."
  },
  "metcon": {
    "code": "OP-047"
  },
  "extras": {
    "notes": "3x12 GHD sit-ups, 3x20 banded pull-aparts"
  }
}
```

### Session Design Principles

- **Metcons are immutable** — if a coach wants to modify a metcon (different time cap, different reps), it becomes a new metcon with a new code. This keeps the library clean and results comparable.
- **Strength is structured** — `scheme` is the human-readable display string (e.g., "5x3"), while `sets` and `reps` provide machine-parseable values for tracking and auto-progression. Strength loads are intentionally free-text in `notes` for v1 — real-world strength programming uses percentages, RPE, "building to heavy," and other formats that don't fit a single `load` field cleanly. A structured load/percentage field can be added in a future version when auto-progression is built.
- **Warmup and extras are free-text** — these vary too much to justify rigid structure. If future AI validation needs to cross-reference warmup movements with the metcon, the warmup format can be upgraded to a structured movements array.

## Age Adjustment

Age adjustment is **not** part of the metcon data. The flat age multiplier (documented in the benchmark methodology) is applied at the presentation layer:

| Age Range | Multiplier |
|-----------|------------|
| 18–29 | 1.00x (baseline) |
| 30–39 | 0.96x |
| 40–49 | 0.89x |
| 50+ | 0.81x |

For load-based movements, multiply the prescribed weight by the age factor. This keeps the metcon data clean and avoids duplicating age variants across the entire library.
