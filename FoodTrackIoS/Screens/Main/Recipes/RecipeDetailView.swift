import SwiftUI

struct RecipeDetailView: View {
    let recipe: Recipe
    @Environment(\.dismiss) private var dismiss
    @State private var showMealTypeSheet = false
    @State private var selectedMealType: MealType = .lunch
    @State private var isSaving = false
    @State private var saved = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {

                // Image area
                ZStack {
                    RoundedRectangle(cornerRadius: 22)
                        .fill(Color.gray.opacity(0.12))
                        .frame(height: 190)
                        .overlay(
                            Image(systemName: recipe.imageSymbol)
                                .font(.system(size: 44, weight: .semibold))
                                .foregroundColor(.black.opacity(0.75))
                        )

                    HStack {
                        Button {
                            dismiss()
                        } label: {
                            Image(systemName: "chevron.left")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.black)
                                .padding(12)
                                .background(Color.white.opacity(0.95))
                                .clipShape(Circle())
                                .overlay(Circle().stroke(FTTheme.border, lineWidth: 1))
                        }
                        Spacer()
                    }
                    .padding(14)
                }

                // Title
                VStack(alignment: .leading, spacing: 6) {
                    Text(recipe.title)
                        .font(.system(size: 26, weight: .semibold))
                    Text(recipe.subtitle)
                        .font(.system(size: 13))
                        .foregroundColor(FTTheme.muted)
                }

                // Metrics
                HStack(spacing: 10) {
                    metricChip("\(recipe.kcal) ккал")
                    metricChip("Б \(recipe.protein)")
                    metricChip("Ж \(recipe.fat)")
                    metricChip("У \(recipe.carbs)")
                    Spacer()
                    metricChip("\(recipe.timeMin) мин", icon: "clock")
                }

                // Ingredients
                sectionTitle("Ингредиенты")
                FTCard {
                    VStack(alignment: .leading, spacing: 10) {
                        ForEach(recipe.ingredients, id: \.self) { item in
                            HStack(alignment: .top, spacing: 10) {
                                Circle().fill(Color.black.opacity(0.85)).frame(width: 6, height: 6).padding(.top, 6)
                                Text(item)
                                    .font(.system(size: 15))
                                    .foregroundColor(Color.black.opacity(0.82))
                            }
                        }
                    }
                }

                // Steps
                sectionTitle("Приготовление")
                FTCard {
                    VStack(alignment: .leading, spacing: 12) {
                        ForEach(Array(recipe.steps.enumerated()), id: \.offset) { idx, step in
                            HStack(alignment: .top, spacing: 12) {
                                Text("\(idx + 1)")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.white)
                                    .frame(width: 26, height: 26)
                                    .background(Color.black)
                                    .clipShape(Circle())

                                Text(step)
                                    .font(.system(size: 15))
                                    .foregroundColor(Color.black.opacity(0.82))
                                    .fixedSize(horizontal: false, vertical: true)

                                Spacer()
                            }
                        }
                    }
                }

                // Add to diary
                if saved {
                    HStack {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(FTTheme.success)
                        Text("Добавлено в дневник!")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(FTTheme.success)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(FTTheme.success.opacity(0.1))
                    .cornerRadius(FTTheme.corner)
                    .padding(.top, 6)
                } else {
                    PrimaryButton(
                        title: isSaving ? "Сохранение..." : "Добавить в дневник",
                        disabled: isSaving
                    ) {
                        showMealTypeSheet = true
                    }
                    .padding(.top, 6)
                }

                Spacer(minLength: 20)
            }
            .padding(.horizontal, FTTheme.hPad)
            .padding(.top, 14)
        }
        .background(FTTheme.bg)
        .navigationBarHidden(true)
        .confirmationDialog("Тип приёма пищи", isPresented: $showMealTypeSheet) {
            ForEach(MealType.allCases, id: \.self) { type in
                Button(type.title) {
                    selectedMealType = type
                    addToDiary()
                }
            }
            Button("Отмена", role: .cancel) {}
        }
    }

    private func addToDiary() {
        isSaving = true
        Task {
            let req = CreateMealRequest(
                name: recipe.title,
                meal_type: selectedMealType.rawValue,
                calories: Double(recipe.kcal),
                protein: Double(recipe.protein),
                carbs: Double(recipe.carbs),
                fats: Double(recipe.fat),
                portions: 1,
                ai_confidence: nil,
                health_score: nil,
                ai_advice: nil,
                tags: nil
            )
            _ = try? await APIClient.shared.createMeal(req)
            isSaving = false
            saved = true
        }
    }

    private func sectionTitle(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 18, weight: .semibold))
            .padding(.top, 6)
    }

    private func metricChip(_ text: String, icon: String? = nil) -> some View {
        HStack(spacing: 6) {
            if let icon {
                Image(systemName: icon)
                    .font(.system(size: 12, weight: .semibold))
            }
            Text(text)
                .font(.system(size: 12, weight: .semibold))
        }
        .foregroundColor(.black.opacity(0.78))
        .padding(.horizontal, 10)
        .padding(.vertical, 8)
        .background(Color.white)
        .overlay(
            RoundedRectangle(cornerRadius: 999).stroke(FTTheme.border, lineWidth: 1)
        )
        .cornerRadius(999)
    }
}
