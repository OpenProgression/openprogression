export default function Home() {
  return (
    <section className="relative flex items-center justify-center min-h-[90vh] px-6">
      <div className="text-center max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex gap-1">
            {["#4ADE80", "#22C55E", "#EAB308", "#F97316", "#EF4444", "#DC2626", "#991B1B"].map(
              (color, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
              )
            )}
          </div>
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tight mb-6">
          Open<span className="text-primary">Progression</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          A research-backed, open standard for assessing and tracking fitness
          progression. 7 levels. 8 categories. Backed by peer-reviewed data
          from over 1.3 million athletes.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href="/levels"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            Explore the Standard
          </a>
          <a
            href="https://github.com/OpenProgression/openprogression"
            className="px-6 py-3 border border-border rounded-full font-medium hover:bg-muted transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  )
}
