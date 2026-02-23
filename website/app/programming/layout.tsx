import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Programming",
  description:
    "Browse the OpenProgression metcon library. View workouts scaled to your level across all 7 tiers.",
  openGraph: {
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
}

export default function ProgrammingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
