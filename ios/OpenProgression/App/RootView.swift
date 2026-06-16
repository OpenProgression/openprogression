import SwiftUI

struct RootView: View {
    @State private var tab = RootView.initialTab
    static var initialTab: Int {
        switch ProcessInfo.processInfo.environment["OP_TAB"] {
        case "program": return 1; case "log": return 2; case "calculator": return 3; case "standard": return 4; default: return 0
        }
    }
    var body: some View {
        TabView(selection: $tab) {
            TodayView().tag(0).tabItem { Label("Today", systemImage: "bolt.fill") }
            ProgramView().tag(1).tabItem { Label("Program", systemImage: "calendar") }
            LogView().tag(2).tabItem { Label("Log", systemImage: "checklist") }
            CalculatorView().tag(3).tabItem { Label("Calculator", systemImage: "slider.horizontal.3") }
            StandardView().tag(4).tabItem { Label("Standard", systemImage: "chart.bar.fill") }
        }
        .tint(Theme.primary)
    }
}
