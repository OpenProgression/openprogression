import SwiftUI
import SwiftData

struct WorkoutRunnerView: View {
    @Environment(\.modelContext) private var ctx
    @Environment(\.dismiss) private var dismiss
    let metcon: Metcon
    let level: Int
    let gender: Gender

    private enum Phase { case ready, running, paused, done }
    @State private var phase: Phase = .ready
    @State private var elapsed = 0          // seconds
    @State private var rounds = 0
    @State private var finalResult = ""
    @State private var saved: LogEntry?
    @State private var showShare = false

    private let tick = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    private var isAMRAP: Bool { metcon.type == "amrap" }
    private var cap: Int { metcon.timeCap * 60 }
    private var display: Int { isAMRAP ? max(0, cap - elapsed) : elapsed }

    var body: some View {
        ZStack {
            Theme.bg.ignoresSafeArea()
            VStack(spacing: 0) {
                header
                Spacer()
                timer
                if isAMRAP && phase != .done { roundCounter }
                Spacer()
                if phase == .done { finishedSummary } else { controls }
            }
            .padding(20)
        }
        .onReceive(tick) { _ in
            guard phase == .running else { return }
            elapsed += 1
            if isAMRAP && elapsed >= cap { finish() }
        }
        .sheet(isPresented: $showShare) {
            if let s = saved {
                ShareResultView(card: ResultCard(name: metcon.name, result: s.result, subtitle: subtitle, levelNumber: level))
                    .presentationDragIndicator(.visible)
            }
        }
    }

    private var header: some View {
        HStack {
            Button { dismiss() } label: { Image(systemName: "xmark").font(.system(size: 16, weight: .bold)).foregroundStyle(Theme.textDim).frame(width: 38, height: 38).background(Theme.surface, in: Circle()) }.buttonStyle(.pressable)
            Spacer()
            VStack(spacing: 2) {
                Text(metcon.name).font(.display(17, .bold)).foregroundStyle(Theme.text)
                Text("\(typeLabel(metcon.type)) · Cap \(metcon.timeCap)′").font(.body(12, .semibold)).foregroundStyle(Theme.textFaint)
            }
            Spacer()
            Color.clear.frame(width: 38, height: 38)
        }
    }

    private var timer: some View {
        VStack(spacing: 6) {
            Text(isAMRAP && phase != .done ? "TIME REMAINING" : "ELAPSED")
                .font(.body(12, .bold)).tracking(1.5).foregroundStyle(Theme.textFaint)
            Text(fmt(display))
                .font(.system(size: 88, weight: .black, design: .rounded)).monospacedDigit()
                .foregroundStyle(phase == .running ? Theme.primary : Theme.text)
                .contentTransition(.numericText())
            // movement reminder
            VStack(spacing: 4) {
                ForEach(Array((metcon.movements ?? []).enumerated()), id: \.offset) { _, mv in
                    let r = mv.resolved(levelNumber: level, gender: gender)
                    Text("\(repsText(r.reps, unit: r.unit))  \(r.name)\(r.load.map { " · \(Int($0)) kg" } ?? "")")
                        .font(.body(14, .medium)).foregroundStyle(Theme.textDim)
                }
            }.padding(.top, 14)
        }
    }

    private var roundCounter: some View {
        VStack(spacing: 10) {
            Text("ROUNDS").font(.body(12, .bold)).tracking(1.5).foregroundStyle(Theme.textFaint)
            HStack(spacing: 24) {
                Button { if rounds > 0 { rounds -= 1; Haptics.tap() } } label: { stepIcon("minus") }.buttonStyle(.pressable)
                Text("\(rounds)").font(.system(size: 48, weight: .black, design: .rounded)).foregroundStyle(Theme.text).frame(minWidth: 70)
                Button { rounds += 1; Haptics.select() } label: { stepIcon("plus") }.buttonStyle(.pressable)
            }
        }.padding(.top, 24)
    }
    private func stepIcon(_ n: String) -> some View {
        Image(systemName: n).font(.system(size: 20, weight: .bold)).foregroundStyle(Theme.text).frame(width: 54, height: 54).background(Theme.surface, in: Circle()).overlay(Circle().strokeBorder(Theme.stroke))
    }

    private var controls: some View {
        HStack(spacing: 12) {
            if phase == .ready {
                bigButton("Start", "play.fill", Theme.primary) { phase = .running; Haptics.success() }
            } else if phase == .running {
                bigButton("Pause", "pause.fill", Theme.surface2, fg: Theme.text) { phase = .paused; Haptics.tap() }
                bigButton("Finish", "flag.checkered", Theme.primary) { finish() }
            } else if phase == .paused {
                bigButton("Resume", "play.fill", Theme.primary) { phase = .running; Haptics.tap() }
                bigButton("Finish", "flag.checkered", Theme.surface2, fg: Theme.text) { finish() }
            }
        }
    }

    private var finishedSummary: some View {
        VStack(spacing: 14) {
            VStack(spacing: 4) {
                Text("RESULT").font(.body(12, .bold)).tracking(1.5).foregroundStyle(Theme.textFaint)
                Text(finalResult).font(.display(34)).foregroundStyle(Theme.primary)
                Text("Saved to your log").font(.body(13)).foregroundStyle(Theme.textDim)
            }
            HStack(spacing: 12) {
                bigButton("Share", "square.and.arrow.up", Theme.surface2, fg: Theme.text) { showShare = true }
                bigButton("Done", "checkmark", Theme.primary) { dismiss() }
            }
        }
    }

    private func bigButton(_ title: String, _ icon: String, _ bg: Color, fg: Color = .black, _ act: @escaping () -> Void) -> some View {
        Button(action: act) {
            Label(title, systemImage: icon).font(.body(16, .bold)).foregroundStyle(fg)
                .frame(maxWidth: .infinity).padding(.vertical, 16)
                .background(bg, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        }.buttonStyle(.pressable)
    }

    private func finish() {
        phase = .done
        Haptics.success()
        finalResult = isAMRAP ? "\(rounds) rounds" : fmt(elapsed)
        let entry = LogEntry(type: "Metcon", name: metcon.name, code: metcon.code, level: level,
                             gender: gender.rawValue, result: finalResult, notes: nil)
        ctx.insert(entry)
        saved = entry
    }

    private var subtitle: String { "\(typeLabel(metcon.type)) · \(levelShort[max(1,min(7,level))-1])" }
    private func fmt(_ s: Int) -> String { String(format: "%d:%02d", s/60, s%60) }
}
