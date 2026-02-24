# Movement Progressions & Foundation Milestones

**Version:** 1.0.0

## Overview

OpenProgression v1.0 defines benchmarks for the **trained population** — athletes who can already perform fundamental barbell movements and bodyweight exercises. Movement Progressions and Foundation Milestones extend the standard downward to serve the **untrained and deconditioned population**: people who have never trained, are returning from injury, or are rebuilding after a long break.

This extension is **purely additive**. The 7-level system, benchmark values, percentile mapping, and weakest-link principle are all unchanged.

## Problem Statement

Level 1 (Beginner, 0-20th percentile) covers a massive range of ability:

- A sedentary adult who has never exercised: 0 push-ups, cannot squat to depth, no barbell experience
- An athlete at the top of Beginner: 10 push-ups, 40kg back squat, 60kg deadlift

These two people are months apart in ability, but the standard gives them the same label. For someone starting from zero, the first level-up (Beginner to Beginner+) may take 6-12 months — a long time without measurable progress.

## Movement Progressions

### Concept

Every OP benchmark movement has an implicit chain of prerequisite movements (regressions). A back squat requires the ability to air squat, which requires the ability to sit-to-stand from a chair. Currently OP only tracks the benchmark movement itself. Progressions formalize the regression chain.

These are not new exercises — they are the same progressions used in coaching, physiotherapy, and clinical rehabilitation, now formalized into the OP data model.

### Compatibility with Existing Scaling

The metcon scaling system (`spec/programming.md`) already defines substitution chains for workout scaling:

```
Ring Muscle-up → Bar Muscle-up → C2B → Pull-up → Jumping Pull-up → Ring Row
```

Movement progressions extend this same concept **below** the Beginner scaling level, into foundational patterns that require little or no equipment.

### Progression Structure

Each progression chain targets a specific OP benchmark movement and consists of ordered steps:

```
data/progressions.json → progressions[].steps[]
```

Each step includes:
- **movement** — Unique identifier (snake_case)
- **name** — Human-readable name
- **description** — What the movement is and how to perform it
- **equipment** — What's needed (see Equipment Tags below)
- **criteria** — Pass condition (reps, time, or completion)
- **milestone** — Which Foundation Milestone this step contributes to (if any)
- **sources** — Research citations supporting the movement and criteria

### Progression Chains

#### Squatting → Back Squat

```
Chair Sit-to-Stand (High)  →  Chair Sit-to-Stand (Standard)  →  Air Squat (Partial)
      [F1]                          [F1]                            [F2]

→  Air Squat (Full Depth)  →  Goblet Squat  →  Barbell Back Squat (Empty Bar)
         [F3]                                         → OP Beginner
```

The chair sit-to-stand is the clinical standard for lower body functional fitness assessment (Rikli & Jones, 2013). It is used globally in physiotherapy for post-knee-surgery, fall prevention, and elderly fitness assessment.

#### Pulling → Deadlift

```
Glute Bridge  →  Hip Hinge (PVC)  →  RDL (Bodyweight)  →  KB Deadlift  →  Barbell DL
    [F1]             [F2]                [F3]                                → OP Beginner
```

The glute bridge is a standard physiotherapy exercise for lower back rehab and post-pregnancy recovery. The PVC hip hinge teaches neutral spine mechanics before any loading.

#### Pressing → Strict Press / Bench Press

```
Wall Push-up  →  Incline Push-up  →  Knee Push-up  →  Full Push-up (1 rep)
    [F1]              [F2]              [F2]               [F3]

→  DB Press / DB Bench  →  Barbell Press / Bench (Empty Bar)  → OP Beginner
```

Push-up regressions are documented in NSCA (2016) and ACSM guidelines. Wall push-ups are a standard entry point in shoulder rehab programs.

#### Gymnastics → Strict Pull-up

```
Dead Hang (10s)  →  Dead Hang (30s)  →  Scapular Pull-up  →  Eccentric Pull-up
      [F1]               [F3]

→  Band-Assisted Pull-up  → OP Beginner+ (1 strict pull-up)
```

Note: Pull-ups are 0 at the Beginner level, so this chain leads to Beginner+. Grip strength and hanging capacity are established biomarkers for functional health (Bohannon, 2019).

#### Gymnastics/Core → Toes-to-Bar

```
Plank (10s)  →  Plank (30s)  →  Plank (60s)  →  Hollow Hold  →  Hanging Knee Raise
                    [F2]            [F3]

→  Hanging Leg Raise  → OP Beginner+ (1 T2B)
```

Plank hold norms from McGill et al. (2015) provide evidence-based criteria for core endurance milestones.

#### Monostructural → 1-Mile Run

```
Walk 1km  →  Walk/Run Intervals  →  Run 400m  →  Run 800m  →  Run 1 Mile (any pace)
  [F1]            [F2]                 [F2]          [F3]           [F3]

→ OP Beginner (timed mile)
```

Walking and walk/run interval programs align with WHO (2020) physical activity guidelines and ACSM return-to-running protocols.

### Equipment Tags

Each progression step declares its equipment requirement so applications can filter for equipment-free progressions:

| Tag | Description | Available at Home |
|-----|-------------|:-----------------:|
| `none` | No equipment needed | Yes |
| `chair` | Standard chair or sturdy surface | Yes |
| `resistance_band` | Resistance band | Yes |
| `kettlebell` | Kettlebell or dumbbell | Maybe |
| `pull_up_bar` | Pull-up bar (doorframe or freestanding) | Maybe |
| `barbell` | Barbell and plates | No (gym) |

Apps can show: "Steps 1-4 can be done at home. Steps 5-6 require gym equipment."

### Shared Progression Steps

Some benchmark movements share early progression steps. For example, `strict_press`, `bench_press`, and `push_up` all share the wall push-up → incline push-up → knee push-up → full push-up chain. The `sharedSteps` field in the data file indicates when a progression reuses steps from another chain to avoid duplication.

---

## Foundation Milestones

### Concept

Foundation Milestones are named micro-achievements within the Beginner level that provide visible progress before the first level-up. They are **not levels** — they are pre-level markers that applications can optionally display.

```
Untrained → F1 (Foundation) → F2 (Moving) → F3 (Ready) → Beginner → Beginner+ → ...
                                                            │
                                                            └── OP v1.0 starts here
```

### Design Principles

1. **Achievable quickly** — F1 within 1-2 weeks for most sedentary adults
2. **Cross-category** — Each milestone tests multiple movement categories (like the weakest-link principle)
3. **Equipment-minimal** — F1 requires only a chair and somewhere to hang; F2/F3 are mostly bodyweight
4. **Pass/fail** — Criteria are capability-based, not percentile-based (unlike OP levels)
5. **Research-grounded** — Criteria reference published clinical and exercise science standards

### Milestone Definitions

#### F1: Foundation

*Can perform basic human movements safely. Ready for a bodyweight exercise program.*

| Requirement | Category | Criteria |
|-------------|----------|----------|
| Chair Sit-to-Stand | Squatting | 10 reps without hands |
| Wall Push-up | Pressing | 10 reps |
| Glute Bridge | Pulling | 10 reps |
| Dead Hang | Gymnastics | 10 seconds |
| Walk 1km | Monostructural | Completion |

**Estimated time:** 1-2 weeks for most sedentary adults.

**Evidence:** The chair stand test criteria are based on the Senior Fitness Test (Rikli & Jones, 2013). The 10-second dead hang aligns with minimum grip endurance thresholds (Bohannon, 2019). The 1km walk threshold reflects WHO (2020) minimum physical activity guidelines.

#### F2: Moving

*Can perform bodyweight exercises with good form. Building functional capacity.*

| Requirement | Category | Criteria |
|-------------|----------|----------|
| Air Squat (Partial) | Squatting | 20 reps |
| Incline Push-up | Pressing | 10 reps |
| Hip Hinge (Broomstick) | Pulling | 10 reps |
| Plank Hold | Bodyweight | 30 seconds |
| Walk/Run 800m | Monostructural | Completion |

**Estimated time:** 2-4 weeks from F1.

**Evidence:** The 30-second plank threshold is supported by McGill et al. (2015) normative data. Exercise selections follow NSCA (2016) progression guidelines.

#### F3: Ready

*Movement quality and base fitness sufficient for structured training with equipment. Ready for gym onboarding.*

| Requirement | Category | Criteria |
|-------------|----------|----------|
| Air Squat (Full Depth) | Squatting | 20 reps |
| Full Push-up | Pressing | 1 rep |
| RDL (Bodyweight) | Pulling | 10 reps |
| Dead Hang | Gymnastics | 30 seconds |
| Run 1 Mile | Monostructural | Completion (any pace) |
| Plank Hold | Bodyweight | 60 seconds |

**Estimated time:** 4-8 weeks from F2.

**Evidence:** The 60-second plank threshold aligns with "good" core endurance in healthy populations (McGill et al., 2015). The ability to run one continuous mile is a standard baseline aerobic capacity marker (ACSM).

### Milestone Assessment

Unlike OP levels (which use quantitative benchmarks from normative data), Foundation Milestones are **pass/fail capability checks**:

1. Can you perform the movement? (capability)
2. Can you perform it safely? (form quality)
3. Can you perform it for the specified volume? (capacity)

This is closer to how coaches actually onboard new members: "Can you squat to depth? Can you hinge properly? OK, you're ready for a barbell."

### Weakest-Link Principle for Milestones

Milestones follow the same weakest-link principle as OP levels: **all requirements must be met** to achieve a milestone. If someone can do 20 air squats and run a mile but cannot hold a 30-second plank, they remain at F1 until their core endurance catches up.

This is consistent with the OP philosophy of encouraging well-rounded fitness.

---

## Rehab and Physiotherapy Overlap

Many foundation progression steps are identical to standard physiotherapy exercises:

| Progression Step | Clinical Context |
|-----------------|-----------------|
| Chair Sit-to-Stand | Post-knee surgery, elderly fall prevention (SFT) |
| Glute Bridge | Lower back rehab, post-pregnancy recovery |
| Wall Push-up | Shoulder rehab, post-surgery upper body |
| Dead Hang | Shoulder mobility, grip rehab |
| Walk/Run Intervals | Cardiac rehab, return-to-activity protocols |
| Plank Hold | Core stability, lower back pain management |

This overlap is by design. Functional fitness movements **are** human movement patterns, and the regressions are how physiotherapists rebuild them. Formalizing this in OP makes the standard useful from rehabilitation through elite performance.

---

## Compatibility

| Existing OP Feature | Impact |
|---------------------|--------|
| 7 levels | No change |
| Benchmark values | No change |
| Percentile mapping | No change |
| Weakest-link principle | No change (milestones also use it) |
| Metcon scaling | No change (scaling already goes below Beginner) |
| Level calculation | No change (milestones are a separate concept) |
| `data/benchmarks/*.json` | No change |
| `data/sources.json` | 5 new sources added |
| New: `data/progressions.json` | Additive |
| New: `data/milestones.json` | Additive |

Implementations that do not support progressions or milestones continue to work exactly as before. All new data is in separate files.

---

## Data Files

### `data/progressions.json`

Contains movement progression chains organized by target benchmark movement. See the file for full schema.

### `data/milestones.json`

Contains Foundation Milestone definitions (F1, F2, F3) with requirements and criteria. See the file for full schema.

---

## Research Sources

| Source | Used For |
|--------|----------|
| Rikli & Jones (2013) | Chair stand test criteria, functional fitness assessment |
| NSCA Essentials (2016) | Exercise progression/regression principles |
| WHO (2020) | Physical activity baseline thresholds |
| McGill et al. (2015) | Plank hold normative data |
| Bohannon (2019) | Grip strength and hanging as functional markers |
| ACSM Guidelines | Push-up progressions, aerobic capacity baselines |

Full citations in `data/sources.json`.

---

## Open Questions

1. **Video references**: Progression steps could include `videoId` fields linking to instructional content. Should this be part of the standard or left to implementers?

2. **Age adjustment**: F1/F2/F3 criteria are intentionally set low enough for healthy adults of any age. Age-specific variations may not be necessary at this level but could be explored in future versions.

3. **Milestone naming**: F1/F2/F3 is functional but could be made more motivating. Alternatives considered: Foundation/Moving/Ready (current), Bronze/Silver/Gold, Seed/Sprout/Bloom. The current names were chosen for clarity over inspiration.
