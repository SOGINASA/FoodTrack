import SwiftUI

struct EditProfileView: View {
    @EnvironmentObject private var appState: AppState
    @Environment(\.dismiss) private var dismiss

    @State private var fullName: String = ""
    @State private var nickname: String = ""
    @State private var gender: String = ""
    @State private var birthYear: String = ""
    @State private var heightCm: String = ""
    @State private var weightKg: String = ""
    @State private var targetWeightKg: String = ""
    @State private var workoutsPerWeek: String = ""
    @State private var diet: String = "none"
    @State private var mealsPerDay: Int = 3

    @State private var isSaving = false
    @State private var error: String?
    @State private var showSuccess = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {

                // Header
                HStack {
                    Button { dismiss() } label: {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(FTTheme.text)
                            .padding(12)
                            .background(FTTheme.fill)
                            .clipShape(Circle())
                    }
                    Spacer()
                    Text("Редактировать профиль")
                        .font(.system(size: 17, weight: .semibold))
                    Spacer()
                    // Balance spacer
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
                        Text("Профиль обновлён")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(FTTheme.success)
                    }
                    .padding(12)
                    .frame(maxWidth: .infinity)
                    .background(FTTheme.success.opacity(0.08))
                    .cornerRadius(12)
                }

                // Personal info
                FTCard {
                    Text("Личные данные")
                        .font(.system(size: 16, weight: .semibold))

                    FTTextField(title: "Полное имя", text: $fullName)
                    FTTextField(title: "Никнейм", text: $nickname)

                    VStack(alignment: .leading, spacing: 6) {
                        Text("Пол")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(FTTheme.muted)
                        HStack(spacing: 8) {
                            genderButton("male", label: "Муж")
                            genderButton("female", label: "Жен")
                            genderButton("other", label: "Другой")
                        }
                    }

                    FTTextField(title: "Год рождения", text: $birthYear, keyboard: .numberPad)
                }

                // Body
                FTCard {
                    Text("Параметры тела")
                        .font(.system(size: 16, weight: .semibold))

                    HStack(spacing: 12) {
                        FTTextField(title: "Рост (см)", text: $heightCm, keyboard: .decimalPad)
                        FTTextField(title: "Вес (кг)", text: $weightKg, keyboard: .decimalPad)
                    }

                    HStack(spacing: 12) {
                        FTTextField(title: "Цель (кг)", text: $targetWeightKg, keyboard: .decimalPad)
                        FTTextField(title: "Тренировки/нед", text: $workoutsPerWeek, keyboard: .numberPad)
                    }
                }

                // Diet
                FTCard {
                    Text("Питание")
                        .font(.system(size: 16, weight: .semibold))

                    VStack(alignment: .leading, spacing: 6) {
                        Text("Диета")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(FTTheme.muted)
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                dietChip("none", label: "Нет")
                                dietChip("keto", label: "Кето")
                                dietChip("vegetarian", label: "Вегетарианство")
                                dietChip("vegan", label: "Веган")
                                dietChip("halal", label: "Халяль")
                                dietChip("lowcarb", label: "Низкоугл.")
                            }
                        }
                    }

                    VStack(alignment: .leading, spacing: 6) {
                        Text("Приёмов пищи в день: \(mealsPerDay)")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(FTTheme.muted)
                        HStack(spacing: 8) {
                            ForEach(1...6, id: \.self) { n in
                                Button {
                                    mealsPerDay = n
                                } label: {
                                    Text("\(n)")
                                        .font(.system(size: 14, weight: .semibold))
                                        .foregroundColor(mealsPerDay == n ? Color(.systemBackground) : FTTheme.text.opacity(0.7))
                                        .frame(width: 38, height: 38)
                                        .background(mealsPerDay == n ? FTTheme.tint : FTTheme.fill)
                                        .cornerRadius(10)
                                }
                            }
                        }
                    }
                }

                // Save button
                PrimaryButton(
                    title: isSaving ? "Сохранение..." : "Сохранить",
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
        .onAppear { loadFromUser() }
    }

    private func genderButton(_ value: String, label: String) -> some View {
        Button {
            gender = value
        } label: {
            Text(label)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(gender == value ? Color(.systemBackground) : FTTheme.text.opacity(0.7))
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(gender == value ? FTTheme.tint : FTTheme.fill)
                .cornerRadius(12)
        }
    }

    private func dietChip(_ value: String, label: String) -> some View {
        Button {
            diet = value
        } label: {
            Text(label)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(diet == value ? Color(.systemBackground) : FTTheme.text.opacity(0.7))
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(diet == value ? FTTheme.tint : FTTheme.fill)
                .cornerRadius(999)
        }
    }

    private func loadFromUser() {
        guard let u = appState.user else { return }
        fullName = u.full_name ?? ""
        nickname = u.nickname ?? ""
        gender = u.gender ?? ""
        birthYear = u.birth_year.map { String($0) } ?? ""
        heightCm = u.height_cm.map { String(Int($0)) } ?? ""
        weightKg = u.weight_kg.map { String(Int($0)) } ?? ""
        targetWeightKg = u.target_weight_kg.map { String(Int($0)) } ?? ""
        workoutsPerWeek = u.workouts_per_week.map { String($0) } ?? ""
        diet = u.diet ?? "none"
        mealsPerDay = u.meals_per_day ?? 3
    }

    private func save() async {
        isSaving = true
        error = nil
        showSuccess = false

        var req = ProfileUpdateRequest()
        req.full_name = fullName.isEmpty ? nil : fullName
        req.nickname = nickname.isEmpty ? nil : nickname
        req.gender = gender.isEmpty ? nil : gender
        req.birth_year = Int(birthYear)
        req.height_cm = Double(heightCm)
        req.weight_kg = Double(weightKg)
        req.target_weight_kg = Double(targetWeightKg)
        req.workouts_per_week = Int(workoutsPerWeek)
        req.diet = diet
        req.meals_per_day = mealsPerDay

        do {
            let updated = try await APIClient.shared.updateProfile(req)
            appState.user = updated
            showSuccess = true
        } catch {
            self.error = error.localizedDescription
        }
        isSaving = false
    }
}
