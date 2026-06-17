import SwiftUI
import SwiftData

let levelShort = ["BEG","BEG+","INT","INT+","ADV","ADV+","RX"]

struct LogEntrySheet: View {
    @Environment(\.modelContext) private var ctx
    @Environment(\.dismiss) private var dismiss
    let type: String
    let name: String
    let code: String?
    let level: Int
    let gender: Gender
    let resultPlaceholder: String
    @State private var result = ""
    @State private var notes = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    VStack(alignment: .leading, spacing: 6) {
                        SectionLabel(text: "Log \(type)")
                        Text(name).font(.display(24)).foregroundStyle(Theme.text)
                        HStack(spacing: 8) {
                            if let c = code { Chip(text: c, color: Theme.textDim) }
                            if level >= 1 && level <= 7 { LevelPill(name: levelShort[level-1], number: level) }
                            Chip(text: gender.rawValue.capitalized, color: Theme.textDim)
                        }
                    }
                    field("Result", placeholder: resultPlaceholder, text: $result)
                    field("Notes (optional)", placeholder: "How it felt, scaling used...", text: $notes)
                    Spacer(minLength: 8)
                }
                .padding(20)
            }
            .background(Theme.bg.ignoresSafeArea())
            .scrollDismissesKeyboard(.interactively)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() }.tint(Theme.textDim) }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { save() }.bold().disabled(result.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
    }

    private func field(_ label: String, placeholder: String, text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            SectionLabel(text: label)
            TextField(placeholder, text: text, axis: label.hasPrefix("Notes") ? .vertical : .horizontal)
                .lineLimit(label.hasPrefix("Notes") ? 4 : 1)
                .font(.body(16, .medium)).foregroundStyle(Theme.text)
                .padding(14)
                .background(Theme.surface, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 14, style: .continuous).strokeBorder(Theme.stroke))
        }
    }

    private func save() {
        Haptics.tap()
        let trimmedNotes = notes.trimmingCharacters(in: .whitespacesAndNewlines)
        ctx.insert(LogEntry(type: type, name: name, code: code, level: level,
                            gender: gender.rawValue, result: result.trimmingCharacters(in: .whitespaces),
                            notes: trimmedNotes.isEmpty ? nil : trimmedNotes))
        dismiss()
    }
}
