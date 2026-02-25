# Movement Progressions & Foundation Milestones

**Version:** 1.0.0

## Overview

OpenProgression v1.0 defines benchmarks for the **trained population** -- athletes who can already perform fundamental barbell movements and bodyweight exercises. Movement Progressions and Foundation Milestones extend the standard downward to serve the **untrained and deconditioned population**: people who have never trained, are returning from injury, or are rebuilding after a long break.

This extension is **purely additive**. The 7-level system, benchmark values, percentile mapping, and weakest-link principle are all unchanged.

## Problem Statement

Level 1 (Beginner, 0-20th percentile) covers a massive range of ability:

- A sedentary adult who has never exercised: 0 push-ups, cannot squat to depth, no barbell experience
- An athlete at the top of Beginner: 10 push-ups, 40kg back squat, 60kg deadlift

These two people are months apart in ability, but the standard gives them the same label. For someone starting from zero, the first level-up (Beginner to Beginner+) may take 6-12 months -- a long time without measurable progress.

## Movement Progressions

### Concept

Every OP benchmark movement has an implicit chain of prerequisite movements (regressions). A back squat requires the ability to air squat, which requires the ability to sit-to-stand from a chair. Currently OP only tracks the benchmark movement itself. Progressions formalize the regression chain.

These are not new exercises -- they are the same progressions used in coaching, physiotherapy, and clinical rehabilitation, now formalized into the OP data model.

### Design Principles

1. **Home-first** -- Early steps in every chain require no gym equipment. A chair, a wall, a floor, and a resistance band cover F1 and F2 entirely.
2. **No pull-up bar required until F2+** -- Dead hangs are valuable but require equipment not available in every home. Farmer's carry and band exercises provide grip and pulling work without a bar.
3. **Research-grounded** -- Every step cites published exercise science or clinical literature.
4. **Gradual steps** -- Smaller jumps than programs like Couch to 5K, which has high dropout rates partly due to large progression jumps.

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
- **movement** -- Unique identifier (snake_case)
- **name** -- Human-readable name
- **description** -- What the movement is and how to perform it
- **equipment** -- What's needed (see Equipment Tags below)
- **criteria** -- Pass condition (reps, time, completion, or either)
- **milestone** -- Which Foundation Milestone this step contributes to (if any)
- **sources** -- Research citations supporting the movement and criteria

### Criteria Types

| Type | Fields | Example |
|------|--------|---------|
| `reps` | `target`, optional `load`/`unit` | `{ "type": "reps", "target": 10 }` |
| `time` | `target`, `unit` | `{ "type": "time", "target": 30, "unit": "seconds" }` |
| `completion` | optional `details` | `{ "type": "completion" }` |
| `either` | `options[]` | Pass if **any one** option is met |

The `either` type allows alternative pass criteria -- useful when a milestone can be achieved via different movements (e.g., dead hang OR farmer's carry). Each option in the `options` array has `movement`, `type`, and `target`:

```json
{
  "type": "either",
  "options": [
    { "movement": "dead_hang_30s", "type": "time", "target": 30, "unit": "seconds" },
    { "movement": "farmers_carry_60s", "type": "time", "target": 60, "unit": "seconds" }
  ]
}
```

### Progression Chains

#### Squatting → Back Squat

```
Chair Sit-to-Stand (High)  →  Chair Sit-to-Stand (Standard)  →  Box Squat (to chair)
          [F1]                          [F1]                           [F2]

→  Air Squat (Partial)  →  Air Squat (Full Depth)  →  Goblet Squat  →  BB Back Squat
         [F2]                     [F3]                                    → OP Beginner
```

The chair sit-to-stand is the clinical standard for lower body functional fitness assessment (Rikli & Jones, 2013; validated by Jones, Rikli & Beam, 1999 with test-retest reliability r=0.89 across 7,183 participants aged 60-94). The box squat provides a safety net and depth target as a bridge between assisted and free squatting -- a standard PT progression step (NSCA, 2016; Fragala et al., 2019).

#### Pulling → Deadlift

```
Glute Bridge  →  Hip Hinge (PVC)  →  RDL (Bodyweight)  →  KB Deadlift  →  Barbell DL
    [F1]             [F2]                [F3]                                → OP Beginner
```

The glute bridge is a standard physiotherapy exercise for lower back rehab and post-pregnancy recovery. The PVC hip hinge teaches neutral spine mechanics before any loading (NSCA, 2016).

#### Pressing → Strict Press / Bench Press

```
Wall Push-up  →  Incline Push-up  →  Knee Push-up  →  Full Push-up (1 rep)
    [F1]              [F2]              [F2]               [F3]

→  DB Press / DB Bench  →  Barbell Press / Bench (Empty Bar)  → OP Beginner
```

Push-up regressions are documented in NSCA (2016) and ACSM guidelines. Each incline change adjusts the percentage of bodyweight being pressed. Wall push-ups are a standard entry point in shoulder rehab programs.

#### Gymnastics → Strict Pull-up

```
Farmer's Carry (30s)  →  Band Pull-apart  →  Seated Band Row  →  Dead Hang (10s)
        [F1]                  [F1]                [F2]                 [F2]

→  Dead Hang (30s)  →  Scapular Pull-up  →  Eccentric Pull-up  →  Band-Assisted Pull-up
        [F3]
                                                              → OP Beginner+ (1 strict pull-up)
```

This chain starts with **no pull-up bar required**. Farmer's carry develops grip strength using household items (bags, water bottles). Band pull-aparts and seated band rows build scapular retraction and upper back strength with a resistance band -- a standard home-based horizontal pulling exercise for older adults (Fragala et al., 2019). Dead hangs enter at F2 once grip and shoulder capacity are established.

Note: Pull-ups are 0 at the Beginner level, so this chain leads to Beginner+. Grip strength is an established biomarker for functional health and all-cause mortality in older adults (Bohannon, 2019).

#### Core → Toes-to-Bar (McGill Big 3 Foundation)

```
McGill Curl-up  →  Bird Dog  →  Side Plank (knees)  →  Plank (30s)  →  Side Plank (full)
     [F1]           [F1]            [F1]                   [F2]             [F2]

→  Plank (60s)  →  Hollow Hold  →  Hanging Knee Raise  →  Hanging Leg Raise
      [F3]
                                                          → OP Beginner+ (1 T2B)
```

The core progression is built on the **McGill Big 3** -- three anti-movement exercises that are the clinical standard for spine health and core development (McGill, 2015):

1. **Curl-up** -- anti-extension (protects the lower back)
2. **Bird dog** -- anti-rotation (trains spinal stability)
3. **Side plank** -- anti-lateral-flexion (builds lateral core endurance)

McGill's research explicitly argues against traditional sit-ups and crunches, which load the spine through repeated flexion. The Big 3 trains the core's primary function: **resisting unwanted movement** to protect the spine.

Plank normative data from Strand et al. (2014, n=471) and McGill et al. (2015) provide evidence-based thresholds. For adults aged 50-59, 30-60 seconds is a strong plank hold; plank endurance decreases approximately 10-15% per decade after age 35.

#### Monostructural → 1-Mile Run

```
Walk 10 min  →  Walk 1km  →  Walk/Run Intervals  →  Run 400m  →  Run 800m  →  Run 1 Mile
    [F1]          [F1]            [F2]                  [F2]         [F3]         [F3]

→ OP Beginner (timed mile)
```

The progression starts with **10-minute continuous walking** -- the absolute baseline for sedentary adults. WHO (2020) and ACSM (Chodzko-Zajko et al., 2009) both recommend replacing sedentary time with light activity as the first step.

This progression has more intermediate steps than Couch to 5K, which has high dropout rates partly due to large progression jumps (e.g., 5-minute to 20-minute continuous running in Week 5). Our intervals (1 min run / 2 min walk) are more gradual than C25K Week 1 (60s run / 90s walk).

### Equipment Tags

Each progression step declares its equipment requirement so applications can filter for equipment-free progressions:

| Tag | Description | Available at Home |
|-----|-------------|:-----------------:|
| `none` | No equipment needed | Yes |
| `chair` | Standard chair or sturdy surface | Yes |
| `resistance_band` | Resistance band (~$10-25) | Yes |
| `free_weight` | Kettlebell or dumbbell | Maybe |
| `pull_up_bar` | Pull-up bar (doorframe or freestanding) | Maybe |
| `barbell` | Barbell and plates | No (gym) |

Apps can show: "Steps 1-4 can be done at home. Steps 5+ require gym equipment."

### Shared Progression Steps

Some benchmark movements share early progression steps. For example, `strict_press`, `bench_press`, and `push_up` all share the wall push-up → incline push-up → knee push-up → full push-up chain. The `sharedSteps` field in the data file indicates when a progression reuses steps from another chain to avoid duplication.

---

## Foundation Milestones

### Concept

Foundation Milestones are named micro-achievements within the Beginner level that provide visible progress before the first level-up. They are **not levels** -- they are pre-level markers that applications can optionally display.

```
Untrained → F1 (Foundation) → F2 (Moving) → F3 (Ready) → Beginner → Beginner+ → ...
                                                            │
                                                            └── OP v1.0 starts here
```

### Design Principles

1. **Achievable quickly** -- F1 within 1-2 weeks for most sedentary adults
2. **Cross-category** -- Each milestone tests multiple movement categories (like the weakest-link principle)
3. **Equipment-minimal** -- F1 requires only a chair and household items; F2 adds a resistance band; F3 optionally adds a pull-up bar
4. **Pass/fail** -- Criteria are capability-based, not percentile-based (unlike OP levels)
5. **Research-grounded** -- Criteria reference published clinical and exercise science standards

### Timeline Caveat

Estimated timelines assume a **healthy but sedentary adult** training 3x/week. For deconditioned, frail, or post-injury individuals, timelines may be 2-3x longer. The ICFSR expert consensus (Dent et al., 2021) recommends 3-5 months of multicomponent training as the minimum for meaningful functional improvement in frail older adults. The NSCA (Fragala et al., 2019) recommends increasing intensity or duration no more than once every 4 weeks for older adults.

### Milestone Definitions

#### F1: Foundation

*Can perform basic human movements safely. Ready for a bodyweight exercise program.*

| Requirement | Category | Criteria |
|-------------|----------|----------|
| Chair Sit-to-Stand | Squatting | 10 reps without hands |
| Wall Push-up | Pressing | 10 reps |
| Glute Bridge | Pulling | 10 reps |
| Farmer's Carry | Gymnastics | 30 seconds with ~5kg per hand |
| Walk 1km | Monostructural | Completion |

**Estimated time:** 1-2 weeks for healthy sedentary adults. 4-6 weeks for deconditioned individuals.

**Evidence:** The chair stand test criteria (10 reps) are well below the normal range for all age groups 60-94 in the Senior Fitness Test (Rikli & Jones, 2013; Jones, Rikli & Beam, 1999: n=7,183, test-retest r=0.89). The farmer's carry tests grip endurance -- a key functional health biomarker (Bohannon, 2019) -- without requiring a pull-up bar. The 1km walk threshold reflects WHO (2020) minimum physical activity guidelines.

**Why farmer's carry instead of dead hang:** A dead hang requires a pull-up bar, which is not available in most homes. The farmer's carry tests the same functional grip capacity using household items (shopping bags, water bottles, etc.) and is accessible to everyone. Dead hangs enter the progression at F2.

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

**Evidence:** The 30-second plank threshold is supported by McGill et al. (2015) and Strand et al. (2014, n=471) normative data. For adults aged 50+, 30 seconds represents adequate baseline core endurance. Exercise selections follow NSCA (2016) and Fragala et al. (2019) progression guidelines for older adults.

#### F3: Ready

*Movement quality and base fitness sufficient for structured training with equipment. Ready for gym onboarding.*

| Requirement | Category | Criteria |
|-------------|----------|----------|
| Air Squat (Full Depth) | Squatting | 20 reps |
| Full Push-up | Pressing | 1 rep |
| RDL (Bodyweight) | Pulling | 10 reps |
| Dead Hang OR Farmer's Carry | Gymnastics | 30 seconds hang, OR 60 seconds carry (~8kg/hand) |
| Run 1 Mile | Monostructural | Completion (any pace) |
| Plank Hold | Bodyweight | 60 seconds |

**Estimated time:** 4-8 weeks from F2.

**Evidence:** The 60-second plank threshold aligns with "good" core endurance in healthy populations (McGill et al., 2015; Strand et al., 2014). The ability to run one continuous mile is a standard baseline aerobic capacity marker (ACSM). The dead hang / farmer's carry alternative ensures this milestone is achievable both at home and in a gym.

### Milestone Assessment

Unlike OP levels (which use quantitative benchmarks from normative data), Foundation Milestones are **pass/fail capability checks**:

1. Can you perform the movement? (capability)
2. Can you perform it safely? (form quality)
3. Can you perform it for the specified volume? (capacity)

This is closer to how coaches actually onboard new members: "Can you squat to depth? Can you hinge properly? OK, you're ready for a barbell."

### Weakest-Link Principle for Milestones

Milestones follow the same weakest-link principle as OP levels: **all requirements must be met** to achieve a milestone. If someone can do 20 air squats and run a mile but cannot hold a 30-second plank, they remain at F1 until their core endurance catches up.

This is consistent with the OP philosophy of encouraging well-rounded fitness.

### Categories Not Covered by Foundation Milestones

Foundation Milestones intentionally exclude two OP categories:

- **Olympic Lifting** -- The clean, snatch, and clean & jerk are technically demanding movements that require coached instruction and cannot be safely self-taught through a progression chain. Foundation-level athletes should focus on the squat, hinge, and press patterns that underpin Olympic lifts.
- **Endurance (Benchmark WODs)** -- Fran, Grace, Murph, and Cindy combine barbell, gymnastics, and monostructural movements at intensity. They require proficiency in their component movements before being trained as workouts. The running/monostructural chain already covers aerobic base building.

Both categories are fully covered by the existing OP level benchmarks once an athlete reaches the Beginner level.

---

## Rehab and Physiotherapy Overlap

Many foundation progression steps are identical to standard physiotherapy exercises:

| Progression Step | Clinical Context |
|-----------------|-----------------|
| Chair Sit-to-Stand | Post-knee surgery, elderly fall prevention (SFT) |
| Glute Bridge | Lower back rehab, post-pregnancy recovery |
| Wall Push-up | Shoulder rehab, post-surgery upper body |
| McGill Curl-up | Lower back pain management, post-injury core rehab |
| Bird Dog | Spinal stability, lower back rehab |
| Side Plank | Lateral core stability, scoliosis management |
| Farmer's Carry | Grip rehab, functional independence assessment |
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
| `data/levels.json` | **No change** -- level definitions, IDs, and colors are untouched |
| `data/benchmarks/*.json` | No change |
| `data/sources.json` | 9 new sources added |
| New: `data/progressions.json` | Additive |
| New: `data/milestones.json` | Additive |

**Foundation Milestones are not levels.** They do not alter `data/levels.json` in any way. Applications that ignore `data/milestones.json` and `data/progressions.json` continue to function exactly as before -- the 7-level system is completely unchanged. Milestones are an optional layer that apps can adopt independently.

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
| Jones, Rikli & Beam (1999) | 30-second chair stand test validation (n=7,183, r=0.89) |
| NSCA Essentials (2016) | Exercise progression/regression principles |
| Fragala et al. (2019) | NSCA resistance training guidelines for older adults |
| Chodzko-Zajko et al. (2009) | ACSM position stand on exercise and older adults |
| WHO (2020) | Physical activity baseline thresholds |
| McGill et al. (2015) | Core endurance assessment, McGill Big 3 |
| Strand et al. (2014) | Plank and core endurance normative data (n=471) |
| Bohannon (2019) | Grip strength as functional health biomarker |
| ACSM Guidelines | Push-up progressions, aerobic capacity baselines |

Full citations in `data/sources.json`.

---

## Open Questions

1. **Video references**: Progression steps could include `videoId` fields linking to instructional content. Should this be part of the standard or left to implementers?

2. **Age adjustment**: F1/F2/F3 criteria are intentionally set low enough for healthy adults of any age. Age-specific variations may not be necessary at this level but could be explored in future versions.

3. **Milestone naming**: F1/F2/F3 is functional but could be made more motivating. Alternatives considered: Foundation/Moving/Ready (current), Bronze/Silver/Gold, Seed/Sprout/Bloom. The current names were chosen for clarity over inspiration.
