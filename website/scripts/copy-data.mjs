import { cpSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = join(__dirname, "..", "..", "data")
const dest = join(__dirname, "..", "public", "data")

// Copy individual files
mkdirSync(join(dest, "benchmarks"), { recursive: true })
cpSync(src, dest, { recursive: true })
console.log("Copied data/ → public/data/")

// Build bundled openprogression.json
const levels = JSON.parse(readFileSync(join(src, "levels.json"), "utf8"))
const categories = JSON.parse(readFileSync(join(src, "categories.json"), "utf8"))
const sources = JSON.parse(readFileSync(join(src, "sources.json"), "utf8"))

const benchmarks = {}
for (const file of readdirSync(join(src, "benchmarks"))) {
  if (!file.endsWith(".json")) continue
  const data = JSON.parse(readFileSync(join(src, "benchmarks", file), "utf8"))
  benchmarks[data.category] = data.benchmarks
}

const bundle = {
  version: levels.version,
  levels: levels.levels,
  categories: categories.categories,
  sources: sources.sources,
  benchmarks,
}

writeFileSync(join(dest, "openprogression.json"), JSON.stringify(bundle, null, 2))
console.log("Generated public/data/openprogression.json (bundled)")
