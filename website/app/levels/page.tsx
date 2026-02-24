import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "The 7 Levels",
  description:
    "Explore the 7 progression levels of the OpenProgression standard, from Beginner to Rx. Research-backed benchmarks for every stage of fitness development.",
  openGraph: {
    images: [{ url: "/og-levels.png", width: 1200, height: 630 }],
  },
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What are the OpenProgression fitness levels?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "OpenProgression defines 7 fitness levels: Beginner (0-20th percentile), Beginner+ (20-35th), Intermediate (35-50th), Intermediate+ (50-65th), Advanced (65-80th), Advanced+ (80-95th), and Rx (95-100th). Each level is mapped to population percentiles using data from 1.3 million athletes.",
      },
    },
    {
      "@type": "Question",
      name: "How is your overall OpenProgression level determined?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your overall level is determined by the weakest-link principle: your overall level equals your lowest category score across all 8 fitness categories (Squatting, Pulling, Pressing, Olympic Lifting, Gymnastics, Monostructural, Bodyweight, Endurance). This ensures well-rounded fitness rather than specialization.",
      },
    },
    {
      "@type": "Question",
      name: "What does Rx level mean in OpenProgression?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Rx is the highest level in OpenProgression, representing the top 5% of trained athletes (95-100th percentile). Rx athletes demonstrate elite performance across all fitness domains, typically with 5+ years of dedicated training. Examples include a 180kg back squat for males, sub-2:00 Fran time, and 15+ unbroken bar muscle-ups.",
      },
    },
    {
      "@type": "Question",
      name: "What are the 8 OpenProgression fitness categories?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The 8 categories are: Squatting (Back Squat, Front Squat, Overhead Squat), Pulling (Deadlift), Pressing (Strict Press, Bench Press), Olympic Lifting (Power Clean, Snatch, Clean & Jerk), Gymnastics (Pull-ups, HSPU, Toes-to-Bar, Muscle-ups), Monostructural (500m Row, 2000m Row, 1 Mile Run, 5K Run), Bodyweight (Push-ups, Double-Unders, Pistol Squats), and Endurance (Fran, Grace, Murph, Cindy).",
      },
    },
  ],
}

const LEVELS = [
  {
    id: "beginner",
    number: 1,
    name: "Beginner",
    shortName: "BEG",
    color: "#4ADE80",
    percentile: "0-20th",
    trainingAge: "0-6 months",
    description:
      "New to structured fitness training. Learning fundamental movement patterns with minimal or no external load.",
    characteristics: [
      "Learning basic barbell movements (air squat, deadlift, press)",
      "Cannot perform strict pull-ups or advanced gymnastics",
      "Developing cardiovascular base",
      "Requires coaching on every movement",
    ],
  },
  {
    id: "beginner_plus",
    number: 2,
    name: "Beginner+",
    shortName: "BEG+",
    color: "#22C55E",
    percentile: "20-35th",
    trainingAge: "3-12 months",
    description:
      "Basic movements mastered with good form. Building consistency, work capacity, and confidence.",
    characteristics: [
      "Comfortable with foundational barbell movements under light-to-moderate load",
      "May have first strict pull-up",
      "Can complete modified benchmark workouts",
      "Starting to understand workout pacing",
    ],
  },
  {
    id: "intermediate",
    number: 3,
    name: "Intermediate",
    shortName: "INT",
    color: "#EAB308",
    percentile: "35-50th",
    trainingAge: "1-2 years",
    description:
      "Solid fundamentals across all fitness categories. Handles moderate loads with consistently good form.",
    characteristics: [
      "Moderate strength relative to bodyweight (bodyweight back squat for males)",
      "Can perform strict pull-ups, kipping pull-ups, toes-to-bar",
      "Understands pacing for different workout time domains",
      "Can follow intermediate programming independently",
    ],
  },
  {
    id: "intermediate_plus",
    number: 4,
    name: "Intermediate+",
    shortName: "INT+",
    color: "#F97316",
    percentile: "50-65th",
    trainingAge: "2-3 years",
    description:
      "Competent athlete proficient across all fitness domains. Requires periodized programming for continued progress.",
    characteristics: [
      "Strong relative to bodyweight (1.3x BW back squat for males)",
      "Can perform handstand push-ups, chest-to-bar pull-ups",
      "Developing Olympic lift proficiency",
      "Can complete most benchmark workouts at prescribed weights",
    ],
  },
  {
    id: "advanced",
    number: 5,
    name: "Advanced",
    shortName: "ADV",
    color: "#EF4444",
    percentile: "65-80th",
    trainingAge: "3-5 years",
    description:
      "Strong and skilled across all categories. Competition-capable at local level.",
    characteristics: [
      "1.6x+ BW back squat for males",
      "Can perform bar muscle-ups and ring muscle-ups",
      "Proficient Olympic lifter",
      "Completes all benchmark workouts at Rx weights",
    ],
  },
  {
    id: "advanced_plus",
    number: 6,
    name: "Advanced+",
    shortName: "ADV+",
    color: "#DC2626",
    percentile: "80-95th",
    trainingAge: "5+ years",
    description:
      "Very strong and highly skilled. Competition-level fitness across all domains.",
    characteristics: [
      "2x+ BW back squat for males",
      "Large unbroken sets of advanced gymnastics",
      "High-level Olympic lifting technique and loads",
      "Competes successfully in fitness competitions",
    ],
  },
  {
    id: "rx",
    number: 7,
    name: "Rx",
    shortName: "RX",
    color: "#991B1B",
    percentile: "95-100th",
    trainingAge: "5+ years dedicated",
    description:
      "Elite-level performance across all fitness domains. Top 5% of the trained population.",
    characteristics: [
      "2.3x+ BW back squat for males",
      "Rapid cycling of advanced gymnastics under fatigue",
      "Elite Olympic lifting numbers",
      "Can compete at national or international level",
    ],
  },
]

const CATEGORY_NAMES = [
  "Squatting",
  "Pulling",
  "Pressing",
  "Olympic Lifting",
  "Gymnastics",
  "Monostructural",
  "Bodyweight",
  "Endurance",
]

export default function LevelsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 px-6">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="section-tag section-tag-teal justify-center mb-6">
            Progression Framework
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black tracking-tight mb-6">
            The 7 <span className="text-primary">Levels</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            From first barbell pickup to elite competition. Each level represents
            a distinct stage of athletic development, defined by measurable
            benchmarks across all 8 fitness categories.
          </p>

          {/* Level color bar */}
          <div className="flex justify-center mt-6 sm:mt-10 gap-0.5 sm:gap-1">
            {LEVELS.map((level) => (
              <div
                key={level.id}
                className="h-1.5 sm:h-2 flex-1 max-w-10 sm:max-w-16 rounded-full"
                style={{ backgroundColor: level.color }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Level Cards */}
      <section className="pb-20 px-6">
        <div className="container max-w-4xl mx-auto space-y-6">
          {LEVELS.map((level) => (
            <div
              key={level.id}
              className="group bg-card rounded-xl border border-border hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              style={{ borderLeftWidth: "4px", borderLeftColor: level.color }}
            >
              <div className="p-6 md:p-8">
                {/* Header Row */}
                <div className="flex flex-wrap items-start gap-4 mb-4">
                  {/* Level Number Circle */}
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-display font-bold text-lg"
                    style={{ backgroundColor: level.color }}
                  >
                    {level.number}
                  </div>

                  {/* Title + Short Name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
                        {level.name}
                      </h2>
                      <span
                        className="text-sm font-mono font-semibold px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: level.color + "18",
                          color: level.color,
                        }}
                      >
                        {level.shortName}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1">
                      {level.description}
                    </p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-3 mb-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                      />
                    </svg>
                    {level.percentile} percentile
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {level.trainingAge} training
                  </span>
                </div>

                {/* Characteristics */}
                <div className="border-t border-border pt-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Key Characteristics
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {level.characteristics.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-card-foreground"
                      >
                        <span
                          className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: level.color }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Weakest-Link Principle */}
      <section className="py-20 px-6 bg-secondary dark:bg-card border-t border-border">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-tag section-tag-teal justify-center mb-6">
              Core Principle
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-4">
              The Weakest-Link Principle
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Your overall OpenProgression level is determined by your{" "}
              <strong className="text-foreground">lowest category score</strong>.
              True fitness means having no glaring weaknesses.
            </p>
          </div>

          {/* Visual Example */}
          <div className="bg-card dark:bg-background rounded-xl border border-border p-6 md:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-5 text-center">
              Example Athlete Profile
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {CATEGORY_NAMES.map((cat) => {
                const isWeakest = cat === "Olympic Lifting"
                return (
                  <div
                    key={cat}
                    className={`rounded-lg px-3 py-3 text-center border ${
                      isWeakest
                        ? "border-[#EAB308]/40 bg-[#EAB308]/10"
                        : "border-[#EF4444]/40 bg-[#EF4444]/10"
                    }`}
                  >
                    <div className="text-xs text-muted-foreground mb-1 truncate">
                      {cat}
                    </div>
                    <div
                      className={`text-sm font-bold ${
                        isWeakest ? "text-[#EAB308]" : "text-[#EF4444]"
                      }`}
                    >
                      {isWeakest ? "INT" : "ADV"}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-center gap-3 pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">
                Overall Level:
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold bg-[#EAB308]/15 text-[#EAB308] border border-[#EAB308]/30">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: "#EAB308" }}
                />
                Level 3 -- Intermediate
              </span>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Despite scoring Advanced in 7 of 8 categories, this athlete is
              classified as Intermediate because Olympic Lifting is their
              weakest link. Balanced development is essential for progression.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
