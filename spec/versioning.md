# OpenProgression Versioning

**Version:** 1.0.0

## Overview

OpenProgression is a standard, not just a codebase. Gym software, coaching platforms, and developer tools consume OP data and depend on its structure being stable. This document defines how the standard evolves without breaking existing consumers.

The core principle: **additive changes are free, breaking changes require a major version bump and a migration path.**

## Version Format

OP follows [Semantic Versioning](https://semver.org/) applied to a data standard:

```
MAJOR.MINOR.PATCH
```

- **MAJOR** -- Breaking changes to existing schemas, level definitions, or category structure
- **MINOR** -- Additive extensions (new data files, new optional fields, new movements)
- **PATCH** -- Corrections (benchmark value adjustments, typo fixes, source citation updates)

The version number applies to the standard as a whole. Individual data files carry a `"version"` field that tracks the standard version they conform to.

## The Stability Contract

These are the things consumers can depend on. Breaking any of these requires a major version bump.

### Core guarantees (MAJOR version)

| Guarantee | What it means |
|-----------|---------------|
| **7 levels** | The level IDs, names, numbers (1-7), and percentile ranges in `data/levels.json` do not change |
| **8 categories** | The category IDs and names in `data/categories.json` do not change |
| **Benchmark schema** | The shape of `data/benchmarks/*.json` does not change -- `standards`, `bwMultiplier`, `sources` fields remain stable |
| **Level calculation** | The weakest-link principle and the method for determining an athlete's level do not change |
| **Gender differentiation** | All benchmarks provide both `male` and `female` values |
| **Source traceability** | Every benchmark value traces to a citable source in `data/sources.json` |

An application that reads `data/levels.json`, `data/categories.json`, and `data/benchmarks/*.json` will continue to work across all minor and patch releases without code changes.

### Extension guarantees (MINOR version)

New data files, new optional fields, and new spec documents are additive. They never modify the schema of existing files. Consumers that don't use the new data are unaffected.

Examples of minor changes:
- Adding a new data file (e.g., `data/milestones.json`, `data/progressions.json`)
- Adding a new benchmark movement to an existing category file
- Adding optional fields to existing schemas (fields that weren't there before)
- Adding new spec documents (e.g., `spec/progressions.md`)
- Adding new source citations to `data/sources.json`

### Correction guarantees (PATCH version)

Benchmark values can be adjusted within a patch release when evidence shows a number is wrong. These are not treated as breaking changes because the standard's purpose is accuracy -- a benchmark that's provably off should be corrected.

Examples of patch changes:
- Adjusting a benchmark value based on new research or community review
- Fixing a typo in a description or citation
- Correcting a source URL
- Updating `notes` fields

## What Counts as Breaking

Any change that would cause an existing consumer to produce incorrect results, crash, or need code changes:

| Change | Why it breaks |
|--------|--------------|
| Removing or renaming a level | Apps display level names, store level IDs |
| Changing the number of levels (adding Level 8, removing a level) | UI layouts, color mappings, percentile logic |
| Removing or renaming a category | Benchmark lookups, category-based filtering |
| Changing the number of categories | Radar charts, UI grids, overall level calculation |
| Removing a field from the benchmark schema | Deserialization fails, null references |
| Changing the `standards` key names (e.g., `beginner` to `level_1`) | Every lookup breaks |
| Changing the weakest-link principle | Level calculation logic changes |
| Changing units mid-category (kg to lb, seconds to minutes) | Every comparison breaks |

## Extensions vs. Core

The standard distinguishes between **core** data (the stability contract) and **extensions** (additive features).

### Core data files

These files are covered by the stability contract. Their schemas are frozen within a major version:

```
data/levels.json
data/categories.json
data/benchmarks/*.json
data/sources.json
```

### Extension data files

These files provide additional functionality. They are additive and optional -- an implementation that ignores them is still a complete OP implementation:

```
data/metcons.json          (added in 1.0.0)
data/sessions.json         (added in 1.0.0)
data/milestones.json       (proposed in 1.1.0)
data/progressions.json     (proposed in 1.1.0)
```

Extensions follow the same versioning rules once introduced. After an extension ships in a minor release, its schema is stable within that major version.

### How to tell if something is core or extension

If removing it would break the "7 levels, 8 categories" level assessment system, it's core. Everything else is an extension.

## Adding New Content

### New movements within existing categories

Adding a new benchmark movement (e.g., Wall Ball to Bodyweight) is a **minor** change. The category file gains a new entry, but existing entries are untouched. Consumers that iterate over all movements in a category will pick up the new one automatically. Consumers that look up specific movements by ID are unaffected.

### New categories

Adding a 9th category would be a **major** change. It changes the weakest-link calculation (overall level now depends on 9 categories instead of 8), breaks UI layouts built for 8 categories, and changes the "8 categories" part of the standard's identity.

If a new domain needs to be tracked, consider whether it can be added as movements within an existing category before creating a new one.

### New levels

Adding an 8th level or splitting an existing level would be a **major** change. It changes percentile boundaries, color mappings, and the "7 levels" identity.

Foundation Milestones (F1, F2, F3) are explicitly **not levels** -- they are an extension that provides sub-Beginner progress markers without modifying the level system. This is the correct pattern for adding granularity without breaking the core.

### New data files

Adding a new data file is always a **minor** change. The file is additive and consumers that don't read it are unaffected.

## Version Number Propagation

When a release is made, the version number updates in:

1. **All data file `"version"` fields** -- every JSON file with a `"version"` key gets the new standard version
2. **All spec document `**Version:**` headers** -- every `.md` file in `spec/` gets the new version
3. **The website footer** (`v1.0.0` badge)
4. **The README** (standard version badge)

This keeps everything in sync and makes it easy to verify which version of the standard a file conforms to.

## Deprecation Process

If a field, movement, or data file needs to be removed in a future major version:

1. **Announce** -- mark it as deprecated in the current minor release (add a `"deprecated": true` field or a note in the spec)
2. **Document** -- explain what replaces it and why
3. **Wait** -- deprecated items remain functional for at least one minor release cycle
4. **Remove** -- the next major version can remove deprecated items

This gives consumers time to migrate.

## Release Checklist

For any OP release:

- [ ] Determine version bump type (major / minor / patch)
- [ ] Update version numbers in all data files and spec documents
- [ ] Update the changelog (if one exists) or the GitHub release notes
- [ ] Run `node scripts/validate-data.mjs` -- all checks pass
- [ ] Build the website -- `cd website && npm run build` succeeds
- [ ] Tag the release in git: `git tag v1.x.x`
- [ ] Update the website version badge

## Version History

| Version | Date | Type | Summary |
|---------|------|------|---------|
| 1.0.0 | 2025-02-17 | Initial | 7 levels, 8 categories, 25 benchmark movements, scaled programming, metcon library |
