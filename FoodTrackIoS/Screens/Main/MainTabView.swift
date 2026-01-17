import SwiftUI

struct MainTabView: View {
    var body: some View {
        TabView {
            DiaryView()
                .tabItem {
                    Label("Дневник", systemImage: "list.bullet.rectangle")
                }

            RecipesView()
                .tabItem {
                    Label("Рецепты", systemImage: "book")
                }

            AnalyzeView()
                .tabItem {
                    Label("Анализ", systemImage: "camera")
                }

            ProfileView()
                .tabItem {
                    Label("Профиль", systemImage: "person.crop.circle")
                }
        }
        .tint(.black) // цвет выбранной вкладки
        .toolbarBackground(.visible, for: .tabBar)
        .toolbarBackground(.ultraThinMaterial, for: .tabBar) // iOS-стиль (blur)
    }
}
