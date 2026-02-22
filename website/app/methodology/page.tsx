import type { Metadata } from "next"
import { ExternalLink, BookOpen, Database, Shield, BarChart3, Globe } from "lucide-react"

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How OpenProgression benchmarks are derived. Peer-reviewed sources, percentile mapping, and a transparent derivation process backed by 1.3 million data points.",
}

const SOURCES = [
  {
    id: "ball_weidman_2024",
    title: "Normative data for squat, bench press and deadlift",
    authors: "Ball, R. & Weidman, D.",
    year: 2024,
    journal: "Journal of Science and Medicine in Sport",
    sampleSize: "809,986",
    url: "https://pubmed.ncbi.nlm.nih.gov/39060209/",
    type: "Peer-reviewed",
    icon: BookOpen,
    usedFor: ["Squatting", "Pulling", "Pressing"],
  },
  {
    id: "mangine_2023",
    title: "Normative scores for CrossFit Open workouts: 2011-2022",
    authors: "Mangine, G.T., Grundlingh, N., & Feito, Y.",
    year: 2023,
    journal: "Sports, 11(2), 24",
    sampleSize: "569,607",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9960888/",
    type: "Peer-reviewed",
    icon: BookOpen,
    usedFor: ["Endurance", "Gymnastics"],
  },
  {
    id: "mangine_2020",
    title: "Determination of a CrossFit Benchmark Performance Profile",
    authors: "Mangine, G.T. et al.",
    year: 2020,
    journal: "International Journal of Exercise Science",
    sampleSize: "162",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8228530/",
    type: "Peer-reviewed",
    icon: BookOpen,
    usedFor: ["Olympic Lifting", "Endurance"],
  },
  {
    id: "butcher_2018",
    title: "Normative Values for Benchmark Workout Scores in CrossFit",
    authors: "Butcher, S.J. et al.",
    year: 2018,
    journal: "Sports Medicine - Open",
    sampleSize: "Large-scale",
    url: "https://link.springer.com/article/10.1186/s40798-018-0156-x",
    type: "Peer-reviewed",
    icon: BookOpen,
    usedFor: ["Endurance"],
  },
  {
    id: "kilgore_2023",
    title: "Lon Kilgore Strength Standard Tables",
    authors: "Kilgore, L.",
    year: 2023,
    journal: null,
    sampleSize: "Decades of competition data",
    url: "http://lonkilgore.com/resources/Lon_Kilgore_Strength_Standard_Tables-Copyright-2023.pdf",
    type: "Published standard",
    icon: BarChart3,
    usedFor: ["Squatting", "Pulling", "Pressing"],
  },
  {
    id: "catalyst_athletics",
    title: "Olympic Weightlifting Skill Levels Chart",
    authors: "Everett, G.",
    year: 2018,
    journal: "Catalyst Athletics",
    sampleSize: "US competition data",
    url: "https://www.catalystathletics.com/article/1836/Olympic-Weightlifting-Skill-Levels-Chart/",
    type: "Published standard",
    icon: BarChart3,
    usedFor: ["Olympic Lifting"],
  },
  {
    id: "concept2",
    title: "Concept2 Logbook World Rankings",
    authors: "Concept2",
    year: 2025,
    journal: null,
    sampleSize: "10,000+ per distance",
    url: "https://log.concept2.com/rankings",
    type: "Public database",
    icon: Database,
    usedFor: ["Monostructural"],
  },
  {
    id: "runninglevel",
    title: "Race time standards",
    authors: "RunningLevel.com",
    year: 2025,
    journal: null,
    sampleSize: "1,000,000+",
    url: "https://runninglevel.com",
    type: "Public database",
    icon: Database,
    usedFor: ["Monostructural"],
  },
  {
    id: "strengthlevel",
    title: "Exercise performance standards",
    authors: "StrengthLevel.com",
    year: 2025,
    journal: null,
    sampleSize: "30,000-600,000+ per exercise",
    url: "https://strengthlevel.com",
    type: "Community database",
    icon: Database,
    usedFor: ["Gymnastics", "Bodyweight"],
  },
  {
    id: "acsm",
    title: "Guidelines for Exercise Testing and Prescription",
    authors: "American College of Sports Medicine",
    year: null,
    journal: null,
    sampleSize: "Large-scale testing cohorts",
    url: null,
    type: "Professional standard",
    icon: Shield,
    usedFor: ["Bodyweight", "Monostructural"],
  },
  {
    id: "military_pft",
    title: "U.S. Military Physical Fitness Test Standards",
    authors: "Department of Defense",
    year: null,
    journal: null,
    sampleSize: "Entire service branches",
    url: null,
    type: "Government (public domain)",
    icon: Shield,
    usedFor: ["Bodyweight", "Gymnastics"],
  },
  {
    id: "crossfit_open",
    title: "CrossFit Open Workout Analysis",
    authors: "CrossFit Games",
    year: null,
    journal: null,
    sampleSize: "All Open registrants",
    url: "https://games.crossfit.com",
    type: "Official competition data",
    icon: Globe,
    usedFor: ["Gymnastics", "Endurance"],
  },
]

const PERCENTILE_MAP = [
  { level: "Beginner", short: "BEG", range: "0-20th", color: "#4ADE80" },
  { level: "Beginner+", short: "BEG+", range: "20-35th", color: "#22C55E" },
  { level: "Intermediate", short: "INT", range: "35-50th", color: "#EAB308" },
  { level: "Intermediate+", short: "INT+", range: "50-65th", color: "#F97316" },
  { level: "Advanced", short: "ADV", range: "65-80th", color: "#EF4444" },
  { level: "Advanced+", short: "ADV+", range: "80-95th", color: "#DC2626" },
  { level: "Rx", short: "RX", range: "95-100th", color: "#991B1B" },
]

export default function MethodologyPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Hero */}
      <div className="mb-16">
        <div className="section-tag section-tag-teal mb-4">Methodology</div>
        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-4">
          How We Derive <span className="text-primary">Benchmarks</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Every benchmark in the OpenProgression standard traces to published, citable data.
          No number is copied from any proprietary system. This page explains our methodology
          and provides full source citations.
        </p>
      </div>

      {/* Percentile Mapping */}
      <section className="mb-16">
        <h2 className="text-2xl font-display font-bold tracking-tight mb-4">
          Percentile Mapping
        </h2>
        <p className="text-muted-foreground mb-6">
          Each of the 7 levels corresponds to a percentile range within the trained population
          — people who regularly engage in structured fitness training (minimum 3 sessions per week).
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2">
          {PERCENTILE_MAP.map((level) => (
            <div
              key={level.short}
              className="text-center rounded-xl border border-border bg-card p-2 sm:p-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full mx-auto mb-1.5 sm:mb-2 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white"
                style={{ backgroundColor: level.color }}
              >
                {PERCENTILE_MAP.indexOf(level) + 1}
              </div>
              <div className="text-xs font-semibold mb-0.5">{level.short}</div>
              <div className="text-[10px] text-muted-foreground">{level.range}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Derivation Process */}
      <section className="mb-16">
        <h2 className="text-2xl font-display font-bold tracking-tight mb-4">
          Derivation Process
        </h2>
        <div className="space-y-4">
          {[
            { step: "1", title: "Identify best available data", desc: "Peer-reviewed studies take precedence, followed by published standards, then public databases." },
            { step: "2", title: "Extract percentile distributions", desc: "Pull percentile data from the source for each benchmark movement, separated by gender." },
            { step: "3", title: "Map percentiles to OP levels", desc: "Apply the 7-level percentile ranges to convert raw data into level-specific benchmarks." },
            { step: "4", title: "Cross-reference", desc: "Validate against at least one additional source where possible. Resolve discrepancies by weighting sample size." },
            { step: "5", title: "Round to practical values", desc: "Round to gym-meaningful numbers (nearest 5kg for barbell lifts, whole reps for gymnastics)." },
            { step: "6", title: "Document sources", desc: "Every benchmark includes source citations traceable to the original data." },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Source Tiers */}
      <section className="mb-16">
        <h2 className="text-2xl font-display font-bold tracking-tight mb-4">
          Source Hierarchy
        </h2>
        <p className="text-muted-foreground mb-6">
          Sources are ranked by evidence quality. When multiple sources conflict,
          higher-tier sources take precedence.
        </p>
        <div className="space-y-3">
          {[
            { tier: "Tier 1", label: "Peer-Reviewed Research", desc: "Published in scientific journals with formal peer review", color: "bg-emerald-500" },
            { tier: "Tier 2", label: "Published Standards", desc: "Widely recognized classification systems from credentialed practitioners", color: "bg-blue-500" },
            { tier: "Tier 3", label: "Public Databases", desc: "Large-scale, publicly accessible performance databases", color: "bg-amber-500" },
            { tier: "Tier 4", label: "Government / Public Domain", desc: "Military fitness standards published as public domain data", color: "bg-purple-500" },
            { tier: "Tier 5", label: "Official Competition Data", desc: "Data from organized fitness competitions and events", color: "bg-orange-500" },
          ].map((tier) => (
            <div key={tier.tier} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
              <div className={`w-2 h-10 rounded-full ${tier.color}`} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{tier.tier}</span>
                  <span className="font-semibold text-sm">{tier.label}</span>
                </div>
                <p className="text-sm text-muted-foreground">{tier.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All Sources */}
      <section className="mb-16">
        <h2 className="text-2xl font-display font-bold tracking-tight mb-6">
          All Sources
        </h2>
        <div className="space-y-4">
          {SOURCES.map((source) => {
            const Icon = source.icon
            return (
              <div
                key={source.id}
                className="p-5 rounded-xl border border-border bg-card hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-sm">{source.title}</h3>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                        {source.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {source.authors}
                      {source.year && ` (${source.year})`}
                      {source.journal && `. ${source.journal}`}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        Sample: <span className="font-medium text-foreground">{source.sampleSize}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">|</span>
                      <span className="text-xs text-muted-foreground">
                        Used for:{" "}
                        {source.usedFor.map((cat, i) => (
                          <span key={cat}>
                            <span className="font-medium text-foreground">{cat}</span>
                            {i < source.usedFor.length - 1 && ", "}
                          </span>
                        ))}
                      </span>
                    </div>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                      >
                        View source <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Limitations */}
      <section className="mb-16">
        <h2 className="text-2xl font-display font-bold tracking-tight mb-4">
          Limitations
        </h2>
        <div className="space-y-3">
          {[
            { title: "Self-reported data", desc: "Some sources (StrengthLevel, Concept2 logbook) rely on self-reported performance, which may introduce upward bias." },
            { title: "Population differences", desc: "CrossFit Open athletes, powerlifting competitors, and Concept2 users are not identical populations. We account for this in cross-referencing." },
            { title: "Absolute vs. relative strength", desc: "Barbell benchmarks use absolute values for a reference bodyweight (~80kg male / ~60kg female). Future versions may add ratio-based standards." },
            { title: "Limited gymnastics research", desc: "Peer-reviewed normative data for pull-ups, muscle-ups, and HSPU is sparse. We supplement with military standards and community databases." },
            { title: "Equipment variation", desc: "Standards assume standard equipment (barbell, pull-up bar, Concept2 erg). Athletes using different equipment may need adjusted benchmarks." },
          ].map((item) => (
            <div key={item.title} className="p-4 rounded-xl bg-secondary/50 border border-border">
              <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contribute */}
      <section className="p-8 rounded-2xl bg-primary/5 border border-primary/20">
        <h2 className="text-xl font-display font-bold tracking-tight mb-2">
          Help Improve the Standard
        </h2>
        <p className="text-muted-foreground mb-4">
          Know of a peer-reviewed study or large dataset that could improve our benchmarks?
          We welcome contributions that strengthen the evidence base.
        </p>
        <a
          href="https://github.com/OpenProgression/openprogression/blob/main/CONTRIBUTING.md"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Contributing Guidelines <ExternalLink className="w-4 h-4" />
        </a>
      </section>
    </div>
  )
}
