import SwiftUI

struct EditGoalsView: View {
    @EnvironmentObject private var appState: AppState
    @Environment(\.dismiss) private var dismiss

    @State private var caloriesGoal: String = ""
    @State private var proteinGoal: String = ""
    @State private var carbsGoal: String = ""
    @State private var fatsGoal: String = ""
    @State private var targetWeight: String = ""
    @State private var activityLevel: String = "moderate"
    @State private var dietType: String = "balanced"

    @State private var isSaving = false
    @State private var error: String?
    @State private var showSuccess = false

    private let activityLevels = [
        ("sedentary", "Сидячий"),
        ("light", "Лёгкий"),
        ("moderate", "Умеренный"),
        ("active", "Активный"),
        ("intense", "Интенсивный"),
    ]

    private let dietTypes = [
        ("balanced", "Сбалансированная"),
        ("low-carb", "Низкоуглеводная"),
        ("high-protein", "Высокобелковая"),
        ("keto", "Кето"),
        ("low-fat", "Низкожировая"),
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {

                // Header
                HStack {
                    Button { dismiss() } label: {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.black)
                            .padding(12)
                            .background(Color.gray.opacity(0.10))
                            .clipShape(Circle())
                    }
                    Spacer()
                    Text("Цели питания")
                        .font(.system(size: 17, weight: .semibold))
                    Spacer()
                    Color.clear.frame(width: 40, height: 40)
                }

                if let error {
                    Text(error)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.red.opacity(0.9))
                        .padding(12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.red.opacity(0.06))
                        .cornerRadius(12)
                }

                if showSuccess {
                    HStack(spacing: 8) {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(FTTheme.success)
                        Text("Цели обновлены")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(FTTheme.success)
                    }
                    .padding(12)
                    .frame(maxWidth: .infinity)
                    .background(FTTheme.success.opacity(0.08))
                    .cornerRadius(12)
                }

                // Macros
                FTCard {
                    Text("Дневные макросы")
                        .font(.system(size: 16, weight: .semibold))

                    FTTextField(title: "Калории (ккал)", text: $caloriesGoal, keyboard: .numberPad)

                    HStack(spacing: 12) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Белки (г)")
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(FTTheme.muted)
                            TextField("140", text: $proteinGoal)
                                .keyboardType(.numberPad)
                                .font(.system(size: 15))
                                .padding(12)
                                .background(Color.gray.opacity(0.08))
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(FTTheme.protein.opacity(0.3), lineWidth: 1)
                                )
                        }
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Углеводы (г)")
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(FTTheme.muted)
                            TextField("220", text: $carbsGoal)
                                .keyboardType(.numberPad)
                                .font(.system(size: 15))
                                .padding(12)
                                .background(Color.gray.opacity(0.08))
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(FTTheme.carbs.opacity(0.3), lineWidth: 1)
                                )
                        }
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Жиры (г)")
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(FTTheme.muted)
                            TextField("70", text: $fatsGoal)
                                .keyboardType(.numberPad)
                                .font(.system(size: 15))
                                .padding(12)
                                .background(Color.gray.opacity(0.08))
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(FTTheme.fats.opacity(0.3), lineWidth: 1)
                                )
                        }
                    }
                }

                // Target weight
                FTCard {
                    Text("Целевой вес")
                        .font(.system(size: 16, weight: .semibold))
                    FTTextField(title: "Вес (кг)", text: $targetWeight, keyboard: .decimalPad)
                }

                // Activity
                FTCard {
                    Text("Уровень активности")
                        .font(.system(size: 16, weight: .semibold))

                    VStack(spacing: 8) {
                        ForEach(activityLevels, id: \.0) { value, label in
                            Button {
                                activityLevel = value
                            } label: {
                                HStack {
                                    Text(label)
                                        .font(.system(size: 14, weight: .medium))
                                        .foregroundColor(.black.opacity(0.8))
                                    Spacer()
                                    if activityLevel == value {
                                        Image(systemName: "checkmark")
                                            .font(.system(size: 14, weight: .bold))
                                            .foregroundColor(.black)
                                    }
                                }
                                .padding(12)
                                .background(activityLevel == value ? Color.black.opacity(0.06) : Color.gray.opacity(0.04))
                                .cornerRadius(12)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(activityLevel == value ? Color.black.opacity(0.2) : FTTheme.border, lineWidth: 1)
                                )
                            }
                        }
                    }
                }

                // Diet type
                FTCard {
                    Text("Тип диеты")
                        .font(.system(size: 16, weight: .semibold))

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(dietTypes, id: \.0) { value, label in
                                Button {
                                    dietType = value
                                } label: {
                                    Text(label)
                                        .font(.system(size: 13, weight: .semibold))
                                        .foregroundColor(dietType == value ? .white : .black.opacity(0.7))
                                        .padding(.horizontal, 14)
                                        .padding(.vertical, 8)
                                        .background(dietType == value ? Color.black : Color.gray.opacity(0.10))
                                        .cornerRadius(999)
                                }
                            }
                        }
                    }
                }

                // Save
                PrimaryButton(
                    title: isSaving ? "Сохранение..." : "Сохранить цели",
                    disabled: isSaving
                ) {
                    Task { await save() }
                }

                Spacer(minLength: 20)
            }
            .padding(.horizontal, FTTheme.hPad)
            .padding(.top, 14)
        }
        .background(FTTheme.bg)
        .navigationBarHidden(true)
        .onAppear { loadFromGoals() }
    }

    private func loadFromGoals() {
        guard let g = appState.goals else { return }
        caloriesGoal = String(g.caloriesGoal)
        proteinGoal = String(g.proteinGoal)
        carbsGoal = String(g.carbsGoal)
        fatsGoal = String(g.fatsGoal)
        targetWeight = g.target_weight.map { String(Int($0)) } ?? ""
        activityLevel = g.activity_level ?? "moderate"
        dietType = g.diet_type ?? "balanced"
    }

    private func save() async {
        isSaving = true
        error = nil
        showSuccess = false

        var req = UpdateGoalsRequest()
        req.calories_goal = Int(caloriesGoal)
        req.protein_goal = Int(proteinGoal)
        req.carbs_goal = Int(carbsGoal)
        req.fats_goal = Int(fatsGoal)
        req.target_weight = Double(targetWeight)
        req.activity_level = activityLevel
        req.diet_type = dietType

        do {
            let updated = try await APIClient.shared.updateGoals(req)
            appState.goals = updated
            showSuccess = true
        } catch {
            self.error = error.localizedDescription
        }
        isSaving = false
    }
}
