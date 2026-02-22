import satori from "satori"
import sharp from "sharp"
import { writeFile } from "node:fs/promises"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")

async function fetchFont(weight) {
  const url = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`
  const cssRes = await fetch(url, {
    headers: { "User-Agent": "Mozilla/4.0" },
  })
  const css = await cssRes.text()
  const fontUrlMatch = css.match(/src:\s*url\(([^)]+)\)\s*format\('truetype'\)/)
  if (!fontUrlMatch) {
    throw new Error(`Could not find TTF font URL for weight ${weight}`)
  }
  const fontRes = await fetch(fontUrlMatch[1])
  if (!fontRes.ok) throw new Error(`Failed to fetch font: ${fontRes.status}`)
  return fontRes.arrayBuffer()
}

const LEVEL_COLORS = [
  "#4ADE80", "#22C55E", "#EAB308", "#F97316", "#EF4444", "#DC2626", "#991B1B",
]
const LEVEL_NAMES = ["BEG", "BEG+", "INT", "INT+", "ADV", "ADV+", "RX"]

const BG = { background: "linear-gradient(to bottom right, #0f172a, #1e293b)" }
const BASE_STYLE = { width: "1200px", height: "630px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Inter", ...BG }

function dots(mb = "32px") {
  return {
    type: "div",
    props: {
      style: { display: "flex", flexDirection: "row", gap: "14px", marginBottom: mb },
      children: LEVEL_COLORS.map((color) => ({
        type: "div",
        props: { style: { width: "16px", height: "16px", borderRadius: "50%", backgroundColor: color } },
      })),
    },
  }
}

function title(text1, text2, size = "64px") {
  return {
    type: "div",
    props: {
      style: { display: "flex", flexDirection: "row", fontSize: size, fontWeight: 700, lineHeight: 1.1 },
      children: [
        { type: "span", props: { style: { color: "#ffffff" }, children: text1 } },
        { type: "span", props: { style: { color: "#0D9488" }, children: text2 } },
      ],
    },
  }
}

function subtitle(text) {
  return {
    type: "div",
    props: {
      style: { fontSize: "26px", color: "#94a3b8", marginTop: "16px", fontWeight: 400 },
      children: text,
    },
  }
}

function statsLine(text) {
  return {
    type: "div",
    props: {
      style: { fontSize: "18px", color: "#64748b", marginTop: "40px", fontWeight: 500, display: "flex", flexDirection: "row", gap: "8px" },
      children: text,
    },
  }
}

// === Page-specific layouts ===

function homeMarkup() {
  return {
    type: "div",
    props: {
      style: BASE_STYLE,
      children: [
        dots("40px"),
        title("Open", "Progression", "72px"),
        subtitle("An open standard for fitness progression."),
        statsLine("7 Levels  |  8 Categories  |  1.3M+ Data Points  |  MIT Licensed"),
      ],
    },
  }
}

function levelsMarkup() {
  return {
    type: "div",
    props: {
      style: BASE_STYLE,
      children: [
        dots(),
        title("The 7 ", "Levels"),
        subtitle("From Beginner to Rx — research-backed progression"),
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "row", gap: "12px", marginTop: "48px" },
            children: LEVEL_COLORS.map((color, i) => ({
              type: "div",
              props: {
                style: {
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
                },
                children: [
                  {
                    type: "div",
                    props: {
                      style: {
                        width: "80px", height: "56px", borderRadius: "12px",
                        backgroundColor: color, display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "20px", fontWeight: 700, color: "#fff",
                      },
                      children: `${i + 1}`,
                    },
                  },
                  {
                    type: "div",
                    props: {
                      style: { fontSize: "14px", fontWeight: 600, color: color },
                      children: LEVEL_NAMES[i],
                    },
                  },
                ],
              },
            })),
          },
        },
      ],
    },
  }
}

function categoriesMarkup() {
  const cats = [
    { icon: "Squatting", emoji: "🏋️" },
    { icon: "Pulling", emoji: "💪" },
    { icon: "Pressing", emoji: "🔝" },
    { icon: "Olympic Lifting", emoji: "⚡" },
    { icon: "Gymnastics", emoji: "🤸" },
    { icon: "Monostructural", emoji: "🚣" },
    { icon: "Bodyweight", emoji: "🏃" },
    { icon: "Endurance", emoji: "❤️" },
  ]
  return {
    type: "div",
    props: {
      style: BASE_STYLE,
      children: [
        dots(),
        title("8 ", "Categories"),
        subtitle("Assess every domain of functional fitness"),
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "12px", marginTop: "40px", justifyContent: "center", maxWidth: "800px" },
            children: cats.map((cat) => ({
              type: "div",
              props: {
                style: {
                  display: "flex", flexDirection: "row", alignItems: "center", gap: "8px",
                  padding: "10px 20px", borderRadius: "12px",
                  backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                },
                children: [
                  { type: "span", props: { style: { fontSize: "20px" }, children: cat.emoji } },
                  { type: "span", props: { style: { fontSize: "16px", fontWeight: 600, color: "#e2e8f0" }, children: cat.icon } },
                ],
              },
            })),
          },
        },
      ],
    },
  }
}

function benchmarksMarkup() {
  const rows = [
    { name: "Back Squat", vals: ["40", "60", "80", "105", "130", "155", "180"] },
    { name: "Deadlift", vals: ["60", "90", "120", "150", "180", "210", "240"] },
    { name: "Strict Press", vals: ["20", "30", "45", "55", "68", "80", "95"] },
  ]
  return {
    type: "div",
    props: {
      style: BASE_STYLE,
      children: [
        dots(),
        title("Benchmark ", "Standards"),
        subtitle("29 movements across 8 categories — male & female"),
        {
          type: "div",
          props: {
            style: {
              display: "flex", flexDirection: "column", gap: "0px", marginTop: "36px",
              borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)",
            },
            children: [
              // Header row
              {
                type: "div",
                props: {
                  style: {
                    display: "flex", flexDirection: "row", backgroundColor: "rgba(255,255,255,0.06)",
                    padding: "8px 16px",
                  },
                  children: [
                    { type: "div", props: { style: { width: "140px", fontSize: "12px", fontWeight: 600, color: "#64748b" }, children: "Movement" } },
                    ...LEVEL_NAMES.map((name, i) => ({
                      type: "div",
                      props: {
                        style: { width: "72px", fontSize: "12px", fontWeight: 700, color: LEVEL_COLORS[i], textAlign: "center" },
                        children: name,
                      },
                    })),
                  ],
                },
              },
              // Data rows
              ...rows.map((row, ri) => ({
                type: "div",
                props: {
                  style: {
                    display: "flex", flexDirection: "row",
                    padding: "8px 16px",
                    backgroundColor: ri % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent",
                  },
                  children: [
                    { type: "div", props: { style: { width: "140px", fontSize: "14px", fontWeight: 500, color: "#e2e8f0" }, children: row.name } },
                    ...row.vals.map((v) => ({
                      type: "div",
                      props: {
                        style: { width: "72px", fontSize: "14px", fontWeight: 600, color: "#e2e8f0", textAlign: "center" },
                        children: `${v}kg`,
                      },
                    })),
                  ],
                },
              })),
              // Ellipsis row
              {
                type: "div",
                props: {
                  style: { display: "flex", padding: "6px 16px", justifyContent: "center" },
                  children: { type: "div", props: { style: { fontSize: "14px", color: "#64748b" }, children: "... 26 more movements" } },
                },
              },
            ],
          },
        },
      ],
    },
  }
}

function methodologyMarkup() {
  return {
    type: "div",
    props: {
      style: BASE_STYLE,
      children: [
        dots(),
        title("Research-Backed ", "Methodology"),
        subtitle("Transparent, citable, peer-reviewed"),
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "row", gap: "32px", marginTop: "48px" },
            children: [
              statBox("1.3M+", "Data Points"),
              statBox("14", "Sources"),
              statBox("5", "Source Tiers"),
              statBox("29", "Benchmarks"),
            ],
          },
        },
      ],
    },
  }
}

function dataMarkup() {
  return {
    type: "div",
    props: {
      style: BASE_STYLE,
      children: [
        dots(),
        title("Free JSON ", "Data"),
        subtitle("Download all benchmarks as structured data"),
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "row", gap: "32px", marginTop: "48px" },
            children: [
              statBox("11", "JSON Files"),
              statBox("29", "Benchmarks"),
              statBox("MIT", "Licensed"),
            ],
          },
        },
      ],
    },
  }
}

function licenseMarkup() {
  return {
    type: "div",
    props: {
      style: BASE_STYLE,
      children: [
        dots(),
        title("Open by ", "Design"),
        subtitle("Free to use, implement, and contribute to"),
        {
          type: "div",
          props: {
            style: {
              display: "flex", flexDirection: "row", gap: "16px", marginTop: "48px",
            },
            children: [
              badge("MIT License", "#0D9488"),
              badge("Free Data", "#22C55E"),
              badge("Open Standard", "#EAB308"),
            ],
          },
        },
      ],
    },
  }
}

function statBox(value, label) {
  return {
    type: "div",
    props: {
      style: {
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "20px 32px", borderRadius: "16px",
        backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
      },
      children: [
        { type: "div", props: { style: { fontSize: "36px", fontWeight: 700, color: "#0D9488" }, children: value } },
        { type: "div", props: { style: { fontSize: "14px", fontWeight: 500, color: "#94a3b8", marginTop: "4px" }, children: label } },
      ],
    },
  }
}

function badge(text, color) {
  return {
    type: "div",
    props: {
      style: {
        display: "flex", padding: "12px 28px", borderRadius: "999px",
        backgroundColor: color, fontSize: "18px", fontWeight: 700, color: "#fff",
      },
      children: text,
    },
  }
}

// === Main ===

const PAGES = [
  { name: "og.png", markup: homeMarkup },
  { name: "og-levels.png", markup: levelsMarkup },
  { name: "og-categories.png", markup: categoriesMarkup },
  { name: "og-benchmarks.png", markup: benchmarksMarkup },
  { name: "og-methodology.png", markup: methodologyMarkup },
  { name: "og-data.png", markup: dataMarkup },
  { name: "og-license.png", markup: licenseMarkup },
]

async function main() {
  console.log("Fetching fonts...")
  const [interBold, interRegular, interMedium] = await Promise.all([
    fetchFont(700),
    fetchFont(400),
    fetchFont(500),
  ])

  const fonts = [
    { name: "Inter", data: interRegular, weight: 400, style: "normal" },
    { name: "Inter", data: interMedium, weight: 500, style: "normal" },
    { name: "Inter", data: interBold, weight: 700, style: "normal" },
  ]

  for (const page of PAGES) {
    console.log(`  Generating ${page.name}...`)
    const svg = await satori(page.markup(), { width: 1200, height: 630, fonts })
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer()
    const outputPath = join(ROOT, "public", page.name)
    await writeFile(outputPath, pngBuffer)
    console.log(`    → ${page.name} (${(pngBuffer.length / 1024).toFixed(1)} KB)`)
  }

  console.log("\nDone! Generated all OG images.")
}

main().catch((err) => {
  console.error("Error generating OG images:", err)
  process.exit(1)
})
