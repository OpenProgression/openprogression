import SwiftUI
#if canImport(FoundationModels)
import FoundationModels
#endif

/// On-device AI coach (Apple Intelligence, no backend). Gracefully degrades when
/// the system model is unavailable (older OS, unsupported device, or simulator).
struct CoachView: View {
    let context: String
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Group {
                if #available(iOS 26.0, *) {
                    CoachChat(context: context)
                } else {
                    Unavailable(text: "The on-device coach needs iOS 26 with Apple Intelligence.")
                }
            }
            .background(Theme.bg.ignoresSafeArea())
            .navigationTitle("Coach")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .cancellationAction) { Button("Done") { dismiss() }.tint(Theme.primary) } }
        }
    }
}

struct Unavailable: View {
    let text: String
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "sparkles").font(.system(size: 40, weight: .light)).foregroundStyle(Theme.primary)
            Text("On-device Coach").font(.display(20)).foregroundStyle(Theme.text)
            Text(text).font(.body(14)).foregroundStyle(Theme.textDim).multilineTextAlignment(.center).padding(.horizontal, 40)
            Text("Runs fully on your iPhone. Nothing leaves the device.").font(.body(12)).foregroundStyle(Theme.textFaint).padding(.top, 4)
        }.frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

#if canImport(FoundationModels)
@available(iOS 26.0, *)
struct CoachChat: View {
    let context: String
    @State private var prompt = ""
    @State private var answer = ""
    @State private var busy = false
    @State private var errored: String?
    private let model = SystemLanguageModel.default

    private let suggestions = ["How should I pace this?", "Scale it for a sore shoulder", "Why this workout today?", "Warm-up ideas"]

    var body: some View {
        switch model.availability {
        case .available: chat
        case .unavailable(let reason):
            Unavailable(text: "Apple Intelligence is not available here (\(reasonText(reason))). The coach works on a supported iPhone.")
        }
    }

    private var chat: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Text("Ask about today's workout: pacing, scaling, technique, or strategy. Answered on-device.")
                        .font(.body(14)).foregroundStyle(Theme.textDim)
                    if !answer.isEmpty || busy {
                        HStack(alignment: .top, spacing: 10) {
                            Image(systemName: "sparkles").foregroundStyle(Theme.primary).font(.system(size: 15, weight: .bold)).padding(.top, 2)
                            Text(answer.isEmpty ? "Thinking..." : answer).font(.body(15)).foregroundStyle(Theme.text)
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }.padding(16).background(Theme.surface, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                    }
                    if let errored {
                        HStack(alignment: .top, spacing: 8) {
                            Image(systemName: "info.circle").font(.system(size: 13, weight: .bold)).foregroundStyle(Theme.textFaint).padding(.top, 1)
                            Text(errored).font(.body(13)).foregroundStyle(Theme.textDim)
                        }.padding(14).background(Theme.surface2, in: RoundedRectangle(cornerRadius: 12)).frame(maxWidth: .infinity, alignment: .leading)
                    }
                    FlowChips(items: suggestions) { ask($0) }
                }.padding(20)
            }
            .scrollDismissesKeyboard(.interactively)
            HStack(spacing: 10) {
                TextField("Ask the coach...", text: $prompt)
                    .font(.body(15)).padding(12).background(Theme.surface, in: Capsule()).overlay(Capsule().strokeBorder(Theme.stroke))
                Button { ask(prompt) } label: {
                    Image(systemName: busy ? "stop.fill" : "arrow.up").font(.system(size: 16, weight: .bold)).foregroundStyle(.black)
                        .frame(width: 44, height: 44).background(Theme.primary, in: Circle())
                }.buttonStyle(.plain).disabled(prompt.trimmingCharacters(in: .whitespaces).isEmpty || busy)
            }.padding(.horizontal, 18).padding(.bottom, 12)
        }
    }

    private func ask(_ q: String) {
        let question = q.trimmingCharacters(in: .whitespaces)
        guard !question.isEmpty, !busy else { return }
        Haptics.tap(); prompt = ""; answer = ""; errored = nil
        #if targetEnvironment(simulator)
        // The on-device model reports available but cannot generate in the Simulator.
        errored = "The on-device model runs only on a real iPhone with Apple Intelligence, not in the Simulator. On device, this answers your question fully on-device, nothing leaves the phone."
        #else
        busy = true
        Task {
            do {
                let session = LanguageModelSession(instructions: instructions)
                answer = try await session.respond(to: question).content
            } catch {
                errored = "The coach is unavailable right now. Make sure Apple Intelligence is on in Settings, then try again."
            }
            busy = false
        }
        #endif
    }

    private var instructions: String {
        """
        You are a knowledgeable, encouraging CrossFit coach for OpenProgression, an open functional-fitness standard with 7 levels. Be concise (2 to 4 short sentences), practical, and safety-first. Never recommend unsafe loading or pushing through sharp pain; suggest scaling down a level when in doubt. Use the weakest-link idea: train the gap, not the strength.
        The athlete's session today is: \(context)
        Answer their question about pacing, scaling, technique, warm-up, or strategy for this session.
        """
    }

    private func reasonText(_ r: SystemLanguageModel.Availability.UnavailableReason) -> String {
        switch r {
        case .deviceNotEligible: return "device not eligible"
        case .appleIntelligenceNotEnabled: return "Apple Intelligence off"
        case .modelNotReady: return "model downloading"
        @unknown default: return "unavailable"
        }
    }
}
#endif

/// Simple wrapping chip row of tappable suggestions.
struct FlowChips: View {
    let items: [String]
    let onTap: (String) -> Void
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ForEach(items, id: \.self) { s in
                Button { onTap(s) } label: {
                    Text(s).font(.body(14, .medium)).foregroundStyle(Theme.text)
                        .padding(.horizontal, 14).padding(.vertical, 9)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Theme.surface2, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                        .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous).strokeBorder(Theme.stroke))
                }.buttonStyle(.plain)
            }
        }
    }
}
