import SwiftUI

@main
struct OpenProgressionApp: App {
    @State private var store = DataStore()
    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(store)
                .preferredColorScheme(.dark)
                .tint(Theme.primary)
        }
    }
}
