import type { Metadata } from "next"
import {
  Dumbbell,
  ArrowDown,
  ArrowUp,
  Zap,
  Waypoints,
  Timer,
  PersonStanding,
  Heart,
} from "lucide-react"

export const metadata: Metadata = {
  title: "8 Categories -- OpenProgression",
  description:
    "Explore the 8 assessment categories of the OpenProgression standard: Squatting, Pulling, Pressing, Olympic Lifting, Gymnastics, Monostructural, Bodyweight, and Endurance.",
}

const ICON_MAP = {
  Dumbbell,
  ArrowDown,
  ArrowUp,
  Zap,
  Waypoints,
  Timer,
  PersonStanding,
  Heart,
} as const

const CATEGORIES = [
  {
    id: "squatting",
    name: "Squatting",
    description: "Lower body pushing strength through squat patterns",
    movements: ["Back Squat", "Front Squat", "Overhead Squat"],
    icon: "Dumbbell" as const,
  },
  {
    id: "pulling",
    name: "Pulling",
    description: "Hip-hinge and pulling strength from the floor",
    movements: ["Deadlift", "Sumo Deadlift", "Romanian Deadlift"],
    icon: "ArrowDown" as const,
  },
  {
    id: "pressing",
    name: "Pressing",
    description: "Upper body pressing strength in all planes",
    movements: ["Strict Press", "Push Press", "Bench Press"],
    icon: "ArrowUp" as const,
  },
  {
    id: "olympic_lifting",
    name: "Olympic Lifting",
    description:
      "Speed-strength and technical proficiency in the Olympic lifts",
    movements: ["Power Clean", "Power Snatch", "Clean & Jerk", "Snatch"],
    icon: "Zap" as const,
  },
  {
    id: "gymnastics",
    name: "Gymnastics",
    description: "Bodyweight strength, control, and skill on apparatus",
    movements: ["Pull-ups", "HSPU", "Muscle-ups", "Toes-to-Bar"],
    icon: "Waypoints" as const,
  },
  {
    id: "monostructural",
    name: "Monostructural",
    description: "Single-modality cardiovascular output",
    movements: ["500m Row", "2000m Row", "1 Mile Run", "5K Run"],
    icon: "Timer" as const,
  },
  {
    id: "bodyweight",
    name: "Bodyweight",
    description: "Functional bodyweight strength and endurance",
    movements: ["Push-ups", "Pistol Squats", "Double-unders"],
    icon: "PersonStanding" as const,
  },
  {
    id: "endurance",
    name: "Endurance",
    description: "Sustained effort across extended workouts",
    movements: ["Fran", "Grace", "Murph", "Cindy"],
    icon: "Heart" as const,
  },
]

const FITNESS_QUALITIES = [
  {
    quality: "Maximal Strength",
    categories: ["Squatting", "Pulling", "Pressing"],
  },
  {
    quality: "Speed-Strength",
    categories: ["Olympic Lifting"],
  },
  {
    quality: "Bodyweight Strength",
    categories: ["Gymnastics", "Bodyweight"],
  },
  {
    quality: "Aerobic Capacity",
    categories: ["Monostructural", "Endurance"],
  },
  {
    quality: "Anaerobic Power",
    categories: ["Olympic Lifting", "Monostructural"],
  },
  {
    quality: "Muscular Endurance",
    categories: ["Gymnastics", "Bodyweight", "Endurance"],
  },
]

export default function CategoriesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 px-6">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="section-tag section-tag-teal justify-center mb-6">
            Assessment Framework
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black tracking-tight mb-6">
            8 <span className="text-primary">Categories</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Every athlete is assessed across 8 distinct fitness categories.
            Together, they paint a complete picture of athletic capacity -- from
            raw strength to gymnastics skill to cardiovascular endurance.
          </p>
        </div>
      </section>

      {/* Category Cards Grid */}
      <section className="pb-20 px-6">
        <div className="container max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CATEGORIES.map((category) => {
              const Icon = ICON_MAP[category.icon]
              return (
                <div
                  key={category.id}
                  className="group bg-card rounded-xl border border-border p-6 hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Icon + Name */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-display font-bold tracking-tight">
                        {category.name}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  {/* Movement Tags */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {category.movements.map((movement) => (
                      <span
                        key={movement}
                        className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground"
                      >
                        {movement}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Category Interaction Section */}
      <section className="py-20 px-6 bg-secondary dark:bg-card border-t border-border">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-tag section-tag-teal justify-center mb-6">
              How They Connect
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
              Category Interaction
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              The 8 categories are designed to cover distinct but overlapping
              fitness qualities. No single category exists in isolation --
              together they ensure a holistic assessment of athletic capacity.
            </p>
          </div>

          {/* Quality vs Category Table */}
          <div className="bg-card dark:bg-background rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground bg-secondary/50 dark:bg-muted/30">
                      Fitness Quality
                    </th>
                    <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground bg-secondary/50 dark:bg-muted/30">
                      Primary Categories
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {FITNESS_QUALITIES.map((row, i) => (
                    <tr
                      key={row.quality}
                      className={
                        i < FITNESS_QUALITIES.length - 1
                          ? "border-b border-border"
                          : ""
                      }
                    >
                      <td className="px-5 py-3.5 font-medium text-foreground whitespace-nowrap">
                        {row.quality}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {row.categories.map((cat) => (
                            <span
                              key={cat}
                              className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            This overlap is intentional. For example, Olympic Lifting tests both
            speed-strength and anaerobic power, while Gymnastics assesses both
            bodyweight strength and muscular endurance. The system values
            well-rounded athleticism.
          </p>
        </div>
      </section>
    </>
  )
}
