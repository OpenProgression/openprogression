import SwiftUI

// Wordmark: "Open" white + "Progression" teal
struct Wordmark: View {
    var size: CGFloat = 20
    var body: some View {
        HStack(spacing: 0) {
            Text("Open").foregroundStyle(Theme.text)
            Text("Progression").foregroundStyle(Theme.primary)
        }
        .font(.brand(size))
        .tracking(-0.5)
    }
}

// The signature 7-dot level gradient mark
struct LevelDots: View {
    var size: CGFloat = 7
    var body: some View {
        HStack(spacing: 4) {
            ForEach(0..<7, id: \.self) { i in
                Circle().fill(Theme.levelColors[i]).frame(width: size, height: size)
            }
        }
    }
}

// Section label (uppercase, tracked)
struct SectionLabel: View {
    let text: String
    var color: Color = Theme.textDim
    var body: some View {
        Text(text.uppercased())
            .font(.system(size: 12, weight: .bold))
            .tracking(1.4)
            .foregroundStyle(color)
    }
}

// A pill for a level (colored)
struct LevelPill: View {
    let name: String
    let number: Int
    var selected: Bool = false
    var body: some View {
        let c = Theme.levelColor(number)
        Text(name)
            .font(.system(size: 13, weight: .semibold))
            .foregroundStyle(selected ? Color.black : c)
            .padding(.horizontal, 12).padding(.vertical, 7)
            .background(selected ? c : c.opacity(0.14), in: Capsule())
            .overlay(Capsule().strokeBorder(c.opacity(selected ? 0 : 0.35), lineWidth: 1))
    }
}

// Small chip/tag
struct Chip: View {
    let text: String
    var color: Color = Theme.primary
    var filled: Bool = false
    var body: some View {
        Text(text)
            .font(.system(size: 12, weight: .semibold))
            .foregroundStyle(filled ? Color.black : color)
            .padding(.horizontal, 10).padding(.vertical, 5)
            .background(filled ? color : color.opacity(0.12), in: Capsule())
    }
}

// A labeled stat
struct Stat: View {
    let value: String
    let label: String
    var body: some View {
        VStack(spacing: 2) {
            Text(value).font(.display(20, .bold)).foregroundStyle(Theme.text)
            Text(label.uppercased()).font(.system(size: 10, weight: .semibold)).tracking(1).foregroundStyle(Theme.textFaint)
        }
    }
}
