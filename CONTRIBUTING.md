# Contributing to OpenProgression

Thank you for your interest in contributing to OpenProgression. This project aims to build a free, research-backed fitness progression standard that any coach, athlete, or developer can use.

## Ways to Contribute

### Review Benchmarks
The most valuable contribution is real-world validation. If you're a coach or experienced athlete:
- Compare OP benchmarks against your athletes' capabilities
- Report where benchmarks feel too easy, too hard, or well-calibrated
- Open an issue with your observations and the context (gym population, training background, etc.)

### Improve Research Foundation
If you're aware of peer-reviewed studies or large datasets that could improve our benchmarks:
- Open an issue linking to the study/data
- Explain which OP category or movement it applies to
- Include sample size, population, and key findings

### Add Movements
To propose a new benchmark movement:
1. Open an issue describing the movement and which category it belongs to
2. Provide standards for all 7 levels (male and female)
3. Cite at least one data source supporting your proposed values
4. Explain why this movement adds value beyond existing benchmarks

### Build Integrations
Build packages, libraries, or tools that use OP data:
- npm packages for JavaScript/TypeScript
- Python packages
- Mobile SDKs
- API wrappers
- Data visualization tools

### Improve Documentation
- Fix typos or unclear language
- Translate documentation to other languages
- Add examples and use cases

## Contribution Process

1. **Open an issue first** — Describe what you want to change and why. This avoids duplicate work and ensures alignment.
2. **Fork the repository** and create a branch
3. **Make your changes** with clear commit messages
4. **Submit a pull request** referencing the issue

## Benchmark Contribution Guidelines

When proposing changes to benchmark values:

- **Cite your sources** — Every number must trace to a published, citable data source
- **Prefer peer-reviewed data** over community estimates
- **Include sample sizes** — Larger samples are more credible
- **Specify the population** — Competitive athletes, recreational gym-goers, general population?
- **Provide both male and female values** — All benchmarks must be gender-differentiated
- **Explain your mapping** — How did you convert source data to the 7-level scale?

## Data Format

Benchmark files follow a strict JSON schema. See existing files in `data/benchmarks/` for reference. Key requirements:

- Use the movement ID format: `snake_case` (e.g., `back_squat`, `strict_pull_up`)
- Include `sources` array referencing source IDs from `data/sources.json`
- Use consistent units within a category (kg for strength, seconds for time, reps for bodyweight)
- Include `notes` for any non-obvious assumptions

## Code of Conduct

- Be respectful and constructive
- Back claims with data, not opinion
- Acknowledge that fitness standards involve trade-offs — reasonable people can disagree
- Focus on improving the standard, not promoting any commercial product

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
