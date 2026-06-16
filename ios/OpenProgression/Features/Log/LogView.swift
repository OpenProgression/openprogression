import SwiftUI
import SwiftData

struct LogView: View {
    @Environment(\.modelContext) private var ctx
    @Query(sort: \LogEntry.date, order: .reverse) private var entries: [LogEntry]

    var body: some View {
        NavigationStack {
            Group {
                if entries.isEmpty { empty } else { list }
            }
            .background(Theme.bg.ignoresSafeArea())
            .navigationTitle("Log")
            .toolbar {
                if !entries.isEmpty {
                    ToolbarItem(placement: .topBarTrailing) {
                        ShareLink(item: CSV.file(for: entries)) {
                            Image(systemName: "square.and.arrow.up")
                        }.tint(Theme.primary)
                    }
                }
            }
        }
    }

    private var empty: some View {
        VStack(spacing: 12) {
            Image(systemName: "checklist").font(.system(size: 44, weight: .light)).foregroundStyle(Theme.textFaint)
            Text("No results yet").font(.display(20)).foregroundStyle(Theme.text)
            Text("Log a workout or a benchmark and it shows up here. Export the whole log to a CSV anytime.")
                .font(.body(14)).foregroundStyle(Theme.textDim).multilineTextAlignment(.center).padding(.horizontal, 40)
        }.frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var list: some View {
        List {
            ForEach(entries) { e in row(e) }
                .onDelete { idx in idx.map { entries[$0] }.forEach(ctx.delete) }
                .listRowBackground(Theme.surface)
                .listRowSeparatorTint(Theme.stroke)
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
    }

    private func row(_ e: LogEntry) -> some View {
        HStack(spacing: 12) {
            Circle().fill(Theme.levelColor(e.level)).frame(width: 8, height: 8)
            VStack(alignment: .leading, spacing: 2) {
                Text(e.name).font(.body(15, .semibold)).foregroundStyle(Theme.text)
                Text("\(e.type) · \(prettyDate(e.date))\(e.notes.map { " · \($0)" } ?? "")")
                    .font(.body(12)).foregroundStyle(Theme.textFaint).lineLimit(1)
            }
            Spacer()
            Text(e.result).font(.display(16, .bold)).foregroundStyle(Theme.primary)
        }.padding(.vertical, 4)
    }

    private func prettyDate(_ d: Date) -> String {
        let f = DateFormatter(); f.dateFormat = "MMM d"; return f.string(from: d)
    }
}
