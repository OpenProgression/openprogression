import SwiftUI

func benchmarkValueText(_ v: StandardValue?, _ unit: String) -> String {
    guard let v else { return "-" }
    switch v {
    case .scalar(let d):
        if unit == "seconds" { let s = Int(d); return String(format: "%d:%02d", s/60, s%60) }
        return "\(Int(d)) \(unit == "kg" ? "kg" : unit == "rounds" ? "rds" : unit)"
    case .range(let lo, let hi):
        if hi >= 99 { return "\(lo)+ \(unit)" }
        if lo == hi { return "\(lo) \(unit)" }
        return "\(lo)-\(hi) \(unit)"
    }
}

struct BenchmarkDetailView: View {
    @Environment(DataStore.self) private var store
    @AppStorage("op.gender") private var gender: Gender = .male
    @AppStorage("op.level") private var userLevel: Int = 3
    let benchmark: Benchmark
    let categoryName: String
    @State private var showLog = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                VStack(alignment: .leading, spacing: 6) {
                    SectionLabel(text: categoryName)
                    Text(benchmark.name).font(.display(28)).foregroundStyle(Theme.text)
                    HStack(spacing: 8) {
                        Chip(text: testLabel, color: Theme.primary)
                        if let d = benchmark.description { Text(d).font(.body(12)).foregroundStyle(Theme.textFaint) }
                    }
                }
                Picker("", selection: $gender) { Text("Male").tag(Gender.male); Text("Female").tag(Gender.female) }.pickerStyle(.segmented)

                VStack(alignment: .leading, spacing: 6) {
                    SectionLabel(text: "Standards by level")
                    ForEach(store.levels.reversed()) { lv in
                        HStack(spacing: 12) {
                            Circle().fill(Theme.levelColor(lv.number)).frame(width: 8, height: 8)
                            Text(lv.name).font(.body(14, .medium)).foregroundStyle(Theme.text)
                            Spacer()
                            if let bwm = benchmark.bwMultiplier?[lv.id]?[gender.rawValue] {
                                Text(String(format: "%.2gx BW", bwm)).font(.body(11)).foregroundStyle(Theme.textFaint)
                            }
                            Text(benchmarkValueText(benchmark.standards[lv.id]?[gender.rawValue], benchmark.unit))
                                .font(.body(15, .semibold)).foregroundStyle(Theme.levelColor(lv.number))
                        }
                        .padding(.vertical, 8)
                        .overlay(alignment: .bottom) { Rectangle().fill(Theme.stroke).frame(height: 1) }
                    }
                }.card(padding: 16)

                Button { Haptics.tap(); showLog = true } label: {
                    Label("Log a test", systemImage: "square.and.pencil")
                        .font(.body(15, .semibold)).foregroundStyle(Color.black)
                        .frame(maxWidth: .infinity).padding(.vertical, 14)
                        .background(Theme.primary, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                }.buttonStyle(.pressable)
                Spacer(minLength: 12)
            }
            .padding(20)
        }
        .background(Theme.bg.ignoresSafeArea())
        .sheet(isPresented: $showLog) {
            LogEntrySheet(type: "Benchmark", name: benchmark.name, code: nil, level: userLevel, gender: gender,
                          resultPlaceholder: placeholder).presentationDetents([.medium])
        }
    }

    private var testLabel: String {
        switch benchmark.testType { case "1rm": return "1 Rep Max"; case "max_reps": return "Max Reps"; case "time": return "For Time"; case "amrap": return "AMRAP"; default: return benchmark.testType }
    }
    private var placeholder: String {
        switch benchmark.testType { case "time": return "e.g. 7:30"; case "1rm": return "e.g. 120 kg"; default: return benchmark.unit == "reps" ? "e.g. 12 reps" : "e.g. \(benchmark.unit)" }
    }
}
