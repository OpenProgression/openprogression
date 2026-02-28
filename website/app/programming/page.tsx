"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Clock,
  Repeat,
  Zap,
  Dumbbell,
  Calendar,
  BookOpen,
  Users,
} from "lucide-react"

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
const LEVEL_NAMES_SHORT = [
  "Beg",
  "Beg+",
  "Int",
  "Int+",
  "Adv",
  "Adv+",
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

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------
interface LoadPair {
  male: number
  female: number
}

interface ScalingOverride {
  sub?: string | { male?: string; female?: string }
  load?: LoadPair
  height?: LoadPair
  reps?: number
  distance?: number
  calories?: number
  sets?: number
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

interface TeamInfo {
  size: number
  format: string
  description: string
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
  team?: TeamInfo
  stimulus: {
    duration: string
    feel: string
    intent: string
  }
  coachNotes: string
  movements?: Movement[]
}

interface StrengthMovement {
  movement: string
  scheme: string
  prescription: string
  notes?: string
}

interface Session {
  date: string
  title: string
  estimatedMinutes: number
  warmup: { notes: string; durationMinutes: number } | null
  strength: {
    movements: StrengthMovement[]
    durationMinutes: number
  } | null
  metcon: string | null
  accessory: { notes: string; durationMinutes?: number } | null
}

// ---------------------------------------------------------------------------
// Resolved movement (structured for flexible display)
// ---------------------------------------------------------------------------
interface ResolvedMovement {
  maleName: string
  femaleName: string
  detail: string
}

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

const TEAM_FORMAT_LABELS: Record<string, string> = {
  ygig: "You Go, I Go",
  partition: "Partition",
  sync: "Synchronized",
}

const TYPE_ICONS: Record<string, typeof Clock> = {
  for_time: Clock,
  amrap: Repeat,
  emom: Zap,
  for_load: Dumbbell,
  intervals: Zap,
}

/** Resolve a movement at a given level with M/F combined format */
function resolveMovement(
  mov: Movement,
  level: LevelKey
): ResolvedMovement {
  const scaling =
    level !== "rx"
      ? mov.scaling?.[level as Exclude<LevelKey, "rx">]
      : undefined

  // Resolve movement name per gender
  const subValue = scaling?.sub
  let maleName: string, femaleName: string
  if (typeof subValue === "object" && subValue !== null) {
    maleName = subValue.male || mov.movement
    femaleName = subValue.female || mov.movement
  } else {
    const s = (subValue as string) || mov.movement
    maleName = s
    femaleName = s
  }

  const reps = scaling?.reps ?? mov.reps
  const load = scaling?.load ?? mov.load
  const height = scaling?.height ?? mov.height
  const distance = scaling?.distance ?? mov.distance
  const calories = scaling?.calories ?? mov.calories

  const parts: string[] = []
  if (reps) parts.push(`${reps}`)
  if (distance) parts.push(`${distance}${mov.unit || "m"}`)
  if (calories) parts.push(`${calories} cal`)

  let detail = parts.join(" ")
  if (load) {
    detail +=
      load.male === load.female
        ? ` @ ${load.male} ${mov.unit || "kg"}`
        : ` @ ${load.male}/${load.female} ${mov.unit || "kg"}`
  }
  if (height) {
    detail +=
      height.male === height.female
        ? ` (${height.male} ${mov.unit || "cm"})`
        : ` (${height.male}/${height.female} ${mov.unit || "cm"})`
  }

  return { maleName, femaleName, detail }
}

/** Format display name — combined M/F when they differ */
function displayName(r: ResolvedMovement): string {
  return r.maleName === r.femaleName
    ? r.maleName
    : `${r.maleName} (M) / ${r.femaleName} (F)`
}

/** Check if this level has a movement substitution */
function hasSub(r: ResolvedMovement, rxName: string): boolean {
  return r.maleName !== rxName || r.femaleName !== rxName
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

function formatDate(dateStr: string): {
  dayName: string
  dayNum: string
  month: string
} {
  const d = new Date(dateStr + "T12:00:00")
  const dayName = d.toLocaleDateString("en-US", { weekday: "short" })
  const dayNum = d.getDate().toString()
  const month = d.toLocaleDateString("en-US", { month: "short" })
  return { dayName, dayNum, month }
}

// ---------------------------------------------------------------------------
// Metcon Card (shared between Daily + Library)
// ---------------------------------------------------------------------------
/** Render a single whiteboard column for a given level */
function WhiteboardColumn({
  metcon,
  levelIdx,
  levelKey,
  label,
}: {
  metcon: Metcon
  levelIdx: number
  levelKey: LevelKey
  label?: string
}) {
  const isEMOM = metcon.type === "emom"
  return (
    <div
      className="rounded-lg p-5 border flex-1"
      style={{
        borderColor: `${LEVEL_COLORS[levelIdx]}30`,
        backgroundColor: `${LEVEL_COLORS[levelIdx]}05`,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {label ? `${label} - ` : ""}{formatHeader(metcon)}
        </h4>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: `${LEVEL_COLORS[levelIdx]}20`,
            color: LEVEL_COLORS[levelIdx],
          }}
        >
          {LEVEL_NAMES[levelIdx]}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        {metcon.type === "amrap" ? "Time:" : "Time cap:"}{" "}
        {metcon.timeCap} min
      </p>

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
                  const r = resolveMovement(mov, levelKey)
                  return (
                    <p key={j} className="text-base font-medium pl-4">
                      {r.detail} {displayName(r)}
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
            const r = resolveMovement(mov, levelKey)
            return (
              <p key={i} className="text-base font-medium">
                {displayName(r)}
                {r.detail && (
                  <span className="text-muted-foreground text-sm ml-2">
                    {r.detail}
                  </span>
                )}
              </p>
            )
          })}
        </div>
      ) : (
        <div className="space-y-1">
          {metcon.movements?.map((mov, i) => {
            const r = resolveMovement(mov, levelKey)
            return (
              <p key={i} className="text-base font-medium">
                {r.detail} {displayName(r)}
              </p>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MetconCard({
  metcon,
  level,
  levelKey,
  defaultExpanded,
}: {
  metcon: Metcon
  level: number
  levelKey: LevelKey
  defaultExpanded?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded ?? false)
  const TypeIcon = TYPE_ICONS[metcon.type] || Clock
  const isTeam = !!metcon.team

  return (
    <div className="rounded-xl border bg-card overflow-hidden transition-all">
      {/* Card Header */}
      <button
        className="w-full px-6 py-5 flex items-center gap-4 text-left hover:bg-secondary/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: isTeam ? "#8B5CF615" : `${LEVEL_COLORS[level]}15` }}
        >
          {isTeam ? (
            <Users className="w-5 h-5" style={{ color: "#8B5CF6" }} />
          ) : (
            <TypeIcon
              className="w-5 h-5"
              style={{ color: LEVEL_COLORS[level] }}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-mono text-muted-foreground">
              {metcon.code}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
              {TYPE_LABELS[metcon.type] || metcon.type}
            </span>
            {isTeam && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 font-bold">
                Teams of {metcon.team!.size}
              </span>
            )}
          </div>
          <h3 className="text-lg font-display font-bold tracking-tight truncate">
            &ldquo;{metcon.name}&rdquo;
          </h3>
        </div>
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
          {/* Team format description */}
          {isTeam && (
            <div className="px-6 pt-5">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <Users className="w-5 h-5 text-purple-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-purple-500">
                    {TEAM_FORMAT_LABELS[metcon.team!.format] || metcon.team!.format}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {metcon.team!.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Whiteboard */}
          <div className="px-6 py-5">
            <WhiteboardColumn metcon={metcon} levelIdx={level} levelKey={levelKey} />
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
                        className="text-center py-2 px-2 text-xs font-bold whitespace-nowrap"
                        style={{ color: LEVEL_COLORS[i] }}
                      >
                        {LEVEL_NAMES_SHORT[i]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {getAllMovements(metcon).map((mov, i) => (
                    <tr
                      key={i}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="py-2 px-3 font-medium text-xs whitespace-nowrap">
                        {mov.movement}
                      </td>
                      {LEVEL_KEYS.map((lk, li) => {
                        const r = resolveMovement(mov, lk)
                        const isActive = li === level
                        const isSub = hasSub(r, mov.movement)
                        const genderDiff = r.maleName !== r.femaleName
                        return (
                          <td
                            key={lk}
                            className={`text-center py-2 px-2 text-xs ${
                              isActive
                                ? "font-bold"
                                : "text-muted-foreground"
                            }`}
                            style={{
                              backgroundColor: isActive
                                ? `${LEVEL_COLORS[li]}10`
                                : undefined,
                            }}
                          >
                            {isSub ? (
                              <span>
                                {genderDiff ? (
                                  <>
                                    <span className="block font-medium whitespace-nowrap">
                                      M: {r.maleName}
                                    </span>
                                    <span className="block font-medium whitespace-nowrap">
                                      F: {r.femaleName}
                                    </span>
                                  </>
                                ) : (
                                  <span className="block font-medium whitespace-nowrap">
                                    {r.maleName}
                                  </span>
                                )}
                                {r.detail && (
                                  <span className="block text-[10px] opacity-70">
                                    {r.detail}
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="whitespace-nowrap">
                                {r.detail || r.maleName}
                              </span>
                            )}
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
}

// ---------------------------------------------------------------------------
// Daily Session View
// ---------------------------------------------------------------------------
function DailyView({
  sessions,
  metcons,
  level,
  levelKey,
}: {
  sessions: Session[]
  metcons: Metcon[]
  level: number
  levelKey: LevelKey
}) {
  const sortedDates = useMemo(
    () => sessions.map((s) => s.date).sort(),
    [sessions]
  )

  const defaultDate = useMemo(() => {
    if (sortedDates.length === 0) return ""
    const today = new Date().toISOString().split("T")[0]
    return sortedDates.find((d) => d >= today) || sortedDates[sortedDates.length - 1]
  }, [sortedDates])

  const [selectedDate, setSelectedDate] = useState("")
  const activeDate = selectedDate || defaultDate

  const session = sessions.find((s) => s.date === activeDate)
  const currentIdx = sortedDates.indexOf(activeDate)
  const metcon = session?.metcon
    ? metcons.find((m) => m.code === session.metcon)
    : null

  const goToPrev = useCallback(() => {
    if (currentIdx > 0) setSelectedDate(sortedDates[currentIdx - 1])
  }, [currentIdx, sortedDates])

  const goToNext = useCallback(() => {
    if (currentIdx < sortedDates.length - 1)
      setSelectedDate(sortedDates[currentIdx + 1])
  }, [currentIdx, sortedDates])

  if (sortedDates.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No sessions scheduled yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Date Navigation */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={goToPrev}
          disabled={currentIdx <= 0}
          className="p-2 rounded-lg hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex gap-1 overflow-x-auto px-2">
          {sortedDates.map((date) => {
            const { dayName, dayNum, month } = formatDate(date)
            const isSelected = date === activeDate
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center px-4 py-2 rounded-lg text-xs font-medium transition-colors min-w-[60px] ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <span className="font-bold">{dayName}</span>
                <span className="text-lg font-display font-black leading-tight">
                  {dayNum}
                </span>
                <span>{month}</span>
              </button>
            )
          })}
        </div>

        <button
          onClick={goToNext}
          disabled={currentIdx >= sortedDates.length - 1}
          className="p-2 rounded-lg hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Session Title */}
      {session && (
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold tracking-tight">
            {session.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            ~{session.estimatedMinutes} min
          </p>
        </div>
      )}

      {!session && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Rest day.</p>
        </div>
      )}

      {session && (
        <div className="flex flex-col gap-4">
          {/* Warm-up */}
          {session.warmup && (
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-orange-500" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Warm-up
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium ml-auto">
                  {session.warmup.durationMinutes} min
                </span>
              </div>
              <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {session.warmup.notes}
              </div>
            </div>
          )}

          {/* Strength */}
          {session.strength && session.strength.movements.length > 0 && (
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4 text-blue-500" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Strength
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium ml-auto">
                  {session.strength.durationMinutes} min
                </span>
              </div>

              <div className="flex flex-col gap-5">
                {session.strength.movements.map((sm, si) => (
                  <div key={si}>
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-lg font-display font-bold tracking-tight">
                        {sm.movement}
                      </span>
                      <span className="text-sm font-mono text-muted-foreground">
                        {sm.scheme}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-primary mb-1">
                      {sm.prescription}
                    </p>
                    {sm.notes && (
                      <p className="text-sm text-muted-foreground">
                        {sm.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metcon */}
          {metcon && (
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${metcon.team ? "bg-purple-500/10" : "bg-red-500/10"}`}>
                  {metcon.team ? (
                    <Users className="w-4 h-4 text-purple-500" />
                  ) : (
                    <Zap className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  {metcon.team ? "Team Metcon" : "Metcon"}
                </h3>
              </div>
              <MetconCard
                metcon={metcon}
                level={level}
                levelKey={levelKey}
                defaultExpanded
              />
            </div>
          )}

          {/* Accessory */}
          {session.accessory && (
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Repeat className="w-4 h-4 text-purple-500" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Accessory
                </h3>
                {session.accessory.durationMinutes && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium ml-auto">
                    {session.accessory.durationMinutes} min
                  </span>
                )}
              </div>
              <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {session.accessory.notes}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// WOD Library View
// ---------------------------------------------------------------------------
function LibraryView({
  metcons,
  level,
  levelKey,
}: {
  metcons: Metcon[]
  level: number
  levelKey: LevelKey
}) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const filtered = useMemo(() => {
    return metcons.filter((m) => {
      if (typeFilter !== "all" && m.type !== typeFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const nameMatch = m.name.toLowerCase().includes(q)
        const codeMatch = m.code.toLowerCase().includes(q)
        const movementMatch = getMovementNames(m).some((n) =>
          n.toLowerCase().includes(q)
        )
        if (!nameMatch && !codeMatch && !movementMatch) return false
      }
      return true
    })
  }, [metcons, search, typeFilter])

  const types = ["all", "for_time", "amrap", "emom"]

  return (
    <div className="flex flex-col gap-6">
      {/* Search + Type Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
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

      {/* WOD Cards */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              No metcons match your search.
            </p>
          </div>
        )}

        {filtered.map((metcon) => (
          <MetconCard
            key={metcon.code}
            metcon={metcon}
            level={level}
            levelKey={levelKey}
          />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------
export default function ProgrammingPage() {
  const [level, setLevel] = useState<number>(6) // default Rx
  const [activeTab, setActiveTab] = useState<"daily" | "library">("daily")
  const [metcons, setMetcons] = useState<Metcon[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  const levelKey = LEVEL_KEYS[level]

  useEffect(() => {
    Promise.all([
      fetch("/data/metcons.json").then((r) => r.json()),
      fetch("/data/sessions.json").then((r) => r.json()),
    ]).then(([metconData, sessionData]) => {
      setMetcons(metconData.metcons)
      setSessions(sessionData.sessions)
      setLoading(false)
    })
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="relative py-20 md:py-28 px-6">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="section-tag section-tag-teal justify-center mb-6">
            Programming
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black tracking-tight mb-6">
            <span className="text-primary">Daily Workouts</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Full sessions scaled to your level. Warm-up, strength, metcon, and
            accessory — all personalized.
          </p>
        </div>
      </section>

      {/* Controls */}
      <section className="pb-4 px-6">
        <div className="container max-w-5xl mx-auto">
          <div className="flex flex-col gap-4">
            {/* Row 1: Tabs */}
            <div className="flex justify-center">
              <div className="flex bg-secondary rounded-full p-1">
                <button
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                    activeTab === "daily"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setActiveTab("daily")}
                >
                  <Calendar className="w-4 h-4" />
                  Daily
                </button>
                <button
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                    activeTab === "library"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setActiveTab("library")}
                >
                  <BookOpen className="w-4 h-4" />
                  WOD Library
                </button>
              </div>
            </div>

            {/* Row 2: Your Level */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground font-medium">Your Level</span>
              <div className="flex bg-secondary rounded-full p-1">
                {LEVEL_NAMES.map((name, i) => (
                  <button
                    key={i}
                    className={`px-2 sm:px-3 py-2 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                      level === i
                        ? "text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    style={{
                      backgroundColor:
                        level === i ? LEVEL_COLORS[i] : undefined,
                    }}
                    onClick={() => setLevel(i)}
                  >
                    <span className="sm:hidden">{LEVEL_NAMES_SHORT[i]}</span>
                    <span className="hidden sm:inline">{name}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 px-6">
        <div className="container max-w-5xl mx-auto">
          {loading ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : activeTab === "daily" ? (
            <DailyView
              sessions={sessions}
              metcons={metcons}
              level={level}
              levelKey={levelKey}
            />
          ) : (
            <LibraryView
              metcons={metcons}
              level={level}
              levelKey={levelKey}
            />
          )}
        </div>
      </section>
    </>
  )
}
