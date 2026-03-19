import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const s = JSON.parse(readFileSync(join(__dirname, "..", "data", "sessions.json"), "utf8"))
const m = JSON.parse(readFileSync(join(__dirname, "..", "data", "metcons.json"), "utf8"))

const metconsByCode = new Map(m.metcons.map(mc => [mc.code, mc]))
let issues = []

// === 1. No duplicate dates ===
const dateCounts = new Map()
for (const sess of s.sessions) {
  dateCounts.set(sess.date, (dateCounts.get(sess.date) || 0) + 1)
}
for (const [date, count] of dateCounts) {
  if (count > 1) issues.push(`Duplicate date: ${date} appears ${count} times`)
}

// === 2. No gaps in date range ===
const dates = s.sessions.map(x => x.date).sort()
if (dates.length > 0) {
  const start = new Date(dates[0])
  const end = new Date(dates[dates.length - 1])
  const dateSet = new Set(dates)
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().slice(0, 10)
    if (!dateSet.has(iso)) issues.push(`Missing date: ${iso} (gap in coverage)`)
  }
}

// === 3. Metcon code references exist ===
for (const sess of s.sessions) {
  if (sess.metcon && !metconsByCode.has(sess.metcon)) {
    issues.push(`${sess.date}: metcon ${sess.metcon} not found in metcons.json`)
  }
}

// === 4. No orphaned metcons (warning only) ===
const usedCodes = new Set(s.sessions.map(x => x.metcon).filter(Boolean))
const orphaned = m.metcons.filter(mc => !usedCodes.has(mc.code))
if (orphaned.length > 0) {
  console.log(`INFO: ${orphaned.length} metcon(s) not referenced by any session: ${orphaned.map(x => x.code).join(", ")}`)
}

// === 5. Tuesday + Saturday must be team metcons ===
for (const sess of s.sessions) {
  if (!sess.metcon) continue
  const dow = new Date(sess.date).getDay() // 0=Sun, 2=Tue, 6=Sat
  const mc = metconsByCode.get(sess.metcon)
  if (!mc) continue

  const isTeamDay = dow === 2 || dow === 6
  const isTeamMetcon = !!mc.team

  if (isTeamDay && !isTeamMetcon) {
    issues.push(`${sess.date}: team day (Tue/Sat) but ${sess.metcon} is not a team metcon`)
  }
  if (!isTeamDay && isTeamMetcon) {
    issues.push(`${sess.date}: non-team day but ${sess.metcon} is a team metcon`)
  }
}

// === 6. Accessory only on Mon/Wed, and not when metcon TC > 20 ===
for (const sess of s.sessions) {
  const dow = new Date(sess.date).getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  const hasAccessory = sess.accessory !== null && sess.accessory !== undefined
  const accessoryDays = [1, 3] // Mon, Wed

  if (hasAccessory && !accessoryDays.includes(dow)) {
    issues.push(`${sess.date}: has accessory but is not Mon/Wed`)
  }

  if (hasAccessory && sess.metcon) {
    const mc = metconsByCode.get(sess.metcon)
    if (mc && mc.timeCap > 20) {
      issues.push(`${sess.date}: has accessory but metcon ${sess.metcon} timeCap is ${mc.timeCap} (>20 min)`)
    }
  }
}

// === 7. Time budget: estimatedMinutes must equal sum of parts ===
for (const sess of s.sessions) {
  const w = sess.warmup?.durationMinutes || 0
  const st = sess.strength?.durationMinutes || 0
  const mc = sess.metcon ? metconsByCode.get(sess.metcon) : null
  const tc = mc ? mc.timeCap : 0
  const a = sess.accessory?.durationMinutes || 0
  const sum = w + st + tc + a
  if (sum !== sess.estimatedMinutes) {
    issues.push(`${sess.date}: estimatedMinutes is ${sess.estimatedMinutes} but parts sum to ${sum} (warmup:${w} + strength:${st} + metcon:${tc} + accessory:${a})`)
  }
}

// === 8. Session duration constraints ===
for (const sess of s.sessions) {
  if (sess.estimatedMinutes > 60) {
    issues.push(`${sess.date}: estimatedMinutes is ${sess.estimatedMinutes} (max 60)`)
  }
  if (sess.warmup && sess.warmup.durationMinutes > 12) {
    issues.push(`${sess.date}: warmup is ${sess.warmup.durationMinutes} min (max 12)`)
  }
  if (sess.strength && sess.strength.durationMinutes > 20) {
    issues.push(`${sess.date}: strength is ${sess.strength.durationMinutes} min (max 20)`)
  }
  if (sess.accessory && sess.accessory.durationMinutes > 15) {
    issues.push(`${sess.date}: accessory is ${sess.accessory.durationMinutes} min (max 15)`)
  }
}

// === 9. Strength block single-focus rule ===
for (const sess of s.sessions) {
  if (sess.strength && sess.strength.movements && sess.strength.movements.length > 1) {
    issues.push(`${sess.date}: strength block has ${sess.strength.movements.length} movements (max 1)`)
  }
}

// === 10. Accessory max 3 exercises (heuristic: count \n-separated lines) ===
for (const sess of s.sessions) {
  if (sess.accessory && sess.accessory.notes) {
    const lines = sess.accessory.notes.split("\n").filter(l => l.trim().length > 0)
    if (lines.length > 3) {
      issues.push(`${sess.date}: accessory has ${lines.length} exercises (max 3)`)
    }
  }
}

// === 11. Long metcon + strength constraint ===
for (const sess of s.sessions) {
  if (!sess.metcon || !sess.strength) continue
  const mc = metconsByCode.get(sess.metcon)
  if (!mc) continue
  if (mc.timeCap >= 40) {
    issues.push(`${sess.date}: metcon ${sess.metcon} timeCap is ${mc.timeCap} but strength is not null`)
  }
}

// === 12. No duplicate metcon usage on same date ===
// (already covered by duplicate dates, but check for duplicate codes across different dates)
const codeUsage = new Map()
for (const sess of s.sessions) {
  if (!sess.metcon) continue
  if (!codeUsage.has(sess.metcon)) codeUsage.set(sess.metcon, [])
  codeUsage.get(sess.metcon).push(sess.date)
}

// === 13. Required session fields ===
for (const sess of s.sessions) {
  if (!sess.date) issues.push("Session missing date")
  if (!sess.title) issues.push(`${sess.date || "?"}: missing title`)
  if (sess.estimatedMinutes === undefined) issues.push(`${sess.date}: missing estimatedMinutes`)
}

// === Summary ===
console.log(`Audited ${s.sessions.length} sessions (${dates[0]} to ${dates[dates.length - 1]})`)
console.log(`Metcon library: ${m.metcons.length} metcons, ${usedCodes.size} used in sessions`)
if (issues.length === 0) {
  console.log("ALL CHECKS PASSED")
} else {
  console.log(`\n${issues.length} ISSUES:`)
  issues.forEach(i => console.log(`  ${i}`))
  process.exit(1)
}
