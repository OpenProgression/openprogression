import SwiftUI

/// A branded, fixed-size card rendered to an image for sharing.
struct ResultCard: View {
    let name: String
    let result: String
    let subtitle: String
    let levelNumber: Int

    var body: some View {
        ZStack(alignment: .top) {
            Theme.bg
            Theme.levelGradient.frame(height: 6)
            VStack(alignment: .leading, spacing: 0) {
                HStack { Wordmark(size: 20); Spacer(); LevelDots(size: 8) }
                Spacer()
                Text("WORKOUT").font(.body(12, .bold)).tracking(2).foregroundStyle(Theme.textFaint)
                Text(name).font(.display(34)).foregroundStyle(Theme.text).lineLimit(2).minimumScaleFactor(0.7)
                Spacer().frame(height: 24)
                Text("RESULT").font(.body(12, .bold)).tracking(2).foregroundStyle(Theme.textFaint)
                Text(result).font(.system(size: 60, weight: .black, design: .rounded)).foregroundStyle(Theme.primary).lineLimit(1).minimumScaleFactor(0.5)
                Text(subtitle).font(.body(15, .semibold)).foregroundStyle(Theme.textDim).padding(.top, 4)
                Spacer()
                HStack {
                    if levelNumber >= 1 && levelNumber <= 7 {
                        Text(levelShort[levelNumber-1]).font(.system(size: 13, weight: .bold)).foregroundStyle(.black)
                            .padding(.horizontal, 12).padding(.vertical, 6)
                            .background(Theme.levelColor(levelNumber), in: Capsule())
                    }
                    Spacer()
                    Text("openprogression.org").font(.body(13, .semibold)).foregroundStyle(Theme.textFaint)
                }
            }
            .padding(30)
        }
        .frame(width: 360, height: 480)
        .environment(\.colorScheme, .dark)
    }
}

struct ShareResultView: View {
    let card: ResultCard
    @Environment(\.dismiss) private var dismiss
    @State private var url: URL?

    var body: some View {
        VStack(spacing: 20) {
            Text("Share your result").font(.display(20)).foregroundStyle(Theme.text).padding(.top, 24)
            card
                .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 22, style: .continuous).strokeBorder(Theme.stroke))
                .scaleEffect(0.92)
            if let url {
                ShareLink(item: url) {
                    Label("Share image", systemImage: "square.and.arrow.up")
                        .font(.body(16, .bold)).foregroundStyle(.black)
                        .frame(maxWidth: .infinity).padding(.vertical, 16)
                        .background(Theme.primary, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                }.buttonStyle(.plain).padding(.horizontal, 24)
            }
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Theme.bg.ignoresSafeArea())
        .task { url = await Self.render(card) }
    }

    @MainActor static func render(_ card: ResultCard) async -> URL? {
        let renderer = ImageRenderer(content: card)
        renderer.scale = 3
        guard let img = renderer.uiImage, let data = img.pngData() else { return nil }
        let out = FileManager.default.temporaryDirectory.appendingPathComponent("openprogression-result.png")
        try? data.write(to: out)
        return out
    }
}
