import SwiftUI

struct TodayView: View {
    @Environment(DataStore.self) private var store
    private let today = Date()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                HStack {
                    VStack(alignment: .leading, spacing: 6) { Wordmark(size: 19); LevelDots() }
                    Spacer()
                    if let s = store.session(for: today) {
                        Text(prettyDate(s.date)).font(.body(13, .medium)).foregroundStyle(Theme.textDim)
                    }
                }.padding(.top, 6)

                if let s = store.session(for: today) {
                    SessionDetailView(session: s)
                } else {
                    Text("No session found.").foregroundStyle(Theme.textDim).padding(.top, 40)
                }
                Spacer(minLength: 24)
            }
            .padding(.horizontal, 18).padding(.top, 8)
        }
        .background(Theme.bg.ignoresSafeArea())
    }

    private func prettyDate(_ iso: String) -> String {
        let inF = DateFormatter(); inF.dateFormat = "yyyy-MM-dd"; inF.timeZone = TimeZone(identifier: "UTC")
        let outF = DateFormatter(); outF.dateFormat = "EEE, MMM d"
        guard let d = inF.date(from: iso) else { return iso }
        return outF.string(from: d)
    }
}
