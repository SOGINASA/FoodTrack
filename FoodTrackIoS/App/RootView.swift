import SwiftUI

struct RootView: View {
    @EnvironmentObject private var appState: AppState

    var body: some View {
        Group {
            if appState.isLoading {
                // Splash / loading
                VStack(spacing: 16) {
                    RoundedRectangle(cornerRadius: 20)
                        .fill(Color.gray.opacity(0.15))
                        .frame(width: 72, height: 72)
                        .overlay(
                            Text("FT")
                                .font(.system(size: 24, weight: .bold))
                                .foregroundColor(.black.opacity(0.85))
                        )
                    Text("FoodTrack")
                        .font(.system(size: 22, weight: .semibold))
                    ProgressView()
                        .tint(.black)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(FTTheme.bg)
            } else {
                switch appState.route {
                case .auth:
                    NavigationStack { AuthView() }
                        .transition(.opacity)
                case .onboarding:
                    NavigationStack { OnboardingFlowView() }
                        .transition(.move(edge: .trailing))
                case .main:
                    MainTabView()
                        .transition(.opacity)
                }
            }
        }
        .animation(.easeOut(duration: 0.25), value: appState.route)
        .animation(.easeOut(duration: 0.25), value: appState.isLoading)
    }
}

// Make Route equatable for animation
extension AppState.Route: Equatable {}
