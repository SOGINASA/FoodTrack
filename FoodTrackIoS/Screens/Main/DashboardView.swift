import SwiftUI

struct DashboardView: View {
    @EnvironmentObject private var appState: AppState

    @State private var selectedDate = Date()
    @State private var meals: [MealDTO] = []
    @State private var dailyStats: DailyStatsDTO?
    @State private var weeklyStats: WeeklyStatsDTO?
    @State private var streak = 0
    @State private var isLoading = true

    private var isToday: Bool {
        Calendar.current.isDateInToday(selectedDate)
    }

    private var goals: GoalsDTO { appState.goals ?? GoalsDTO(calories_goal: nil, protein_goal: nil, carbs_goal: nil, fats_goal: nil, target_weight: nil, activity_level: nil, goal_type: nil, diet_type: nil) }

    private var consumedKcal: Int { Int(dailyStats?.total_calories ?? 0) }
    private var consumedProtein: Int { Int(dailyStats?.total_protein ?? 0) }
    private var consumedCarbs: Int { Int(dailyStats?.total_carbs ?? 0) }
    private var consumedFats: Int { Int(dailyStats?.total_fats ?? 0) }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {

                    // Header
                    HStack(spacing: 10) {
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.gray.opacity(0.15))
                            .frame(width: 38, height: 38)
                            .overlay(
                                Text("FT")
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(.black.opacity(0.85))
                            )

                        VStack(alignment: .leading, spacing: 2) {
                            Text("FoodTrack")
                                .font(.system(size: 16, weight: .semibold))
                            Text("Главная")
                                .font(.system(size: 11))
                                .foregroundColor(FTTheme.muted)
                        }

                        Spacer()

                        if streak > 0 {
                            HStack(spacing: 4) {
                                Image(systemName: "flame.fill")
                                    .font(.system(size: 12))
                                Text("\(streak)")
                                    .font(.system(size: 13, weight: .bold))
                            }
                            .foregroundColor(.orange)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color.orange.opacity(0.12))
                            .cornerRadius(999)
                        }
                    }
                    .padding(.top, 10)

                    // Date navigation
                    dateNavigationBar

                    if isLoading {
                        VStack(spacing: 12) {
                            ProgressView().tint(.black)
                            Text("Загрузка...")
                                .font(.system(size: 13))
                                .foregroundColor(FTTheme.muted)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.top, 40)
                    } else {
                        // Daily summary card
                        dailySummaryCard

                        // Macro progress
                        macroProgressCard

                        // Weekly chart
                        if let weekly = weeklyStats {
                            weeklyChartCard(weekly)
                        }

                        // Recent meals
                        recentMealsCard
                    }

                    Spacer(minLength: 20)
                }
                .padding(.horizontal, FTTheme.hPad)
                .padding(.bottom, 18)
            }
            .background(FTTheme.bg)
            .navigationBarHidden(true)
        }
        .task { await loadData() }
    }

    // MARK: - Date Navigation

    private var dateNavigationBar: some View {
        HStack {
            Button {
                selectedDate = Calendar.current.date(byAdding: .day, value: -1, to: selectedDate) ?? selectedDate
                Task { await loadData() }
            } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.black.opacity(0.7))
                    .padding(10)
                    .background(Color.gray.opacity(0.10))
                    .clipShape(Circle())
            }

            Spacer()

            VStack(spacing: 2) {
                Text(formattedDate(selectedDate))
                    .font(.system(size: 15, weight: .semibold))
                if !isToday {
                    Button("Вернуться к сегодня") {
                        selectedDate = Date()
                        Task { await loadData() }
                    }
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.black.opacity(0.6))
                }
            }

            Spacer()

            Button {
                selectedDate = Calendar.current.date(byAdding: .day, value: 1, to: selectedDate) ?? selectedDate
                Task { await loadData() }
            } label: {
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.black.opacity(0.7))
                    .padding(10)
                    .background(Color.gray.opacity(0.10))
                    .clipShape(Circle())
            }
        }
    }

    // MARK: - Daily Summary

    private var dailySummaryCard: some View {
        FTCard {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(isToday ? "Сегодня" : formattedDate(selectedDate))
                        .font(.system(size: 15, weight: .semibold))
                    Text("\(meals.count) приём(ов) пищи")
                        .font(.system(size: 12))
                        .foregroundColor(FTTheme.muted)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 4) {
                    Text("\(consumedKcal) / \(goals.caloriesGoal) ккал")
                        .font(.system(size: 15, weight: .semibold))
                    let pct = goals.caloriesGoal > 0 ? Int(Double(consumedKcal) / Double(goals.caloriesGoal) * 100) : 0
                    Text("\(pct)% от цели")
                        .font(.system(size: 12))
                        .foregroundColor(pct <= 100 ? FTTheme.success : .red.opacity(0.85))
                }
            }

            // Calorie progress bar
            GeometryReader { geo in
                let ratio = goals.caloriesGoal > 0 ? min(1.0, Double(consumedKcal) / Double(goals.caloriesGoal)) : 0
                ZStack(alignment: .leading) {
                    Capsule().fill(Color.gray.opacity(0.12)).frame(height: 10)
                    Capsule().fill(Color.black).frame(width: geo.size.width * ratio, height: 10)
                }
            }
            .frame(height: 10)
        }
    }

    // MARK: - Macro Progress

    private var macroProgressCard: some View {
        FTCard {
            Text("Макронутриенты")
                .font(.system(size: 15, weight: .semibold))

            HStack(spacing: 12) {
                MacroCircle(
                    label: "Белки",
                    value: consumedProtein,
                    goal: goals.proteinGoal,
                    unit: "г",
                    color: FTTheme.protein
                )
                MacroCircle(
                    label: "Углеводы",
                    value: consumedCarbs,
                    goal: goals.carbsGoal,
                    unit: "г",
                    color: FTTheme.carbs
                )
                MacroCircle(
                    label: "Жиры",
                    value: consumedFats,
                    goal: goals.fatsGoal,
                    unit: "г",
                    color: FTTheme.fats
                )
            }
        }
    }

    // MARK: - Weekly Chart

    private func weeklyChartCard(_ weekly: WeeklyStatsDTO) -> some View {
        FTCard {
            Text("Неделя")
                .font(.system(size: 15, weight: .semibold))

            if let days = weekly.daily, !days.isEmpty {
                let maxCal = days.compactMap(\.calories).max() ?? 1
                HStack(alignment: .bottom, spacing: 6) {
                    ForEach(days) { day in
                        let cal = day.calories ?? 0
                        let height = maxCal > 0 ? CGFloat(cal / maxCal) * 100 : 0
                        VStack(spacing: 4) {
                            RoundedRectangle(cornerRadius: 6)
                                .fill(Color.black.opacity(0.85))
                                .frame(height: max(4, height))

                            Text(shortDay(day.date))
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(FTTheme.muted)
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
                .frame(height: 120)
            }

            if let summary = weekly.summary {
                HStack(spacing: 16) {
                    WeekStat(title: "Среднее", value: "\(Int(summary.avg_calories ?? 0)) ккал")
                    WeekStat(title: "Дней с целью", value: "\(summary.days_with_goal ?? 0)")
                    WeekStat(title: "Приёмов", value: "\(summary.total_meals ?? 0)")
                }
                .padding(.top, 8)
            }
        }
    }

    // MARK: - Recent Meals

    private var recentMealsCard: some View {
        FTCard {
            HStack {
                Text("Последние записи")
                    .font(.system(size: 15, weight: .semibold))
                Spacer()
                if !meals.isEmpty {
                    Text("\(meals.count) всего")
                        .font(.system(size: 12))
                        .foregroundColor(FTTheme.muted)
                }
            }

            if meals.isEmpty {
                VStack(spacing: 8) {
                    Image(systemName: "fork.knife")
                        .font(.system(size: 24))
                        .foregroundColor(FTTheme.muted)
                    Text("Нет записей за этот день")
                        .font(.system(size: 13))
                        .foregroundColor(FTTheme.muted)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
            } else {
                ForEach(meals.prefix(3)) { meal in
                    HStack(spacing: 12) {
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.gray.opacity(0.12))
                            .frame(width: 44, height: 44)
                            .overlay(
                                Text("\(meal.displayCalories)")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundColor(.black.opacity(0.75))
                            )

                        VStack(alignment: .leading, spacing: 4) {
                            Text(meal.name)
                                .font(.system(size: 15, weight: .semibold))
                                .lineLimit(1)
                            Text("Б \(meal.displayProtein) \u{2022} Ж \(meal.displayFats) \u{2022} У \(meal.displayCarbs)")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(.black.opacity(0.7))
                        }
                        Spacer()
                        Text(meal.mealType.title)
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(FTTheme.muted)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.gray.opacity(0.10))
                            .cornerRadius(999)
                    }
                }
            }
        }
    }

    // MARK: - Data Loading

    private func loadData() async {
        isLoading = true
        let dateStr = apiDateString(selectedDate)

        async let mealsTask = APIClient.shared.getMeals(date: dateStr)
        async let statsTask = APIClient.shared.getDailyStats(date: dateStr)
        async let weeklyTask = APIClient.shared.getWeeklyStats()
        async let streakTask = APIClient.shared.getStreak()

        meals = (try? await mealsTask) ?? []
        dailyStats = try? await statsTask
        weeklyStats = try? await weeklyTask
        streak = (try? await streakTask) ?? 0

        isLoading = false
    }

    // MARK: - Helpers

    private func formattedDate(_ date: Date) -> String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "ru_RU")
        f.dateFormat = "d MMMM, EEEE"
        return f.string(from: date).capitalized
    }

    private func apiDateString(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: date)
    }

    private func shortDay(_ dateStr: String) -> String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        guard let d = f.date(from: dateStr) else { return "" }
        let out = DateFormatter()
        out.locale = Locale(identifier: "ru_RU")
        out.dateFormat = "EE"
        return out.string(from: d).prefix(2).capitalized
    }
}

// MARK: - Sub-views

private struct MacroCircle: View {
    let label: String
    let value: Int
    let goal: Int
    let unit: String
    let color: Color

    private var ratio: Double {
        guard goal > 0 else { return 0 }
        return min(1.0, Double(value) / Double(goal))
    }

    var body: some View {
        VStack(spacing: 6) {
            ZStack {
                Circle()
                    .stroke(Color.gray.opacity(0.12), lineWidth: 6)
                Circle()
                    .trim(from: 0, to: ratio)
                    .stroke(color, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                    .rotationEffect(.degrees(-90))

                Text("\(value)")
                    .font(.system(size: 14, weight: .bold))
            }
            .frame(width: 64, height: 64)

            Text(label)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(FTTheme.muted)

            Text("\(value)/\(goal)\(unit)")
                .font(.system(size: 11, weight: .semibold))
        }
        .frame(maxWidth: .infinity)
    }
}

private struct WeekStat: View {
    let title: String
    let value: String

    var body: some View {
        VStack(spacing: 4) {
            Text(title)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(FTTheme.muted)
            Text(value)
                .font(.system(size: 14, weight: .semibold))
        }
        .frame(maxWidth: .infinity)
    }
}
