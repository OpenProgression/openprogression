import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, "..", "..", "data", "benchmarks")

// Load all benchmark data
const categories = [
  { id: "squatting", label: "Squatting", icon: "🏋️" },
  { id: "pulling", label: "Pulling", icon: "💪" },
  { id: "pressing", label: "Pressing", icon: "🔝" },
  { id: "olympic_lifting", label: "Olympic Lifting", icon: "⚡" },
  { id: "gymnastics", label: "Gymnastics", icon: "🤸" },
  { id: "monostructural", label: "Monostructural", icon: "🚣" },
  { id: "bodyweight", label: "Bodyweight", icon: "🏃" },
  { id: "endurance", label: "Endurance", icon: "❤️" },
]

const LEVELS = [
  { key: "beginner", short: "BEG", name: "Beginner", color: "#4ADE80" },
  { key: "beginner_plus", short: "BEG+", name: "Beginner+", color: "#22C55E" },
  { key: "intermediate", short: "INT", name: "Intermediate", color: "#EAB308" },
  { key: "intermediate_plus", short: "INT+", name: "Intermediate+", color: "#F97316" },
  { key: "advanced", short: "ADV", name: "Advanced", color: "#EF4444" },
  { key: "advanced_plus", short: "ADV+", name: "Advanced+", color: "#DC2626" },
  { key: "rx", short: "RX", name: "Rx", color: "#991B1B" },
]

function loadBenchmarks() {
  const allData = []
  for (const cat of categories) {
    const raw = JSON.parse(readFileSync(join(dataDir, `${cat.id}.json`), "utf8"))
    allData.push({
      ...cat,
      benchmarks: raw.benchmarks,
    })
  }
  return allData
}

function escapeXml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  return s === 0 ? `${m}:00` : `${m}:${s.toString().padStart(2, "0")}`
}

function formatValue(benchmark, levelKey, gender) {
  const val = benchmark.standards[levelKey]
  if (!val) return "-"

  const genderVal = val[gender]
  if (genderVal === undefined || genderVal === null) return "-"

  // Range-based (gymnastics, bodyweight)
  if (Array.isArray(genderVal)) {
    const [lo, hi] = genderVal
    if (lo === 0 && hi === 0) return "-"
    if (hi >= 99) return `${lo}+`
    return `${lo}-${hi}`
  }

  // Time-based
  if (benchmark.lowerIsBetter || benchmark.unit === "seconds") {
    return formatTime(genderVal)
  }

  // Rounds or kg
  if (benchmark.unit === "rounds") return `${genderVal}r`
  if (benchmark.unit === "kg") return `${genderVal}kg`
  return `${genderVal}`
}

function generatePoster() {
  const data = loadBenchmarks()

  // Layout constants — A1 landscape proportions at 2x for high DPI
  const W = 2384  // ~841mm at 72dpi × 2
  const H = 1684  // ~594mm at 72dpi × 2

  const MARGIN = 60
  const HEADER_H = 140
  const FOOTER_H = 60
  const GENDER_GAP = 40
  const SECTION_GAP = 16

  // Colors
  const BG = "#0c1222"
  const BG_CARD = "#131c2e"
  const TEXT = "#e2e8f0"
  const TEXT_MUTED = "#64748b"
  const TEXT_DIM = "#475569"
  const TEAL = "#0D9488"
  const BORDER = "#1e293b"

  // Calculate total movements
  const totalMovements = data.reduce((sum, cat) => sum + cat.benchmarks.length, 0)

  // Gender section width
  const genderW = (W - MARGIN * 2 - GENDER_GAP) / 2

  // Column widths within a gender section
  const movementColW = 160
  const levelColW = (genderW - movementColW) / 7

  // Row height
  const contentH = H - HEADER_H - FOOTER_H - MARGIN * 2
  const totalRows = totalMovements + categories.length // movements + category headers
  const rowH = Math.min(28, contentH / totalRows)
  const catHeaderH = rowH + 4

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
  <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" style="stop-color:${BG}"/>
    <stop offset="100%" style="stop-color:#0f172a"/>
  </linearGradient>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap');
    text { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
  </style>
</defs>

<!-- Background -->
<rect width="${W}" height="${H}" rx="24" fill="url(#bgGrad)"/>

`

  // === HEADER ===
  const headerY = MARGIN
  const dotR = 8
  const dotGap = 24
  const dotsStartX = W / 2 - (6 * dotGap) / 2

  // Level dots
  for (let i = 0; i < 7; i++) {
    svg += `<circle cx="${dotsStartX + i * dotGap}" cy="${headerY + 20}" r="${dotR}" fill="${LEVELS[i].color}"/>\n`
  }

  // Title
  svg += `<text x="${W / 2}" y="${headerY + 62}" text-anchor="middle" font-size="42" font-weight="800" letter-spacing="-1">
  <tspan fill="${TEXT}">Open</tspan><tspan fill="${TEAL}">Progression</tspan>
</text>\n`

  // Subtitle
  svg += `<text x="${W / 2}" y="${headerY + 88}" text-anchor="middle" font-size="16" fill="${TEXT_MUTED}" font-weight="400">Benchmark Standards  ·  v1.0.0  ·  Reference bodyweight: Male ~80kg / Female ~60kg</text>\n`

  // Gender labels
  const maleX = MARGIN
  const femaleX = MARGIN + genderW + GENDER_GAP

  svg += `<text x="${maleX + genderW / 2}" y="${headerY + 120}" text-anchor="middle" font-size="20" font-weight="700" fill="${TEXT}" letter-spacing="3">MALE</text>\n`
  svg += `<text x="${femaleX + genderW / 2}" y="${headerY + 120}" text-anchor="middle" font-size="20" font-weight="700" fill="${TEXT}" letter-spacing="3">FEMALE</text>\n`

  // Divider line between genders
  const divX = MARGIN + genderW + GENDER_GAP / 2
  svg += `<line x1="${divX}" y1="${headerY + 108}" x2="${divX}" y2="${H - MARGIN - FOOTER_H}" stroke="${BORDER}" stroke-width="2" stroke-dasharray="6,4"/>\n`

  // === TABLE CONTENT ===
  const startY = headerY + HEADER_H

  function renderGenderSection(startX, gender, yStart) {
    let y = yStart

    // Level column headers
    for (let i = 0; i < 7; i++) {
      const cx = startX + movementColW + levelColW * i + levelColW / 2

      // Colored dot
      svg += `<circle cx="${cx}" cy="${y - 14}" r="5" fill="${LEVELS[i].color}"/>\n`

      // Level short name
      svg += `<text x="${cx}" y="${y + 2}" text-anchor="middle" font-size="11" font-weight="700" fill="${LEVELS[i].color}">${LEVELS[i].short}</text>\n`
    }

    y += 14

    for (const cat of data) {
      // Category header row
      svg += `<rect x="${startX}" y="${y}" width="${genderW}" height="${catHeaderH}" rx="6" fill="${TEAL}" opacity="0.15"/>\n`
      svg += `<text x="${startX + 12}" y="${y + catHeaderH / 2 + 5}" font-size="12" font-weight="700" fill="${TEAL}" letter-spacing="0.5">${escapeXml(cat.label.toUpperCase())}</text>\n`
      y += catHeaderH + 2

      // Movement rows
      for (let mi = 0; mi < cat.benchmarks.length; mi++) {
        const bm = cat.benchmarks[mi]
        const isAlt = mi % 2 === 0

        // Row background
        if (isAlt) {
          svg += `<rect x="${startX}" y="${y}" width="${genderW}" height="${rowH}" rx="4" fill="${BG_CARD}" opacity="0.5"/>\n`
        }

        // Movement name
        svg += `<text x="${startX + 12}" y="${y + rowH / 2 + 4}" font-size="11" font-weight="500" fill="${TEXT}">${escapeXml(bm.name)}</text>\n`

        // Unit hint
        const unitHint = bm.unit === "seconds" ? "" : bm.unit === "kg" ? " (kg)" : bm.unit === "rounds" ? " (rounds)" : " (reps)"
        if (mi === 0) {
          svg += `<text x="${startX + movementColW - 6}" y="${y + rowH / 2 + 4}" text-anchor="end" font-size="8" fill="${TEXT_DIM}">${unitHint}</text>\n`
        }

        // Level values
        for (let li = 0; li < 7; li++) {
          const cx = startX + movementColW + levelColW * li + levelColW / 2
          const val = formatValue(bm, LEVELS[li].key, gender)
          const isZero = val === "-"
          svg += `<text x="${cx}" y="${y + rowH / 2 + 4}" text-anchor="middle" font-size="11" font-weight="${isZero ? "400" : "600"}" fill="${isZero ? TEXT_DIM : TEXT}">${val}</text>\n`
        }

        y += rowH
      }

      y += SECTION_GAP
    }
  }

  renderGenderSection(maleX, "male", startY)
  renderGenderSection(femaleX, "female", startY)

  // === FOOTER ===
  const footerY = H - MARGIN - 10

  svg += `<text x="${MARGIN}" y="${footerY}" font-size="11" fill="${TEXT_DIM}" font-weight="400">openprogression.org  ·  MIT License  ·  All benchmarks derived from peer-reviewed research and public-domain data</text>\n`

  svg += `<text x="${W - MARGIN}" y="${footerY}" text-anchor="end" font-size="11" fill="${TEXT_DIM}" font-weight="400">github.com/OpenProgression/openprogression</text>\n`

  // Level legend at bottom
  const legendX = W / 2 - (7 * 80) / 2
  for (let i = 0; i < 7; i++) {
    const lx = legendX + i * 80
    svg += `<circle cx="${lx}" cy="${footerY - 24}" r="4" fill="${LEVELS[i].color}"/>\n`
    svg += `<text x="${lx + 10}" y="${footerY - 20}" font-size="9" fill="${TEXT_MUTED}" font-weight="500">${LEVELS[i].name}</text>\n`
  }

  svg += `</svg>`

  // Write files
  const outDir = join(__dirname, "..", "public")
  const assetsDir = join(__dirname, "..", "..", "assets")

  writeFileSync(join(outDir, "poster.svg"), svg)
  console.log(`Poster SVG: ${join(outDir, "poster.svg")}`)

  writeFileSync(join(assetsDir, "poster.svg"), svg)
  console.log(`Assets copy: ${join(assetsDir, "poster.svg")}`)

  console.log(`\nDimensions: ${W}×${H} (A1 landscape at 2x)`)
  console.log("Open the SVG in a browser and print, or use Inkscape/Illustrator to export as PDF for professional printing.")
}

generatePoster()
