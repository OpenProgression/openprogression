# OpenProgression Programming Specification

**Version:** 0.1.0 (Draft)

## Session Structure

A standard OP session follows three parts:

| Part | Purpose | Example |
|------|---------|---------|
| **Warmup** | Prepare for the session's demands | 3 rounds: 200m row, 10 PVC pass-throughs, 10 air squats |
| **Strength / Skill** | Build capacity in a specific domain | 5x3 Weighted Ring Dips, building |
| **Metcon** | The named workout — metabolic conditioning | OP-047 "Thick Smoke" |

The metcon is the only part that carries a name and code. Warmup and strength blocks are described but not named.

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

| Type | Format | Scoring |
|------|--------|---------|
| **For Time** | Complete the work as fast as possible | Time (lower is better) |
| **AMRAP** | As many rounds/reps as possible in a time cap | Rounds + reps (higher is better) |
| **EMOM** | Every minute on the minute | Completion (pass/fail per round) |
| **For Load** | Build to a max within a workout structure | Weight (higher is better) |
| **Intervals** | Repeated efforts with prescribed rest | Time per interval or total |

## Level Targeting

Metcons are not named by level, but each metcon should specify:

- **Rx weights** (the default prescribed load)
- **Scaling guidance** per OP level where applicable
- **Intended stimulus** — time domain, feel, target effort

The OP level system determines how athletes scale, not which metcons they do. All athletes do the same metcon, scaled to their level.

## Data Structure (Future)

When programming moves to structured data, each metcon would follow:

```json
{
  "code": "OP-047",
  "name": "Thick Smoke",
  "type": "for_time",
  "rounds": 3,
  "movements": [
    { "movement": "thruster", "reps": 15, "load": { "male": 43, "female": 30 }, "unit": "kg" },
    { "movement": "pull_up", "reps": 12 },
    { "movement": "box_jump", "reps": 9, "height": { "male": 60, "female": 50 }, "unit": "cm" }
  ],
  "timeCap": null,
  "stimulus": "Moderate grind. Should take 8-14 minutes. Thrusters should be challenging but unbroken for most athletes at Rx.",
  "scaling": {
    "intermediate": { "notes": "Reduce thruster load to 30/20kg, sub ring rows for pull-ups" },
    "beginner": { "notes": "Reduce to 20/15kg thrusters, banded pull-ups, step-ups" }
  }
}
```

This structure is a draft and will be finalized when the programming feature is built.
