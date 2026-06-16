import SwiftUI

private struct SelectedBenchmark: Identifiable {
    let benchmark: Benchmark; let category: String
    var id: String { benchmark.movement }
}

struct BenchmarksView: View {
    @Environment(DataStore.self) private var store
    @AppStorage("op.gender") private var gender: Gender = .male
    @State private var selected: SelectedBenchmark?

    private let catOrder = ["squatting","pulling","pressing","olympic_lifting","gymnastics","monostructural","bodyweight","endurance"]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                VStack(alignment: .leading, spacing: 6) {
                    SectionLabel(text: "The Standard")
                    Text("Benchmarks").font(.display(28)).foregroundStyle(Theme.text)
                    Picker("", selection: $gender) { Text("Male").tag(Gender.male); Text("Female").tag(Gender.female) }
                        .pickerStyle(.segmented).padding(.top, 2)
                }
                ForEach(catOrder, id: \.self) { catId in
                    if let cat = store.categories.first(where: { $0.id == catId }),
                       let bms = store.benchmarksByCategory[catId] {
                        VStack(alignment: .leading, spacing: 4) {
                            HStack(spacing: 8) {
                                Text(cat.icon)
                                Text(cat.name).font(.display(16, .bold)).foregroundStyle(Theme.text)
                            }.padding(.bottom, 6)
                            ForEach(bms) { b in
                                Button { Haptics.tap(); selected = SelectedBenchmark(benchmark: b, category: cat.name) } label: {
                                    benchmarkRow(b)
                                }.buttonStyle(.plain)
                            }
                        }.frame(maxWidth: .infinity, alignment: .leading).card(padding: 16)
                    }
                }
                Spacer(minLength: 24)
            }
            .padding(.horizontal, 18).padding(.top, 8)
        }
        .background(Theme.bg.ignoresSafeArea())
        .sheet(item: $selected) { sel in
            BenchmarkDetailView(benchmark: sel.benchmark, categoryName: sel.category).presentationDragIndicator(.visible)
        }
    }

    private func benchmarkRow(_ b: Benchmark) -> some View {
        HStack {
            Text(b.name).font(.body(14, .medium)).foregroundStyle(Theme.text)
            Spacer()
            HStack(spacing: 6) {
                Text("Rx").font(.system(size: 11, weight: .bold)).foregroundStyle(Theme.levelColor(7))
                Text(benchmarkValueText(b.standards["rx"]?[gender.rawValue], b.unit)).font(.body(14, .semibold)).foregroundStyle(Theme.textDim)
                Image(systemName: "chevron.right").font(.system(size: 10, weight: .bold)).foregroundStyle(Theme.textFaint)
            }
        }
        .padding(.vertical, 8)
        .overlay(alignment: .bottom) { Rectangle().fill(Theme.stroke).frame(height: 1) }
    }
}
