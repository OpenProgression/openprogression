import SwiftUI

struct GymTimerView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var t = GymTimerEngine()
    @State private var soundOn = true

    private var color: Color {
        switch t.kind {
        case .countdown: return Color(hex: "#EAB308")
        case .work: return Theme.primary
        case .rest: return Color(hex: "#F97316")
        case .done: return Color(hex: "#22C55E")
        }
    }

    var body: some View {
        ZStack {
            (t.state == .idle ? Theme.bg : color.opacity(0.06)).ignoresSafeArea()
                .animation(.easeInOut(duration: 0.4), value: t.kind)
            VStack(spacing: 0) {
                topBar
                if t.state == .idle { config } else { clock }
            }.padding(20)
        }
    }

    private var topBar: some View {
        HStack {
            Button { dismiss() } label: { Image(systemName: "xmark").font(.system(size: 16, weight: .bold)).foregroundStyle(Theme.textDim).frame(width: 38, height: 38).background(Theme.surface, in: Circle()) }.buttonStyle(.pressable)
            Spacer()
            Text(t.mode.rawValue.uppercased()).font(.body(13, .bold)).tracking(2).foregroundStyle(Theme.textFaint)
            Spacer()
            Button { soundOn.toggle(); Beeper.shared.enabled = soundOn; Haptics.tap() } label: {
                Image(systemName: soundOn ? "speaker.wave.2.fill" : "speaker.slash.fill").font(.system(size: 15, weight: .semibold)).foregroundStyle(soundOn ? Theme.primary : Theme.textFaint).frame(width: 38, height: 38).background(Theme.surface, in: Circle())
            }.buttonStyle(.pressable)
        }
    }

    // MARK: - Clock
    private var clock: some View {
        VStack(spacing: 0) {
            Spacer()
            Text(t.label).font(.body(15, .bold)).tracking(3).foregroundStyle(color)
                .contentTransition(.opacity).animation(.easeInOut, value: t.label)
            ZStack {
                Circle().stroke(Theme.surface2, lineWidth: 12)
                Circle().trim(from: 0, to: t.segProgress)
                    .stroke(color, style: StrokeStyle(lineWidth: 12, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                    .animation(.linear(duration: 0.1), value: t.segProgress)
                Text(fmt(t.big))
                    .font(.system(size: 92, weight: .black, design: .rounded)).monospacedDigit()
                    .foregroundStyle(color)
                    .contentTransition(.numericText(countsDown: !t.isCountUp))
                    .animation(.snappy, value: t.big)
            }
            .frame(width: 300, height: 300).padding(.vertical, 24)
            .scaleEffect(pulse ? 1.04 : 1.0)
            .animation(.easeInOut(duration: 0.45).repeatForever(autoreverses: true), value: pulse)
            if let r = t.roundsLabel {
                Text("ROUND \(r)").font(.display(18, .bold)).foregroundStyle(Theme.text)
                if t.totalRounds <= 12 { roundDots }
            }
            Spacer()
            controls
        }
    }

    private var pulse: Bool { t.kind == .countdown && t.big <= 3 && t.state == .active }

    private var roundDots: some View {
        HStack(spacing: 6) {
            ForEach(0..<t.totalRounds, id: \.self) { i in
                Circle().fill(i < t.round ? color : Theme.surface2).frame(width: 7, height: 7)
            }
        }.padding(.top, 8)
    }

    private var controls: some View {
        HStack(spacing: 12) {
            switch t.state {
            case .active:
                bigBtn("Pause", "pause.fill", Theme.surface2, Theme.text) { t.pause() }
                if t.mode == .forTime && !t.capOn { bigBtn("Finish", "flag.checkered", color, .black) { t.stop() } }
                else { bigBtn("Reset", "arrow.counterclockwise", Theme.surface2, Theme.text) { t.reset() } }
            case .paused:
                bigBtn("Resume", "play.fill", color, .black) { t.resume() }
                bigBtn("Reset", "arrow.counterclockwise", Theme.surface2, Theme.text) { t.reset() }
            case .done:
                bigBtn("Again", "arrow.counterclockwise", Theme.surface2, Theme.text) { t.reset() }
                bigBtn("Done", "checkmark", color, .black) { dismiss() }
            case .idle:
                EmptyView()
            }
        }
    }

    // MARK: - Config
    private var config: some View {
        ScrollView {
            VStack(spacing: 16) {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 96), spacing: 8)], spacing: 8) {
                    ForEach(GymTimerEngine.Mode.allCases, id: \.self) { m in
                        Button { Haptics.select(); withAnimation(.snappy) { t.mode = m } } label: {
                            Text(m.rawValue).font(.body(14, .semibold)).foregroundStyle(t.mode == m ? .black : Theme.text)
                                .frame(maxWidth: .infinity).padding(.vertical, 11)
                                .background(t.mode == m ? Theme.primary : Theme.surface, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                                .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(Theme.stroke, lineWidth: t.mode == m ? 0 : 1))
                        }.buttonStyle(.pressable)
                    }
                }
                VStack(spacing: 10) { settings }.card()
                Spacer(minLength: 8)
                Button { Haptics.success(); t.start() } label: {
                    Label("Start", systemImage: "play.fill").font(.body(17, .bold)).foregroundStyle(.black)
                        .frame(maxWidth: .infinity).padding(.vertical, 17)
                        .background(Theme.primary, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                }.buttonStyle(.pressable)
            }.padding(.top, 20)
        }
    }

    @ViewBuilder private var settings: some View {
        switch t.mode {
        case .amrap: step("Duration", $t.amrapMinutes, 1...60, 1, "min")
        case .forTime:
            HStack { Text("Time cap").font(.body(15, .medium)).foregroundStyle(Theme.text); Spacer(); Toggle("", isOn: $t.capOn).labelsHidden().tint(Theme.primary) }
            if t.capOn { step("Cap", $t.capMinutes, 1...60, 1, "min") }
        case .emom:
            step("Rounds", $t.emomRounds, 1...60, 1, "")
            step("Every", $t.emomInterval, 20...300, 5, "sec")
        case .intervals:
            step("Rounds", $t.intRounds, 1...30, 1, "")
            step("Work", $t.intWork, 5...300, 5, "sec")
            step("Rest", $t.intRest, 5...300, 5, "sec")
        case .tabata:
            Text("8 rounds · 20s work / 10s rest").font(.body(15, .medium)).foregroundStyle(Theme.textDim).frame(maxWidth: .infinity, alignment: .leading)
        }
        step("Countdown", $t.countdownLead, 0...30, 1, "sec")
    }

    private func step(_ title: String, _ value: Binding<Int>, _ range: ClosedRange<Int>, _ by: Int, _ unit: String) -> some View {
        HStack {
            Text(title).font(.body(15, .medium)).foregroundStyle(Theme.text)
            Spacer()
            Button { if value.wrappedValue - by >= range.lowerBound { value.wrappedValue -= by; Haptics.tap() } } label: { stepIcon("minus") }.buttonStyle(.pressable)
            Text("\(value.wrappedValue)\(unit.isEmpty ? "" : " \(unit)")").font(.display(16, .bold)).foregroundStyle(Theme.text).frame(minWidth: 64)
            Button { if value.wrappedValue + by <= range.upperBound { value.wrappedValue += by; Haptics.tap() } } label: { stepIcon("plus") }.buttonStyle(.pressable)
        }
    }
    private func stepIcon(_ n: String) -> some View {
        Image(systemName: n).font(.system(size: 15, weight: .bold)).foregroundStyle(Theme.text).frame(width: 38, height: 38).background(Theme.surface2, in: Circle()).overlay(Circle().strokeBorder(Theme.stroke))
    }

    private func bigBtn(_ title: String, _ icon: String, _ bg: Color, _ fg: Color, _ act: @escaping () -> Void) -> some View {
        Button { act() } label: {
            Label(title, systemImage: icon).font(.body(16, .bold)).foregroundStyle(fg)
                .frame(maxWidth: .infinity).padding(.vertical, 16)
                .background(bg, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        }.buttonStyle(.pressable)
    }

    private func fmt(_ s: Int) -> String { String(format: "%d:%02d", s / 60, s % 60) }
}
