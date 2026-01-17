import Foundation
import SwiftUI

final class AppState: ObservableObject {
    enum Route {
        case auth
        case onboarding
        case main
    }

    @Published var route: Route = .auth

    // статично имитируем "авторизован"
    @Published var isLoggedIn: Bool = false
    @Published var onboardingCompleted: Bool = false

    func finishAuth(goToOnboarding: Bool) {
        isLoggedIn = true
        route = goToOnboarding ? .onboarding : .main
    }

    func finishOnboarding() {
        onboardingCompleted = true
        route = .main
    }

    func logout() {
        isLoggedIn = false
        onboardingCompleted = false
        route = .auth
    }
}
