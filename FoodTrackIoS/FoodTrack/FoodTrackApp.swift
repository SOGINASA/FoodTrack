import SwiftUI

@main
struct FoodTrackApp: App {
    @StateObject private var authVM = AuthViewModel()
    @StateObject private var mealVM = MealViewModel()
    @StateObject private var progressVM = ProgressViewModel()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(authVM)
                .environmentObject(mealVM)
                .environmentObject(progressVM)
        }
    }
}
