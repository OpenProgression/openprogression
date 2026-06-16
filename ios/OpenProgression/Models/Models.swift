import Foundation

enum Gender: String, CaseIterable, Codable { case male, female }

// Canonical level order (id -> number 1...7)
enum Levels {
    static let order = ["beginner","beginner_plus","intermediate","intermediate_plus","advanced","advanced_plus","rx"]
    static func number(_ id: String) -> Int { (order.firstIndex(of: id) ?? 0) + 1 }
}

struct Load: Codable, Hashable {
    let male: Double
    let female: Double
    func value(_ g: Gender) -> Double { g == .male ? male : female }
}

// MARK: - Levels
struct OPLevel: Codable, Identifiable {
    let id: String
    let number: Int
    let name: String
    let shortName: String
    let color: String
    let description: String
    let trainingAge: String?
    let percentileRange: [Int]
}
struct LevelsFile: Codable { let levels: [OPLevel] }

// MARK: - Categories
struct OPCategory: Codable, Identifiable {
    let id: String
    let name: String
    let icon: String
    let description: String
    let keyMovements: [String]
}
struct CategoriesFile: Codable { let categories: [OPCategory] }

// MARK: - Benchmarks (polymorphic standards)
enum StandardValue: Codable {
    case scalar(Double)
    case range(Int, Int)
    init(from decoder: Decoder) throws {
        let c = try decoder.singleValueContainer()
        if let arr = try? c.decode([Int].self), arr.count == 2 { self = .range(arr[0], arr[1]); return }
        if let d = try? c.decode(Double.self) { self = .scalar(d); return }
        throw DecodingError.dataCorruptedError(in: c, debugDescription: "standard value not scalar or [min,max]")
    }
    func encode(to encoder: Encoder) throws {
        var c = encoder.singleValueContainer()
        switch self {
        case .scalar(let d): try c.encode(d)
        case .range(let lo, let hi): try c.encode([lo, hi])
        }
    }
    /// The comparison threshold (lower bound for ranges).
    var threshold: Double {
        switch self { case .scalar(let d): return d; case .range(let lo, _): return Double(lo) }
    }
}
struct Benchmark: Codable, Identifiable {
    let movement: String
    let name: String
    let testType: String
    let unit: String
    let description: String?
    let standards: [String: [String: StandardValue]]    // level -> gender -> value
    let bwMultiplier: [String: [String: Double]]?
    let lowerIsBetter: Bool?
    var id: String { movement }
    var higherIsBetter: Bool { lowerIsBetter == nil ? true : !(lowerIsBetter!) }
}
struct BenchmarkFile: Codable {
    let category: String
    let benchmarks: [Benchmark]
}

// MARK: - Metcons
struct ScaleEntry: Codable {
    let sub: String?
    let reps: Int?
    let load: Load?
}
struct MetconMovement: Codable, Identifiable {
    let movement: String
    let reps: Int?
    let load: Load?
    let unit: String?
    let scaling: [String: ScaleEntry]?
    var id: String { movement + "-" + String(reps ?? 0) }

    /// Resolve display for a given level number (1...7) and gender.
    func resolved(levelNumber: Int, gender: Gender) -> (name: String, reps: Int?, load: Double?, unit: String?) {
        let levelId = Levels.order[max(1, min(7, levelNumber)) - 1]
        let entry = levelId == "rx" ? nil : scaling?[levelId]
        let name = entry?.sub ?? movement
        let r = entry?.reps ?? reps
        let l = (entry?.load ?? load)?.value(gender)
        return (name, r, l, unit)
    }
}
struct MetconTeam: Codable {
    let size: Int
    let format: String
    let description: String
}
struct MetconStimulus: Codable { let duration: String; let feel: String; let intent: String }
struct MetconGoal: Codable { let target: String; let scaleDown: String }
struct Metcon: Codable, Identifiable {
    let code: String
    let name: String
    let type: String
    let timeCap: Int
    let rounds: Int?
    let team: MetconTeam?
    let stimulus: MetconStimulus?
    let coachNotes: String?
    let movements: [MetconMovement]?
    let goal: MetconGoal?
    var id: String { code }
    var isTeam: Bool { team != nil }
}
struct MetconsFile: Codable { let metcons: [Metcon] }

// MARK: - Sessions
struct StrengthMovement: Codable, Identifiable {
    let movement: String
    let scheme: String?
    let prescription: String?
    let notes: String?
    var id: String { movement + (scheme ?? "") }
}
struct StrengthBlock: Codable { let durationMinutes: Int; let movements: [StrengthMovement] }
struct WorkBlock: Codable { let notes: String; let durationMinutes: Int }
struct Session: Codable, Identifiable {
    let date: String
    let title: String
    let phase: String?
    let deload: Bool?
    let estimatedMinutes: Int
    let warmup: WorkBlock?
    let strength: StrengthBlock?
    let metcon: String?
    let accessory: WorkBlock?
    var id: String { date }
}
struct SessionsFile: Codable { let sessions: [Session] }

// MARK: - Calculator config
struct CalcAgeAdjust: Codable { let multipliers: [String: Double] }
struct CalcBWScoring: Codable {
    struct Bounds: Codable { let min: Double; let max: Double }
    let roundToKg: Double
    let plausibleBodyweightKg: Bounds
    let suggestRelativeWhenDeviationOver: Double
}
struct CalcRepMovement: Codable { let movement: String; let file: String }

private struct DynamicKey: CodingKey {
    var stringValue: String; var intValue: Int?
    init?(stringValue: String) { self.stringValue = stringValue }
    init?(intValue: Int) { return nil }
}

struct CalculatorConfig: Codable {
    let referenceBodyweightKg: Load
    let bodyweightScoring: CalcBWScoring
    let ageAdjustment: CalcAgeAdjust
    let representativeMovements: [String: CalcRepMovement]

    enum CodingKeys: String, CodingKey { case referenceBodyweightKg, bodyweightScoring, ageAdjustment, representativeMovements }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        referenceBodyweightKg = try c.decode(Load.self, forKey: .referenceBodyweightKg)
        bodyweightScoring = try c.decode(CalcBWScoring.self, forKey: .bodyweightScoring)
        ageAdjustment = try c.decode(CalcAgeAdjust.self, forKey: .ageAdjustment)
        // Tolerate documentation keys (e.g. "_description") mixed into the map.
        let rm = try c.nestedContainer(keyedBy: DynamicKey.self, forKey: .representativeMovements)
        var map: [String: CalcRepMovement] = [:]
        for key in rm.allKeys where !key.stringValue.hasPrefix("_") {
            if let v = try? rm.decode(CalcRepMovement.self, forKey: key) { map[key.stringValue] = v }
        }
        representativeMovements = map
    }
}
