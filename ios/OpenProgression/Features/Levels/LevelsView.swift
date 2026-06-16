import SwiftUI

struct LevelsView: View {
    @Environment(DataStore.self) private var store
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                VStack(alignment: .leading, spacing: 6) {
                    SectionLabel(text: "The Standard")
                    Text("7 Levels").font(.display(28)).foregroundStyle(Theme.text)
                    Text("Your overall level is your lowest category. The weakest-link principle.")
                        .font(.system(size: 14)).foregroundStyle(Theme.textDim)
                    Theme.levelGradient.frame(height: 6).clipShape(Capsule()).padding(.top, 4)
                }
                ForEach(store.levels) { lv in
                    HStack(spacing: 14) {
                        ZStack {
                            Circle().fill(Theme.levelColor(lv.number).opacity(0.16)).frame(width: 46, height: 46)
                            Text("\(lv.number)").font(.display(20)).foregroundStyle(Theme.levelColor(lv.number))
                        }
                        VStack(alignment: .leading, spacing: 3) {
                            HStack {
                                Text(lv.name).font(.system(size: 17, weight: .bold)).foregroundStyle(Theme.text)
                                Spacer()
                                Text("\(lv.percentileRange.first ?? 0)–\(lv.percentileRange.last ?? 0)th")
                                    .font(.system(size: 12, weight: .semibold)).foregroundStyle(Theme.textFaint)
                            }
                            Text(lv.description).font(.system(size: 13)).foregroundStyle(Theme.textDim).fixedSize(horizontal: false, vertical: true)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading).card(padding: 16)
                }
                Spacer(minLength: 24)
            }
            .padding(.horizontal, 18).padding(.top, 8)
        }
        .background(Theme.bg.ignoresSafeArea())
    }
}
