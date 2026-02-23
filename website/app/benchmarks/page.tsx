"use client"

import { useState, useRef, useEffect } from "react"

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
const LEVEL_SHORT = ["BEG", "BEG+", "INT", "INT+", "ADV", "ADV+", "RX"]
const LEVEL_KEYS = [
  "beginner",
  "beginner_plus",
  "intermediate",
  "intermediate_plus",
  "advanced",
  "advanced_plus",
  "rx",
] as const

type LevelKey = (typeof LEVEL_KEYS)[number]
type Gender = "male" | "female"

// ---------------------------------------------------------------------------
// Benchmark types
// ---------------------------------------------------------------------------
type DisplayMode = "absolute" | "bw"

interface ValueBenchmark {
  name: string
  unit: string
  type: "value"
  description?: string
  male: Record<LevelKey, number>
  female: Record<LevelKey, number>
  bwMale?: Record<LevelKey, number>
  bwFemale?: Record<LevelKey, number>
}

interface RangeBenchmark {
  name: string
  unit: string
  type: "range"
  description?: string
  male: Record<LevelKey, number[]>
  female: Record<LevelKey, number[]>
}

interface TimeBenchmark {
  name: string
  unit: string
  type: "time"
  description?: string
  male: Record<LevelKey, number>
  female: Record<LevelKey, number>
}

interface RoundsBenchmark {
  name: string
  unit: string
  type: "rounds"
  description?: string
  male: Record<LevelKey, number>
  female: Record<LevelKey, number>
}

type Benchmark = ValueBenchmark | RangeBenchmark | TimeBenchmark | RoundsBenchmark

// ---------------------------------------------------------------------------
// Category metadata
// ---------------------------------------------------------------------------
const CATEGORIES = [
  { key: "squatting", label: "Squatting" },
  { key: "pulling", label: "Pulling" },
  { key: "pressing", label: "Pressing" },
  { key: "olympic_lifting", label: "Olympic Lifting" },
  { key: "gymnastics", label: "Gymnastics" },
  { key: "monostructural", label: "Monostructural" },
  { key: "bodyweight", label: "Bodyweight" },
  { key: "endurance", label: "Endurance" },
] as const

type CategoryKey = (typeof CATEGORIES)[number]["key"]

// ---------------------------------------------------------------------------
// Benchmark data (hardcoded from JSON sources)
// ---------------------------------------------------------------------------
const BENCHMARKS: Record<CategoryKey, Benchmark[]> = {
  squatting: [
    {
      name: "Back Squat",
      unit: "kg",
      type: "value",
      male: { beginner: 40, beginner_plus: 60, intermediate: 80, intermediate_plus: 105, advanced: 130, advanced_plus: 155, rx: 180 },
      female: { beginner: 25, beginner_plus: 40, intermediate: 55, intermediate_plus: 70, advanced: 85, advanced_plus: 100, rx: 120 },
      bwMale: { beginner: 0.50, beginner_plus: 0.75, intermediate: 1.00, intermediate_plus: 1.31, advanced: 1.63, advanced_plus: 1.94, rx: 2.25 },
      bwFemale: { beginner: 0.42, beginner_plus: 0.67, intermediate: 0.92, intermediate_plus: 1.17, advanced: 1.42, advanced_plus: 1.67, rx: 2.00 },
    },
    {
      name: "Front Squat",
      unit: "kg",
      type: "value",
      male: { beginner: 34, beginner_plus: 51, intermediate: 68, intermediate_plus: 89, advanced: 110, advanced_plus: 132, rx: 153 },
      female: { beginner: 21, beginner_plus: 34, intermediate: 47, intermediate_plus: 60, advanced: 72, advanced_plus: 85, rx: 102 },
      bwMale: { beginner: 0.43, beginner_plus: 0.64, intermediate: 0.85, intermediate_plus: 1.11, advanced: 1.38, advanced_plus: 1.65, rx: 1.91 },
      bwFemale: { beginner: 0.35, beginner_plus: 0.57, intermediate: 0.78, intermediate_plus: 1.00, advanced: 1.20, advanced_plus: 1.42, rx: 1.70 },
    },
    {
      name: "Overhead Squat",
      unit: "kg",
      type: "value",
      male: { beginner: 26, beginner_plus: 39, intermediate: 52, intermediate_plus: 68, advanced: 85, advanced_plus: 101, rx: 117 },
      female: { beginner: 16, beginner_plus: 26, intermediate: 36, intermediate_plus: 46, advanced: 55, advanced_plus: 65, rx: 78 },
      bwMale: { beginner: 0.33, beginner_plus: 0.49, intermediate: 0.65, intermediate_plus: 0.85, advanced: 1.06, advanced_plus: 1.26, rx: 1.46 },
      bwFemale: { beginner: 0.27, beginner_plus: 0.43, intermediate: 0.60, intermediate_plus: 0.77, advanced: 0.92, advanced_plus: 1.08, rx: 1.30 },
    },
  ],
  pulling: [
    {
      name: "Deadlift",
      unit: "kg",
      type: "value",
      male: { beginner: 60, beginner_plus: 90, intermediate: 120, intermediate_plus: 150, advanced: 180, advanced_plus: 210, rx: 240 },
      female: { beginner: 35, beginner_plus: 55, intermediate: 80, intermediate_plus: 100, advanced: 120, advanced_plus: 145, rx: 170 },
      bwMale: { beginner: 0.75, beginner_plus: 1.13, intermediate: 1.50, intermediate_plus: 1.88, advanced: 2.25, advanced_plus: 2.63, rx: 3.00 },
      bwFemale: { beginner: 0.58, beginner_plus: 0.92, intermediate: 1.33, intermediate_plus: 1.67, advanced: 2.00, advanced_plus: 2.42, rx: 2.83 },
    },
  ],
  pressing: [
    {
      name: "Strict Press",
      unit: "kg",
      type: "value",
      male: { beginner: 20, beginner_plus: 30, intermediate: 45, intermediate_plus: 55, advanced: 68, advanced_plus: 80, rx: 95 },
      female: { beginner: 12, beginner_plus: 20, intermediate: 30, intermediate_plus: 38, advanced: 45, advanced_plus: 52, rx: 57 },
      bwMale: { beginner: 0.25, beginner_plus: 0.38, intermediate: 0.56, intermediate_plus: 0.69, advanced: 0.85, advanced_plus: 1.00, rx: 1.19 },
      bwFemale: { beginner: 0.20, beginner_plus: 0.33, intermediate: 0.50, intermediate_plus: 0.63, advanced: 0.75, advanced_plus: 0.87, rx: 0.95 },
    },
    {
      name: "Bench Press",
      unit: "kg",
      type: "value",
      male: { beginner: 40, beginner_plus: 55, intermediate: 70, intermediate_plus: 90, advanced: 105, advanced_plus: 125, rx: 145 },
      female: { beginner: 20, beginner_plus: 30, intermediate: 42, intermediate_plus: 55, advanced: 65, advanced_plus: 80, rx: 90 },
      bwMale: { beginner: 0.50, beginner_plus: 0.69, intermediate: 0.88, intermediate_plus: 1.13, advanced: 1.31, advanced_plus: 1.56, rx: 1.81 },
      bwFemale: { beginner: 0.33, beginner_plus: 0.50, intermediate: 0.70, intermediate_plus: 0.92, advanced: 1.08, advanced_plus: 1.33, rx: 1.50 },
    },
  ],
  olympic_lifting: [
    {
      name: "Power Clean",
      unit: "kg",
      type: "value",
      male: { beginner: 30, beginner_plus: 45, intermediate: 65, intermediate_plus: 85, advanced: 105, advanced_plus: 120, rx: 135 },
      female: { beginner: 20, beginner_plus: 30, intermediate: 45, intermediate_plus: 57, advanced: 70, advanced_plus: 82, rx: 95 },
      bwMale: { beginner: 0.38, beginner_plus: 0.56, intermediate: 0.81, intermediate_plus: 1.06, advanced: 1.31, advanced_plus: 1.50, rx: 1.69 },
      bwFemale: { beginner: 0.33, beginner_plus: 0.50, intermediate: 0.75, intermediate_plus: 0.95, advanced: 1.17, advanced_plus: 1.37, rx: 1.58 },
    },
    {
      name: "Snatch",
      unit: "kg",
      type: "value",
      male: { beginner: 20, beginner_plus: 35, intermediate: 52, intermediate_plus: 70, advanced: 90, advanced_plus: 105, rx: 125 },
      female: { beginner: 15, beginner_plus: 25, intermediate: 37, intermediate_plus: 48, advanced: 60, advanced_plus: 70, rx: 80 },
      bwMale: { beginner: 0.25, beginner_plus: 0.44, intermediate: 0.65, intermediate_plus: 0.88, advanced: 1.13, advanced_plus: 1.31, rx: 1.56 },
      bwFemale: { beginner: 0.25, beginner_plus: 0.42, intermediate: 0.62, intermediate_plus: 0.80, advanced: 1.00, advanced_plus: 1.17, rx: 1.33 },
    },
    {
      name: "Clean & Jerk",
      unit: "kg",
      type: "value",
      male: { beginner: 35, beginner_plus: 50, intermediate: 72, intermediate_plus: 95, advanced: 115, advanced_plus: 130, rx: 150 },
      female: { beginner: 22, beginner_plus: 35, intermediate: 50, intermediate_plus: 65, advanced: 80, advanced_plus: 92, rx: 105 },
      bwMale: { beginner: 0.44, beginner_plus: 0.63, intermediate: 0.90, intermediate_plus: 1.19, advanced: 1.44, advanced_plus: 1.63, rx: 1.88 },
      bwFemale: { beginner: 0.37, beginner_plus: 0.58, intermediate: 0.83, intermediate_plus: 1.08, advanced: 1.33, advanced_plus: 1.53, rx: 1.75 },
    },
  ],
  gymnastics: [
    {
      name: "Strict Pull-ups",
      unit: "reps",
      type: "range",
      male: { beginner: [0, 0], beginner_plus: [1, 3], intermediate: [4, 8], intermediate_plus: [9, 14], advanced: [15, 20], advanced_plus: [21, 25], rx: [26, 99] },
      female: { beginner: [0, 0], beginner_plus: [0, 1], intermediate: [2, 4], intermediate_plus: [5, 8], advanced: [9, 12], advanced_plus: [13, 16], rx: [17, 99] },
    },
    {
      name: "Strict HSPU",
      unit: "reps",
      type: "range",
      male: { beginner: [0, 0], beginner_plus: [0, 0], intermediate: [1, 5], intermediate_plus: [6, 10], advanced: [11, 18], advanced_plus: [19, 28], rx: [29, 99] },
      female: { beginner: [0, 0], beginner_plus: [0, 0], intermediate: [1, 3], intermediate_plus: [4, 7], advanced: [8, 13], advanced_plus: [14, 20], rx: [21, 99] },
    },
    {
      name: "Toes to Bar",
      unit: "reps",
      type: "range",
      male: { beginner: [0, 0], beginner_plus: [1, 3], intermediate: [4, 10], intermediate_plus: [11, 16], advanced: [17, 24], advanced_plus: [25, 31], rx: [32, 99] },
      female: { beginner: [0, 0], beginner_plus: [1, 2], intermediate: [3, 7], intermediate_plus: [8, 11], advanced: [12, 17], advanced_plus: [18, 22], rx: [23, 99] },
    },
    {
      name: "Bar Muscle-ups",
      unit: "reps",
      type: "range",
      male: { beginner: [0, 0], beginner_plus: [0, 0], intermediate: [0, 0], intermediate_plus: [1, 4], advanced: [5, 9], advanced_plus: [10, 14], rx: [15, 99] },
      female: { beginner: [0, 0], beginner_plus: [0, 0], intermediate: [0, 0], intermediate_plus: [1, 2], advanced: [3, 6], advanced_plus: [7, 10], rx: [11, 99] },
    },
    {
      name: "Ring Muscle-ups",
      unit: "reps",
      type: "range",
      male: { beginner: [0, 0], beginner_plus: [0, 0], intermediate: [0, 0], intermediate_plus: [1, 3], advanced: [4, 8], advanced_plus: [9, 15], rx: [16, 99] },
      female: { beginner: [0, 0], beginner_plus: [0, 0], intermediate: [0, 0], intermediate_plus: [1, 2], advanced: [3, 5], advanced_plus: [6, 10], rx: [11, 99] },
    },
  ],
  monostructural: [
    {
      name: "500m Row",
      unit: "seconds",
      type: "time",
      male: { beginner: 150, beginner_plus: 130, intermediate: 115, intermediate_plus: 105, advanced: 98, advanced_plus: 90, rx: 84 },
      female: { beginner: 170, beginner_plus: 150, intermediate: 135, intermediate_plus: 125, advanced: 115, advanced_plus: 105, rx: 98 },
    },
    {
      name: "2000m Row",
      unit: "seconds",
      type: "time",
      male: { beginner: 570, beginner_plus: 510, intermediate: 465, intermediate_plus: 435, advanced: 410, advanced_plus: 385, rx: 350 },
      female: { beginner: 630, beginner_plus: 570, intermediate: 530, intermediate_plus: 490, advanced: 460, advanced_plus: 430, rx: 400 },
    },
    {
      name: "1 Mile Run",
      unit: "seconds",
      type: "time",
      male: { beginner: 600, beginner_plus: 510, intermediate: 450, intermediate_plus: 405, advanced: 370, advanced_plus: 340, rx: 310 },
      female: { beginner: 660, beginner_plus: 570, intermediate: 510, intermediate_plus: 465, advanced: 420, advanced_plus: 390, rx: 360 },
    },
    {
      name: "5K Run",
      unit: "seconds",
      type: "time",
      male: { beginner: 1920, beginner_plus: 1680, intermediate: 1440, intermediate_plus: 1260, advanced: 1140, advanced_plus: 1050, rx: 960 },
      female: { beginner: 2160, beginner_plus: 1920, intermediate: 1680, intermediate_plus: 1500, advanced: 1320, advanced_plus: 1230, rx: 1140 },
    },
  ],
  bodyweight: [
    {
      name: "Push-ups",
      unit: "reps",
      type: "range",
      male: { beginner: [0, 10], beginner_plus: [11, 20], intermediate: [21, 35], intermediate_plus: [36, 50], advanced: [51, 65], advanced_plus: [66, 80], rx: [81, 199] },
      female: { beginner: [0, 4], beginner_plus: [5, 10], intermediate: [11, 18], intermediate_plus: [19, 28], advanced: [29, 38], advanced_plus: [39, 48], rx: [49, 199] },
    },
    {
      name: "Double-unders",
      unit: "reps",
      type: "range",
      male: { beginner: [0, 0], beginner_plus: [1, 5], intermediate: [6, 25], intermediate_plus: [26, 50], advanced: [51, 80], advanced_plus: [81, 120], rx: [121, 999] },
      female: { beginner: [0, 0], beginner_plus: [1, 5], intermediate: [6, 25], intermediate_plus: [26, 50], advanced: [51, 80], advanced_plus: [81, 120], rx: [121, 999] },
    },
    {
      name: "Pistol Squats",
      unit: "reps/leg",
      type: "range",
      male: { beginner: [0, 0], beginner_plus: [0, 0], intermediate: [1, 3], intermediate_plus: [4, 8], advanced: [9, 15], advanced_plus: [16, 24], rx: [25, 99] },
      female: { beginner: [0, 0], beginner_plus: [0, 0], intermediate: [1, 2], intermediate_plus: [3, 6], advanced: [7, 12], advanced_plus: [13, 20], rx: [21, 99] },
    },
  ],
  endurance: [
    {
      name: "Fran",
      unit: "seconds",
      type: "time",
      description: "21-15-9: Thrusters (43/30kg) + Pull-ups",
      male: { beginner: 600, beginner_plus: 480, intermediate: 360, intermediate_plus: 270, advanced: 210, advanced_plus: 160, rx: 120 },
      female: { beginner: 660, beginner_plus: 540, intermediate: 420, intermediate_plus: 330, advanced: 260, advanced_plus: 200, rx: 150 },
    },
    {
      name: "Grace",
      unit: "seconds",
      type: "time",
      description: "30 Clean & Jerk (61/43kg)",
      male: { beginner: 480, beginner_plus: 360, intermediate: 270, intermediate_plus: 210, advanced: 165, advanced_plus: 130, rx: 100 },
      female: { beginner: 540, beginner_plus: 420, intermediate: 330, intermediate_plus: 260, advanced: 200, advanced_plus: 160, rx: 120 },
    },
    {
      name: "Murph",
      unit: "seconds",
      type: "time",
      description: "1mi + 100PU/200PU/300SQ + 1mi (w/ vest)",
      male: { beginner: 4200, beginner_plus: 3600, intermediate: 3150, intermediate_plus: 2700, advanced: 2400, advanced_plus: 2100, rx: 1800 },
      female: { beginner: 4500, beginner_plus: 3900, intermediate: 3450, intermediate_plus: 3000, advanced: 2640, advanced_plus: 2340, rx: 2100 },
    },
    {
      name: "Cindy",
      unit: "rounds",
      type: "rounds",
      description: "20min AMRAP: 5PU/10PU/15SQ",
      male: { beginner: 8, beginner_plus: 11, intermediate: 14, intermediate_plus: 17, advanced: 20, advanced_plus: 23, rx: 26 },
      female: { beginner: 6, beginner_plus: 9, intermediate: 12, intermediate_plus: 15, advanced: 18, advanced_plus: 21, rx: 24 },
    },
  ],
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s === 0 ? `${m}:00` : `${m}:${s.toString().padStart(2, "0")}`
}

function formatRange(range: number[]): string {
  if (range[0] === 0 && range[1] === 0) return "-"
  // Cap display at a readable upper bound (99, 199, 999 all mean "or more")
  if (range[1] >= 99) return `${range[0]}+`
  if (range[0] === range[1]) return `${range[0]}`
  return `${range[0]}-${range[1]}`
}

function formatCell(benchmark: Benchmark, gender: Gender, levelKey: LevelKey, displayMode: DisplayMode = "absolute"): string {
  if (displayMode === "bw" && benchmark.type === "value") {
    const vb = benchmark as ValueBenchmark
    const bwData = gender === "male" ? vb.bwMale : vb.bwFemale
    if (bwData) {
      const val = bwData[levelKey]
      return `${val.toFixed(2)}x`
    }
  }

  const data = benchmark[gender] as Record<LevelKey, number | number[]>
  const val = data[levelKey]

  switch (benchmark.type) {
    case "value":
      return `${val} kg`
    case "range":
      return formatRange(val as number[])
    case "time":
      return formatTime(val as number)
    case "rounds":
      return `${val} rds`
    default:
      return String(val)
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function BenchmarksPage() {
  const [gender, setGender] = useState<Gender>("male")
  const [displayMode, setDisplayMode] = useState<DisplayMode>("absolute")
  const [activeCategory, setActiveCategory] = useState<"all" | CategoryKey>("all")
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftFade, setShowLeftFade] = useState(false)
  const [showRightFade, setShowRightFade] = useState(false)

  const visibleCategories =
    activeCategory === "all"
      ? CATEGORIES
      : CATEGORIES.filter((c) => c.key === activeCategory)

  // Check pill scroll overflow for fade indicators
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const check = () => {
      setShowLeftFade(el.scrollLeft > 4)
      setShowRightFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
    }
    check()
    el.addEventListener("scroll", check, { passive: true })
    window.addEventListener("resize", check)
    return () => {
      el.removeEventListener("scroll", check)
      window.removeEventListener("resize", check)
    }
  }, [])

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 px-6">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="section-tag section-tag-teal justify-center mb-6">
            Standards Database
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black tracking-tight mb-6">
            Benchmark <span className="text-primary">Standards</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Every number traces to peer-reviewed research. Browse all benchmarks
            across 8 categories and 7 progression levels.
          </p>
        </div>
      </section>

      {/* Controls Bar */}
      <section className="sticky top-16 z-40 bg-background/80 backdrop-blur-xl border-b border-border py-4 px-6">
        <div className="container flex flex-col sm:flex-row items-center gap-4">
          {/* Gender Toggle */}
          <div className="flex bg-secondary rounded-full p-1 flex-shrink-0">
            <button
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                gender === "male"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setGender("male")}
            >
              Male
            </button>
            <button
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                gender === "female"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setGender("female")}
            >
              Female
            </button>
          </div>

          {/* Display Mode Toggle */}
          <div className="flex bg-secondary rounded-full p-1 flex-shrink-0">
            <button
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                displayMode === "absolute"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setDisplayMode("absolute")}
            >
              kg
            </button>
            <button
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                displayMode === "bw"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setDisplayMode("bw")}
              title="Show as bodyweight multiplier (for strength benchmarks)"
            >
              x BW
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="relative flex-1 min-w-0 w-full sm:w-auto">
            {showLeftFade && (
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background/80 to-transparent z-10 pointer-events-none rounded-l-full" />
            )}
            <div
              ref={scrollRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <button
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveCategory("all")}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    activeCategory === cat.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setActiveCategory(cat.key)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            {showRightFade && (
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background/80 to-transparent z-10 pointer-events-none rounded-r-full" />
            )}
          </div>
        </div>
      </section>

      {/* Benchmark Tables */}
      <section className="py-12 md:py-16 px-6">
        <div className="container space-y-12">
          {visibleCategories.map((cat) => {
            const benchmarks = BENCHMARKS[cat.key]
            return (
              <div key={cat.key}>
                {/* Category heading */}
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight">
                    {cat.label}
                  </h2>
                  <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full font-medium">
                    {benchmarks.length} {benchmarks.length === 1 ? "movement" : "movements"}
                  </span>
                </div>

                {/* Table card */}
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="sticky left-0 z-10 bg-card text-left py-2 sm:py-3 px-3 sm:px-4 font-semibold text-muted-foreground text-[10px] sm:text-xs uppercase tracking-wider min-w-[120px] sm:min-w-[160px]">
                            Movement
                          </th>
                          {LEVEL_KEYS.map((key, i) => (
                            <th
                              key={key}
                              className="text-center py-2 sm:py-3 px-2 sm:px-3 font-semibold text-[10px] sm:text-xs uppercase tracking-wider min-w-[56px] sm:min-w-[80px]"
                            >
                              <div className="flex flex-col items-center gap-1.5">
                                <span
                                  className="w-2.5 h-2.5 rounded-full inline-block"
                                  style={{ backgroundColor: LEVEL_COLORS[i] }}
                                />
                                <span className="text-muted-foreground">
                                  {LEVEL_SHORT[i]}
                                </span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {benchmarks.map((benchmark, rowIdx) => (
                          <tr
                            key={benchmark.name}
                            className={`border-b border-border last:border-b-0 transition-colors hover:bg-muted/50 ${
                              rowIdx % 2 === 0 ? "bg-secondary/50" : ""
                            }`}
                          >
                            <td className="sticky left-0 z-10 py-2 sm:py-3 px-3 sm:px-4 font-medium text-sm bg-inherit">
                              <div>
                                <span className="text-foreground">{benchmark.name}</span>
                                {benchmark.description && (
                                  <span className="block text-xs text-muted-foreground mt-0.5">
                                    {benchmark.description}
                                  </span>
                                )}
                              </div>
                            </td>
                            {LEVEL_KEYS.map((key) => {
                              const cellValue = formatCell(benchmark, gender, key, displayMode)
                              return (
                                <td
                                  key={key}
                                  className="text-center py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm tabular-nums"
                                >
                                  <span
                                    className={
                                      cellValue === "-"
                                        ? "text-muted-foreground/40"
                                        : "text-foreground/90 font-medium"
                                    }
                                  >
                                    {cellValue}
                                  </span>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Methodology note */}
      <section className="pb-20 px-6">
        <div className="container max-w-3xl mx-auto">
          <div className="bg-secondary/50 dark:bg-card rounded-xl border border-border p-6 md:p-8 text-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              About These Numbers
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              All benchmark standards are based on an approximately 80 kg male and 60 kg
              female reference athlete. Values are derived from peer-reviewed research,
              competition data, and established fitness testing databases. Use the
              &quot;x BW&quot; toggle to view strength benchmarks as bodyweight multipliers.
            </p>
            <a
              href="/methodology"
              className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary hover:underline"
            >
              Read the full methodology
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
