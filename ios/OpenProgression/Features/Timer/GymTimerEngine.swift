import Foundation
import QuartzCore
import Observation

@Observable
final class GymTimerEngine {
    enum Mode: String, CaseIterable { case amrap = "AMRAP", forTime = "For Time", emom = "EMOM", intervals = "Intervals", tabata = "Tabata" }
    enum RunState { case idle, active, paused, done }
    enum Kind { case work, rest, countdown, done }

    // MARK: config
    var mode: Mode = .amrap
    var amrapMinutes = 12
    var capMinutes = 12
    var capOn = true
    var emomRounds = 10
    var emomInterval = 60      // seconds
    var intRounds = 5
    var intWork = 30
    var intRest = 30
    var countdownLead = 10

    // MARK: runtime (read by the view)
    private(set) var state: RunState = .idle
    private(set) var big = 0           // seconds shown on the clock
    private(set) var kind: Kind = .countdown
    private(set) var round = 0
    private(set) var totalRounds = 0
    private(set) var label = "GET READY"
    private(set) var segProgress = 0.0 // 0...1 of current segment
    private(set) var isCountUp = false

    private struct Seg { let kind: Kind; let dur: Double }
    private var segs: [Seg] = []
    private var active = 0.0
    private var lastTick: CFTimeInterval?
    private var timer: Timer?
    private var firedTicks = Set<Int>()
    private var goFired = false
    private var endFired = false
    private var lastSegIdx = -1

    var roundsLabel: String? { totalRounds > 0 ? "\(min(round, totalRounds)) / \(totalRounds)" : nil }

    // MARK: control
    func start() {
        build()
        state = .active; active = 0; lastTick = nil
        firedTicks.removeAll(); goFired = false; endFired = false; lastSegIdx = -1
        kind = .countdown; label = "GET READY"; big = countdownLead
        Beeper.shared.prepare()
        timer?.invalidate()
        let t = Timer(timeInterval: 0.03, repeats: true) { [weak self] _ in self?.tick() }
        RunLoop.main.add(t, forMode: .common); timer = t
    }
    func pause() { state = .paused; Haptics.tap() }
    func resume() { state = .active; lastTick = nil; Haptics.tap() }
    func stop() { // manual finish (for open-ended For Time)
        guard state == .active || state == .paused else { return }
        state = .done; kind = .done; label = "DONE"; timer?.invalidate()
        if !endFired { endFired = true; Beeper.shared.finish(); Haptics.success() }
    }
    func reset() {
        timer?.invalidate(); timer = nil
        state = .idle; active = 0; lastTick = nil; round = 0; segProgress = 0
        kind = .countdown; label = "GET READY"; big = countdownLead; isCountUp = false
    }

    // MARK: tick
    private func tick() {
        guard state == .active else { lastTick = nil; return }
        let now = CACurrentMediaTime()
        if let lt = lastTick { active += now - lt }
        lastTick = now
        process(active)
    }

    private func process(_ t: Double) {
        let lead = Double(countdownLead)
        if t < lead {
            kind = .countdown; isCountUp = false
            let remaining = lead - t
            big = Int(ceil(remaining)); label = "GET READY"; segProgress = t / lead
            let r = Int(ceil(remaining))
            if r <= 3, r >= 1, !firedTicks.contains(-r) { firedTicks.insert(-r); Beeper.shared.tick(); Haptics.tap() }
            return
        }
        if !goFired { goFired = true; Beeper.shared.go(); Haptics.success() }
        let st = t - lead

        if segs.isEmpty { // open-ended For Time: count up until the user stops
            kind = .work; isCountUp = true; big = Int(floor(st)); label = "FOR TIME"; round = 0; totalRounds = 0; segProgress = 0
            return
        }
        var acc = 0.0, idx = 0
        while idx < segs.count, st >= acc + segs[idx].dur { acc += segs[idx].dur; idx += 1 }
        if idx >= segs.count {
            state = .done; kind = .done; timer?.invalidate()
            if !endFired { endFired = true; Beeper.shared.finish(); Haptics.success() }
            big = 0; label = "DONE"; segProgress = 1
            return
        }
        let seg = segs[idx]; let inSeg = st - acc; let remaining = seg.dur - inSeg
        kind = seg.kind; segProgress = inSeg / seg.dur
        if idx != lastSegIdx {
            lastSegIdx = idx
            if seg.kind == .work { if idx > 0 { Beeper.shared.go(); Haptics.success() } }
            else { Beeper.shared.rest(); Haptics.tap() }
        }
        switch mode {
        case .amrap:    label = "AMRAP"; isCountUp = false; big = Int(ceil(remaining)); round = 0; totalRounds = 0
        case .forTime:  label = "CAP";   isCountUp = true;  big = Int(floor(st));       round = 0; totalRounds = 0
        case .emom:     label = "EMOM";  isCountUp = false; big = Int(ceil(remaining)); round = idx + 1; totalRounds = emomRounds
        case .intervals, .tabata:
            isCountUp = false; big = Int(ceil(remaining))
            label = seg.kind == .work ? "WORK" : "REST"
            round = idx / 2 + 1; totalRounds = (mode == .tabata ? 8 : intRounds)
        }
        let rr = Int(ceil(remaining))
        if rr <= 3, rr >= 1 {
            let key = (idx + 1) * 100 + rr
            if !firedTicks.contains(key) { firedTicks.insert(key); Beeper.shared.tick(); Haptics.tap() }
        }
    }

    private func build() {
        switch mode {
        case .amrap:    segs = [Seg(kind: .work, dur: Double(amrapMinutes * 60))]
        case .forTime:  segs = capOn ? [Seg(kind: .work, dur: Double(capMinutes * 60))] : []
        case .emom:     segs = (0..<emomRounds).map { _ in Seg(kind: .work, dur: Double(emomInterval)) }
        case .intervals:
            segs = []; for _ in 0..<intRounds { segs.append(Seg(kind: .work, dur: Double(intWork))); segs.append(Seg(kind: .rest, dur: Double(intRest))) }
        case .tabata:
            segs = []; for _ in 0..<8 { segs.append(Seg(kind: .work, dur: 20)); segs.append(Seg(kind: .rest, dur: 10)) }
        }
    }
}
