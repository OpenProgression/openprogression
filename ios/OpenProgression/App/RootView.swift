import SwiftUI

struct RootView: View {
    @State private var tab = RootView.initialTab
    static var initialTab: Int {
        switch ProcessInfo.processInfo.environment["OP_TAB"] {
        case "calculator": return 1; case "benchmarks": return 2; case "levels": return 3; default: return 0
        }
    }
    var body: some View {
        TabView(selection: $tab) {
            TodayView().tag(0).tabItem { Label("Today", systemImage: "bolt.fill") }
            CalculatorView().tag(1).tabItem { Label("Calculator", systemImage: "slider.horizontal.3") }
            BenchmarksView().tag(2).tabItem { Label("Benchmarks", systemImage: "chart.bar.fill") }
            LevelsView().tag(3).tabItem { Label("Levels", systemImage: "square.stack.3d.up.fill") }
        }
        .tint(Theme.primary)
    }
}
