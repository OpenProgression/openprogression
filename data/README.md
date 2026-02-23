# OpenProgression Data

This directory contains the complete OpenProgression dataset. Any application can consume these files to display benchmarks, calculate athlete levels, and render programmed workouts with proper scaling.

## File Structure

```
data/
├── levels.json              # 7 OP levels (Beginner → Rx)
├── categories.json          # 8 benchmark categories
├── sources.json             # Research citations
├── metcons.json             # Programmed workouts (WOD library)
├── sessions.json            # Daily programming (references metcons by code)
├── benchmarks/
│   ├── squatting.json       # Back Squat, Front Squat, Overhead Squat
│   ├── pulling.json         # Deadlift
│   ├── pressing.json        # Strict Press, Bench Press
│   ├── olympic_lifting.json # Power Clean, Snatch, Clean & Jerk
│   ├── gymnastics.json      # Pull-ups, HSPU, TTB, Bar/Ring Muscle-ups
│   ├── monostructural.json  # 500m Row, 2000m Row, 1 Mile Run, 5K Run
│   ├── bodyweight.json      # Push-ups, Double-Unders, Pistol Squats
│   └── endurance.json       # Fran, Grace, Murph, Cindy
└── README.md                # This file
```

## How the Files Relate

```
levels.json          defines level keys: beginner, beginner_plus, ..., rx
    ↓
benchmarks/*.json    uses those keys for standards per movement
    ↓
metcons.json         uses those keys for scaling overrides per movement
    ↓
sessions.json        references metcons by code, adds strength scaling per level
    ↓
categories.json      groups benchmark movements into 8 categories
    ↓
sources.json         provides citations referenced by benchmark files
```

## levels.json

Defines the 7 progression levels. Each level has:

| Field | Example | Description |
|-------|---------|-------------|
| `id` | `"intermediate_plus"` | Canonical key used everywhere |
| `number` | `4` | Sort order (1 = Beginner, 7 = Rx) |
| `name` | `"Intermediate+"` | Display name |
| `shortName` | `"INT+"` | Abbreviated label |
| `color` | `"#F97316"` | Brand color (hex) |
| `percentileRange` | `[50, 65]` | Percentile within trained population |

**Level keys in order:** `beginner`, `beginner_plus`, `intermediate`, `intermediate_plus`, `advanced`, `advanced_plus`, `rx`

## benchmarks/*.json

Each file covers one category. Structure:

```json
{
  "category": "squatting",
  "version": "1.0.0",
  "benchmarks": [
    {
      "movement": "back_squat",
      "name": "Back Squat",
      "testType": "1rm",
      "unit": "kg",
      "standards": {
        "beginner":          { "male": 40,  "female": 25 },
        "beginner_plus":     { "male": 60,  "female": 40 },
        "intermediate":      { "male": 80,  "female": 55 },
        "intermediate_plus": { "male": 105, "female": 70 },
        "advanced":          { "male": 130, "female": 85 },
        "advanced_plus":     { "male": 155, "female": 100 },
        "rx":                { "male": 180, "female": 120 }
      },
      "bwMultiplier": { ... },
      "sources": ["van_den_hoek_2024", "kilgore_2023"]
    }
  ]
}
```

**Test types:**
- `1rm` — max single rep (kg). Higher is better.
- `max_reps` — unbroken reps. Values are `[min, max]` ranges. Higher is better.
- `time` — completion time (seconds). Lower is better.
- `amrap` — rounds in fixed time. Higher is better.

**Determining an athlete's level:** Compare their result to the standards. Their level is the highest one where they meet or exceed the threshold (or fall within the range for `max_reps`).

## metcons.json

The WOD library. Each metcon follows the [Programming Spec v0.4.0](../spec/programming.md).

```json
{
  "version": "0.4.0",
  "metcons": [
    {
      "code": "OP-001",
      "name": "Quick Ember",
      "type": "for_time",
      "timeCap": 14,
      "rounds": 3,
      "stimulus": { "duration": "...", "feel": "...", "intent": "..." },
      "coachNotes": "...",
      "movements": [
        {
          "movement": "Thruster",
          "reps": 15,
          "load": { "male": 43, "female": 30 },
          "unit": "kg",
          "scaling": {
            "advanced_plus":     { "load": { "male": 40, "female": 27 } },
            "advanced":          { "load": { "male": 34, "female": 25 } },
            "intermediate_plus": { "load": { "male": 30, "female": 20 } },
            "intermediate":      { "load": { "male": 25, "female": 18 } },
            "beginner_plus":     { "load": { "male": 20, "female": 15 } },
            "beginner":          { "load": { "male": 15, "female": 10 } }
          }
        }
      ]
    }
  ]
}
```

### Key Concepts

**Rx is the default.** Top-level values on each movement (load, reps, height) are always Rx. The `scaling` object provides overrides for the 6 levels below.

**Overrides are sparse.** Each level only specifies what changes from Rx. If a field isn't overridden, the Rx value carries forward.

**Movement substitutions** use the `sub` field:
```json
"scaling": {
  "intermediate": { "sub": "Jumping Pull-up" },
  "beginner":     { "sub": "Ring Row", "reps": 8 }
}
```

**Rep schemes** (21-15-9 etc.) use `repScheme` at the metcon level. When present, individual `reps` fields are omitted — the scheme applies to all movements.

### Metcon Types

| Type | `timeCap` meaning | Scoring |
|------|-------------------|---------|
| `for_time` | Max allowed time (cap) | Time (lower is better) |
| `amrap` | Workout duration | Rounds + reps (higher is better) |
| `emom` | Total working time | Completion per round |

**EMOM format:** Uses `pattern` (e.g., `["A", "B"]`) and `groups` for alternating minutes. `interval` sets the minute length (1 = EMOM, 2 = E2MOM).

## sessions.json

Daily programming that assembles complete class sessions. Each session references a metcon by code and adds warmup, strength, and accessory work.

```json
{
  "version": "1.0.0",
  "sessions": [
    {
      "date": "2026-02-24",
      "title": "Monday — Push/Pull",
      "warmup": { "notes": "3 rounds: 200m row, 10 PVC pass-throughs, 10 air squats", "durationMinutes": 10 },
      "strength": [
        {
          "movement": "Back Squat",
          "scheme": "5x3",
          "sets": 5,
          "reps": 3,
          "load": { "male": 140, "female": 95 },
          "unit": "kg",
          "notes": "Build across sets. Rest 2:00.",
          "scaling": { "beginner": { "load": { "male": 40, "female": 25 } }, "..." : "..." }
        }
      ],
      "metcon": "OP-001",
      "accessory": { "notes": "3x15 GHD hip extensions, 3x20 banded pull-aparts" }
    }
  ]
}
```

### Session Structure

| Field | Type | Description |
|-------|------|-------------|
| `date` | string | ISO date (`YYYY-MM-DD`) |
| `title` | string | Human-readable day title |
| `warmup` | object \| null | `{ notes, durationMinutes }` — free text, no scaling |
| `strength` | array \| null | Array of strength movements with full 7-level scaling |
| `metcon` | string \| null | Metcon code reference (e.g., `"OP-005"`) |
| `accessory` | object \| null | `{ notes }` — free text, no scaling |

**Strength uses the same scaling system as metcons.** Rx load is the top-level default; lower levels override via `scaling`. Strength is always an array — even a single lift is `[{ ... }]`.

**All fields are nullable.** Engine days have `"strength": null`. Long metcon days may have `"accessory": null`. Rest days have no session entry.

## Rendering a Scaled WOD

To display a metcon for a specific athlete:

1. Determine the athlete's level (from their benchmark results)
2. Read the metcon from `metcons.json`
3. For each movement:
   - Start with the top-level (Rx) values
   - If `scaling[athleteLevel]` exists, merge those overrides
   - If `sub` is present in the override, replace the movement name
4. Select `male` or `female` from any `load`/`height` objects

**Example:** OP-009 "Thick Smoke" for a female Intermediate athlete:
- Thruster: 18kg (from `scaling.intermediate.load.female`)
- Jumping Pull-up x 10 (from `scaling.intermediate.sub` + `reps`)
- Box Step-up at 40cm (from `scaling.intermediate.sub` + `height.female`)

## Age Adjustment

Age multipliers are applied at the presentation layer, not stored in the data:

| Age Range | Multiplier |
|-----------|------------|
| 18-29 | 1.00x |
| 30-39 | 0.96x |
| 40-49 | 0.89x |
| 50+ | 0.81x |

For load-based movements, multiply the prescribed weight by the factor. For time-based benchmarks, divide the threshold by the factor (allows more time).

## Reference Bodyweights

Barbell benchmarks are calibrated for:
- Male: ~80kg (176 lb)
- Female: ~60kg (132 lb)

Strength benchmarks include `bwMultiplier` fields for athletes at different bodyweights.

## Versioning

- Benchmark data: semantic versioning (1.0.0)
- Metcon data: follows programming spec version (0.4.0)
- Session data: semantic versioning (1.0.0)
- Level keys and category IDs are stable — they won't change between versions
