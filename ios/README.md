# OpenProgression iOS

Native SwiftUI app (iOS 17+), no backend. Bundles the canonical `/data` JSON
(benchmarks, the level standard, and a full year of programming) so it runs offline.

## Build

```bash
brew install xcodegen          # one-time
cd ios
xcodegen generate              # creates OpenProgression.xcodeproj from project.yml
scripts/copy-data.sh           # bundles /data into the app (also runs as a build phase)
open OpenProgression.xcodeproj # then Run, or:
xcodebuild -scheme OpenProgression -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone 17' build
```

## Structure

- `App/` — entry point + tab navigation
- `DesignSystem/` — brand theme (dark + teal, the 7-level gradient), reusable components
- `Models/` — Codable models matching the data contract (handles the polymorphic `standards` shape)
- `Data/` — `DataStore` loads the bundled JSON
- `Features/` — Today (daily session), Calculator (bodyweight-relative scoring + weakest-link), Benchmarks, Levels
- `Resources/data/` — generated; copied from `/data` (gitignored)

The `.xcodeproj` is generated and gitignored — edit `project.yml` and re-run `xcodegen generate`.
