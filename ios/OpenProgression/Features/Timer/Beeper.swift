import AVFoundation

/// Synthesizes clean gym-timer beeps on the fly (no audio assets). Uses the
/// playback category so beeps are heard even with the ringer on silent.
final class Beeper {
    static let shared = Beeper()
    private let engine = AVAudioEngine()
    private let player = AVAudioPlayerNode()
    private let format = AVAudioFormat(standardFormatWithSampleRate: 44_100, channels: 1)!
    private var ready = false
    var enabled = true

    func prepare() {
        guard !ready else { return }
        let session = AVAudioSession.sharedInstance()
        try? session.setCategory(.playback, options: [.mixWithOthers, .duckOthers])
        try? session.setActive(true)
        engine.attach(player)
        engine.connect(player, to: engine.mainMixerNode, format: format)
        engine.prepare()
        try? engine.start()
        ready = true
    }

    private func tone(_ freq: Double, _ dur: Double, _ gain: Float) {
        guard enabled else { return }
        prepare()
        let sr = format.sampleRate
        let frames = AVAudioFrameCount(dur * sr)
        guard frames > 0, let buf = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frames) else { return }
        buf.frameLength = frames
        let data = buf.floatChannelData![0]
        let fade = max(1, Int(0.006 * sr))
        let n = Int(frames)
        for i in 0..<n {
            var amp = gain
            if i < fade { amp *= Float(i) / Float(fade) }
            if i > n - fade { amp *= Float(n - i) / Float(fade) }
            data[i] = sinf(2 * .pi * Float(freq) * Float(i) / Float(sr)) * amp
        }
        if !player.isPlaying { player.play() }
        player.scheduleBuffer(buf, at: nil, options: [], completionHandler: nil)
    }

    func tick()  { tone(784,  0.10, 0.45) }   // G5  - countdown / last 3s
    func go()    { tone(1175, 0.45, 0.6)  }   // D6  - GO / new round
    func rest()  { tone(587,  0.30, 0.5)  }   // D5  - rest start (lower)
    func finish(){ tone(1318, 0.75, 0.65) }   // E6  - workout done (long)
}
