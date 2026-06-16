import SwiftUI
import SwiftData
import Charts

private struct ShareTarget: Identifiable { let id = UUID(); let card: ResultCard }

struct LogView: View {
    @Environment(\.modelContext) private var ctx
    @Query(sort: \LogEntry.date, order: .reverse) private var entries: [LogEntry]
    @State private var shareTarget: ShareTarget?

    var body: some View {
        NavigationStack {
            Group {
                if entries.isEmpty { empty } else { content }
            }
            .background(Theme.bg.ignoresSafeArea())
            .navigationTitle("Log")
            .toolbar {
                if !entries.isEmpty {
                    ToolbarItem(placement: .topBarTrailing) {
                        ShareLink(item: CSV.file(for: entries)) { Image(systemName: "square.and.arrow.up") }.tint(Theme.primary)
                    }
                }
            }
        }
    }

    private var empty: some View {
        VStack(spacing: 12) {
            Image(systemName: "checklist").font(.system(size: 44, weight: .light)).foregroundStyle(Theme.textFaint)
            Text("No results yet").font(.display(20)).foregroundStyle(Theme.text)
            Text("Run a workout or log a benchmark and it shows up here, with PRs, a streak, and CSV export.")
                .font(.body(14)).foregroundStyle(Theme.textDim).multilineTextAlignment(.center).padding(.horizontal, 40)
        }.frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var content: some View {
        List {
            Section {
                statsCard.listRowInsets(EdgeInsets(top: 8, leading: 18, bottom: 6, trailing: 18))
                    .listRowBackground(Color.clear).listRowSeparator(.hidden)
            }
            Section {
                ForEach(entries) { e in
                    row(e).listRowInsets(EdgeInsets(top: 0, leading: 18, bottom: 0, trailing: 18))
                        .listRowBackground(Color.clear).listRowSeparator(.hidden)
                }
                .onDelete { idx in idx.map { entries[$0] }.forEach(ctx.delete) }
            }
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
        .sheet(item: $shareTarget) { t in ShareResultView(card: t.card).presentationDragIndicator(.visible) }
    }

    // MARK: stats
    private var statsCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                stat("\(streak)", streak == 1 ? "day streak" : "day streak")
                Divider().frame(height: 34).overlay(Theme.stroke)
                stat("\(entries.count)", "logged")
                Divider().frame(height: 34).overlay(Theme.stroke)
                stat("\(thisWeekCount)", "this week")
            }
            if weekCounts.contains(where: { $0.1 > 0 }) {
                Chart(weekCounts, id: \.0) { item in
                    BarMark(x: .value("Week", item.0, unit: .weekOfYear), y: .value("Sessions", item.1))
                        .foregroundStyle(Theme.primary).cornerRadius(3)
                }
                .frame(height: 70)
                .chartXAxis { AxisMarks(values: .stride(by: .weekOfYear)) { _ in } }
                .chartYAxis(.hidden)
            }
        }.frame(maxWidth: .infinity).card()
    }
    private func stat(_ v: String, _ l: String) -> some View {
        VStack(spacing: 2) {
            Text(v).font(.display(22, .bold)).foregroundStyle(Theme.text)
            Text(l.uppercased()).font(.system(size: 10, weight: .bold)).tracking(0.8).foregroundStyle(Theme.textFaint)
        }.frame(maxWidth: .infinity)
    }

    private func row(_ e: LogEntry) -> some View {
        Button {
            Haptics.tap()
            shareTarget = ShareTarget(card: ResultCard(
                name: e.name, result: e.result,
                subtitle: "\(e.type) · \(levelShort[max(1, min(7, e.level)) - 1])", levelNumber: e.level))
        } label: {
            HStack(spacing: 12) {
                Circle().fill(Theme.levelColor(e.level)).frame(width: 8, height: 8)
                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 6) {
                        Text(e.name).font(.body(15, .semibold)).foregroundStyle(Theme.text)
                        if prIDs.contains(e.persistentModelID) {
                            Text("PR").font(.system(size: 9, weight: .black)).foregroundStyle(.black)
                                .padding(.horizontal, 5).padding(.vertical, 2).background(Theme.primary, in: Capsule())
                        }
                    }
                    Text("\(e.type) · \(prettyDate(e.date))\(e.notes.map { " · \($0)" } ?? "")")
                        .font(.body(12)).foregroundStyle(Theme.textFaint).lineLimit(1)
                }
                Spacer()
                Text(e.result).font(.display(16, .bold)).foregroundStyle(Theme.primary)
                Image(systemName: "square.and.arrow.up").font(.system(size: 12, weight: .semibold)).foregroundStyle(Theme.textFaint)
            }
            .padding(.vertical, 11)
            .contentShape(Rectangle())
            .overlay(alignment: .bottom) { Rectangle().fill(Theme.stroke).frame(height: 1) }
        }.buttonStyle(.plain)
    }

    // MARK: derived
    private var cal: Calendar { Calendar.current }
    private func day(_ d: Date) -> Date { cal.startOfDay(for: d) }
    private func week(_ d: Date) -> Date { cal.date(from: cal.dateComponents([.yearForWeekOfYear, .weekOfYear], from: d)) ?? d }

    private var streak: Int {
        let days = Set(entries.map { day($0.date) })
        guard !days.isEmpty else { return 0 }
        var cursor = day(Date())
        if !days.contains(cursor) { cursor = cal.date(byAdding: .day, value: -1, to: cursor)! }  // grace for "not yet today"
        guard days.contains(cursor) else { return 0 }
        var n = 0
        while days.contains(cursor) { n += 1; cursor = cal.date(byAdding: .day, value: -1, to: cursor)! }
        return n
    }
    private var thisWeekCount: Int { entries.filter { week($0.date) == week(Date()) }.count }
    private var weekCounts: [(Date, Int)] {
        let now = week(Date())
        return (0..<8).reversed().map { off -> (Date, Int) in
            let w = cal.date(byAdding: .weekOfYear, value: -off, to: now) ?? now
            return (w, entries.filter { week($0.date) == w }.count)
        }
    }

    /// IDs of the best entry per movement (only when there is a prior to beat).
    private var prIDs: Set<PersistentIdentifier> {
        var counts: [String: Int] = [:]
        for e in entries { counts[e.name, default: 0] += 1 }
        var best: [String: LogEntry] = [:]
        for e in entries where (counts[e.name] ?? 0) >= 2 {
            if let b = best[e.name] { if better(e, than: b) { best[e.name] = e } }
            else { best[e.name] = e }
        }
        return Set(best.values.map { $0.persistentModelID })
    }
    private func score(_ r: String) -> (Double, Bool) {
        if r.contains(":") {
            let parts = r.split(separator: ":")
            if parts.count == 2, let m = Double(parts[0]), let s = Double(parts[1].prefix(while: { $0.isNumber })) {
                return (m * 60 + s, true)   // time, lower is better
            }
        }
        let num = Double(r.prefix(while: { $0.isNumber || $0 == "." })) ?? 0
        return (num, false)                 // load/reps/rounds, higher is better
    }
    private func better(_ a: LogEntry, than b: LogEntry) -> Bool {
        let (av, low) = score(a.result); let (bv, _) = score(b.result)
        return low ? av < bv : av > bv
    }

    private func prettyDate(_ d: Date) -> String { let f = DateFormatter(); f.dateFormat = "MMM d"; return f.string(from: d) }
}
