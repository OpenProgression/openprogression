import SwiftUI
import SwiftData

@main
struct OpenProgressionApp: App {
    @State private var store = DataStore()

    init() {
        // SwiftData's default store lives in Application Support, which doesn't exist
        // on a fresh install. Create it up front so the store opens cleanly (avoids
        // the first-launch CoreData "failed to create file" recovery noise).
        try? FileManager.default.createDirectory(
            at: URL.applicationSupportDirectory, withIntermediateDirectories: true)
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(store)
                .preferredColorScheme(.dark)
                .tint(Theme.primary)
        }
        .modelContainer(for: LogEntry.self)
    }
}
