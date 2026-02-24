import type { Metadata } from "next"
import { Download, FileJson, Printer, ExternalLink, Github } from "lucide-react"

export const metadata: Metadata = {
  title: "Data & Downloads",
  description:
    "Download OpenProgression benchmark data as JSON. One bundled file with all levels, categories, and benchmarks — free and MIT licensed.",
  openGraph: {
    images: [{ url: "/og-data.png", width: 1200, height: 630 }],
  },
}

const CORE_FILES = [
  {
    name: "openprogression.json",
    description: "Everything in one file — levels, categories, sources, and all benchmarks",
    path: "/data/openprogression.json",
    primary: true,
  },
  {
    name: "levels.json",
    description: "7 progression levels with colors, percentile ranges, and descriptions",
    path: "/data/levels.json",
  },
  {
    name: "categories.json",
    description: "8 fitness categories with descriptions and key movements",
    path: "/data/categories.json",
  },
  {
    name: "sources.json",
    description: "14 research sources with citations, URLs, and sample sizes",
    path: "/data/sources.json",
  },
]

const BENCHMARK_FILES = [
  { name: "squatting.json", label: "Squatting", movements: 4, path: "/data/benchmarks/squatting.json" },
  { name: "pulling.json", label: "Pulling", movements: 1, path: "/data/benchmarks/pulling.json" },
  { name: "pressing.json", label: "Pressing", movements: 2, path: "/data/benchmarks/pressing.json" },
  { name: "olympic_lifting.json", label: "Olympic Lifting", movements: 3, path: "/data/benchmarks/olympic_lifting.json" },
  { name: "gymnastics.json", label: "Gymnastics", movements: 6, path: "/data/benchmarks/gymnastics.json" },
  { name: "monostructural.json", label: "Monostructural", movements: 4, path: "/data/benchmarks/monostructural.json" },
  { name: "bodyweight.json", label: "Bodyweight", movements: 5, path: "/data/benchmarks/bodyweight.json" },
  { name: "endurance.json", label: "Endurance", movements: 4, path: "/data/benchmarks/endurance.json" },
]

const SCHEMA_EXAMPLE = `{
  "version": "1.0.0",
  "levels": [...],
  "categories": [...],
  "sources": [...],
  "benchmarks": {
    "squatting": [
      {
        "movement": "back_squat",
        "name": "Back Squat",
        "testType": "1rm",
        "unit": "kg",
        "standards": {
          "beginner":          { "male": 40,  "female": 25 },
          "beginner_plus":     { "male": 60,  "female": 40 },
          "intermediate":      { "male": 80,  "female": 55 },
          "intermediate_plus": { "male": 105, "female": 70 },
          "advanced":          { "male": 130, "female": 85 },
          "advanced_plus":     { "male": 155, "female": 100 },
          "rx":                { "male": 180, "female": 120 }
        },
        "sources": ["ball_weidman_2024", "kilgore_2023"]
      }
    ],
    "pulling": [...],
    ...
  }
}`

const USAGE_EXAMPLE = `import data from './openprogression.json'

function getLevel(category, movement, gender, value) {
  const benchmarks = data.benchmarks[category]
  const bm = benchmarks.find(b => b.movement === movement)

  const levels = ['rx', 'advanced_plus', 'advanced',
    'intermediate_plus', 'intermediate', 'beginner_plus', 'beginner']

  for (const level of levels) {
    const standard = bm.standards[level][gender]
    // Handle range-based (arrays) vs single values
    const threshold = Array.isArray(standard) ? standard[0] : standard
    if (value >= threshold) return level
  }
  return 'beginner'
}

// Example: 80kg male with 105kg back squat
getLevel('squatting', 'back_squat', 'male', 105)
// => 'intermediate_plus'`

const datasetJsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "OpenProgression Fitness Benchmarks",
  description:
    "Research-backed fitness benchmark data across 8 categories and 7 progression levels. 25 movements with gender-specific standards derived from 1.3 million data points. Includes squatting, pulling, pressing, Olympic lifting, gymnastics, monostructural, bodyweight, and endurance benchmarks.",
  url: "https://openprogression.org/data",
  license: "https://opensource.org/licenses/MIT",
  creator: {
    "@type": "Organization",
    name: "OpenProgression",
    url: "https://openprogression.org",
  },
  distribution: {
    "@type": "DataDownload",
    contentUrl: "https://openprogression.org/data/openprogression.json",
    encodingFormat: "application/json",
  },
  keywords: [
    "fitness benchmarks",
    "strength standards",
    "CrossFit levels",
    "exercise progression",
    "athletic performance data",
  ],
}

export default function DataPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
      />
      {/* Hero */}
      <div className="mb-16">
        <div className="section-tag section-tag-teal mb-4">Data</div>
        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-4">
          Data & <span className="text-primary">Downloads</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          All OpenProgression data is available as JSON — free to use in any project under the MIT license.
          Build it into your gym software, coaching platform, or training app.
        </p>
      </div>

      {/* Primary Download */}
      <section className="mb-16">
        <div className="p-6 sm:p-8 rounded-2xl bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileJson className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-display font-bold tracking-tight mb-1">
                openprogression.json
              </h2>
              <p className="text-muted-foreground mb-4">
                One file with everything — all 7 levels, 8 categories, 14 sources, and 29 benchmarks
                with gender-specific standards across all levels. This is the recommended download.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/data/openprogression.json"
                  download
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  <Download className="w-4 h-4" /> Download JSON
                </a>
                <a
                  href="https://github.com/OpenProgression/openprogression/tree/main/data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-full font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Github className="w-4 h-4" /> View on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Individual Files */}
      <section className="mb-16">
        <h2 className="text-2xl font-display font-bold tracking-tight mb-2">
          Individual Files
        </h2>
        <p className="text-muted-foreground mb-6">
          Prefer to import only what you need? Download individual files.
        </p>

        {/* Core files */}
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Core
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {CORE_FILES.filter(f => !f.primary).map((file) => (
            <a
              key={file.name}
              href={file.path}
              download
              className="group p-4 rounded-xl border border-border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center gap-2 mb-1">
                <FileJson className="w-4 h-4 text-primary" />
                <span className="font-mono text-sm font-medium">{file.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{file.description}</p>
              <div className="mt-2 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <Download className="w-3 h-3" /> Download
              </div>
            </a>
          ))}
        </div>

        {/* Benchmark files */}
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Benchmarks by Category
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BENCHMARK_FILES.map((file) => (
            <a
              key={file.name}
              href={file.path}
              download
              className="group p-4 rounded-xl border border-border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center gap-2 mb-1">
                <FileJson className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs font-medium">{file.name}</span>
              </div>
              <p className="text-sm font-medium">{file.label}</p>
              <p className="text-xs text-muted-foreground">{file.movements} movement{file.movements !== 1 ? "s" : ""}</p>
              <div className="mt-2 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <Download className="w-3 h-3" /> Download
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Schema */}
      <section className="mb-16">
        <h2 className="text-2xl font-display font-bold tracking-tight mb-2">
          Schema Overview
        </h2>
        <p className="text-muted-foreground mb-4">
          The bundled JSON contains levels, categories, sources, and benchmarks. Here&apos;s the structure:
        </p>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-2 border-b border-border bg-secondary/50">
            <span className="font-mono text-xs text-muted-foreground">openprogression.json</span>
          </div>
          <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
            <code className="text-foreground">{SCHEMA_EXAMPLE}</code>
          </pre>
        </div>
      </section>

      {/* Usage Example */}
      <section className="mb-16">
        <h2 className="text-2xl font-display font-bold tracking-tight mb-2">
          Usage Example
        </h2>
        <p className="text-muted-foreground mb-4">
          Load the JSON and look up a level for any movement:
        </p>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-2 border-b border-border bg-secondary/50">
            <span className="font-mono text-xs text-muted-foreground">JavaScript / TypeScript</span>
          </div>
          <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
            <code className="text-foreground">{USAGE_EXAMPLE}</code>
          </pre>
        </div>
      </section>

      {/* Poster */}
      <section className="mb-16">
        <h2 className="text-2xl font-display font-bold tracking-tight mb-2">
          Gym Wall Poster
        </h2>
        <p className="text-muted-foreground mb-4">
          Print all benchmarks on a single A1 poster for your gym wall. Both genders, all 8 categories, all 7 levels.
        </p>
        <a
          href="/poster.svg"
          download="OpenProgression-Poster.svg"
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-full font-medium text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Printer className="w-4 h-4" /> Download Poster (SVG, A1 landscape)
        </a>
      </section>

      {/* CTA */}
      <section className="p-8 rounded-2xl bg-primary/5 border border-primary/20">
        <h2 className="text-xl font-display font-bold tracking-tight mb-2">
          Build with OpenProgression
        </h2>
        <p className="text-muted-foreground mb-4">
          The data is MIT licensed — use it in your gym management software, workout tracker,
          coaching platform, or any other project. No attribution required (but appreciated).
        </p>
        <a
          href="https://github.com/OpenProgression/openprogression"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-medium text-sm hover:opacity-90 transition-opacity"
        >
          View on GitHub <ExternalLink className="w-4 h-4" />
        </a>
      </section>
    </div>
  )
}
