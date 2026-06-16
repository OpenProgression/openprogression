import SwiftUI

struct StandardView: View {
    @State private var seg = 0
    var body: some View {
        VStack(spacing: 0) {
            Picker("", selection: $seg) {
                Text("Benchmarks").tag(0); Text("Levels").tag(1)
            }
            .pickerStyle(.segmented)
            .padding(.horizontal, 18).padding(.top, 12).padding(.bottom, 4)
            .onChange(of: seg) { Haptics.select() }
            if seg == 0 { BenchmarksView() } else { LevelsView() }
        }
        .background(Theme.bg.ignoresSafeArea())
    }
}
