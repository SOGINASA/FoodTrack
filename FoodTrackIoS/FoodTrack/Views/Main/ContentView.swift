import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            DashboardView()
                .tabItem { Label("Сегодня", systemImage: "house") }

            DiaryView()
                .tabItem { Label("Дневник", systemImage: "book") }

            AddMealView()
                .tabItem { Label("Добавить", systemImage: "plus.circle") }

            ProgressScreenView()
                .tabItem { Label("Прогресс", systemImage: "chart.line.uptrend.xyaxis") }

            SettingsView()
                .tabItem { Label("Настройки", systemImage: "gearshape") }
        }
        .tint(.black)
    }
}
