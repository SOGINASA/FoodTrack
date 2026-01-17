import SwiftUI

struct RootView: View {
    @EnvironmentObject private var appState: AppState

    var body: some View {
        NavigationStack {
            Group {
                switch appState.route {
                case .auth:
                    AuthView()
                case .onboarding:
                    OnboardingFlowView()
                case .main:
                    MainTabView()
                }
            }
            .navigationBarHidden(true)
        }
    }
}
