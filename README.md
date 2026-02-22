<p align="center">
  <a href="https://openprogression.org">
    <img src="assets/banner.svg" alt="OpenProgression" width="800" />
  </a>
</p>

<p align="center">
  <strong>7 levels. 8 categories. Research-backed benchmarks derived from over 1.3 million data points.</strong>
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://openprogression.org"><img src="https://img.shields.io/badge/Standard-v1.0.0-teal.svg" alt="Standard v1.0.0" /></a>
  <a href="https://github.com/OpenProgression/openprogression/issues"><img src="https://img.shields.io/github/issues/OpenProgression/openprogression.svg" alt="Issues" /></a>
  <a href="https://github.com/OpenProgression/openprogression/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" /></a>
</p>

---

## What is OpenProgression?

OpenProgression (OP) is a **free, open standard** for classifying athletic ability across functional fitness. It provides a common language for coaches, athletes, and software to describe fitness levels — from first-day beginner to elite competitor.

<table>
<tr>
<td>

**Open** — Free to use, implement, and contribute to

</td>
<td>

**Research-backed** — Every benchmark traces to peer-reviewed studies or public-domain data

</td>
</tr>
<tr>
<td>

**Gym-agnostic** — Works for any functional fitness facility, not tied to any brand

</td>
<td>

**Community-driven** — Standards improve through open contribution

</td>
</tr>
</table>

## The 7 Levels

<p align="center">
  <img src="assets/levels.svg" alt="The 7 OpenProgression levels from Beginner to Rx" width="800" />
</p>

| Level | Name | Percentile | Description |
|:-----:|------|:----------:|-------------|
| 1 | **Beginner** | 0-20th | New to structured training |
| 2 | **Beginner+** | 20-35th | Fundamentals mastered, building consistency |
| 3 | **Intermediate** | 35-50th | Solid across all categories, handles moderate loads |
| 4 | **Intermediate+** | 50-65th | Competent athlete, proficient across all domains |
| 5 | **Advanced** | 65-80th | Strong and skilled, competition-capable |
| 6 | **Advanced+** | 80-95th | Competition-level fitness across all domains |
| 7 | **Rx** | 95-100th | Elite performance, top 5% of trained athletes |

> Levels are determined by the **weakest-link principle**: your overall level equals your lowest category level. This encourages well-rounded fitness rather than specialization.

## The 8 Categories

| Category | Key Movements |
|----------|--------------|
| **Squatting** | Back Squat, Front Squat, Overhead Squat |
| **Pulling** | Deadlift, Sumo Deadlift |
| **Pressing** | Strict Press, Push Press, Bench Press |
| **Olympic Lifting** | Clean, Snatch, Clean & Jerk |
| **Gymnastics** | Pull-ups, HSPU, Muscle-ups, Toes-to-Bar |
| **Monostructural** | 500m Row, 2000m Row, 1-Mile Run, 5K Run |
| **Bodyweight** | Push-ups, Pistols, Double-unders |
| **Endurance** | Fran, Grace, Murph, Cindy |

## Quick Example

An 80kg male who can:

| Category | Result | Level |
|----------|--------|:-----:|
| Back Squat | 105kg | Intermediate+ |
| Deadlift | 150kg | Intermediate+ |
| Strict Press | 55kg | Intermediate+ |
| Clean & Jerk | 95kg | Intermediate+ |
| Strict Pull-ups | 9 reps | Intermediate+ |
| 2000m Row | 7:15 | Intermediate+ |
| Push-ups | 40 reps | Intermediate+ |
| Fran | 4:30 | Intermediate+ |

**Overall level: Intermediate+** — all categories at INT+ or above.

But if their pull-ups were only 4 (Intermediate), their overall level drops to **Intermediate** — the weakest link determines the chain.

## Repository Structure

```
openprogression/
├── spec/               # The standard (human-readable)
│   ├── levels.md
│   ├── categories.md
│   └── methodology.md
├── data/               # Machine-readable benchmark data
│   ├── levels.json
│   ├── categories.json
│   ├── sources.json
│   └── benchmarks/
│       ├── squatting.json
│       ├── pulling.json
│       ├── pressing.json
│       ├── olympic_lifting.json
│       ├── gymnastics.json
│       ├── monostructural.json
│       ├── bodyweight.json
│       └── endurance.json
└── website/            # openprogression.org (Next.js)
```

## Using the Data

The benchmark data is published as JSON and can be consumed by any application:

```typescript
// Example: Load and use OP benchmarks
import squatting from '@openprogression/data/benchmarks/squatting.json'

function getLevel(movement: string, gender: 'male' | 'female', value: number) {
  const benchmark = squatting.benchmarks.find(b => b.movement === movement)
  if (!benchmark) return null

  const levelOrder = ['rx', 'advanced_plus', 'advanced', 'intermediate_plus',
                      'intermediate', 'beginner_plus', 'beginner']

  for (const level of levelOrder) {
    const standard = benchmark.standards[level][gender]
    if (value >= standard) return level
  }
  return 'beginner'
}

// A 80kg male with 105kg back squat
getLevel('back_squat', 'male', 105) // => 'intermediate_plus'
```

## Research Foundation

All benchmarks are derived from published, citable sources:

| Source | Type | Sample Size |
|--------|------|:-----------:|
| Ball & Weidman (2024) | Peer-reviewed (J Sci Med Sport) | 809,986 |
| Mangine et al. (2023) | Peer-reviewed (Sports) | 569,607 |
| Concept2 Logbook Rankings | Public database | 10,000+ per distance |
| RunningLevel.com | Aggregated race data | 1,000,000+ |
| U.S. Military PFT Standards | Public domain (DoD) | Entire service branches |
| ACSM/Cooper Institute | Professional standard | Large-scale testing cohorts |
| Catalyst Athletics | Published standard | Competition data |
| StrengthLevel.com | Community database | 30,000-600,000+ per exercise |

Full source details with citations: [`data/sources.json`](data/sources.json) | Methodology: [`spec/methodology.md`](spec/methodology.md)

## For Coaches

OpenProgression gives you a shared framework to:

- **Assess** new members and place them in appropriate scaling
- **Scale** workouts across 7 clearly defined levels
- **Track** athlete progression over time with objective benchmarks
- **Communicate** fitness levels in a way every coach understands

The weakest-link principle ensures athletes develop well-rounded fitness rather than hiding behind their strengths.

## For Developers

Build OP into your gym management software, workout tracking app, or coaching platform:

- JSON data files ready to import
- Clear schema with TypeScript-friendly structure
- Gender-differentiated standards
- Source citations for every benchmark
- MIT licensed — use it however you want

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

- **Review benchmarks** — Are the numbers accurate for your experience?
- **Add movements** — Help expand the movement library
- **Improve methodology** — Suggest better research sources
- **Build integrations** — Create packages for your language/framework

## License

MIT License. See [LICENSE](LICENSE).

## Trademark

"OpenProgression", the OpenProgression logo, and the 7-level progression gradient mark are trademarks of the OpenProgression project. The trademarks are **not** licensed under the MIT license.

- **The standard, data, and code are fully open** — use them freely in any project, commercial or not
- **The name and logo require permission** for use on merchandise, commercial products, or anything that implies official endorsement

This is the same approach used by Linux, Firefox, Kubernetes, and most major open source projects: the *work* is open, the *brand* is protected.

## Disclaimer

OpenProgression is an independent, community-driven open standard. It is not affiliated with, endorsed by, or derived from any commercial fitness assessment product. All benchmarks are independently derived from publicly available research and data sources cited in this repository.

---

<p align="center">
  <a href="https://openprogression.org"><strong>openprogression.org</strong></a> · <a href="https://github.com/OpenProgression/openprogression">GitHub</a> · <a href="https://github.com/OpenProgression/openprogression/issues">Issues</a>
</p>
