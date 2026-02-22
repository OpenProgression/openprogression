import { Check, X, ExternalLink, Scale, Shield, Heart } from "lucide-react"

export const metadata = {
  title: "Open by Design — OpenProgression",
  description:
    "OpenProgression is free and open. The standard, data, and code are MIT licensed. Only the brand name and logo are protected.",
}

const CAN_DO = [
  "Use the standard in your gym management software",
  "Build a mobile app powered by OP benchmarks",
  "Import the JSON data into your coaching platform",
  "Modify the benchmarks for your specific community",
  "Create derivative works and publish them",
  "Use OP commercially without paying a cent",
  "Fork the repo and build your own version",
  "Print benchmark posters for your gym wall",
  "Teach OP methodology in coaching certifications",
  "Write articles and books referencing OP",
]

const CANNOT_DO = [
  'Sell merchandise using the "OpenProgression" name or logo without permission',
  "Imply official endorsement or partnership without permission",
  "Use the OP logo on commercial products as if they are officially certified",
]

export default function LicensePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Hero */}
      <div className="mb-16">
        <div className="section-tag section-tag-teal mb-4">Philosophy</div>
        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-4">
          Open by <span className="text-primary">Design</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          OpenProgression exists because fitness assessment should be a shared language,
          not a proprietary product. The standard is free. The data is free. The code is free.
          We only protect the brand.
        </p>
      </div>

      {/* The Two Parts */}
      <section className="mb-16">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Open Part */}
          <div className="p-8 rounded-2xl border border-primary/20 bg-primary/5">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Scale className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-display font-bold tracking-tight mb-2">
              The Standard: Fully Open
            </h2>
            <p className="text-sm text-muted-foreground mb-1">Licensed under MIT</p>
            <p className="text-muted-foreground mb-6">
              All benchmark data, level definitions, assessment methodology, source code,
              and documentation are released under the MIT License — the most permissive
              open source license available.
            </p>
            <p className="text-sm font-medium mb-3">You can freely:</p>
            <ul className="space-y-2.5">
              {CAN_DO.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Protected Part */}
          <div className="p-8 rounded-2xl border border-border bg-card">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-display font-bold tracking-tight mb-2">
              The Brand: Protected
            </h2>
            <p className="text-sm text-muted-foreground mb-1">Trademark, not copyright</p>
            <p className="text-muted-foreground mb-6">
              The name &ldquo;OpenProgression&rdquo;, the OP logo, and the 7-level progression
              gradient mark are trademarks of the OpenProgression project. This is separate
              from the code license.
            </p>
            <p className="text-sm font-medium mb-3">The only restrictions:</p>
            <ul className="space-y-2.5 mb-8">
              {CANNOT_DO.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground">
              Want to use the brand for something specific?{" "}
              <a
                href="https://github.com/OpenProgression/openprogression/issues"
                className="text-primary hover:underline"
              >
                Just ask
              </a>
              . We&apos;re happy to work with the community.
            </p>
          </div>
        </div>
      </section>

      {/* Why This Approach */}
      <section className="mb-16">
        <h2 className="text-2xl font-display font-bold tracking-tight mb-6">
          Why This Approach?
        </h2>
        <div className="space-y-6">
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Maximum adoption</h3>
              <p className="text-muted-foreground">
                The whole point of an open standard is adoption. MIT licensing means zero friction —
                any developer, coach, or gym can use OP without lawyers, licensing fees, or
                complicated agreements. The more people who use it, the more valuable it becomes
                for everyone.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Brand integrity</h3>
              <p className="text-muted-foreground">
                Protecting the name ensures that when someone sees &ldquo;OpenProgression&rdquo;
                on a product, it actually means something. Without trademark protection, anyone
                could slap the OP name on low-quality products or misrepresent the standard.
                The brand protection exists to serve the community, not restrict it.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Industry precedent</h3>
              <p className="text-muted-foreground">
                This is exactly how the most successful open source projects work.
                Linux, Firefox, Kubernetes, Docker, and hundreds of others use this same model:
                open code, protected brand. It&apos;s proven to work at every scale,
                from small community projects to global standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-16">
        <h2 className="text-2xl font-display font-bold tracking-tight mb-6">
          Common Questions
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "Can I use OP benchmarks in my commercial app?",
              a: "Yes, absolutely. The data and code are MIT licensed. Use them however you want, commercially or otherwise.",
            },
            {
              q: "Can I modify the benchmarks for my community?",
              a: "Yes. You can fork, modify, and redistribute the data. MIT license allows full modification.",
            },
            {
              q: 'Can I say my app "uses OpenProgression standards"?',
              a: 'Yes. Describing that your product uses or is compatible with the OP standard is factual and fine. You just can\'t use the OP logo in a way that implies official certification or endorsement without permission.',
            },
            {
              q: "Can I print OP benchmark charts for my gym?",
              a: "Yes. Print them, post them on your wall, hand them out to members. That is exactly what the standard is for.",
            },
            {
              q: 'Can I sell t-shirts that say "OpenProgression"?',
              a: "Not without permission. The name is trademarked. But reach out — we are open to working with the community on merchandise.",
            },
            {
              q: "Do I need to credit OpenProgression if I use the data?",
              a: "The MIT license only requires you to include the copyright notice in copies of the software. Attribution is appreciated but not legally required for the data itself.",
            },
          ].map((item) => (
            <div
              key={item.q}
              className="p-5 rounded-xl border border-border bg-card"
            >
              <h3 className="font-semibold text-sm mb-2">{item.q}</h3>
              <p className="text-sm text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Full License */}
      <section className="p-8 rounded-2xl bg-secondary/50 border border-border">
        <h2 className="text-xl font-display font-bold tracking-tight mb-4">
          Full License Text
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          The complete MIT License as applied to the OpenProgression project:
        </p>
        <a
          href="https://github.com/OpenProgression/openprogression/blob/main/LICENSE"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-medium text-sm hover:opacity-90 transition-opacity"
        >
          View LICENSE on GitHub <ExternalLink className="w-4 h-4" />
        </a>
      </section>
    </div>
  )
}
