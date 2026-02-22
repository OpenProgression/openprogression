import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Benchmarks",
  description:
    "Explore all OpenProgression benchmarks across 8 categories. Filter by gender and category, see exact numbers for every level from Beginner to Rx.",
}

export default function BenchmarksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
