import SwiftUI

struct MainTabView: View {
    var body: some View {
        TabView {
            DashboardView()
                .tabItem {
                    Label("Главная", systemImage: "house")
                }

            DiaryView()
                .tabItem {
                    Label("Дневник", systemImage: "list.bullet.rectangle")
                }

            AnalyzeView()
                .tabItem {
                    Label("Анализ", systemImage: "camera")
                }

            RecipesView()
                .tabItem {
                    Label("Рецепты", systemImage: "book")
                }

            ProfileView()
                .tabItem {
                    Label("Профиль", systemImage: "person.crop.circle")
                }
        }
        .tint(.black)
        .toolbarBackground(.visible, for: .tabBar)
        .toolbarBackground(.ultraThinMaterial, for: .tabBar)
    }
}
