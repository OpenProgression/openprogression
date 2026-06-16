import Foundation
import Observation

@Observable
final class DataStore {
    var levels: [OPLevel] = []
    var categories: [OPCategory] = []
    var sessions: [Session] = []
    private var metconsByCode: [String: Metcon] = [:]
    var benchmarks: [Benchmark] = []           // flattened across categories
    var benchmarksByCategory: [String: [Benchmark]] = [:]
    var calc: CalculatorConfig?

    init() { load() }

    private func decode<T: Decodable>(_ type: T.Type, _ name: String, subdir: String = "data") -> T? {
        guard let url = Bundle.main.url(forResource: name, withExtension: "json", subdirectory: subdir),
              let data = try? Data(contentsOf: url) else { return nil }
        do { return try JSONDecoder().decode(T.self, from: data) }
        catch { print("decode \(name) failed: \(error)"); return nil }
    }

    private func load() {
        levels = decode(LevelsFile.self, "levels")?.levels ?? []
        categories = decode(CategoriesFile.self, "categories")?.categories ?? []
        sessions = (decode(SessionsFile.self, "sessions")?.sessions ?? []).sorted { $0.date < $1.date }
        let metcons = decode(MetconsFile.self, "metcons")?.metcons ?? []
        metconsByCode = Dictionary(uniqueKeysWithValues: metcons.map { ($0.code, $0) })
        calc = decode(CalculatorConfig.self, "calculator")
        for cat in ["squatting","pulling","pressing","olympic_lifting","gymnastics","monostructural","bodyweight","endurance"] {
            if let f = decode(BenchmarkFile.self, cat, subdir: "data/benchmarks") {
                benchmarksByCategory[f.category] = f.benchmarks
                benchmarks.append(contentsOf: f.benchmarks)
            }
        }
    }

    func metcon(_ code: String?) -> Metcon? { code.flatMap { metconsByCode[$0] } }
    func level(number: Int) -> OPLevel? { levels.first { $0.number == number } }

    /// The session for a given calendar date, clamped into the available range.
    func session(for date: Date) -> Session? {
        guard !sessions.isEmpty else { return nil }
        let f = DateFormatter(); f.dateFormat = "yyyy-MM-dd"; f.timeZone = TimeZone(identifier: "UTC")
        let key = f.string(from: date)
        if let exact = sessions.first(where: { $0.date == key }) { return exact }
        if let upcoming = sessions.first(where: { $0.date >= key }) { return upcoming }
        return sessions.last
    }
}
