import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, "..", "data")

const LEVELS = [
  "beginner", "beginner_plus", "intermediate", "intermediate_plus",
  "advanced", "advanced_plus", "rx",
]

const CATEGORIES = [
  "squatting", "pulling", "pressing", "olympic_lifting",
  "gymnastics", "monostructural", "bodyweight", "endurance",
]

let errors = 0
let checks = 0

function assert(condition, message) {
  checks++
  if (!condition) {
    console.error(`  FAIL: ${message}`)
    errors++
  }
}

function loadJSON(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"))
  } catch (e) {
    console.error(`  FAIL: Could not parse ${path}: ${e.message}`)
    errors++
    return null
  }
}

// === Validate levels.json ===
console.log("Validating levels.json...")
const levels = loadJSON(join(dataDir, "levels.json"))
if (levels) {
  assert(levels.version === "1.0.0", "levels.json version should be 1.0.0")
  assert(Array.isArray(levels.levels), "levels.levels should be an array")
  assert(levels.levels.length === 7, `Expected 7 levels, got ${levels.levels.length}`)
  for (const level of levels.levels) {
    assert(LEVELS.includes(level.id), `Unknown level id: ${level.id}`)
    assert(typeof level.name === "string", `Level ${level.id} missing name`)
    assert(typeof level.shortName === "string", `Level ${level.id} missing shortName`)
    assert(typeof level.color === "string", `Level ${level.id} missing color`)
    assert(Array.isArray(level.percentileRange), `Level ${level.id} missing percentileRange`)
  }
}

// === Validate categories.json ===
console.log("Validating categories.json...")
const categories = loadJSON(join(dataDir, "categories.json"))
if (categories) {
  assert(categories.version === "1.0.0", "categories.json version should be 1.0.0")
  assert(Array.isArray(categories.categories), "categories.categories should be an array")
  assert(categories.categories.length === 8, `Expected 8 categories, got ${categories.categories.length}`)
  for (const cat of categories.categories) {
    assert(CATEGORIES.includes(cat.id), `Unknown category id: ${cat.id}`)
    assert(typeof cat.name === "string", `Category ${cat.id} missing name`)
    assert(Array.isArray(cat.keyMovements), `Category ${cat.id} missing keyMovements`)
  }
}

// === Validate sources.json ===
console.log("Validating sources.json...")
const sources = loadJSON(join(dataDir, "sources.json"))
if (sources) {
  assert(sources.version === "1.0.0", "sources.json version should be 1.0.0")
  assert(Array.isArray(sources.sources), "sources.sources should be an array")
  assert(sources.sources.length > 0, "sources.sources should not be empty")
  const sourceIds = new Set(sources.sources.map((s) => s.id))
  for (const s of sources.sources) {
    assert(typeof s.id === "string", "Source missing id")
    assert(typeof s.citation === "string", `Source ${s.id} missing citation`)
    assert(typeof s.type === "string", `Source ${s.id} missing type`)
  }

  // === Validate benchmark files ===
  const benchmarkDir = join(dataDir, "benchmarks")
  const benchmarkFiles = readdirSync(benchmarkDir).filter((f) => f.endsWith(".json"))

  assert(benchmarkFiles.length === 8, `Expected 8 benchmark files, got ${benchmarkFiles.length}`)

  for (const file of benchmarkFiles) {
    const category = file.replace(".json", "")
    console.log(`Validating benchmarks/${file}...`)
    const data = loadJSON(join(benchmarkDir, file))
    if (!data) continue

    assert(data.category === category, `${file}: category should be "${category}", got "${data.category}"`)
    assert(Array.isArray(data.benchmarks), `${file}: benchmarks should be an array`)
    assert(data.benchmarks.length > 0, `${file}: benchmarks should not be empty`)

    for (const bm of data.benchmarks) {
      assert(typeof bm.movement === "string", `${file}: benchmark missing movement id`)
      assert(typeof bm.name === "string", `${file}: benchmark ${bm.movement} missing name`)
      assert(typeof bm.unit === "string", `${file}: benchmark ${bm.movement} missing unit`)
      assert(typeof bm.standards === "object", `${file}: benchmark ${bm.movement} missing standards`)

      // Validate all 7 levels have standards
      for (const level of LEVELS) {
        assert(bm.standards[level] !== undefined, `${file}: ${bm.movement} missing standard for ${level}`)

        if (bm.standards[level]) {
          const std = bm.standards[level]
          assert(
            std.male !== undefined && std.female !== undefined,
            `${file}: ${bm.movement}.${level} missing male or female value`
          )
        }
      }

      // Validate sources reference known source IDs
      if (bm.sources) {
        for (const srcId of bm.sources) {
          assert(sourceIds.has(srcId), `${file}: ${bm.movement} references unknown source "${srcId}"`)
        }
      }

      // Validate progression (values should increase or decrease monotonically)
      if (bm.standards.beginner && typeof bm.standards.beginner.male === "number") {
        const maleVals = LEVELS.map((l) => bm.standards[l]?.male).filter((v) => v != null)
        const isIncreasing = maleVals.every((v, i) => i === 0 || v >= maleVals[i - 1])
        const isDecreasing = maleVals.every((v, i) => i === 0 || v <= maleVals[i - 1])
        assert(
          isIncreasing || isDecreasing,
          `${file}: ${bm.movement} male values are not monotonic: [${maleVals.join(", ")}]`
        )
      }
    }
  }
}

// === Summary ===
console.log("")
if (errors > 0) {
  console.error(`FAILED: ${errors} error(s) out of ${checks} checks`)
  process.exit(1)
} else {
  console.log(`PASSED: All ${checks} checks passed`)
}
