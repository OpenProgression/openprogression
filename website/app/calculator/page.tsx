"use client"

import { useState } from "react"

// ---------------------------------------------------------------------------
// Level metadata
// ---------------------------------------------------------------------------
const LEVEL_COLORS = [
  "#4ADE80",
  "#22C55E",
  "#EAB308",
  "#F97316",
  "#EF4444",
  "#DC2626",
  "#991B1B",
]
const LEVEL_NAMES = [
  "Beginner",
  "Beginner+",
  "Intermediate",
  "Intermediate+",
  "Advanced",
  "Advanced+",
  "Rx",
]
const LEVEL_SHORT = ["BEG", "BEG+", "INT", "INT+", "ADV", "ADV+", "RX"]

type Gender = "male" | "female"

// ---------------------------------------------------------------------------
// Age adjustment multipliers
// ---------------------------------------------------------------------------
const AGE_RANGES = [
  { label: "18-29", value: "18-29" },
  { label: "30-39", value: "30-39" },
  { label: "40-49", value: "40-49" },
  { label: "50+", value: "50+" },
] as const

type AgeRange = (typeof AGE_RANGES)[number]["value"]

const AGE_MULTIPLIERS: Record<AgeRange, number> = {
  "18-29": 1.00,
  "30-39": 0.96,
  "40-49": 0.89,
  "50+":   0.81,
}

// ---------------------------------------------------------------------------
// Calculator movements — one representative per category
// ---------------------------------------------------------------------------
const MOVEMENTS = [
  {
    category: "Squatting",
    movement: "Back Squat",
    inputType: "kg" as const,
    placeholder: "e.g. 100",
    thresholds: {
      male: [40, 60, 80, 105, 130, 155, 180],
      female: [25, 40, 55, 70, 85, 100, 120],
    },
    higherIsBetter: true,
  },
  {
    category: "Pulling",
    movement: "Deadlift",
    inputType: "kg" as const,
    placeholder: "e.g. 140",
    thresholds: {
      male: [60, 90, 120, 150, 180, 210, 240],
      female: [35, 55, 80, 100, 120, 145, 170],
    },
    higherIsBetter: true,
  },
  {
    category: "Pressing",
    movement: "Strict Press",
    inputType: "kg" as const,
    placeholder: "e.g. 50",
    thresholds: {
      male: [20, 30, 45, 55, 68, 80, 95],
      female: [12, 20, 30, 38, 45, 52, 57],
    },
    higherIsBetter: true,
  },
  {
    category: "Olympic Lifting",
    movement: "Clean & Jerk",
    inputType: "kg" as const,
    placeholder: "e.g. 80",
    thresholds: {
      male: [35, 50, 72, 95, 115, 130, 150],
      female: [22, 35, 50, 65, 80, 92, 105],
    },
    higherIsBetter: true,
  },
  {
    category: "Gymnastics",
    movement: "Strict Pull-ups",
    inputType: "reps" as const,
    placeholder: "e.g. 10",
    thresholds: {
      male: [0, 1, 4, 9, 15, 21, 26],
      female: [0, 0, 2, 5, 9, 13, 17],
    },
    higherIsBetter: true,
  },
  {
    category: "Monostructural",
    movement: "2000m Row",
    inputType: "time" as const,
    placeholder: "e.g. 7:30",
    thresholds: {
      male: [570, 510, 465, 435, 410, 385, 350],
      female: [630, 570, 530, 490, 460, 430, 400],
    },
    higherIsBetter: false,
  },
  {
    category: "Bodyweight",
    movement: "Push-ups",
    inputType: "reps" as const,
    placeholder: "e.g. 35",
    thresholds: {
      male: [0, 11, 21, 36, 51, 66, 81],
      female: [0, 5, 11, 19, 29, 39, 49],
    },
    higherIsBetter: true,
  },
  {
    category: "Endurance",
    movement: "Fran",
    inputType: "time" as const,
    placeholder: "e.g. 5:00",
    thresholds: {
      male: [600, 480, 360, 270, 210, 160, 120],
      female: [660, 540, 420, 330, 260, 200, 150],
    },
    higherIsBetter: false,
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseTimeInput(input: string): number | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  // "M:SS" or "MM:SS" or "H:MM:SS"
  const parts = trimmed.split(":")
  if (parts.length === 2) {
    const m = parseInt(parts[0], 10)
    const s = parseInt(parts[1], 10)
    if (!isNaN(m) && !isNaN(s) && s >= 0 && s < 60) return m * 60 + s
  }
  if (parts.length === 3) {
    const h = parseInt(parts[0], 10)
    const m = parseInt(parts[1], 10)
    const s = parseInt(parts[2], 10)
    if (!isNaN(h) && !isNaN(m) && !isNaN(s) && m < 60 && s < 60) return h * 3600 + m * 60 + s
  }

  // Raw seconds
  const n = parseFloat(trimmed)
  if (!isNaN(n) && n >= 0) return n

  return null
}

function parseInput(input: string, inputType: "kg" | "reps" | "time"): number | null {
  if (!input.trim()) return null
  if (inputType === "time") return parseTimeInput(input)
  const n = parseFloat(input.trim())
  return !isNaN(n) && n >= 0 ? n : null
}

function determineLevel(
  value: number,
  thresholds: number[],
  higherIsBetter: boolean
): number {
  if (higherIsBetter) {
    for (let i = 6; i >= 0; i--) {
      if (value >= thresholds[i]) return i
    }
    return 0
  } else {
    for (let i = 6; i >= 0; i--) {
      if (value <= thresholds[i]) return i
    }
    return 0
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return s === 0 ? `${m}:00` : `${m}:${s.toString().padStart(2, "0")}`
}

function adjustThresholds(
  thresholds: number[],
  ageMultiplier: number,
  higherIsBetter: boolean
): number[] {
  if (ageMultiplier === 1.00) return thresholds
  if (higherIsBetter) {
    // Strength/reps: lower the threshold (easier to reach)
    return thresholds.map((t) => Math.round(t * ageMultiplier))
  } else {
    // Time: raise the threshold (more time allowed)
    return thresholds.map((t) => Math.round(t / ageMultiplier))
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function CalculatorPage() {
  const [gender, setGender] = useState<Gender>("male")
  const [ageRange, setAgeRange] = useState<AgeRange>("18-29")
  const [inputs, setInputs] = useState<Record<string, string>>({})

  const ageMultiplier = AGE_MULTIPLIERS[ageRange]

  const results = MOVEMENTS.map((m) => {
    const raw = inputs[m.category] || ""
    const value = parseInput(raw, m.inputType)
    if (value === null) return { ...m, level: null }
    const adjusted = adjustThresholds(m.thresholds[gender], ageMultiplier, m.higherIsBetter)
    const level = determineLevel(value, adjusted, m.higherIsBetter)
    return { ...m, level }
  })

  const filledCount = results.filter((r) => r.level !== null).length
  const overallLevel =
    filledCount > 0
      ? Math.min(...results.filter((r) => r.level !== null).map((r) => r.level!))
      : null

  return (
    <>
      {/* Hero */}
      <section className="relative py-20 md:py-28 px-6">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="section-tag section-tag-teal justify-center mb-6">
            Assessment Tool
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black tracking-tight mb-6">
            Level <span className="text-primary">Calculator</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Enter your numbers for one movement per category. See your level
            across all 8 categories and your overall level instantly.
          </p>
        </div>
      </section>

      {/* Controls + Form */}
      <section className="pb-8 px-6">
        <div className="container max-w-4xl mx-auto">
          {/* Gender + Age Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            {/* Gender Toggle */}
            <div className="flex bg-secondary rounded-full p-1">
              <button
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  gender === "male"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setGender("male")}
              >
                Male
              </button>
              <button
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  gender === "female"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setGender("female")}
              >
                Female
              </button>
            </div>

            {/* Age Range Toggle */}
            <div className="flex bg-secondary rounded-full p-1">
              {AGE_RANGES.map((a) => (
                <button
                  key={a.value}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    ageRange === a.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setAgeRange(a.value)}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOVEMENTS.map((m) => {
              const raw = inputs[m.category] || ""
              const value = parseInput(raw, m.inputType)
              const adjusted = adjustThresholds(m.thresholds[gender], ageMultiplier, m.higherIsBetter)
              const level = value !== null
                ? determineLevel(value, adjusted, m.higherIsBetter)
                : null

              return (
                <div
                  key={m.category}
                  className="p-5 rounded-xl border bg-card transition-all"
                  style={{
                    borderColor: level !== null ? `${LEVEL_COLORS[level]}40` : undefined,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-sm">{m.category}</h3>
                      <p className="text-xs text-muted-foreground">{m.movement}</p>
                    </div>
                    {level !== null && (
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: LEVEL_COLORS[level] }}
                        />
                        <span
                          className="text-xs font-bold"
                          style={{ color: LEVEL_COLORS[level] }}
                        >
                          {LEVEL_SHORT[level]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode={m.inputType === "time" ? "text" : "numeric"}
                      placeholder={m.placeholder}
                      value={raw}
                      onChange={(e) =>
                        setInputs((prev) => ({ ...prev, [m.category]: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                      {m.inputType === "kg" && "kg"}
                      {m.inputType === "reps" && "reps"}
                      {m.inputType === "time" && "MM:SS"}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Results */}
      {filledCount > 0 && (
        <section className="py-12 px-6">
          <div className="container max-w-4xl mx-auto">
            <h2 className="text-2xl font-display font-bold tracking-tight text-center mb-8">
              Your Results
            </h2>

            {/* Category Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {results.map((r) => (
                <div
                  key={r.category}
                  className="text-center p-4 rounded-xl border bg-card transition-all"
                  style={{
                    borderColor: r.level !== null ? `${LEVEL_COLORS[r.level]}40` : undefined,
                    backgroundColor: r.level !== null ? `${LEVEL_COLORS[r.level]}08` : undefined,
                  }}
                >
                  <p className="text-xs text-muted-foreground mb-2 font-medium">{r.category}</p>
                  {r.level !== null ? (
                    <>
                      <span
                        className="w-3 h-3 rounded-full inline-block mb-1.5"
                        style={{ backgroundColor: LEVEL_COLORS[r.level] }}
                      />
                      <p
                        className="text-sm font-bold"
                        style={{ color: LEVEL_COLORS[r.level] }}
                      >
                        {LEVEL_NAMES[r.level]}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground/40 font-medium">-</p>
                  )}
                </div>
              ))}
            </div>

            {/* Overall Level */}
            {overallLevel !== null && (
              <div
                className="text-center p-6 rounded-2xl border-2 transition-all"
                style={{
                  borderColor: `${LEVEL_COLORS[overallLevel]}60`,
                  backgroundColor: `${LEVEL_COLORS[overallLevel]}10`,
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Overall Level (Weakest Link)
                </p>
                <div className="flex items-center justify-center gap-3">
                  <span
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: LEVEL_COLORS[overallLevel] }}
                  />
                  <span
                    className="text-3xl font-display font-black"
                    style={{ color: LEVEL_COLORS[overallLevel] }}
                  >
                    {LEVEL_NAMES[overallLevel]}
                  </span>
                </div>
                {filledCount < 8 && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Based on {filledCount}/8 categories. Fill all 8 for an official overall level.
                  </p>
                )}
              </div>
            )}

            {/* Breakdown Table */}
            {filledCount >= 2 && (
              <div className="mt-8 bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2.5 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                        Category
                      </th>
                      <th className="text-left py-2.5 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                        Movement
                      </th>
                      <th className="text-center py-2.5 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                        Your Result
                      </th>
                      <th className="text-center py-2.5 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                        Level
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, idx) => {
                      const raw = inputs[r.category] || ""
                      const value = parseInput(raw, r.inputType)
                      return (
                        <tr
                          key={r.category}
                          className={`border-b border-border last:border-b-0 ${
                            idx % 2 === 0 ? "bg-secondary/50" : ""
                          }`}
                        >
                          <td className="py-2.5 px-4 font-medium">{r.category}</td>
                          <td className="py-2.5 px-4 text-muted-foreground">{r.movement}</td>
                          <td className="text-center py-2.5 px-4 tabular-nums">
                            {value !== null ? (
                              r.inputType === "time" ? formatTime(value) :
                              r.inputType === "kg" ? `${value} kg` :
                              `${value} reps`
                            ) : (
                              <span className="text-muted-foreground/40">-</span>
                            )}
                          </td>
                          <td className="text-center py-2.5 px-4">
                            {r.level !== null ? (
                              <span className="inline-flex items-center gap-1.5">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: LEVEL_COLORS[r.level] }}
                                />
                                <span
                                  className="font-bold text-xs"
                                  style={{ color: LEVEL_COLORS[r.level] }}
                                >
                                  {LEVEL_SHORT[r.level]}
                                </span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground/40">-</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Info Note */}
      <section className="pb-20 px-6">
        <div className="container max-w-3xl mx-auto">
          <div className="bg-secondary/50 dark:bg-card rounded-xl border border-border p-6 md:p-8 text-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              How It Works
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Each category uses one representative movement. Your level is determined by
              comparing your result against benchmarks for a ~80 kg male / ~60 kg female
              reference athlete. Selecting an age range adjusts all benchmarks with a flat
              multiplier (30-39: 0.96x, 40-49: 0.89x, 50+: 0.81x). Your overall level
              follows the{" "}
              <span className="font-medium text-foreground">weakest-link principle</span>:
              it equals your lowest category level.
            </p>
            <a
              href="/benchmarks"
              className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary hover:underline"
            >
              View all benchmarks
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
