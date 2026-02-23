"use client"

import { useState, useMemo } from "react"
import { Search, ChevronDown, ChevronUp, Clock, Repeat, Zap, Dumbbell } from "lucide-react"

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
// Metcon types from the JSON
// ---------------------------------------------------------------------------
interface LoadPair {
  male: number
  female: number
}

interface ScalingOverride {
  sub?: string
  load?: LoadPair
  height?: LoadPair
  reps?: number
  distance?: number
  calories?: number
}

interface Movement {
  movement: string
  reps?: number
  load?: LoadPair
  height?: LoadPair
  distance?: number
  calories?: number
  unit?: string
  scaling?: Partial<Record<Exclude<LevelKey, "rx">, ScalingOverride>>
}

interface EMOMGroup {
  movements: Movement[]
}

interface Metcon {
  code: string
  name: string
  type: string
  timeCap: number
  rounds?: number
  repScheme?: number[]
  interval?: number
  pattern?: string[]
  groups?: Record<string, EMOMGroup>
  stimulus: {
    duration: string
    feel: string
    intent: string
  }
  coachNotes: string
  movements?: Movement[]
}

// ---------------------------------------------------------------------------
// Metcon data (hardcoded from metcons.json)
// ---------------------------------------------------------------------------
const METCONS: Metcon[] = [
  {
    code: "OP-001",
    name: "Quick Ember",
    type: "for_time",
    timeCap: 8,
    rounds: 3,
    stimulus: {
      duration: "4-7 min",
      feel: "Short sprint. Power cleans should be fast singles or quick touch-and-go. Push-ups are active recovery.",
      intent: "Barbell cycling speed, pushing through short-duration discomfort",
    },
    coachNotes: "Touch-and-go cleans if possible — singles are fine but don't rest between reps. Push-ups should be unbroken for at least round 1. If cleans are slow singles from the start, go lighter.",
    movements: [
      {
        movement: "Power Clean", reps: 10, load: { male: 61, female: 43 }, unit: "kg",
        scaling: {
          advanced_plus: { load: { male: 56, female: 40 } },
          advanced: { load: { male: 48, female: 34 } },
          intermediate_plus: { load: { male: 43, female: 30 } },
          intermediate: { load: { male: 34, female: 25 } },
          beginner_plus: { load: { male: 25, female: 20 } },
          beginner: { load: { male: 20, female: 15 } },
        },
      },
      {
        movement: "Push-up", reps: 15,
        scaling: {
          advanced_plus: {},
          advanced: {},
          intermediate_plus: { reps: 12 },
          intermediate: { reps: 12 },
          beginner_plus: { sub: "Knee Push-up", reps: 12 },
          beginner: { sub: "Knee Push-up", reps: 10 },
        },
      },
    ],
  },
  {
    code: "OP-002",
    name: "Sweet Honey",
    type: "amrap",
    timeCap: 12,
    stimulus: {
      duration: "12 min",
      feel: "Balanced and approachable. Should feel like a rhythm you can sustain — no single movement should break you.",
      intent: "Mixed modal conditioning, pacing across three domains",
    },
    coachNotes: "Find a sustainable pace from round 1 — don't go out too hot on the run. KB swings should be unbroken every round. TTB in 1-2 sets. Target 6-8 rounds at Rx.",
    movements: [
      { movement: "Run", distance: 200, unit: "m" },
      {
        movement: "Kettlebell Swing", reps: 10, load: { male: 24, female: 16 }, unit: "kg",
        scaling: {
          advanced_plus: { load: { male: 24, female: 16 } },
          advanced: { load: { male: 20, female: 12 } },
          intermediate_plus: { load: { male: 16, female: 12 } },
          intermediate: { load: { male: 16, female: 8 } },
          beginner_plus: { sub: "Russian Kettlebell Swing", load: { male: 12, female: 8 } },
          beginner: { sub: "Russian Kettlebell Swing", load: { male: 8, female: 6 } },
        },
      },
      {
        movement: "Toes-to-Bar", reps: 8,
        scaling: {
          advanced_plus: {},
          advanced: { sub: "Hanging Knee Raise" },
          intermediate_plus: { sub: "Hanging Knee Raise" },
          intermediate: { sub: "Hanging Knee Raise", reps: 6 },
          beginner_plus: { sub: "Sit-up", reps: 12 },
          beginner: { sub: "Sit-up", reps: 10 },
        },
      },
    ],
  },
  {
    code: "OP-003",
    name: "Heavy Iron",
    type: "for_time",
    timeCap: 18,
    rounds: 5,
    stimulus: {
      duration: "10-15 min",
      feel: "Heavy barbell complex. Low reps but challenging loads. Rest between rounds is expected — the weight is the challenge, not the pace.",
      intent: "Strength endurance across three barbell movements, cycling heavy loads under fatigue",
    },
    coachNotes: "This is NOT a sprint. Take 15-30s between movements if needed. Deadlifts should be heavy but controlled. Front squats from the floor — clean the first rep. Press should be tough but doable for 3 unbroken. Scale load to keep all three movements unbroken.",
    movements: [
      {
        movement: "Deadlift", reps: 3, load: { male: 102, female: 70 }, unit: "kg",
        scaling: {
          advanced_plus: { load: { male: 93, female: 65 } },
          advanced: { load: { male: 84, female: 57 } },
          intermediate_plus: { load: { male: 70, female: 48 } },
          intermediate: { load: { male: 61, female: 43 } },
          beginner_plus: { load: { male: 48, female: 34 } },
          beginner: { load: { male: 34, female: 25 } },
        },
      },
      {
        movement: "Front Squat", reps: 3, load: { male: 70, female: 48 }, unit: "kg",
        scaling: {
          advanced_plus: { load: { male: 65, female: 45 } },
          advanced: { load: { male: 57, female: 40 } },
          intermediate_plus: { load: { male: 48, female: 34 } },
          intermediate: { load: { male: 43, female: 30 } },
          beginner_plus: { load: { male: 34, female: 25 } },
          beginner: { load: { male: 25, female: 20 } },
        },
      },
      {
        movement: "Strict Press", reps: 3, load: { male: 43, female: 30 }, unit: "kg",
        scaling: {
          advanced_plus: { load: { male: 40, female: 27 } },
          advanced: { load: { male: 34, female: 25 } },
          intermediate_plus: { load: { male: 30, female: 20 } },
          intermediate: { load: { male: 25, female: 18 } },
          beginner_plus: { load: { male: 20, female: 15 } },
          beginner: { load: { male: 15, female: 10 } },
        },
      },
    ],
  },
  {
    code: "OP-004",
    name: "Sharp Frost",
    type: "emom",
    timeCap: 16,
    interval: 1,
    pattern: ["A", "B"],
    stimulus: {
      duration: "16 min",
      feel: "Interval work — push hard, recover within the minute. Should have 15-20s rest each round at Rx.",
      intent: "Power output under repeating time pressure, barbell skill under fatigue",
    },
    coachNotes: "Snatches should be crisp singles or quick touch-and-go — no grinding reps. Burpees are the engine piece. If athletes can't finish within 40-45 seconds, reduce snatch load or burpee reps.",
    groups: {
      A: {
        movements: [
          {
            movement: "Power Snatch", reps: 3, load: { male: 52, female: 35 }, unit: "kg",
            scaling: {
              advanced_plus: { load: { male: 48, female: 32 } },
              advanced: { load: { male: 43, female: 30 } },
              intermediate_plus: { load: { male: 35, female: 25 } },
              intermediate: { load: { male: 30, female: 20 } },
              beginner_plus: { sub: "Power Clean", load: { male: 25, female: 18 } },
              beginner: { sub: "Power Clean", load: { male: 20, female: 15 } },
            },
          },
        ],
      },
      B: {
        movements: [
          {
            movement: "Bar-facing Burpee", reps: 8,
            scaling: {
              advanced_plus: {},
              advanced: { reps: 7 },
              intermediate_plus: { reps: 6 },
              intermediate: { sub: "Burpee", reps: 6 },
              beginner_plus: { sub: "Burpee", reps: 5 },
              beginner: { sub: "Up-Down", reps: 5 },
            },
          },
        ],
      },
    },
  },
  {
    code: "OP-005",
    name: "Spicy Gravel",
    type: "for_time",
    timeCap: 12,
    repScheme: [21, 15, 9],
    stimulus: {
      duration: "6-10 min",
      feel: "High intensity couplet. The descending reps give you hope — but the burpees are relentless. Should hurt from round 2 onward.",
      intent: "High-intensity mixed modal work, mental toughness through descending reps",
    },
    coachNotes: "Wall balls should be unbroken in the round of 21 at Rx. Burpees set the pace — just keep moving. Scale wall ball weight to maintain large sets.",
    movements: [
      {
        movement: "Wall Ball", load: { male: 9, female: 6 }, unit: "kg",
        scaling: {
          advanced_plus: { load: { male: 9, female: 6 } },
          advanced: { load: { male: 6, female: 4 } },
          intermediate_plus: { load: { male: 6, female: 4 } },
          intermediate: { load: { male: 6, female: 4 } },
          beginner_plus: { load: { male: 4, female: 3 } },
          beginner: { load: { male: 4, female: 3 } },
        },
      },
      {
        movement: "Burpee",
        scaling: {
          advanced_plus: {},
          advanced: {},
          intermediate_plus: {},
          intermediate: {},
          beginner_plus: { sub: "Burpee to Target" },
          beginner: { sub: "Up-Down" },
        },
      },
    ],
  },
  {
    code: "OP-006",
    name: "Long Oatmeal",
    type: "amrap",
    timeCap: 25,
    stimulus: {
      duration: "25 min",
      feel: "Steady engine work. No single movement should gas you — find a rhythm and hold it for 25 minutes.",
      intent: "Aerobic capacity, pacing discipline, sustained mixed modal output",
    },
    coachNotes: "This is a pacer, not a sprint. Athletes should be able to talk between movements. If the cleans slow to singles, go lighter. Run should be conversational pace. Target 5-7 rounds at Rx.",
    movements: [
      { movement: "Run", distance: 400, unit: "m" },
      {
        movement: "Wall Ball", reps: 15, load: { male: 9, female: 6 }, unit: "kg",
        scaling: {
          advanced_plus: { load: { male: 9, female: 6 } },
          advanced: { load: { male: 6, female: 4 } },
          intermediate_plus: { load: { male: 6, female: 4 } },
          intermediate: { load: { male: 6, female: 4 }, reps: 12 },
          beginner_plus: { load: { male: 4, female: 3 }, reps: 12 },
          beginner: { load: { male: 4, female: 3 }, reps: 10 },
        },
      },
      {
        movement: "Toes-to-Bar", reps: 10,
        scaling: {
          advanced_plus: {},
          advanced: { sub: "Hanging Knee Raise" },
          intermediate_plus: { sub: "Hanging Knee Raise" },
          intermediate: { sub: "Hanging Knee Raise", reps: 8 },
          beginner_plus: { sub: "Sit-up", reps: 15 },
          beginner: { sub: "Sit-up", reps: 12 },
        },
      },
      {
        movement: "Power Clean", reps: 5, load: { male: 61, female: 43 }, unit: "kg",
        scaling: {
          advanced_plus: { load: { male: 56, female: 40 } },
          advanced: { load: { male: 48, female: 34 } },
          intermediate_plus: { load: { male: 43, female: 30 } },
          intermediate: { load: { male: 34, female: 25 } },
          beginner_plus: { load: { male: 25, female: 20 } },
          beginner: { load: { male: 20, female: 15 } },
        },
      },
    ],
  },
  {
    code: "OP-007",
    name: "Dark Thunder",
    type: "for_time",
    timeCap: 16,
    rounds: 3,
    stimulus: {
      duration: "8-14 min",
      feel: "Gymnastics-heavy and skill-demanding. Every movement requires control and body awareness. Mental focus matters more than fitness here.",
      intent: "Gymnastics skill under fatigue, unilateral strength, coordination",
    },
    coachNotes: "Bar muscle-ups in small sets from the start — don't burn out in round 1. Pistols should be controlled, not rushed. Double-unders are active recovery. Scale movements to maintain quality — ugly muscle-ups are worse than clean pull-ups.",
    movements: [
      {
        movement: "Bar Muscle-up", reps: 5,
        scaling: {
          advanced_plus: { sub: "Chest-to-Bar Pull-up", reps: 7 },
          advanced: { sub: "Chest-to-Bar Pull-up", reps: 8 },
          intermediate_plus: { sub: "Pull-up", reps: 8 },
          intermediate: { sub: "Pull-up", reps: 7 },
          beginner_plus: { sub: "Jumping Pull-up", reps: 8 },
          beginner: { sub: "Ring Row", reps: 10 },
        },
      },
      {
        movement: "Pistol Squat", reps: 10,
        scaling: {
          advanced_plus: {},
          advanced: { sub: "Pistol Squat to Box" },
          intermediate_plus: { sub: "Pistol Squat to Box" },
          intermediate: { sub: "Air Squat", reps: 20 },
          beginner_plus: { sub: "Air Squat", reps: 15 },
          beginner: { sub: "Air Squat", reps: 12 },
        },
      },
      {
        movement: "Double-Under", reps: 30,
        scaling: {
          advanced_plus: {},
          advanced: { reps: 25 },
          intermediate_plus: { reps: 20 },
          intermediate: { sub: "Single-Under", reps: 60 },
          beginner_plus: { sub: "Single-Under", reps: 50 },
          beginner: { sub: "Single-Under", reps: 40 },
        },
      },
    ],
  },
  {
    code: "OP-008",
    name: "Light Lemon",
    type: "for_time",
    timeCap: 10,
    stimulus: {
      duration: "5-8 min",
      feel: "Fast bodyweight chipper. No equipment, no excuses. The descending reps make each movement feel shorter — just keep moving.",
      intent: "Bodyweight conditioning, sustained effort without external load",
    },
    coachNotes: "This is about constant movement — there's no reason to stop. Double-unders should be unbroken at Rx. Push-ups are where most athletes slow down. Scale to keep moving the entire time.",
    movements: [
      {
        movement: "Double-Under", reps: 50,
        scaling: {
          advanced_plus: {},
          advanced: { reps: 40 },
          intermediate_plus: { reps: 30 },
          intermediate: { sub: "Single-Under", reps: 100 },
          beginner_plus: { sub: "Single-Under", reps: 75 },
          beginner: { sub: "Single-Under", reps: 50 },
        },
      },
      {
        movement: "Air Squat", reps: 40,
        scaling: {
          advanced_plus: {},
          advanced: {},
          intermediate_plus: { reps: 35 },
          intermediate: { reps: 30 },
          beginner_plus: { reps: 25 },
          beginner: { reps: 20 },
        },
      },
      {
        movement: "Push-up", reps: 30,
        scaling: {
          advanced_plus: {},
          advanced: { reps: 25 },
          intermediate_plus: { reps: 20 },
          intermediate: { reps: 15 },
          beginner_plus: { sub: "Knee Push-up", reps: 15 },
          beginner: { sub: "Knee Push-up", reps: 10 },
        },
      },
      {
        movement: "Jumping Lunge", reps: 20,
        scaling: {
          advanced_plus: {},
          advanced: {},
          intermediate_plus: { reps: 16 },
          intermediate: { sub: "Walking Lunge", reps: 16 },
          beginner_plus: { sub: "Walking Lunge", reps: 12 },
          beginner: { sub: "Walking Lunge", reps: 10 },
        },
      },
      {
        movement: "Burpee", reps: 10,
        scaling: {
          advanced_plus: {},
          advanced: {},
          intermediate_plus: {},
          intermediate: {},
          beginner_plus: { sub: "Burpee to Target" },
          beginner: { sub: "Up-Down", reps: 8 },
        },
      },
    ],
  },
  {
    code: "OP-009",
    name: "Thick Smoke",
    type: "for_time",
    timeCap: 14,
    rounds: 3,
    stimulus: {
      duration: "8-14 min",
      feel: "Moderate grind. Thrusters are the challenge — heavy enough to demand respect but light enough for sets. Pull-ups are the rest. Box jumps keep the legs honest.",
      intent: "Mixed modal, barbell cycling under fatigue, classic triplet",
    },
    coachNotes: "Break thrusters at 8 if needed — don't go to failure in round 1. Pull-ups should be quick sets. Box jumps are steady — no need to sprint them. Scale load to keep under the cap.",
    movements: [
      {
        movement: "Thruster", reps: 15, load: { male: 43, female: 30 }, unit: "kg",
        scaling: {
          advanced_plus: { load: { male: 40, female: 27 } },
          advanced: { load: { male: 34, female: 25 } },
          intermediate_plus: { load: { male: 30, female: 20 } },
          intermediate: { load: { male: 25, female: 18 } },
          beginner_plus: { load: { male: 20, female: 15 } },
          beginner: { load: { male: 15, female: 10 } },
        },
      },
      {
        movement: "Pull-up", reps: 12,
        scaling: {
          advanced_plus: {},
          advanced: {},
          intermediate_plus: { sub: "Jumping Pull-up" },
          intermediate: { sub: "Jumping Pull-up", reps: 10 },
          beginner_plus: { sub: "Ring Row" },
          beginner: { sub: "Ring Row", reps: 8 },
        },
      },
      {
        movement: "Box Jump", reps: 9, height: { male: 60, female: 50 }, unit: "cm",
        scaling: {
          advanced_plus: {},
          advanced: { height: { male: 50, female: 40 } },
          intermediate_plus: { height: { male: 50, female: 40 } },
          intermediate: { sub: "Box Step-up", height: { male: 50, female: 40 } },
          beginner_plus: { sub: "Box Step-up", height: { male: 50, female: 40 } },
          beginner: { sub: "Box Step-up", height: { male: 40, female: 30 } },
        },
      },
    ],
  },
  {
    code: "OP-010",
    name: "Loud Copper",
    type: "for_time",
    timeCap: 22,
    stimulus: {
      duration: "15-22 min",
      feel: "Big and explosive. The rows bookend the barbell work — you'll need to find your pace on the erg knowing 30 clean & jerks are waiting. The second row is where mental toughness shows.",
      intent: "Engine capacity, explosive barbell cycling, pacing strategy",
    },
    coachNotes: "Don't blow up on the first row — save energy for the barbell. C&J should be quick singles or small touch-and-go sets. The second row will feel harder than the first — that's normal. Settle in and hold a pace.",
    movements: [
      { movement: "Row", distance: 1000, unit: "m" },
      {
        movement: "Clean & Jerk", reps: 30, load: { male: 61, female: 43 }, unit: "kg",
        scaling: {
          advanced_plus: { load: { male: 56, female: 40 } },
          advanced: { load: { male: 48, female: 34 } },
          intermediate_plus: { load: { male: 43, female: 30 } },
          intermediate: { load: { male: 34, female: 25 } },
          beginner_plus: { sub: "Power Clean & Push Press", load: { male: 25, female: 20 } },
          beginner: { sub: "Power Clean & Push Press", load: { male: 20, female: 15 } },
        },
      },
      { movement: "Row", distance: 1000, unit: "m" },
    ],
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const TYPE_LABELS: Record<string, string> = {
  for_time: "For Time",
  amrap: "AMRAP",
  emom: "EMOM",
  for_load: "For Load",
  intervals: "Intervals",
}

const TYPE_ICONS: Record<string, typeof Clock> = {
  for_time: Clock,
  amrap: Repeat,
  emom: Zap,
  for_load: Dumbbell,
  intervals: Zap,
}

function resolveMovement(
  mov: Movement,
  level: LevelKey,
  gender: Gender
): { name: string; detail: string } {
  const scaling = level !== "rx" ? mov.scaling?.[level as Exclude<LevelKey, "rx">] : undefined
  const name = scaling?.sub || mov.movement
  const reps = scaling?.reps ?? mov.reps
  const load = scaling?.load ?? mov.load
  const height = scaling?.height ?? mov.height
  const distance = mov.distance
  const calories = mov.calories

  const parts: string[] = []
  if (reps) parts.push(`${reps}`)
  if (distance) parts.push(`${distance}${mov.unit || "m"}`)
  if (calories) parts.push(`${calories} cal`)

  let detail = parts.join(" ")
  if (load) {
    const val = gender === "male" ? load.male : load.female
    detail += ` @ ${val}${mov.unit || "kg"}`
  }
  if (height) {
    const val = gender === "male" ? height.male : height.female
    detail += ` (${val}${mov.unit || "cm"})`
  }

  return { name, detail }
}

function formatHeader(metcon: Metcon): string {
  if (metcon.repScheme) {
    return `${metcon.repScheme.join("-")} ${TYPE_LABELS[metcon.type] || metcon.type}`
  }
  if (metcon.rounds) {
    return `${metcon.rounds} Rounds ${TYPE_LABELS[metcon.type] || metcon.type}`
  }
  if (metcon.type === "amrap") {
    return `${metcon.timeCap} min AMRAP`
  }
  if (metcon.type === "emom") {
    const label = metcon.interval === 1 ? "EMOM" : `E${metcon.interval}MOM`
    return `${metcon.timeCap} min ${label}`
  }
  return TYPE_LABELS[metcon.type] || metcon.type
}

function getAllMovements(metcon: Metcon): Movement[] {
  if (metcon.movements) return metcon.movements
  if (metcon.groups) {
    return Object.values(metcon.groups).flatMap((g) => g.movements)
  }
  return []
}

function getMovementNames(metcon: Metcon): string[] {
  return getAllMovements(metcon).map((m) => m.movement)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ProgrammingPage() {
  const [gender, setGender] = useState<Gender>("male")
  const [level, setLevel] = useState<number>(6) // default Rx
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [expandedCode, setExpandedCode] = useState<string | null>(null)

  const levelKey = LEVEL_KEYS[level]

  const filtered = useMemo(() => {
    return METCONS.filter((m) => {
      if (typeFilter !== "all" && m.type !== typeFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const nameMatch = m.name.toLowerCase().includes(q)
        const codeMatch = m.code.toLowerCase().includes(q)
        const movementMatch = getMovementNames(m).some((n) => n.toLowerCase().includes(q))
        if (!nameMatch && !codeMatch && !movementMatch) return false
      }
      return true
    })
  }, [search, typeFilter])

  const types = ["all", "for_time", "amrap", "emom"]

  return (
    <>
      {/* Hero */}
      <section className="relative py-20 md:py-28 px-6">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="section-tag section-tag-teal justify-center mb-6">
            WOD Library
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black tracking-tight mb-6">
            <span className="text-primary">Programming</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse the metcon library. Every workout scaled to your level.
          </p>
        </div>
      </section>

      {/* Controls */}
      <section className="pb-4 px-6">
        <div className="container max-w-5xl mx-auto">
          <div className="flex flex-col gap-4">
            {/* Row 1: Gender + Level */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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

              {/* Level Selector */}
              <div className="flex bg-secondary rounded-full p-1">
                {LEVEL_NAMES.map((name, i) => (
                  <button
                    key={i}
                    className={`px-3 py-2 rounded-full text-xs font-bold transition-colors ${
                      level === i
                        ? "text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    style={{
                      backgroundColor: level === i ? LEVEL_COLORS[i] : undefined,
                    }}
                    onClick={() => setLevel(i)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Search + Type Filter */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, code, or movement..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>

              {/* Type Filter */}
              <div className="flex bg-secondary rounded-full p-1">
                {types.map((t) => (
                  <button
                    key={t}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                      typeFilter === t
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setTypeFilter(t)}
                  >
                    {t === "all" ? "All" : TYPE_LABELS[t] || t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WOD Cards */}
      <section className="py-8 px-6">
        <div className="container max-w-5xl mx-auto">
          <div className="flex flex-col gap-4">
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No metcons match your search.</p>
              </div>
            )}

            {filtered.map((metcon) => {
              const isExpanded = expandedCode === metcon.code
              const TypeIcon = TYPE_ICONS[metcon.type] || Clock
              const isEMOM = metcon.type === "emom"

              return (
                <div
                  key={metcon.code}
                  className="rounded-xl border bg-card overflow-hidden transition-all"
                >
                  {/* Card Header — always visible */}
                  <button
                    className="w-full px-6 py-5 flex items-center gap-4 text-left hover:bg-secondary/50 transition-colors"
                    onClick={() => setExpandedCode(isExpanded ? null : metcon.code)}
                  >
                    {/* Type Icon */}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${LEVEL_COLORS[level]}15` }}
                    >
                      <TypeIcon className="w-5 h-5" style={{ color: LEVEL_COLORS[level] }} />
                    </div>

                    {/* Name + Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono text-muted-foreground">{metcon.code}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
                          {TYPE_LABELS[metcon.type] || metcon.type}
                        </span>
                      </div>
                      <h3 className="text-lg font-display font-bold tracking-tight truncate">
                        &ldquo;{metcon.name}&rdquo;
                      </h3>
                    </div>

                    {/* Time + Expand */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm text-muted-foreground font-medium">
                        {metcon.stimulus.duration}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="border-t border-border">
                      {/* Whiteboard */}
                      <div className="px-6 py-5">
                        <div
                          className="rounded-lg p-5 border"
                          style={{
                            borderColor: `${LEVEL_COLORS[level]}30`,
                            backgroundColor: `${LEVEL_COLORS[level]}05`,
                          }}
                        >
                          {/* Level badge + format header */}
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                              {formatHeader(metcon)}
                            </h4>
                            <span
                              className="text-xs font-bold px-2.5 py-1 rounded-full"
                              style={{
                                backgroundColor: `${LEVEL_COLORS[level]}20`,
                                color: LEVEL_COLORS[level],
                              }}
                            >
                              {LEVEL_NAMES[level]}
                            </span>
                          </div>

                          {/* Time cap */}
                          <p className="text-xs text-muted-foreground mb-3">
                            {metcon.type === "amrap" ? "Time:" : "Time cap:"} {metcon.timeCap} min
                          </p>

                          {/* Movements */}
                          {isEMOM && metcon.pattern && metcon.groups ? (
                            <div className="space-y-3">
                              {metcon.pattern.map((key) => {
                                const group = metcon.groups![key]
                                return (
                                  <div key={key}>
                                    <p className="text-xs font-bold text-muted-foreground mb-1">
                                      Minute {key}:
                                    </p>
                                    {group.movements.map((mov, j) => {
                                      const resolved = resolveMovement(mov, levelKey, gender)
                                      return (
                                        <p key={j} className="text-base font-medium pl-4">
                                          {resolved.detail} {resolved.name}
                                        </p>
                                      )
                                    })}
                                  </div>
                                )
                              })}
                            </div>
                          ) : metcon.repScheme ? (
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-muted-foreground mb-2">
                                {metcon.repScheme.join("-")}:
                              </p>
                              {metcon.movements?.map((mov, i) => {
                                const resolved = resolveMovement(mov, levelKey, gender)
                                return (
                                  <p key={i} className="text-base font-medium">
                                    {resolved.name}
                                    {resolved.detail && (
                                      <span className="text-muted-foreground text-sm ml-2">
                                        {resolved.detail}
                                      </span>
                                    )}
                                  </p>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {metcon.movements?.map((mov, i) => {
                                const resolved = resolveMovement(mov, levelKey, gender)
                                return (
                                  <p key={i} className="text-base font-medium">
                                    {resolved.detail} {resolved.name}
                                  </p>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stimulus + Coach Notes */}
                      <div className="px-6 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-secondary/50">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                            Stimulus
                          </h5>
                          <p className="text-sm text-foreground leading-relaxed">
                            {metcon.stimulus.feel}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            {metcon.stimulus.intent}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/50">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                            Coach Notes
                          </h5>
                          <p className="text-sm text-foreground leading-relaxed">
                            {metcon.coachNotes}
                          </p>
                        </div>
                      </div>

                      {/* All Levels Quick View */}
                      <div className="px-6 pb-5">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                          All Levels
                        </h5>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">
                                  Movement
                                </th>
                                {LEVEL_NAMES.map((name, i) => (
                                  <th
                                    key={i}
                                    className="text-center py-2 px-2 text-xs font-bold"
                                    style={{ color: LEVEL_COLORS[i] }}
                                  >
                                    {name.replace("+", "+")}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {getAllMovements(metcon).map((mov, i) => (
                                <tr key={i} className="border-b border-border last:border-b-0">
                                  <td className="py-2 px-3 font-medium text-xs whitespace-nowrap">
                                    {mov.movement}
                                  </td>
                                  {LEVEL_KEYS.map((lk, li) => {
                                    const resolved = resolveMovement(mov, lk, gender)
                                    const isActive = li === level
                                    return (
                                      <td
                                        key={lk}
                                        className={`text-center py-2 px-2 text-xs whitespace-nowrap ${
                                          isActive ? "font-bold" : "text-muted-foreground"
                                        }`}
                                        style={{
                                          backgroundColor: isActive ? `${LEVEL_COLORS[li]}10` : undefined,
                                        }}
                                      >
                                        <span className={isActive ? "" : ""}>
                                          {resolved.name !== mov.movement && (
                                            <span className="block text-[10px] opacity-70">{resolved.name}</span>
                                          )}
                                          {resolved.detail || "-"}
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
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
