import SwiftUI

struct AnalyticsView: View {
    @State private var selectedTab: AnalyticsPeriod = .week
    @State private var weeklyStats: WeeklyStatsDTO?
    @State private var monthlyStats: MonthlyStatsDTO?
    @State private var topFoods: [TopFoodDTO] = []
    @State private var streak: StreakDTO?
    @State private var isLoading = true

    @State private var selectedYear: Int = Calendar.current.component(.year, from: Date())
    @State private var selectedMonth: Int = Calendar.current.component(.month, from: Date())

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {

                    FTHeader(
                        title: "Аналитика",
                        subtitle: "Статистика питания за неделю и месяц"
                    )
                    .padding(.top, 10)

                    // Streak card
                    streakCard

                    // Period picker
                    periodPicker

                    if isLoading {
                        VStack(spacing: 12) {
                            ProgressView().tint(FTTheme.tint)
                            Text("Загрузка...")
                                .font(.system(size: 13))
                                .foregroundColor(FTTheme.muted)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.top, 40)
                    } else {
                        switch selectedTab {
                        case .week:
                            weeklyContent
                        case .month:
                            monthlyContent
                        }

                        // Top foods (shown in both tabs)
                        if !topFoods.isEmpty {
                            topFoodsCard
                        }
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

    // MARK: - Streak Card

    private var streakCard: some View {
        FTCard {
            HStack(spacing: 0) {
                streakStat(
                    emoji: "\u{1F525}",
                    value: "\(streak?.current_streak ?? 0)",
                    label: "Текущий стрик"
                )

                streakDivider

                streakStat(
                    emoji: "\u{1F3C6}",
                    value: "\(streak?.longest_streak ?? 0)",
                    label: "Лучший стрик"
                )

                streakDivider

                streakStat(
                    emoji: "\u{1F4C5}",
                    value: "\(streak?.total_days_tracked ?? 0)",
                    label: "Всего дней"
                )
            }
        }
    }

    private func streakStat(emoji: String, value: String, label: String) -> some View {
        VStack(spacing: 6) {
            Text(emoji)
                .font(.system(size: 22))
            Text(value)
                .font(.system(size: 22, weight: .bold))
                .foregroundColor(FTTheme.text)
            Text(label)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(FTTheme.muted)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
    }

    private var streakDivider: some View {
        Rectangle()
            .fill(FTTheme.border)
            .frame(width: 1, height: 50)
    }

    // MARK: - Period Picker

    private var periodPicker: some View {
        HStack(spacing: 0) {
            ForEach(AnalyticsPeriod.allCases, id: \.self) { tab in
                Button {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        selectedTab = tab
                    }
                    Task { await loadData() }
                } label: {
                    Text(tab.title)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(selectedTab == tab ? Color(.systemBackground) : FTTheme.text.opacity(0.7))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(selectedTab == tab ? FTTheme.tint : Color.clear)
                        .cornerRadius(14)
                }
            }
        }
        .padding(4)
        .background(FTTheme.fill)
        .cornerRadius(FTTheme.corner)
    }

    // MARK: - Weekly Content

    @ViewBuilder
    private var weeklyContent: some View {
        if let weekly = weeklyStats {
            // Bar chart
            weeklyBarChart(weekly)

            // Summary stats
            if let summary = weekly.summary {
                weeklySummaryCard(summary)
            }
        } else {
            emptyState(text: "Нет данных за неделю")
        }
    }

    private func weeklyBarChart(_ weekly: WeeklyStatsDTO) -> some View {
        FTCard {
            Text("Калории по дням")
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(FTTheme.text)

            if let days = weekly.daily, !days.isEmpty {
                let maxCal = days.compactMap(\.calories).max() ?? 1

                HStack(alignment: .bottom, spacing: 6) {
                    ForEach(days) { day in
                        let cal = day.calories ?? 0
                        let normalizedHeight = maxCal > 0 ? CGFloat(cal / maxCal) * 130 : 0

                        VStack(spacing: 4) {
                            Text("\(Int(cal))")
                                .font(.system(size: 9, weight: .semibold))
                                .foregroundColor(FTTheme.muted)
                                .lineLimit(1)
                                .minimumScaleFactor(0.7)

                            RoundedRectangle(cornerRadius: 6)
                                .fill(barColor(for: cal, max: maxCal))
                                .frame(height: max(6, normalizedHeight))

                            Text(shortDay(day.date))
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(FTTheme.muted)
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
                .frame(height: 170)
                .padding(.top, 4)
            } else {
                emptyState(text: "Нет данных")
            }
        }
    }

    private func weeklySummaryCard(_ summary: WeeklyStatsDTO.WeeklySummary) -> some View {
        FTCard {
            Text("Итоги недели")
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(FTTheme.text)

            HStack(spacing: 10) {
                AnalyticsStat(
                    icon: "flame",
                    value: "\(Int(summary.avg_calories ?? 0))",
                    label: "Среднее ккал",
                    color: FTTheme.protein
                )

                AnalyticsStat(
                    icon: "checkmark.circle",
                    value: "\(summary.days_with_goal ?? 0)",
                    label: "Дней с целью",
                    color: FTTheme.success
                )

                AnalyticsStat(
                    icon: "fork.knife",
                    value: "\(summary.total_meals ?? 0)",
                    label: "Приёмов пищи",
                    color: FTTheme.fats
                )
            }
        }
    }

    // MARK: - Monthly Content

    @ViewBuilder
    private var monthlyContent: some View {
        // Month selector
        monthSelector

        if let monthly = monthlyStats {
            // Weekly breakdown chart
            if let weeks = monthly.weeks, !weeks.isEmpty {
                monthlyWeeksChart(weeks)
            }

            // Monthly totals
            monthlyTotalsCard(monthly)

            // Monthly summary
            if let summary = monthly.summary {
                monthlySummaryCard(summary)
            }
        } else {
            emptyState(text: "Нет данных за месяц")
        }
    }

    private var monthSelector: some View {
        HStack {
            Button {
                goToPreviousMonth()
                Task { await loadMonthly() }
            } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(FTTheme.text.opacity(0.7))
                    .padding(10)
                    .background(FTTheme.fill)
                    .clipShape(Circle())
            }

            Spacer()

            Text(monthYearLabel)
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(FTTheme.text)

            Spacer()

            Button {
                goToNextMonth()
                Task { await loadMonthly() }
            } label: {
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(isCurrentMonth ? FTTheme.text.opacity(0.25) : FTTheme.text.opacity(0.7))
                    .padding(10)
                    .background(FTTheme.fill)
                    .clipShape(Circle())
            }
            .disabled(isCurrentMonth)
        }
    }

    private func monthlyWeeksChart(_ weeks: [MonthlyStatsDTO.WeekData]) -> some View {
        FTCard {
            Text("Средние калории по неделям")
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(FTTheme.text)

            let maxCal = weeks.compactMap(\.avg_calories).max() ?? 1

            VStack(spacing: 10) {
                ForEach(weeks) { week in
                    let cal = week.avg_calories ?? 0
                    let ratio = maxCal > 0 ? CGFloat(cal / maxCal) : 0

                    HStack(spacing: 10) {
                        Text("Н\(week.week_number)")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(FTTheme.muted)
                            .frame(width: 28, alignment: .leading)

                        GeometryReader { geo in
                            ZStack(alignment: .leading) {
                                RoundedRectangle(cornerRadius: 6)
                                    .fill(FTTheme.fill)
                                    .frame(height: 24)

                                RoundedRectangle(cornerRadius: 6)
                                    .fill(barGradient)
                                    .frame(width: max(4, geo.size.width * ratio), height: 24)
                            }
                        }
                        .frame(height: 24)

                        Text("\(Int(cal))")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(FTTheme.text)
                            .frame(width: 44, alignment: .trailing)
                    }

                    HStack(spacing: 10) {
                        Spacer()
                            .frame(width: 28)
                        Text(weekDateRange(week))
                            .font(.system(size: 10))
                            .foregroundColor(FTTheme.muted)
                        Spacer()
                        if let meals = week.total_meals {
                            Text("\(meals) приёмов")
                                .font(.system(size: 10))
                                .foregroundColor(FTTheme.muted)
                                .frame(width: 44, alignment: .trailing)
                        }
                    }
                }
            }
        }
    }

    private func monthlyTotalsCard(_ monthly: MonthlyStatsDTO) -> some View {
        FTCard {
            Text("Итоги месяца")
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(FTTheme.text)

            if let totals = monthly.totals {
                VStack(spacing: 10) {
                    HStack(spacing: 10) {
                        monthlyTotalChip(
                            label: "Калории",
                            value: "\(Int(totals.calories ?? 0))",
                            unit: "ккал",
                            color: FTTheme.tint
                        )
                        monthlyTotalChip(
                            label: "Белки",
                            value: "\(Int(totals.protein ?? 0))",
                            unit: "г",
                            color: FTTheme.protein
                        )
                    }

                    HStack(spacing: 10) {
                        monthlyTotalChip(
                            label: "Углеводы",
                            value: "\(Int(totals.carbs ?? 0))",
                            unit: "г",
                            color: FTTheme.carbs
                        )
                        monthlyTotalChip(
                            label: "Жиры",
                            value: "\(Int(totals.fats ?? 0))",
                            unit: "г",
                            color: FTTheme.fats
                        )
                    }

                    if let mealsCount = totals.meals_count {
                        HStack {
                            Image(systemName: "fork.knife")
                                .font(.system(size: 12))
                                .foregroundColor(FTTheme.muted)
                            Text("Всего приёмов пищи:")
                                .font(.system(size: 13))
                                .foregroundColor(FTTheme.muted)
                            Spacer()
                            Text("\(mealsCount)")
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(FTTheme.text)
                        }
                        .padding(.top, 4)
                    }
                }
            }
        }
    }

    private func monthlySummaryCard(_ summary: MonthlyStatsDTO.MonthlySummary) -> some View {
        FTCard {
            Text("Сводка")
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(FTTheme.text)

            HStack(spacing: 10) {
                AnalyticsStat(
                    icon: "flame",
                    value: "\(Int(summary.avg_daily_calories ?? 0))",
                    label: "Среднее/день",
                    color: FTTheme.protein
                )

                AnalyticsStat(
                    icon: "calendar",
                    value: "\(summary.days_tracked ?? 0)",
                    label: "Дней записей",
                    color: FTTheme.fats
                )

                AnalyticsStat(
                    icon: "checkmark.circle",
                    value: "\(summary.days_with_goal ?? 0)",
                    label: "Дней с целью",
                    color: FTTheme.success
                )
            }
        }
    }

    // MARK: - Top Foods

    private var topFoodsCard: some View {
        FTCard {
            HStack {
                Text("Топ блюд за 30 дней")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(FTTheme.text)
                Spacer()
                Text("\(topFoods.count) блюд")
                    .font(.system(size: 12))
                    .foregroundColor(FTTheme.muted)
            }

            VStack(spacing: 8) {
                ForEach(Array(topFoods.enumerated()), id: \.offset) { idx, food in
                    HStack(spacing: 12) {
                        Text("\(idx + 1)")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(FTTheme.bg)
                            .frame(width: 24, height: 24)
                            .background(
                                idx < 3
                                    ? topFoodMedalColor(idx)
                                    : FTTheme.text.opacity(0.8)
                            )
                            .clipShape(Circle())

                        VStack(alignment: .leading, spacing: 2) {
                            Text(food.name)
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(FTTheme.text)
                                .lineLimit(1)
                            Text("~\(Int(food.avg_calories ?? 0)) ккал / порция")
                                .font(.system(size: 11))
                                .foregroundColor(FTTheme.muted)
                        }

                        Spacer()

                        VStack(alignment: .trailing, spacing: 2) {
                            Text("\(food.count)x")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(FTTheme.text)
                            Text("\(Int(food.total_calories ?? 0)) ккал")
                                .font(.system(size: 11))
                                .foregroundColor(FTTheme.muted)
                        }
                    }

                    if idx < topFoods.count - 1 {
                        Divider().opacity(0.25)
                    }
                }
            }
        }
    }

    // MARK: - Helpers

    private func monthlyTotalChip(label: String, value: String, unit: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(FTTheme.muted)
            HStack(alignment: .firstTextBaseline, spacing: 3) {
                Text(value)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(color)
                Text(unit)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(FTTheme.muted)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(FTTheme.fill)
        .cornerRadius(14)
    }

    private func emptyState(text: String) -> some View {
        FTCard {
            VStack(spacing: 10) {
                Image(systemName: "chart.bar.xaxis")
                    .font(.system(size: 28))
                    .foregroundColor(FTTheme.muted)
                Text(text)
                    .font(.system(size: 14))
                    .foregroundColor(FTTheme.muted)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 24)
        }
    }

    private func barColor(for calories: Double, max: Double) -> Color {
        let ratio = max > 0 ? calories / max : 0
        if ratio >= 0.85 {
            return FTTheme.text.opacity(0.85)
        } else if ratio >= 0.5 {
            return FTTheme.text.opacity(0.6)
        } else {
            return FTTheme.text.opacity(0.35)
        }
    }

    private var barGradient: LinearGradient {
        LinearGradient(
            colors: [FTTheme.text.opacity(0.7), FTTheme.text.opacity(0.5)],
            startPoint: .leading,
            endPoint: .trailing
        )
    }

    private func topFoodMedalColor(_ index: Int) -> Color {
        switch index {
        case 0: return Color(red: 1.0, green: 0.84, blue: 0.0)   // gold
        case 1: return Color(red: 0.75, green: 0.75, blue: 0.75) // silver
        case 2: return Color(red: 0.80, green: 0.50, blue: 0.20) // bronze
        default: return FTTheme.text.opacity(0.8)
        }
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

    private func weekDateRange(_ week: MonthlyStatsDTO.WeekData) -> String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        f.locale = Locale(identifier: "ru_RU")

        let display = DateFormatter()
        display.dateFormat = "d MMM"
        display.locale = Locale(identifier: "ru_RU")

        guard let start = f.date(from: week.start_date),
              let end = f.date(from: week.end_date) else {
            return "\(week.start_date) - \(week.end_date)"
        }
        return "\(display.string(from: start)) - \(display.string(from: end))"
    }

    private var monthYearLabel: String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "ru_RU")
        f.dateFormat = "LLLL yyyy"
        var components = DateComponents()
        components.year = selectedYear
        components.month = selectedMonth
        components.day = 1
        guard let date = Calendar.current.date(from: components) else {
            return "\(selectedMonth)/\(selectedYear)"
        }
        return f.string(from: date).capitalized
    }

    private var isCurrentMonth: Bool {
        let now = Date()
        let cal = Calendar.current
        return selectedYear == cal.component(.year, from: now)
            && selectedMonth == cal.component(.month, from: now)
    }

    private func goToPreviousMonth() {
        if selectedMonth == 1 {
            selectedMonth = 12
            selectedYear -= 1
        } else {
            selectedMonth -= 1
        }
    }

    private func goToNextMonth() {
        guard !isCurrentMonth else { return }
        if selectedMonth == 12 {
            selectedMonth = 1
            selectedYear += 1
        } else {
            selectedMonth += 1
        }
    }

    // MARK: - Data Loading

    private func loadData() async {
        isLoading = true

        switch selectedTab {
        case .week:
            async let weeklyTask = APIClient.shared.getWeeklyStats()
            async let streakTask = APIClient.shared.getStreak()
            async let topFoodsTask = APIClient.shared.getTopFoods(days: 30, limit: 10)

            weeklyStats = try? await weeklyTask
            streak = try? await streakTask
            topFoods = (try? await topFoodsTask) ?? []

        case .month:
            async let monthlyTask = APIClient.shared.getMonthlyStats(year: selectedYear, month: selectedMonth)
            async let streakTask = APIClient.shared.getStreak()
            async let topFoodsTask = APIClient.shared.getTopFoods(days: 30, limit: 10)

            monthlyStats = try? await monthlyTask
            streak = try? await streakTask
            topFoods = (try? await topFoodsTask) ?? []
        }

        isLoading = false
    }

    private func loadMonthly() async {
        isLoading = true
        monthlyStats = try? await APIClient.shared.getMonthlyStats(year: selectedYear, month: selectedMonth)
        isLoading = false
    }
}

// MARK: - Period Enum

private enum AnalyticsPeriod: String, CaseIterable {
    case week
    case month

    var title: String {
        switch self {
        case .week: return "Неделя"
        case .month: return "Месяц"
        }
    }
}

// MARK: - Analytics Stat Sub-view

private struct AnalyticsStat: View {
    let icon: String
    let value: String
    let label: String
    let color: Color

    var body: some View {
        VStack(spacing: 6) {
            RoundedRectangle(cornerRadius: 12)
                .fill(color.opacity(0.12))
                .frame(width: 36, height: 36)
                .overlay(
                    Image(systemName: icon)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(color)
                )

            Text(value)
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(FTTheme.text)

            Text(label)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(FTTheme.muted)
                .multilineTextAlignment(.center)
                .lineLimit(2)
                .minimumScaleFactor(0.8)
        }
        .frame(maxWidth: .infinity)
    }
}
