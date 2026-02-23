import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Calculator",
  description:
    "Assess your fitness level across all 8 OpenProgression categories. Enter your numbers and see where you stand.",
  openGraph: {
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
}

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
