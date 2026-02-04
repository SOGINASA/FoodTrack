import SwiftUI

struct MealPlansView: View {
    @State private var plans: [MealPlanDTO] = []
    @State private var isLoading = true
    @State private var selectedDate = Date()

    private var dateString: String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: selectedDate)
    }

    private var displayDate: String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "ru_RU")
        f.dateFormat = "d MMMM, EEEE"
        return f.string(from: selectedDate)
    }

    private var grouped: [String: [MealPlanDTO]] {
        Dictionary(grouping: plans) { $0.type ?? "other" }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {

                    FTHeader(
                        title: "План питания",
                        subtitle: "Запланированные рецепты на неделю"
                    )
                    .padding(.top, 10)

                    // Date navigation
                    HStack {
                        Button {
                            selectedDate = Calendar.current.date(byAdding: .day, value: -1, to: selectedDate) ?? selectedDate
                        } label: {
                            Image(systemName: "chevron.left")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(FTTheme.text.opacity(0.7))
                                .padding(10)
                                .background(FTTheme.fill)
                                .clipShape(Circle())
                        }

                        Spacer()

                        VStack(spacing: 2) {
                            Text(displayDate)
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(FTTheme.text)
                        }

                        Spacer()

                        Button {
                            selectedDate = Calendar.current.date(byAdding: .day, value: 1, to: selectedDate) ?? selectedDate
                        } label: {
                            Image(systemName: "chevron.right")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(FTTheme.text.opacity(0.7))
                                .padding(10)
                                .background(FTTheme.fill)
                                .clipShape(Circle())
                        }
                    }

                    // Week day chips
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(-3...3, id: \.self) { offset in
                                let date = Calendar.current.date(byAdding: .day, value: offset, to: Date()) ?? Date()
                                let isSelected = Calendar.current.isDate(date, inSameDayAs: selectedDate)
                                Button {
                                    selectedDate = date
                                } label: {
                                    VStack(spacing: 4) {
                                        Text(dayName(date))
                                            .font(.system(size: 11, weight: .medium))
                                        Text("\(Calendar.current.component(.day, from: date))")
                                            .font(.system(size: 16, weight: .semibold))
                                    }
                                    .foregroundColor(isSelected ? Color(.systemBackground) : FTTheme.text)
                                    .frame(width: 48, height: 60)
                                    .background(isSelected ? FTTheme.tint : FTTheme.card)
                                    .cornerRadius(14)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 14)
                                            .stroke(isSelected ? FTTheme.tint : FTTheme.border, lineWidth: 1)
                                    )
                                }
                            }
                        }
                    }

                    if isLoading {
                        ProgressView().tint(FTTheme.tint)
                            .frame(maxWidth: .infinity)
                            .padding(.top, 30)
                    } else if plans.isEmpty {
                        VStack(spacing: 12) {
                            Image(systemName: "calendar")
                                .font(.system(size: 36))
                                .foregroundColor(FTTheme.muted)
                            Text("Нет запланированных блюд")
                                .font(.system(size: 15, weight: .medium))
                                .foregroundColor(FTTheme.muted)
                            Text("Добавьте рецепты из каталога")
                                .font(.system(size: 13))
                                .foregroundColor(FTTheme.muted.opacity(0.7))
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.top, 40)
                    } else {
                        ForEach(MealType.allCases, id: \.self) { type in
                            let typePlans = grouped[type.rawValue] ?? []
                            if !typePlans.isEmpty {
                                VStack(alignment: .leading, spacing: 10) {
                                    Text(type.title)
                                        .font(.system(size: 15, weight: .semibold))
                                        .foregroundColor(FTTheme.text)

                                    ForEach(typePlans) { plan in
                                        MealPlanRow(plan: plan) {
                                            await deletePlan(plan.id)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    Spacer(minLength: 18)
                }
                .padding(.horizontal, FTTheme.hPad)
                .padding(.bottom, 18)
            }
            .background(FTTheme.bg)
            .navigationBarHidden(true)
        }
        .task { await loadPlans() }
        .onChange(of: selectedDate) { _ in
            Task { await loadPlans() }
        }
    }

    private func loadPlans() async {
        isLoading = true
        plans = (try? await APIClient.shared.getMealPlans(date: dateString)) ?? []
        isLoading = false
    }

    private func deletePlan(_ id: Int) async {
        try? await APIClient.shared.deleteMealPlan(id)
        plans.removeAll { $0.id == id }
    }

    private func dayName(_ date: Date) -> String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "ru_RU")
        f.dateFormat = "EE"
        return f.string(from: date).uppercased()
    }
}

// MARK: - Plan Row

private struct MealPlanRow: View {
    let plan: MealPlanDTO
    let onDelete: () async -> Void

    var body: some View {
        HStack(spacing: 12) {
            RoundedRectangle(cornerRadius: 14)
                .fill(FTTheme.fill)
                .frame(width: 56, height: 56)
                .overlay(
                    Image(systemName: "fork.knife")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundColor(FTTheme.text.opacity(0.75))
                )

            VStack(alignment: .leading, spacing: 4) {
                Text(plan.name ?? "Рецепт")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(FTTheme.text)

                HStack(spacing: 8) {
                    if let cal = plan.calories {
                        Text("\(Int(cal)) ккал")
                            .font(.system(size: 12))
                            .foregroundColor(FTTheme.muted)
                    }
                    if let p = plan.protein, let f = plan.fats, let c = plan.carbs {
                        Text("Б\(Int(p)) Ж\(Int(f)) У\(Int(c))")
                            .font(.system(size: 12))
                            .foregroundColor(FTTheme.muted)
                    }
                }
            }

            Spacer()

            if plan.is_completed == true {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(FTTheme.success)
                    .font(.system(size: 18))
            }

            Button {
                Task { await onDelete() }
            } label: {
                Image(systemName: "trash")
                    .font(.system(size: 14))
                    .foregroundColor(.red.opacity(0.7))
                    .padding(8)
                    .background(FTTheme.fill)
                    .clipShape(Circle())
            }
        }
        .padding(12)
        .background(FTTheme.card)
        .overlay(
            RoundedRectangle(cornerRadius: FTTheme.corner)
                .stroke(FTTheme.border, lineWidth: 1)
        )
        .cornerRadius(FTTheme.corner)
    }
}
