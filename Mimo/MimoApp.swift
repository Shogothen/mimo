import SwiftUI

@main
struct MimoApp: App {
    @StateObject private var viewModel = AppViewModel()

    var body: some Scene {
        WindowGroup {
            Group {
                if viewModel.state.onboardingCompleted {
                    MainTabView()
                } else {
                    OnboardingView()
                }
            }
            .environmentObject(viewModel)
            .fontDesign(.rounded)
            .preferredColorScheme(.light)
            .onAppear { viewModel.applyTimeDecay() }
        }
    }
}
