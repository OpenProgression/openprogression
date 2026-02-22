# OpenProgression Methodology

**Version:** 1.0.0

## How Benchmarks Are Derived

Every benchmark in the OpenProgression standard is derived from publicly available, citable data. No benchmark is copied from any proprietary system. This document explains the methodology used to determine benchmark values and provides full source citations.

## Percentile Mapping

The foundation of OP is a percentile-based mapping system. Each of the 7 levels corresponds to a percentile range within the **trained population** (people who regularly engage in structured fitness training):

| Level | Percentile Range | Population Description |
|-------|-----------------|----------------------|
| Beginner | 0-20th | Bottom quintile of trained population |
| Beginner+ | 20-35th | Below median but beyond initial adaptation |
| Intermediate | 35-50th | Around the median of trained athletes |
| Intermediate+ | 50-65th | Above median, requires periodized training |
| Advanced | 65-80th | Well above average, multi-year training |
| Advanced+ | 80-95th | Top quintile, competition-level |
| Rx | 95-100th | Top 5%, elite performance |

To convert this mapping into specific numbers, we reference datasets that provide percentile distributions for each benchmark movement.

## Source Categories

### Tier 1: Peer-Reviewed Research

The strongest evidence comes from studies published in peer-reviewed scientific journals:

**Ball & Weidman (2024)**
- "Normative data for the squat, bench press and deadlift exercises in powerlifting: Data from 809,986 competition entries"
- *Journal of Science and Medicine in Sport*
- Sample: 809,986 competition entries (571,650 male, 238,336 female)
- Coverage: Squat, bench press, deadlift — percentile data by bodyweight class, age, and sex
- DOI: https://pubmed.ncbi.nlm.nih.gov/39060209/
- **Used for:** Squatting, Pulling, and Pressing category benchmarks

**Mangine, Grundlingh & Feito (2023)**
- "Normative scores for CrossFit Open workouts: 2011-2022"
- *Sports*, 11(2), 24
- Sample: 569,607 athletes across 12 years
- Coverage: Percentile scores for all 60 Open workouts, separated by sex
- DOI: https://pmc.ncbi.nlm.nih.gov/articles/PMC9960888/
- **Used for:** Endurance and Gymnastics category benchmarks

**Mangine et al. (2020)**
- "Determination of a CrossFit Benchmark Performance Profile"
- *International Journal of Exercise Science*
- Sample: 162 athletes (66 male, 96 female)
- Coverage: Percentile data for 6 lifts and 3 benchmark WODs
- DOI: https://pmc.ncbi.nlm.nih.gov/articles/PMC8228530/
- **Used for:** Olympic Lifting and Endurance benchmarks

**Butcher et al. (2018)**
- "Normative Values for Self-Reported Benchmark Workout Scores in CrossFit Practitioners"
- *Sports Medicine - Open*
- Coverage: Large-scale normative data for benchmark workouts by gender, age, and competition level
- DOI: https://link.springer.com/article/10.1186/s40798-018-0156-x
- **Used for:** Endurance category benchmarks

**ACSM Guidelines for Exercise Testing and Prescription**
- Professional standard for fitness assessment
- Coverage: Push-up norms by age and gender, VO2max classification, bench press ratios
- **Used for:** Bodyweight and Monostructural benchmarks

**Cooper Institute (1997)**
- Physical Fitness Specialist Certification Manual
- Coverage: VO2max normative tables, cardiovascular fitness classification
- **Used for:** Monostructural benchmark calibration

### Tier 2: Published Standards

Widely recognized classification systems from credentialed practitioners:

**Kilgore, L. (2023)**
- Lon Kilgore Strength Standard Tables
- Based on decades of competitive and recreational barbell lifting data
- 5-tier classification: Untrained, Novice, Intermediate, Advanced, Elite
- URL: http://lonkilgore.com/resources/Lon_Kilgore_Strength_Standard_Tables-Copyright-2023.pdf
- **Used for:** Calibrating barbell strength benchmarks across levels

**Everett, G. (2018)**
- Olympic Weightlifting Skill Levels Chart, Catalyst Athletics
- 7 skill levels based on US competition performance data
- URL: https://www.catalystathletics.com/article/1836/Olympic-Weightlifting-Skill-Levels-Chart/
- **Used for:** Olympic Lifting level calibration and lift ratio relationships

### Tier 3: Public Databases

Large-scale, publicly accessible performance databases:

**Concept2 Logbook Rankings**
- Official world rankings for indoor rowing and skiing
- Self-reported data from Concept2 erg users worldwide
- Sample sizes: 1,000-10,000+ entries per distance/sex
- URL: https://log.concept2.com/rankings
- **Used for:** Monostructural benchmarks (rowing)

**RunningLevel.com**
- Race time standards aggregated from 1,000,000+ race results
- Percentile-based classification by age and gender
- URL: https://runninglevel.com
- **Used for:** Monostructural benchmarks (running distances)

**StrengthLevel.com**
- Community-sourced exercise performance data
- Sample sizes: 30,000-600,000+ per exercise
- 5-tier classification based on percentile rank
- URL: https://strengthlevel.com
- **Used for:** Gymnastics and Bodyweight benchmarks

### Tier 4: Government / Public Domain

**U.S. Military Physical Fitness Test Standards**
- Published by the Department of Defense (public domain)
- USMC PFT, Army AFT, Navy PRT, Navy SEAL PST
- Specific rep/time requirements by age and gender
- **Used for:** Bodyweight and Gymnastics benchmark calibration (push-ups, pull-ups, running)

### Tier 5: Official Competition Data

**CrossFit Open Workout Analysis**
- Post-workout analysis articles from CrossFit Games
- Population-level completion rates for specific movements
- URL: https://games.crossfit.com
- **Used for:** Gymnastics movement capability benchmarks (e.g., % of athletes who can perform muscle-ups)

**CrossFit Liftoff Data (2015)**
- Percentile data for snatch and clean & jerk from large-scale open event
- URL: https://games.crossfit.com/article/liftoff-data
- **Used for:** Olympic Lifting benchmarks

## Derivation Process

For each benchmark, we follow this process:

1. **Identify the best available data source(s)** — peer-reviewed > published standards > public databases
2. **Extract percentile distributions** from the data
3. **Map percentiles to OP levels** using the 7-level percentile ranges
4. **Cross-reference** with at least one additional source where possible
5. **Round to practical values** that are meaningful in a gym setting (e.g., nearest 5kg for barbell lifts)
6. **Document sources** in the benchmark JSON file

When multiple sources provide data for the same benchmark:
- Peer-reviewed data takes precedence
- Sources are weighted by sample size
- Values are adjusted if sources represent different populations (e.g., competitive powerlifters vs. general gym-goers)

## Bodyweight Normalization

Barbell strength benchmarks are published as **absolute values** for reference bodyweights:
- Male reference: ~80kg (176 lb)
- Female reference: ~60kg (132 lb)

These reference weights approximate the median bodyweight of trained adults in published studies. For athletes at different bodyweights, standards should be adjusted proportionally. Strength scales roughly with the 2/3 power of bodyweight (Allometric scaling), though this relationship varies by lift and training status.

## Population Definition

The OP percentile ranges reference the **trained population** — adults who engage in regular, structured fitness training (at minimum 3 sessions per week for several months). This is distinct from:

- The **general population** (which would make OP levels too easy for trained athletes)
- The **competitive population** (which would make OP levels unreachable for recreational athletes)

Most of our data sources (Concept2 logbook, CrossFit Open, StrengthLevel.com) represent self-selected trained individuals, which aligns well with this target population.

## Limitations

1. **Self-reported data** — Some sources (StrengthLevel, Concept2 logbook) rely on self-reported performance. This may introduce upward bias.

2. **Population skew** — CrossFit Open athletes, powerlifting competitors, and Concept2 users are not identical populations. We account for this in our cross-referencing.

3. **Absolute vs. relative strength** — Barbell benchmarks are given as absolute values, which inherently favor heavier athletes. Future versions may add bodyweight-ratio standards.

4. **Limited gymnastics research** — Peer-reviewed normative data for pull-ups, muscle-ups, and HSPU is sparse. We supplement with military standards (public domain) and community databases.

5. **Cultural and equipment variation** — Standards assume access to standard equipment (barbell, pull-up bar, Concept2 erg). Athletes training with different equipment may need adjusted benchmarks.

## Versioning

The OP standard uses semantic versioning:
- **Major version** (1.x.x) — Significant changes to level definitions, category structure, or methodology
- **Minor version** (x.1.x) — New benchmarks added, existing benchmarks refined
- **Patch version** (x.x.1) — Corrections, source updates, clarifications

Benchmark values may be adjusted in minor versions as new research becomes available. All changes are documented in the changelog.

## Contributing to Methodology

We welcome contributions that improve the evidence base:

- Peer-reviewed studies with normative fitness data
- Large-scale datasets from competitions or tracking platforms
- Analysis of existing OP benchmarks against real-world athlete data
- Proposals for new assessment categories or movements

See [CONTRIBUTING.md](../CONTRIBUTING.md) for how to submit methodology improvements.
