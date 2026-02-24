import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Calculator",
  description:
    "Assess your fitness level across all 8 OpenProgression categories. Enter your numbers and see where you stand.",
  openGraph: {
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
}

const calculatorJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "OpenProgression Level Calculator",
  url: "https://openprogression.org/calculator",
  description:
    "Assess your fitness level across all 8 OpenProgression categories. Enter your numbers and see where you stand — from Beginner to Rx.",
  applicationCategory: "HealthApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
}

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorJsonLd) }}
      />
      {children}
    </>
  )
}
