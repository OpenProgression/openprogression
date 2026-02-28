import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const m = JSON.parse(readFileSync(join(__dirname, "..", "data", "metcons.json"), "utf8"))
const LEVELS = ["advanced_plus","advanced","intermediate_plus","intermediate","beginner_plus","beginner"]
const KB_SIZES = [6, 8, 12, 16, 20, 24, 28, 32]
const WB_SIZES = [3, 4, 6, 9]
let issues = []

for (const mc of m.metcons) {
  const movs = (mc.movements || []).slice()
  if (mc.groups) {
    for (const g of Object.keys(mc.groups)) {
      for (const mv of mc.groups[g].movements) movs.push(mv)
    }
  }
  for (const mov of movs) {
    if (!mov.scaling) continue

    // All 6 levels present
    for (const lvl of LEVELS) {
      if (!(lvl in mov.scaling)) issues.push(`${mc.code} ${mov.movement}: missing ${lvl}`)
    }

    // Monotonic male load
    if (mov.load && mov.load.male) {
      let prev = mov.load.male
      for (const lvl of LEVELS) {
        const s = mov.scaling[lvl]
        if (s && s.load && s.load.male !== undefined) {
          if (s.load.male > prev) issues.push(`${mc.code} ${mov.movement} male INVERSION at ${lvl}: ${s.load.male} > ${prev}`)
          prev = s.load.male
        }
      }
    }

    // Monotonic female load
    if (mov.load && mov.load.female) {
      let prev = mov.load.female
      for (const lvl of LEVELS) {
        const s = mov.scaling[lvl]
        if (s && s.load && s.load.female !== undefined) {
          if (s.load.female > prev) issues.push(`${mc.code} ${mov.movement} female INVERSION at ${lvl}: ${s.load.female} > ${prev}`)
          prev = s.load.female
        }
      }
    }

    // Barbell loads multiples of 5 (skip KB and WB - they use standard sizes)
    const isKBorWB = mov.movement === "Kettlebell Swing" || mov.movement === "Wall Ball"
    if (mov.unit === "kg" && mov.load && mov.load.male > 10 && !isKBorWB) {
      const allLoads = [{ lvl: "rx", ...mov.load }]
      for (const lvl of LEVELS) {
        const s = mov.scaling[lvl]
        if (s && s.load) allLoads.push({ lvl, ...s.load })
      }
      for (const ld of allLoads) {
        if (ld.male && ld.male % 5 !== 0) issues.push(`${mc.code} ${mov.movement} ${ld.lvl} male ${ld.male} not x5`)
        if (ld.female && ld.female % 5 !== 0) issues.push(`${mc.code} ${mov.movement} ${ld.lvl} female ${ld.female} not x5`)
      }
    }

    // KB standard sizes
    if (mov.movement === "Kettlebell Swing") {
      const allLoads = [{ lvl: "rx", ...mov.load }]
      for (const lvl of LEVELS) {
        const s = mov.scaling[lvl]
        if (s && s.load) allLoads.push({ lvl, ...s.load })
      }
      for (const ld of allLoads) {
        if (ld.male && !KB_SIZES.includes(ld.male)) issues.push(`${mc.code} KB male ${ld.lvl} ${ld.male} not standard`)
        if (ld.female && !KB_SIZES.includes(ld.female)) issues.push(`${mc.code} KB female ${ld.lvl} ${ld.female} not standard`)
      }
    }

    // Monotonic reps within same movement
    if (mov.reps) {
      let prevReps = mov.reps
      let prevMov = mov.movement
      for (const lvl of LEVELS) {
        const s = mov.scaling[lvl]
        if (!s) continue
        const curMov = s.sub || prevMov
        const curReps = s.reps || prevReps
        if (curMov === prevMov && curReps > prevReps) {
          issues.push(`${mc.code} ${mov.movement} rep INVERSION at ${lvl}: ${curReps} > ${prevReps} (same movement: ${curMov})`)
        }
        if (curMov === prevMov) prevReps = curReps
        else { prevMov = curMov; prevReps = curReps }
      }
    }
  }
}

console.log(`Audited ${m.metcons.length} metcons`)
if (issues.length === 0) {
  console.log("ALL CHECKS PASSED")
} else {
  console.log(`${issues.length} ISSUES:`)
  issues.forEach(i => console.log(`  ${i}`))
  process.exit(1)
}
