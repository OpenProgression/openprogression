import SwiftUI

private struct CatInput: Identifiable {
    let id: String        // category id
    let title: String     // category name
    let movement: String  // representative movement display
    let benchmark: Benchmark
}

struct CalculatorView: View {
    @Environment(DataStore.self) private var store
    @AppStorage("op.gender") private var gender: Gender = .male
    @State private var ageBand: String = "18-29"
    @State private var bodyweight: String = ""
    @State private var useBW = false
    @State private var inputs: [String: String] = [:]

    private let ageBands = ["18-29","30-39","40-49","50+"]

    private var cats: [CatInput] {
        guard let calc = store.calc else { return [] }
        return store.categories.compactMap { cat in
            guard let rep = calc.representativeMovements[cat.id],
                  let bm = store.benchmarks.first(where: { $0.movement == rep.movement }) else { return nil }
            return CatInput(id: cat.id, title: cat.name, movement: bm.name, benchmark: bm)
        }
    }

    private var bw: Double? { let n = Double(bodyweight); return (n ?? 0) >= 30 && (n ?? 0) <= 300 ? n : nil }
    private var ageMult: Double { store.calc?.ageAdjustment.multipliers[ageBand] ?? 1 }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                VStack(alignment: .leading, spacing: 4) {
                    SectionLabel(text: "Assessment")
                    Text("Level Calculator").font(.display(28)).foregroundStyle(Theme.text)
                    Text("Enter one movement per category. Overall = your weakest link.").font(.system(size: 14)).foregroundStyle(Theme.textDim)
                }
                controls
                results.animation(.snappy, value: inputs)
                ForEach(cats) { c in inputRow(c) }
                Spacer(minLength: 24)
            }
            .padding(.horizontal, 18).padding(.top, 8)
            .animation(.snappy, value: useBW)
        }
        .background(Theme.bg.ignoresSafeArea())
    }

    private var controls: some View {
        VStack(spacing: 10) {
            Picker("", selection: $gender) { Text("Male").tag(Gender.male); Text("Female").tag(Gender.female) }.pickerStyle(.segmented)
            Picker("", selection: $ageBand) { ForEach(ageBands, id: \.self) { Text($0).tag($0) } }.pickerStyle(.segmented)
            HStack(spacing: 10) {
                TextField("Bodyweight (kg)", text: $bodyweight).keyboardType(.numberPad)
                    .padding(.horizontal, 14).padding(.vertical, 10)
                    .background(Theme.surface, in: Capsule()).overlay(Capsule().strokeBorder(Theme.stroke))
                HStack(spacing: 0) {
                    segBtn("Absolute", active: !useBW, enabled: true) { useBW = false }
                    segBtn("× BW", active: useBW && bw != nil, enabled: bw != nil) { useBW = true }
                }.background(Theme.surface, in: Capsule()).overlay(Capsule().strokeBorder(Theme.stroke))
            }
            if !bodyweight.isEmpty && bw == nil {
                Text("Enter a bodyweight between 30 and 300 kg to score relative to bodyweight.")
                    .font(.system(size: 12)).foregroundStyle(Theme.textFaint).frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }
    private func segBtn(_ t: String, active: Bool, enabled: Bool, _ act: @escaping () -> Void) -> some View {
        Button(action: act) {
            Text(t).font(.system(size: 13, weight: .semibold))
                .foregroundStyle(active ? Color.black : (enabled ? Theme.textDim : Theme.textFaint.opacity(0.5)))
                .padding(.horizontal, 14).padding(.vertical, 10).background(active ? Theme.primary : Color.clear, in: Capsule())
        }.buttonStyle(.plain).disabled(!enabled)
    }

    private var results: some View {
        let levels = cats.compactMap { levelNumber(for: $0) }
        let overall = levels.min()
        let complete = levels.count == cats.count && !cats.isEmpty
        return VStack(alignment: .leading, spacing: 12) {
            if let overall, let lv = store.level(number: overall) {
                VStack(spacing: 8) {
                    SectionLabel(text: complete ? "Overall Level · Weakest Link" : "Weakest So Far · \(levels.count)/\(cats.count)")
                    HStack(spacing: 10) {
                        Circle().fill(Theme.levelColor(overall)).frame(width: 16, height: 16)
                        Text(lv.name).font(.display(28)).foregroundStyle(Theme.levelColor(overall))
                    }
                    if !complete {
                        Text("Fill all \(cats.count) categories for your official level.")
                            .font(.system(size: 12)).foregroundStyle(Theme.textFaint)
                    }
                }.frame(maxWidth: .infinity).padding(18)
                .background(RoundedRectangle(cornerRadius: 20, style: .continuous).fill(Theme.levelColor(overall).opacity(0.10)))
                .overlay(RoundedRectangle(cornerRadius: 20, style: .continuous).strokeBorder(Theme.levelColor(overall).opacity(complete ? 0.4 : 0.22), lineWidth: 1.5))
            }
        }
    }

    private func inputRow(_ c: CatInput) -> some View {
        let lvl = levelNumber(for: c)
        return HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                Text(c.title).font(.system(size: 15, weight: .bold)).foregroundStyle(Theme.text)
                Text(c.movement).font(.system(size: 12)).foregroundStyle(Theme.textFaint)
            }
            Spacer()
            if let lvl, let lv = store.level(number: lvl) { LevelPill(name: lv.shortName, number: lvl) }
            TextField(placeholder(c.benchmark), text: Binding(get: { inputs[c.id] ?? "" }, set: { inputs[c.id] = $0 }))
                .keyboardType(c.benchmark.testType == "time" ? .numbersAndPunctuation : .numberPad)
                .multilineTextAlignment(.trailing).frame(width: 86)
                .padding(.horizontal, 12).padding(.vertical, 9)
                .background(Theme.surface2, in: RoundedRectangle(cornerRadius: 10)).foregroundStyle(Theme.text)
        }
        .padding(14)
        .background(Theme.surface, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).strokeBorder(lvl != nil ? Theme.levelColor(lvl!).opacity(0.35) : Theme.stroke, lineWidth: 1))
    }

    private func placeholder(_ b: Benchmark) -> String {
        switch b.testType { case "time": return "m:ss"; case "1rm": return "kg"; default: return b.unit == "reps" ? "reps" : b.unit }
    }

    // MARK: scoring
    private func parse(_ s: String, _ testType: String) -> Double? {
        let t = s.trimmingCharacters(in: .whitespaces); if t.isEmpty { return nil }
        if testType == "time" {
            let parts = t.split(separator: ":")
            if parts.count == 2, let m = Int(parts[0]), let sec = Int(parts[1]) { return Double(m*60+sec) }
        }
        return Double(t)
    }

    private func levelNumber(for c: CatInput) -> Int? {
        guard let value = parse(inputs[c.id] ?? "", c.benchmark.testType) else { return nil }
        let b = c.benchmark
        for number in stride(from: 7, through: 1, by: -1) {
            let id = Levels.order[number-1]
            guard let std = b.standards[id]?[gender.rawValue] else { continue }
            var threshold = std.threshold
            if useBW, b.testType == "1rm", let bw, let bwm = b.bwMultiplier?[id]?[gender.rawValue] {
                threshold = (bwm * bw * 2).rounded() / 2
            }
            if b.higherIsBetter {
                let adj = ageMult == 1 ? threshold : max(b.unit == "reps" ? 1 : 0, (threshold * ageMult).rounded())
                if value >= adj { return number }
            } else {
                let adj = ageMult == 1 ? threshold : (threshold / ageMult).rounded()
                if value <= adj { return number }
            }
        }
        return 1 // at/above the floor counts as Beginner once a value is entered
    }
}
