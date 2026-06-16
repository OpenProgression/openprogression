import SwiftUI

struct ProgramView: View {
    @Environment(DataStore.self) private var store
    @State private var selected = Date()

    private var cal: Calendar {
        var c = Calendar(identifier: .gregorian)
        c.timeZone = TimeZone(identifier: "UTC")!
        c.firstWeekday = 2 // Monday
        return c
    }

    private var weekDates: [Date] {
        let comps = cal.dateComponents([.yearForWeekOfYear, .weekOfYear], from: selected)
        guard let monday = cal.date(from: comps) else { return [] }
        return (0..<7).compactMap { cal.date(byAdding: .day, value: $0, to: monday) }
    }

    private func iso(_ d: Date) -> String {
        let f = DateFormatter(); f.dateFormat = "yyyy-MM-dd"; f.timeZone = TimeZone(identifier: "UTC"); return f.string(from: d)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                header
                weekStrip
                if let s = store.session(for: selected) {
                    SessionDetailView(session: s)
                        .transition(.opacity)
                        .id(s.date)
                }
                Spacer(minLength: 24)
            }
            .padding(.horizontal, 18).padding(.top, 8)
        }
        .background(Theme.bg.ignoresSafeArea())
        .simultaneousGesture(
            DragGesture(minimumDistance: 24).onEnded { v in
                guard abs(v.translation.width) > 60, abs(v.translation.width) > abs(v.translation.height) * 1.4 else { return }
                Haptics.select()
                withAnimation(.snappy) { shift(v.translation.width < 0 ? 1 : -1) }
            }
        )
    }

    private var header: some View {
        let monthF = DateFormatter(); monthF.dateFormat = "MMMM yyyy"; monthF.timeZone = TimeZone(identifier: "UTC")
        return VStack(alignment: .leading, spacing: 4) {
            SectionLabel(text: "Programming")
            HStack {
                Text(monthF.string(from: selected)).font(.display(26)).foregroundStyle(Theme.text)
                Spacer()
                HStack(spacing: 14) {
                    navButton("chevron.left") { shift(-7) }
                    navButton("chevron.right") { shift(7) }
                }
            }
        }
    }

    private func navButton(_ icon: String, _ act: @escaping () -> Void) -> some View {
        Button { Haptics.tap(); withAnimation(.snappy) { act() } } label: {
            Image(systemName: icon).font(.system(size: 15, weight: .bold)).foregroundStyle(Theme.text)
                .frame(width: 38, height: 38).background(Theme.surface, in: Circle()).overlay(Circle().strokeBorder(Theme.stroke))
        }.buttonStyle(.plain)
    }

    private func shift(_ days: Int) {
        if let d = cal.date(byAdding: .day, value: days, to: selected) { selected = d }
    }

    private var weekStrip: some View {
        HStack(spacing: 6) {
            ForEach(weekDates, id: \.self) { d in
                let key = iso(d)
                let sess = store.sessions.first { $0.date == key }
                let isSel = key == iso(selected)
                Button { Haptics.select(); withAnimation(.snappy) { selected = d } } label: {
                    VStack(spacing: 5) {
                        Text(shortWeekday(d)).font(.system(size: 10, weight: .bold)).foregroundStyle(Theme.textFaint)
                        Text(dayNum(d)).font(.display(16, .bold)).foregroundStyle(isSel ? Color.black : Theme.text)
                        Circle().fill(phaseColor(sess)).frame(width: 5, height: 5).opacity(sess == nil ? 0 : 1)
                    }
                    .frame(maxWidth: .infinity).padding(.vertical, 9)
                    .background(isSel ? Theme.primary : Theme.surface, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                    .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(Theme.stroke, lineWidth: isSel ? 0 : 1))
                }.buttonStyle(.plain)
            }
        }
    }

    private func phaseColor(_ s: Session?) -> Color {
        guard let s else { return Theme.textFaint }
        if s.deload == true { return Color(hex: "#EAB308") }
        switch s.phase {
        case "Volume": return Theme.primary
        case "Strength": return Color(hex: "#22C55E")
        case "Peak": return Color(hex: "#F97316")
        case "Test": return Color(hex: "#EF4444")
        default: return Theme.textDim
        }
    }
    private func shortWeekday(_ d: Date) -> String { let f = DateFormatter(); f.dateFormat = "EEEEE"; f.timeZone = TimeZone(identifier: "UTC"); return f.string(from: d) }
    private func dayNum(_ d: Date) -> String { let f = DateFormatter(); f.dateFormat = "d"; f.timeZone = TimeZone(identifier: "UTC"); return f.string(from: d) }
}
