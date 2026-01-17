import SwiftUI

struct DashboardView: View {
    @EnvironmentObject private var mealVM: MealViewModel
    @EnvironmentObject private var progressVM: ProgressViewModel

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Сегодня")
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(.black)
                            Text("Сводка дня и цели")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.black.opacity(0.55))
                        }
                        Spacer()
                        StreakBadgeView(streak: progressVM.streakDays)
                    }

                    WeeklyMiniCalendarView()

                    CardView {
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 6) {
                                Text("\(mealVM.todayCalories)")
                                    .font(.system(size: 44, weight: .bold))
                                Text("/ \(mealVM.goalCalories)")
                                    .font(.system(size: 18, weight: .semibold))
                                    .foregroundColor(.black.opacity(0.55))
                                Text("Калорий съедено")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.black.opacity(0.55))
                            }
                            Spacer()
                            CircularProgressView(
                                value: Double(mealVM.todayCalories),
                                max: Double(mealVM.goalCalories),
                                lineWidth: 10,
                                size: 92
                            )
                        }
                        .padding(.bottom, 8)

                        Divider().opacity(0.15)

                        HStack {
                            MacroBar(title: "Белки", value: mealVM.todayProtein, goal: mealVM.goalProtein, accent: .red)
                            MacroBar(title: "Углеводы", value: mealVM.todayCarbs, goal: mealVM.goalCarbs, accent: .orange)
                            MacroBar(title: "Жиры", value: mealVM.todayFats, goal: mealVM.goalFats, accent: .blue)
                        }
                        .padding(.top, 12)
                    }

                    CardView {
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Text("Недавно добавлено")
                                    .font(.system(size: 18, weight: .bold))
                                Spacer()
                                Text("все")
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundColor(.black.opacity(0.5))
                            }

                            if mealVM.todayMeals.isEmpty {
                                Text("Нет добавленных блюд")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.black.opacity(0.55))
                            } else {
                                VStack(spacing: 10) {
                                    ForEach(mealVM.todayMeals.prefix(3)) { meal in
                                        MealCard(meal: meal)
                                    }
                                }
                            }
                        }
                    }
                }
                .padding(16)
            }
            .background(Color.white)
        }
    }
}
