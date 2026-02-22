import Link from "next/link"

const LEVEL_COLORS = [
  "#4ADE80",
  "#22C55E",
  "#EAB308",
  "#F97316",
  "#EF4444",
  "#DC2626",
  "#991B1B",
]

const QUICK_LINKS = [
  { href: "/levels", label: "Levels" },
  { href: "/categories", label: "Categories" },
  { href: "/benchmarks", label: "Benchmarks" },
  { href: "/methodology", label: "Methodology" },
  { href: "/license", label: "Open by Design" },
  {
    href: "https://github.com/OpenProgression/openprogression",
    label: "GitHub",
    external: true,
  },
]

export default function Footer() {
  return (
    <footer className="bg-secondary dark:bg-card border-t border-border">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex gap-0.5">
                {LEVEL_COLORS.map((c, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <span className="font-display font-bold text-base tracking-tight">
                Open<span className="text-primary">Progression</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              An open standard for fitness progression. Research-backed benchmarks
              across 7 levels and 8 categories.
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                MIT License
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                v1.0.0
              </span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Supporters Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Supporters
            </h3>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            {new Date().getFullYear()} OpenProgression contributors. Released under the MIT License.
          </p>
        </div>
      </div>
    </footer>
  )
}
