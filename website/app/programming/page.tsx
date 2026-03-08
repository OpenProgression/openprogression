"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
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

/** Get ISO week number */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/** Get Monday of the week containing a given date string */
function getMonday(dateStr: string): Date {
  const d = new Date(dateStr + "T12:00:00")
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  return monday
}

/** Generate YYYY-MM-DD strings for Mon-Sun of a week starting at monday */
function getWeekDates(monday: Date): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().split("T")[0]
  })
}

/** Get all days in a calendar month grid (6 rows x 7 cols, Mon-start) */
function getCalendarGrid(year: number, month: number): (string | null)[][] {
  const firstDay = new Date(year, month, 1)
  const startDay = firstDay.getDay()
  const offset = startDay === 0 ? -6 : 1 - startDay
  const gridStart = new Date(year, month, 1 + offset)

  const rows: (string | null)[][] = []
  for (let r = 0; r < 6; r++) {
    const row: (string | null)[] = []
    for (let c = 0; c < 7; c++) {
      const d = new Date(gridStart)
      d.setDate(gridStart.getDate() + r * 7 + c)
      if (d.getMonth() === month) {
        row.push(d.toISOString().split("T")[0])
      } else {
        row.push(null)
      }
    }
    if (row.some((d) => d !== null)) rows.push(row)
  }
  return rows
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

  const dateSet = useMemo(() => new Set(sortedDates), [sortedDates])

  const defaultDate = useMemo(() => {
    if (sortedDates.length === 0) return ""
    const today = new Date().toISOString().split("T")[0]
    return sortedDates.find((d) => d >= today) || sortedDates[sortedDates.length - 1]
  }, [sortedDates])

  const [selectedDate, setSelectedDate] = useState("")
  const activeDate = selectedDate || defaultDate

  // Week navigation
  const currentMonday = useMemo(() => getMonday(activeDate), [activeDate])
  const weekDates = useMemo(() => getWeekDates(currentMonday), [currentMonday])
  const weekLabel = useMemo(() => {
    const mon = new Date(weekDates[0] + "T12:00:00")
    const sun = new Date(weekDates[6] + "T12:00:00")
    const monMonth = mon.toLocaleDateString("en-US", { month: "short" })
    const sunMonth = sun.toLocaleDateString("en-US", { month: "short" })
    const year = mon.getFullYear()
    const week = getWeekNumber(mon)
    if (monMonth === sunMonth) {
      return `${monMonth} ${year}, Week ${week}`
    }
    return `${monMonth}/${sunMonth} ${year}, Week ${week}`
  }, [weekDates])

  const goToPrevWeek = useCallback(() => {
    const prev = new Date(currentMonday)
    prev.setDate(prev.getDate() - 7)
    const prevWeek = getWeekDates(prev)
    const match = prevWeek.reverse().find((d) => dateSet.has(d))
    if (match) setSelectedDate(match)
  }, [currentMonday, dateSet])

  const goToNextWeek = useCallback(() => {
    const next = new Date(currentMonday)
    next.setDate(next.getDate() + 7)
    const nextWeek = getWeekDates(next)
    const match = nextWeek.find((d) => dateSet.has(d))
    if (match) setSelectedDate(match)
  }, [currentMonday, dateSet])

  // Check if prev/next weeks have sessions
  const hasPrevWeek = useMemo(() => {
    const prev = new Date(currentMonday)
    prev.setDate(prev.getDate() - 7)
    return getWeekDates(prev).some((d) => dateSet.has(d))
  }, [currentMonday, dateSet])

  const hasNextWeek = useMemo(() => {
    const next = new Date(currentMonday)
    next.setDate(next.getDate() + 7)
    return getWeekDates(next).some((d) => dateSet.has(d))
  }, [currentMonday, dateSet])

  // Calendar popover
  const [calOpen, setCalOpen] = useState(false)
  const [calYear, setCalYear] = useState(() => new Date(activeDate + "T12:00:00").getFullYear())
  const [calMonth, setCalMonth] = useState(() => new Date(activeDate + "T12:00:00").getMonth())
  const calRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (calRef.current && !calRef.current.contains(e.target as Node)) {
        setCalOpen(false)
      }
    }
    if (calOpen) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [calOpen])

  const calGrid = useMemo(() => getCalendarGrid(calYear, calMonth), [calYear, calMonth])
  const calMonthLabel = new Date(calYear, calMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const openCalendar = useCallback(() => {
    const d = new Date(activeDate + "T12:00:00")
    setCalYear(d.getFullYear())
    setCalMonth(d.getMonth())
    setCalOpen(true)
  }, [activeDate])

  const calPrevMonth = useCallback(() => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1) }
    else setCalMonth(calMonth - 1)
  }, [calMonth, calYear])

  const calNextMonth = useCallback(() => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1) }
    else setCalMonth(calMonth + 1)
  }, [calMonth, calYear])

  const session = sessions.find((s) => s.date === activeDate)
  const metcon = session?.metcon
    ? metcons.find((m) => m.code === session.metcon)
    : null
  const today = new Date().toISOString().split("T")[0]

  if (sortedDates.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No sessions scheduled yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Week Navigation */}
      <div className="flex flex-col items-center gap-3">
        {/* Week label + calendar button */}
        <div className="flex items-center gap-3">
          <button
            onClick={goToPrevWeek}
            disabled={!hasPrevWeek}
            className="p-2 rounded-lg hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-muted-foreground min-w-[180px] text-center">
            {weekLabel}
          </span>
          <button
            onClick={goToNextWeek}
            disabled={!hasNextWeek}
            className="p-2 rounded-lg hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="relative" ref={calRef}>
            <button
              onClick={openCalendar}
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              title="Jump to date"
            >
              <Calendar className="w-5 h-5" />
            </button>

            {/* Calendar Popover */}
            {calOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 bg-card border rounded-xl shadow-lg p-4 w-[280px]">
                <div className="flex items-center justify-between mb-3">
                  <button onClick={calPrevMonth} className="p-1 rounded hover:bg-secondary transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold">{calMonthLabel}</span>
                  <button onClick={calNextMonth} className="p-1 rounded hover:bg-secondary transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-0 text-center">
                  {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                    <div key={d} className="text-[10px] font-bold text-muted-foreground py-1">
                      {d}
                    </div>
                  ))}
                  {calGrid.flat().map((date, i) => {
                    if (!date) return <div key={i} />
                    const hasSession = dateSet.has(date)
                    const isActive = date === activeDate
                    const isToday = date === today
                    return (
                      <button
                        key={i}
                        disabled={!hasSession}
                        onClick={() => {
                          setSelectedDate(date)
                          setCalOpen(false)
                        }}
                        className={`relative text-xs py-1.5 rounded transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground font-bold"
                            : hasSession
                              ? "hover:bg-secondary text-foreground font-medium"
                              : "text-muted-foreground/30 cursor-default"
                        }`}
                      >
                        {new Date(date + "T12:00:00").getDate()}
                        {isToday && !isActive && (
                          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Week day pills */}
        <div className="flex gap-1">
          {weekDates.map((date) => {
            const { dayName, dayNum } = formatDate(date)
            const isSelected = date === activeDate
            const hasSession = dateSet.has(date)
            const isToday = date === today
            return (
              <button
                key={date}
                disabled={!hasSession}
                onClick={() => setSelectedDate(date)}
                className={`relative flex flex-col items-center px-3 sm:px-4 py-2 rounded-lg text-xs font-medium transition-colors min-w-[48px] sm:min-w-[60px] ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : hasSession
                      ? "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      : "text-muted-foreground/30 cursor-default"
                }`}
              >
                <span className="font-bold">{dayName}</span>
                <span className="text-lg font-display font-black leading-tight">
                  {dayNum}
                </span>
                {isToday && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>
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
                  Strength / Skill
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
