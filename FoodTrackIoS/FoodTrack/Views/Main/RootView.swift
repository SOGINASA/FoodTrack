import SwiftUI

struct RootView: View {
    @EnvironmentObject private var authVM: AuthViewModel

    var body: some View {
        Group {
            if authVM.isAuthenticated {
                ContentView()
            } else {
                AuthLandingView()
            }
        }
        .animation(.easeInOut(duration: 0.2), value: authVM.isAuthenticated)
    }
}
