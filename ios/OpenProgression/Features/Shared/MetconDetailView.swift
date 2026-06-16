import SwiftUI

struct MetconDetailView: View {
    @Environment(DataStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    let metcon: Metcon
    @Binding var level: Int
    @Binding var gender: Gender

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                VStack(alignment: .leading, spacing: 10) {
                    Text(metcon.code).font(.body(11, .semibold)).foregroundStyle(Theme.textFaint)
                    Text(metcon.name).font(.display(30)).foregroundStyle(Theme.text)
                    HStack(spacing: 8) {
                        Chip(text: typeLabel(metcon.type), color: Theme.primary)
                        Chip(text: "Cap \(metcon.timeCap)′", color: Theme.textDim)
                        if let r = metcon.rounds { Chip(text: "\(r) rounds", color: Theme.textDim) }
                        if let t = metcon.team { Chip(text: "Team · \(t.format.uppercased())", color: Color(hex: "#F97316")) }
                    }
                }
                if let t = metcon.team {
                    InfoBlock(label: "Partner Format", text: t.description, accent: Color(hex: "#F97316"))
                }
                // Level selector
                VStack(alignment: .leading, spacing: 8) {
                    SectionLabel(text: "Scaling Level")
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
                // Movements at selected level
                VStack(spacing: 0) {
                    ForEach(Array((metcon.movements ?? []).enumerated()), id: \.offset) { _, mv in
                        MovementRow(mv: mv, level: level, gender: gender)
                    }
                }.background(Theme.surface, in: RoundedRectangle(cornerRadius: 16, style: .continuous))

                // Full scaling table per movement
                ForEach(Array((metcon.movements ?? []).enumerated()), id: \.offset) { _, mv in
                    scalingTable(mv)
                }

                if let s = metcon.stimulus {
                    InfoBlock(label: "Stimulus", text: "\(s.feel)\n\n\(s.intent)", accent: Theme.primary)
                }
                if let c = metcon.coachNotes { InfoBlock(label: "Coach Notes", text: c, accent: Theme.textDim) }
                if let g = metcon.goal {
                    VStack(alignment: .leading, spacing: 8) {
                        SectionLabel(text: "Goal")
                        Label(g.target, systemImage: "target").font(.body(15, .semibold)).foregroundStyle(Theme.text)
                        Text(g.scaleDown).font(.body(13)).foregroundStyle(Theme.textDim).fixedSize(horizontal: false, vertical: true)
                    }.frame(maxWidth: .infinity, alignment: .leading).card()
                }
                Spacer(minLength: 12)
            }
            .padding(20)
        }
        .background(Theme.bg.ignoresSafeArea())
    }

    private func scalingTable(_ mv: MetconMovement) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            SectionLabel(text: mv.movement)
            ForEach(store.levels.reversed()) { lv in
                let r = mv.resolved(levelNumber: lv.number, gender: gender)
                HStack(spacing: 10) {
                    Text(lv.shortName).font(.system(size: 11, weight: .bold)).foregroundStyle(Theme.levelColor(lv.number)).frame(width: 42, alignment: .leading)
                    Text(repsText(r.reps, unit: r.unit)).font(.body(13, .semibold)).foregroundStyle(Theme.text).frame(width: 56, alignment: .leading)
                    Text(r.name == mv.movement ? "" : r.name).font(.body(12)).foregroundStyle(Theme.textDim)
                    Spacer()
                    if let l = r.load, l > 0 { Text("\(Int(l)) kg").font(.body(12, .semibold)).foregroundStyle(Theme.textDim) }
                }
                .padding(.vertical, 5).padding(.horizontal, 12)
                .background(lv.number == level ? Theme.levelColor(lv.number).opacity(0.10) : Color.clear, in: RoundedRectangle(cornerRadius: 8))
            }
        }.frame(maxWidth: .infinity, alignment: .leading).card(padding: 14)
    }
}

struct InfoBlock: View {
    let label: String; let text: String; let accent: Color
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            SectionLabel(text: label, color: accent)
            Text(text).font(.body(14)).foregroundStyle(Theme.text).fixedSize(horizontal: false, vertical: true)
        }.frame(maxWidth: .infinity, alignment: .leading).card()
    }
}
