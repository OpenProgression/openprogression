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

export const metadata: Metadata = {
  title: "OpenProgression -- Open Fitness Progression Standard",
  description:
    "A research-backed, open standard for assessing and tracking fitness progression. 7 levels, 8 categories, backed by peer-reviewed data.",
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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
