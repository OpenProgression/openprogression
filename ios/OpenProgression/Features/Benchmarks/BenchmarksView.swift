import SwiftUI

struct BenchmarksView: View {
    @Environment(DataStore.self) private var store
    @State private var gender: Gender = .male

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
                        VStack(alignment: .leading, spacing: 10) {
                            HStack(spacing: 8) {
                                Text(cat.icon)
                                Text(cat.name).font(.system(size: 16, weight: .bold)).foregroundStyle(Theme.text)
                            }
                            ForEach(bms) { b in benchmarkRow(b) }
                        }.frame(maxWidth: .infinity, alignment: .leading).card(padding: 16)
                    }
                }
                Spacer(minLength: 24)
            }
            .padding(.horizontal, 18).padding(.top, 8)
        }
        .background(Theme.bg.ignoresSafeArea())
    }

    private func benchmarkRow(_ b: Benchmark) -> some View {
        let rx = b.standards["rx"]?[gender.rawValue]
        return HStack {
            Text(b.name).font(.system(size: 14, weight: .medium)).foregroundStyle(Theme.text)
            Spacer()
            HStack(spacing: 6) {
                Text("Rx").font(.system(size: 11, weight: .bold)).foregroundStyle(Theme.levelColor(7))
                Text(rxText(rx, b.unit)).font(.system(size: 14, weight: .semibold)).foregroundStyle(Theme.textDim)
            }
        }
        .padding(.vertical, 7)
        .overlay(alignment: .bottom) { Rectangle().fill(Theme.stroke).frame(height: 1) }
    }

    private func rxText(_ v: StandardValue?, _ unit: String) -> String {
        guard let v else { return "-" }
        switch v {
        case .scalar(let d):
            if unit == "seconds" { let s = Int(d); return String(format: "%d:%02d", s/60, s%60) }
            return "\(Int(d)) \(unit == "kg" ? "kg" : unit == "rounds" ? "rds" : unit)"
        case .range(let lo, _): return "\(lo)+ \(unit)"
        }
    }
}
