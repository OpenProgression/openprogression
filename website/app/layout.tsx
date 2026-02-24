import type { Metadata } from "next"
import { Outfit, Inter_Tight } from "next/font/google"
import { ThemeProvider } from "next-themes"
import Header from "./components/Header"
import Footer from "./components/Footer"
import "./globals.css"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

const display = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-display-family",
  weight: ["700", "800", "900"],
  display: "swap",
})

const SITE_URL = "https://openprogression.org"

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "OpenProgression",
    url: SITE_URL,
    logo: `${SITE_URL}/og.png`,
    description:
      "An open standard for fitness progression assessment. 7 levels, 8 categories, 25 benchmarks derived from 1.3 million data points.",
    sameAs: ["https://github.com/OpenProgression/openprogression"],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "OpenProgression",
    url: SITE_URL,
    description:
      "A research-backed, open standard for assessing and tracking fitness progression. 7 levels, 8 categories, backed by peer-reviewed data from 1.3 million athletes.",
  },
]

export const metadata: Metadata = {
  title: {
    default: "OpenProgression — Open Fitness Progression Standard",
    template: "%s — OpenProgression",
  },
  description:
    "A research-backed, open standard for assessing and tracking fitness progression. 7 levels, 8 categories, backed by peer-reviewed data from 1.3 million athletes.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    siteName: "OpenProgression",
    title: "OpenProgression — Open Fitness Progression Standard",
    description:
      "A research-backed, open standard for assessing and tracking fitness progression. 7 levels, 8 categories, backed by peer-reviewed data from 1.3 million athletes.",
    url: SITE_URL,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "OpenProgression — 7 levels, 8 categories, research-backed fitness standard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenProgression — Open Fitness Progression Standard",
    description:
      "A research-backed, open standard for assessing and tracking fitness progression. 7 levels, 8 categories, 1.3M+ data points.",
    images: ["/og.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${display.variable} font-sans`}
      >
        {jsonLd.map((data, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
          />
        ))}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
