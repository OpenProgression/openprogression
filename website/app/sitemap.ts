import type { MetadataRoute } from "next"

export const dynamic = "force-static"

const BASE = "https://openprogression.org"

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { path: "/", priority: 1.0 },
    { path: "/levels", priority: 0.8 },
    { path: "/categories", priority: 0.8 },
    { path: "/benchmarks", priority: 0.9 },
    { path: "/calculator", priority: 0.9 },
    { path: "/programming", priority: 0.9 },
    { path: "/data", priority: 0.7 },
    { path: "/methodology", priority: 0.6 },
    { path: "/license", priority: 0.3 },
  ]

  return pages.map(({ path, priority }) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/programming" ? "weekly" : "monthly",
    priority,
  }))
}
