import SwiftUI

struct DiaryView: View {
    @EnvironmentObject private var appState: AppState

    @State private var selectedDate = Date()
    @State private var meals: [MealDTO] = []
    @State private var isLoading = true

    private var goals: GoalsDTO { appState.goals ?? GoalsDTO(calories_goal: nil, protein_goal: nil, carbs_goal: nil, fats_goal: nil, target_weight: nil, activity_level: nil, goal_type: nil, diet_type: nil) }

    private var totalKcal: Int { meals.reduce(0) { $0 + $1.displayCalories } }
    private var totalProtein: Int { meals.reduce(0) { $0 + $1.displayProtein } }
    private var totalCarbs: Int { meals.reduce(0) { $0 + $1.displayCarbs } }
    private var totalFats: Int { meals.reduce(0) { $0 + $1.displayFats } }

    private var grouped: [(MealType, [MealDTO])] {
        MealType.allCases.map { type in
            (type, meals.filter { $0.mealType == type })
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {

                    FTHeader(
                        title: "Дневник",
                        subtitle: "Записывайте еду и следите за прогрессом"
                    )
                    .padding(.top, 10)

                    // Date bar
                    dateBar

                    if isLoading {
                        ProgressView().tint(.black)
                            .frame(maxWidth: .infinity)
                            .padding(.top, 30)
                    } else {
                        // Daily summary
                        dailySummary

                        // Macro stats row
                        macroStatsRow

                        // Meal sections
                        ForEach(grouped, id: \.0) { type, items in
                            mealSection(type: type, items: items)
                        }

                        Text("Совет: лучшее приложение — то, которое вы используете. Записывайте как есть.")
                            .font(.system(size: 12))
                            .foregroundColor(FTTheme.muted)
                            .frame(maxWidth: .infinity, alignment: .center)
                            .padding(.top, 6)
                    }

                    Spacer(minLength: 20)
                }
                .padding(.horizontal, FTTheme.hPad)
                .padding(.bottom, 18)
            }
            .background(FTTheme.bg)
            .navigationBarHidden(true)
        }
        .task { await loadMeals() }
    }

    // MARK: - Date Bar

    private var dateBar: some View {
        HStack {
            Button {
                selectedDate = Calendar.current.date(byAdding: .day, value: -1, to: selectedDate) ?? selectedDate
                Task { await loadMeals() }
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
                Text(dayName(selectedDate))
                    .font(.system(size: 12))
                    .foregroundColor(FTTheme.muted)
            }

            Spacer()

            Button {
                selectedDate = Calendar.current.date(byAdding: .day, value: 1, to: selectedDate) ?? selectedDate
                Task { await loadMeals() }
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

    // MARK: - Summary

    private var dailySummary: some View {
        FTCard {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Итого")
                        .font(.system(size: 15, weight: .semibold))
                    Text("\(meals.count) приём(ов)")
                        .font(.system(size: 12))
                        .foregroundColor(FTTheme.muted)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 4) {
                    Text("\(totalKcal) / \(goals.caloriesGoal) ккал")
                        .font(.system(size: 15, weight: .semibold))
                    Text(totalKcal <= goals.caloriesGoal ? "В пределах плана" : "Превышение")
                        .font(.system(size: 12))
                        .foregroundColor(totalKcal <= goals.caloriesGoal ? FTTheme.success : .red.opacity(0.85))
                }
            }

            GeometryReader { geo in
                let ratio = goals.caloriesGoal > 0 ? min(1.0, Double(totalKcal) / Double(goals.caloriesGoal)) : 0
                ZStack(alignment: .leading) {
                    Capsule().fill(Color.gray.opacity(0.12)).frame(height: 8)
                    Capsule().fill(Color.black).frame(width: geo.size.width * ratio, height: 8)
                }
            }
            .frame(height: 8)
        }
    }

    // MARK: - Macro Row

    private var macroStatsRow: some View {
        HStack(spacing: 10) {
            DiaryMacroChip(label: "Белки", value: totalProtein, goal: goals.proteinGoal, unit: "г", color: FTTheme.protein)
            DiaryMacroChip(label: "Жиры", value: totalFats, goal: goals.fatsGoal, unit: "г", color: FTTheme.fats)
            DiaryMacroChip(label: "Углеводы", value: totalCarbs, goal: goals.carbsGoal, unit: "г", color: FTTheme.carbs)
        }
    }

    // MARK: - Meal Section

    private func mealSection(type: MealType, items: [MealDTO]) -> some View {
        FTCard {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Image(systemName: type.icon)
                            .font(.system(size: 13))
                            .foregroundColor(FTTheme.muted)
                        Text(type.title)
                            .font(.system(size: 16, weight: .semibold))
                    }
                    if items.isEmpty {
                        Text("Пока пусто")
                            .font(.system(size: 12))
                            .foregroundColor(FTTheme.muted)
                    } else {
                        let sectionKcal = items.reduce(0) { $0 + $1.displayCalories }
                        Text("\(sectionKcal) ккал")
                            .font(.system(size: 12))
                            .foregroundColor(FTTheme.muted)
                    }
                }
                Spacer()
            }

            if items.isEmpty {
                Text("Добавьте блюдо по фото или из рецептов")
                    .font(.system(size: 12))
                    .foregroundColor(FTTheme.muted)
                    .padding(.top, 2)
            } else {
                VStack(spacing: 10) {
                    ForEach(items) { meal in
                        diaryMealRow(meal)
                        if meal.id != items.last?.id {
                            Divider().opacity(0.35)
                        }
                    }
                }
                .padding(.top, 6)
            }
        }
    }

    private func diaryMealRow(_ meal: MealDTO) -> some View {
        HStack(alignment: .top, spacing: 12) {
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

            Button {
                Task {
                    try? await APIClient.shared.deleteMeal(meal.id)
                    await loadMeals()
                }
            } label: {
                Image(systemName: "trash")
                    .font(.system(size: 13))
                    .foregroundColor(.red.opacity(0.6))
                    .padding(8)
                    .background(Color.red.opacity(0.06))
                    .clipShape(Circle())
            }
        }
    }

    // MARK: - Data

    private func loadMeals() async {
        isLoading = true
        let dateStr = apiDateString(selectedDate)
        meals = (try? await APIClient.shared.getMeals(date: dateStr)) ?? []
        isLoading = false
    }

    // MARK: - Helpers

    private func formattedDate(_ date: Date) -> String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "ru_RU")
        f.dateFormat = "d MMMM"
        return f.string(from: date)
    }

    private func dayName(_ date: Date) -> String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "ru_RU")
        f.dateFormat = "EEEE"
        return f.string(from: date).capitalized
    }

    private func apiDateString(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: date)
    }
}

// MARK: - Diary Macro Chip

private struct DiaryMacroChip: View {
    let label: String
    let value: Int
    let goal: Int
    let unit: String
    let color: Color

    var body: some View {
        VStack(spacing: 6) {
            Text(label)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(FTTheme.muted)

            Text("\(value)")
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(color)

            Text("/ \(goal)\(unit)")
                .font(.system(size: 11, weight: .semibold))
                .foregroundColor(.black.opacity(0.5))

            GeometryReader { geo in
                let ratio = goal > 0 ? min(1.0, Double(value) / Double(goal)) : 0
                ZStack(alignment: .leading) {
                    Capsule().fill(Color.gray.opacity(0.12)).frame(height: 4)
                    Capsule().fill(color).frame(width: geo.size.width * ratio, height: 4)
                }
            }
            .frame(height: 4)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 12)
        .background(FTTheme.card)
        .overlay(RoundedRectangle(cornerRadius: FTTheme.corner).stroke(FTTheme.border, lineWidth: 1))
        .cornerRadius(FTTheme.corner)
    }
}
