import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

enum Haptics {
    static func tap() {
        #if canImport(UIKit)
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
        #endif
    }
    static func select() {
        #if canImport(UIKit)
        UISelectionFeedbackGenerator().selectionChanged()
        #endif
    }
}

/// Renders a full session (warm-up, strength, metcon, accessory) with a level + gender selector.
struct SessionDetailView: View {
    @Environment(DataStore.self) private var store
    let session: Session
    @AppStorage("op.level") private var level: Int = 3
    @AppStorage("op.gender") private var gender: Gender = .male
    @State private var shownMetcon: Metcon?

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            hero
            selectors
            if let w = session.warmup { BlockCard(label: "Warm-up", minutes: w.durationMinutes, content: w.notes, accent: Theme.primary) }
            if let st = session.strength { strengthCard(st) }
            if let mc = store.metcon(session.metcon) {
                Button { Haptics.tap(); shownMetcon = mc } label: { MetconCard(metcon: mc, level: level, gender: gender) }
                    .buttonStyle(.plain)
            }
            if let a = session.accessory { BlockCard(label: "Accessory", minutes: a.durationMinutes, content: a.notes, accent: Theme.textDim) }
        }
        .sheet(item: $shownMetcon) { mc in
            MetconDetailView(metcon: mc, level: $level, gender: $gender).presentationDragIndicator(.visible)
        }
    }

    private var hero: some View {
        let focus = session.title.components(separatedBy: " - ").last ?? session.title
        let day = session.title.components(separatedBy: " - ").first ?? ""
        let headline = store.metcon(session.metcon)?.name ?? focus
        return VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                if let phase = session.phase { Chip(text: phase, color: Theme.primary) }
                if session.deload == true { Chip(text: "Deload", color: Color(hex: "#EAB308")) }
                if session.title.contains("Teams of 2") { Chip(text: "Teams of 2", color: Color(hex: "#F97316")) }
                if session.title.contains("Benchmark") { Chip(text: "Benchmark", color: Color(hex: "#22C55E"), filled: true) }
            }
            Text("\(day.uppercased()) · \(focus.uppercased())").font(.body(12, .bold)).tracking(1.3).foregroundStyle(Theme.textFaint)
            Text(headline).font(.display(30)).foregroundStyle(Theme.text).fixedSize(horizontal: false, vertical: true)
            Label("\(session.estimatedMinutes) min", systemImage: "clock").font(.body(14, .semibold)).foregroundStyle(Theme.textDim)
        }
        .frame(maxWidth: .infinity, alignment: .leading).padding(20)
        .background(RoundedRectangle(cornerRadius: 24, style: .continuous).fill(Theme.surface)
            .overlay(alignment: .top) { Theme.levelGradient.frame(height: 3).clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous)) })
        .overlay(RoundedRectangle(cornerRadius: 24, style: .continuous).strokeBorder(Theme.stroke, lineWidth: 1))
    }

    private var selectors: some View {
        VStack(alignment: .leading, spacing: 10) {
            SectionLabel(text: "Your Level")
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(store.levels) { lv in
                        Button { Haptics.select(); withAnimation(.snappy) { level = lv.number } } label: {
                            LevelPill(name: lv.shortName, number: lv.number, selected: level == lv.number)
                        }.buttonStyle(.plain)
                    }
                }
            }
            Picker("", selection: $gender) { Text("Male").tag(Gender.male); Text("Female").tag(Gender.female) }.pickerStyle(.segmented)
        }
    }

    private func strengthCard(_ st: StrengthBlock) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack { SectionLabel(text: "Strength / Skill"); Spacer(); Text("\(st.durationMinutes) min").font(.body(12, .semibold)).foregroundStyle(Theme.textFaint) }
            ForEach(st.movements) { mv in
                VStack(alignment: .leading, spacing: 3) {
                    HStack(alignment: .firstTextBaseline) {
                        Text(mv.movement).font(.display(16, .bold)).foregroundStyle(Theme.text)
                        if let s = mv.scheme { Text(s).font(.body(13, .medium)).foregroundStyle(Theme.primary) }
                    }
                    if let p = mv.prescription { Text(p).font(.body(13)).foregroundStyle(Theme.textDim) }
                    if let n = mv.notes { Text(n).font(.body(12)).foregroundStyle(Theme.textFaint) }
                }
            }
        }.frame(maxWidth: .infinity, alignment: .leading).card()
    }
}

// MARK: - Generic block (warm-up / accessory)
struct BlockCard: View {
    let label: String; let minutes: Int; let content: String; let accent: Color
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack { SectionLabel(text: label, color: accent); Spacer(); Text("\(minutes) min").font(.body(12, .semibold)).foregroundStyle(Theme.textFaint) }
            Text(content).font(.body(14)).foregroundStyle(Theme.text).fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, alignment: .leading).card()
    }
}

// MARK: - Metcon summary card (tap to open detail)
struct MetconCard: View {
    let metcon: Metcon
    let level: Int
    let gender: Gender
    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 8) {
                SectionLabel(text: "Metcon", color: Theme.primary)
                Spacer()
                Text(metcon.code).font(.body(11, .semibold)).foregroundStyle(Theme.textFaint)
                Image(systemName: "chevron.right").font(.system(size: 11, weight: .bold)).foregroundStyle(Theme.textFaint)
            }
            Text(metcon.name).font(.display(24)).foregroundStyle(Theme.text)
            HStack(spacing: 8) {
                Chip(text: typeLabel(metcon.type), color: Theme.primary)
                Chip(text: "Cap \(metcon.timeCap)′", color: Theme.textDim)
                if let r = metcon.rounds { Chip(text: "\(r) rounds", color: Theme.textDim) }
                if let t = metcon.team { Chip(text: "Team · \(t.format.uppercased())", color: Color(hex: "#F97316")) }
            }
            VStack(spacing: 0) {
                ForEach(Array((metcon.movements ?? []).enumerated()), id: \.offset) { _, mv in
                    MovementRow(mv: mv, level: level, gender: gender)
                }
            }.padding(.vertical, 4).background(Theme.surface2, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
            if let g = metcon.goal {
                HStack(spacing: 8) {
                    Image(systemName: "target").font(.system(size: 12, weight: .bold)).foregroundStyle(Theme.primary)
                    Text(g.target).font(.body(13, .semibold)).foregroundStyle(Theme.text)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading).padding(20)
        .background(RoundedRectangle(cornerRadius: 22, style: .continuous).fill(Theme.surface))
        .overlay(RoundedRectangle(cornerRadius: 22, style: .continuous).strokeBorder(Theme.levelColor(level).opacity(0.35), lineWidth: 1.5))
    }
}

func typeLabel(_ t: String) -> String {
    switch t { case "for_time": return "For Time"; case "amrap": return "AMRAP"; case "emom": return "EMOM"; default: return t }
}

struct MovementRow: View {
    let mv: MetconMovement
    let level: Int
    let gender: Gender
    var body: some View {
        let r = mv.resolved(levelNumber: level, gender: gender)
        HStack(alignment: .firstTextBaseline, spacing: 12) {
            Text(repsText(r.reps, unit: r.unit)).font(.system(size: 16, weight: .heavy, design: .rounded)).foregroundStyle(Theme.primary).frame(width: 58, alignment: .leading)
            Text(r.name).font(.body(15, .medium)).foregroundStyle(Theme.text)
            Spacer()
            if let l = r.load, l > 0 { Text("\(Int(l)) kg").font(.body(14, .semibold)).foregroundStyle(Theme.textDim) }
        }
        .padding(.horizontal, 14).padding(.vertical, 11)
        .overlay(alignment: .bottom) { Rectangle().fill(Theme.stroke).frame(height: 1).padding(.horizontal, 14) }
    }
}

func repsText(_ reps: Int?, unit: String?) -> String {
    guard let reps else { return "" }
    switch unit { case "m": return "\(reps)m"; case "cal": return "\(reps) cal"; default: return "\(reps)" }
}
