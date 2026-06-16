import Foundation
import SwiftData

@Model
final class LogEntry {
    var date: Date
    var type: String        // "Metcon" | "Strength" | "Benchmark"
    var name: String
    var code: String?
    var level: Int
    var gender: String
    var result: String      // e.g. "8:32", "120 kg", "12 rounds + 5"
    var notes: String?

    init(date: Date = Date(), type: String, name: String, code: String? = nil,
         level: Int, gender: String, result: String, notes: String? = nil) {
        self.date = date; self.type = type; self.name = name; self.code = code
        self.level = level; self.gender = gender; self.result = result; self.notes = notes
    }
}

enum CSV {
    static func escape(_ s: String) -> String {
        if s.contains(",") || s.contains("\"") || s.contains("\n") {
            return "\"" + s.replacingOccurrences(of: "\"", with: "\"\"") + "\""
        }
        return s
    }
    static func file(for entries: [LogEntry]) -> URL {
        let df = DateFormatter(); df.dateFormat = "yyyy-MM-dd HH:mm"
        var rows = ["Date,Type,Name,Code,Level,Gender,Result,Notes"]
        let levelName = ["Beginner","Beginner+","Intermediate","Intermediate+","Advanced","Advanced+","Rx"]
        for e in entries {
            let lvl = (e.level >= 1 && e.level <= 7) ? levelName[e.level-1] : "\(e.level)"
            rows.append([df.string(from: e.date), e.type, e.name, e.code ?? "", lvl, e.gender, e.result, e.notes ?? ""].map(escape).joined(separator: ","))
        }
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("openprogression-log.csv")
        try? rows.joined(separator: "\n").data(using: .utf8)?.write(to: url)
        return url
    }
}
