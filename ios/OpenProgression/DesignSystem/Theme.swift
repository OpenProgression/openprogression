import SwiftUI

// MARK: - Color from hex
extension Color {
    init(hex: String) {
        let s = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        var v: UInt64 = 0
        Scanner(string: s).scanHexInt64(&v)
        let r, g, b, a: Double
        switch s.count {
        case 8: r = Double((v >> 24) & 0xFF)/255; g = Double((v >> 16) & 0xFF)/255; b = Double((v >> 8) & 0xFF)/255; a = Double(v & 0xFF)/255
        default: r = Double((v >> 16) & 0xFF)/255; g = Double((v >> 8) & 0xFF)/255; b = Double(v & 0xFF)/255; a = 1
        }
        self.init(.sRGB, red: r, green: g, blue: b, opacity: a)
    }
}

// MARK: - Brand theme
enum Theme {
    static let bg        = Color(hex: "#0A0A0D")
    static let bgElevated = Color(hex: "#101015")
    static let surface   = Color(hex: "#16161D")
    static let surface2  = Color(hex: "#1E1E27")
    static let stroke    = Color.white.opacity(0.07)
    static let primary   = Color(hex: "#14B8A6")   // OpenProgression teal
    static let primaryDim = Color(hex: "#0E7C70")
    static let text      = Color(hex: "#F5F5F7")
    static let textDim   = Color(hex: "#9A9AA6")
    static let textFaint = Color(hex: "#6A6A76")

    // 7-level gradient (Beginner -> Rx). Falls back if data omits a color.
    static let levelColors: [Color] = ["#4ADE80","#22C55E","#EAB308","#F97316","#EF4444","#DC2626","#991B1B"].map { Color(hex: $0) }
    static func levelColor(_ number: Int) -> Color {
        let i = max(1, min(7, number)) - 1
        return levelColors[i]
    }

    static var levelGradient: LinearGradient {
        LinearGradient(colors: levelColors, startPoint: .leading, endPoint: .trailing)
    }
}

// MARK: - Typography (SF Pro, premium weights). Rounded for display/brand.
extension Font {
    static func display(_ size: CGFloat, _ weight: Weight = .heavy) -> Font {
        .system(size: size, weight: weight, design: .rounded)
    }
    static func brand(_ size: CGFloat) -> Font { .system(size: size, weight: .black, design: .rounded) }
}

// MARK: - Reusable view modifiers
struct CardStyle: ViewModifier {
    var padding: CGFloat = 18
    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(Theme.surface, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 20, style: .continuous).strokeBorder(Theme.stroke, lineWidth: 1))
    }
}
extension View {
    func card(padding: CGFloat = 18) -> some View { modifier(CardStyle(padding: padding)) }
}
