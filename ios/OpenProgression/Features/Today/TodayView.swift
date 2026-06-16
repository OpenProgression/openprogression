import SwiftUI

struct TodayView: View {
    @Environment(DataStore.self) private var store
    @State private var level: Int = 3
    @State private var gender: Gender = .male
    // Demo "today": the app runs against the baked-in calendar; clamps into range.
    private let today = Date()

    private var session: Session? { store.session(for: today) }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                header
                if let s = session {
                    hero(s)
                    selectors
                    if let w = s.warmup { BlockCard(label: "Warm-up", minutes: w.durationMinutes, content: w.notes, accent: Theme.primary) }
                    if let st = s.strength { strengthCard(st) }
                    if let mc = store.metcon(s.metcon) { MetconCard(metcon: mc, level: level, gender: gender) }
                    if let a = s.accessory { BlockCard(label: "Accessory", minutes: a.durationMinutes, content: a.notes, accent: Theme.textDim) }
                } else {
                    Text("No session found.").foregroundStyle(Theme.textDim).padding(.top, 40)
                }
                Spacer(minLength: 24)
            }
            .padding(.horizontal, 18)
            .padding(.top, 8)
        }
        .background(Theme.bg.ignoresSafeArea())
    }

    private var header: some View {
        HStack {
            VStack(alignment: .leading, spacing: 6) {
                Wordmark(size: 19)
                LevelDots()
            }
            Spacer()
            if let s = session {
                Text(prettyDate(s.date)).font(.system(size: 13, weight: .medium)).foregroundStyle(Theme.textDim)
            }
        }
        .padding(.top, 6)
    }

    private func hero(_ s: Session) -> some View {
        let focus = s.title.components(separatedBy: " - ").last ?? s.title
        let day = s.title.components(separatedBy: " - ").first ?? ""
        // Headline is the actual workout name; the day + focus becomes the eyebrow.
        let headline = store.metcon(s.metcon)?.name ?? focus
        return VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                if let phase = s.phase { Chip(text: phase, color: Theme.primary) }
                if s.deload == true { Chip(text: "Deload", color: Color(hex: "#EAB308")) }
                if s.title.contains("Teams of 2") { Chip(text: "Teams of 2", color: Color(hex: "#F97316")) }
                if s.title.contains("Benchmark") { Chip(text: "Benchmark", color: Color(hex: "#22C55E"), filled: true) }
            }
            Text("\(day.uppercased()) · \(focus.uppercased())").font(.system(size: 12, weight: .bold)).tracking(1.3).foregroundStyle(Theme.textFaint)
            Text(headline).font(.display(30)).foregroundStyle(Theme.text).fixedSize(horizontal: false, vertical: true)
            HStack(spacing: 18) {
                Label("\(s.estimatedMinutes) min", systemImage: "clock").font(.system(size: 14, weight: .semibold)).foregroundStyle(Theme.textDim)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(Theme.surface)
                .overlay(alignment: .top) { Theme.levelGradient.frame(height: 3).clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous)) }
        )
        .overlay(RoundedRectangle(cornerRadius: 24, style: .continuous).strokeBorder(Theme.stroke, lineWidth: 1))
    }

    private var selectors: some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionLabel(text: "Your Level")
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(store.levels) { lv in
                        Button { withAnimation(.snappy) { level = lv.number } } label: {
                            LevelPill(name: lv.shortName, number: lv.number, selected: level == lv.number)
                        }.buttonStyle(.plain)
                    }
                }
            }
            Picker("", selection: $gender) {
                Text("Male").tag(Gender.male); Text("Female").tag(Gender.female)
            }.pickerStyle(.segmented).padding(.top, 2)
        }
    }

    private func strengthCard(_ st: StrengthBlock) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack { SectionLabel(text: "Strength / Skill"); Spacer(); Text("\(st.durationMinutes) min").font(.system(size: 12, weight: .semibold)).foregroundStyle(Theme.textFaint) }
            ForEach(st.movements) { mv in
                VStack(alignment: .leading, spacing: 3) {
                    HStack(alignment: .firstTextBaseline) {
                        Text(mv.movement).font(.system(size: 16, weight: .bold)).foregroundStyle(Theme.text)
                        if let s = mv.scheme { Text(s).font(.system(size: 13, weight: .medium)).foregroundStyle(Theme.primary) }
                    }
                    if let p = mv.prescription { Text(p).font(.system(size: 13)).foregroundStyle(Theme.textDim) }
                    if let n = mv.notes { Text(n).font(.system(size: 12)).foregroundStyle(Theme.textFaint) }
                }
            }
        }.frame(maxWidth: .infinity, alignment: .leading).card()
    }

    private func prettyDate(_ iso: String) -> String {
        let inF = DateFormatter(); inF.dateFormat = "yyyy-MM-dd"; inF.timeZone = TimeZone(identifier: "UTC")
        let outF = DateFormatter(); outF.dateFormat = "EEE, MMM d"
        guard let d = inF.date(from: iso) else { return iso }
        return outF.string(from: d)
    }
}

// MARK: - Generic block (warm-up / accessory)
struct BlockCard: View {
    let label: String; let minutes: Int; let content: String; let accent: Color
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack { SectionLabel(text: label, color: accent); Spacer(); Text("\(minutes) min").font(.system(size: 12, weight: .semibold)).foregroundStyle(Theme.textFaint) }
            Text(content).font(.system(size: 14)).foregroundStyle(Theme.text).fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading).card()
    }
}

// MARK: - Metcon card
struct MetconCard: View {
    let metcon: Metcon
    let level: Int
    let gender: Gender

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 8) {
                SectionLabel(text: "Metcon", color: Theme.primary)
                Spacer()
                Text(metcon.code).font(.system(size: 11, weight: .semibold)).foregroundStyle(Theme.textFaint)
            }
            Text(metcon.name).font(.display(24)).foregroundStyle(Theme.text)
            HStack(spacing: 8) {
                Chip(text: typeLabel, color: Theme.primary)
                Chip(text: "Cap \(metcon.timeCap)′", color: Theme.textDim)
                if let r = metcon.rounds { Chip(text: "\(r) rounds", color: Theme.textDim) }
                if let t = metcon.team { Chip(text: "Team · \(t.format.uppercased())", color: Color(hex: "#F97316")) }
            }
            // movements at the selected level
            VStack(spacing: 0) {
                ForEach(Array((metcon.movements ?? []).enumerated()), id: \.offset) { _, mv in
                    movementRow(mv)
                }
            }
            .padding(.vertical, 4)
            .background(Theme.surface2, in: RoundedRectangle(cornerRadius: 14, style: .continuous))

            if let s = metcon.stimulus {
                Text(s.feel).font(.system(size: 13)).foregroundStyle(Theme.textDim).fixedSize(horizontal: false, vertical: true)
            }
            if let g = metcon.goal {
                HStack(spacing: 8) {
                    Image(systemName: "target").font(.system(size: 12, weight: .bold)).foregroundStyle(Theme.primary)
                    Text(g.target).font(.system(size: 13, weight: .semibold)).foregroundStyle(Theme.text)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(RoundedRectangle(cornerRadius: 22, style: .continuous).fill(Theme.surface))
        .overlay(RoundedRectangle(cornerRadius: 22, style: .continuous).strokeBorder(Theme.levelColor(level).opacity(0.35), lineWidth: 1.5))
    }

    private var typeLabel: String {
        switch metcon.type { case "for_time": return "For Time"; case "amrap": return "AMRAP"; case "emom": return "EMOM"; default: return metcon.type }
    }

    private func movementRow(_ mv: MetconMovement) -> some View {
        let r = mv.resolved(levelNumber: level, gender: gender)
        return HStack(alignment: .firstTextBaseline, spacing: 12) {
            Text(repsText(r.reps, unit: r.unit)).font(.system(size: 16, weight: .heavy, design: .rounded)).foregroundStyle(Theme.primary).frame(width: 58, alignment: .leading)
            Text(r.name).font(.system(size: 15, weight: .medium)).foregroundStyle(Theme.text)
            Spacer()
            if let l = r.load, l > 0 { Text("\(Int(l)) kg").font(.system(size: 14, weight: .semibold)).foregroundStyle(Theme.textDim) }
        }
        .padding(.horizontal, 14).padding(.vertical, 11)
        .overlay(alignment: .bottom) { Rectangle().fill(Theme.stroke).frame(height: 1).padding(.horizontal, 14) }
    }

    private func repsText(_ reps: Int?, unit: String?) -> String {
        guard let reps else { return "" }
        switch unit { case "m": return "\(reps)m"; case "cal": return "\(reps) cal"; default: return "\(reps)" }
    }
}
