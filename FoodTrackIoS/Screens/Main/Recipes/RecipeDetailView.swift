import SwiftUI

struct RecipeDetailView: View {
    let recipe: Recipe
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {

                // Верх: "картинка"
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

                // Заголовок
                VStack(alignment: .leading, spacing: 6) {
                    Text(recipe.title)
                        .font(.system(size: 26, weight: .semibold))
                    Text(recipe.subtitle)
                        .font(.system(size: 13))
                        .foregroundColor(FTTheme.muted)
                }

                // Короткие метрики
                HStack(spacing: 10) {
                    metricChip("\(recipe.kcal) ккал")
                    metricChip("Б \(recipe.protein)")
                    metricChip("Ж \(recipe.fat)")
                    metricChip("У \(recipe.carbs)")
                    Spacer()
                    metricChip("\(recipe.timeMin) мин", icon: "clock")
                }

                // Ингредиенты
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

                // Шаги
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

                // Кнопка (статично)
                PrimaryButton(title: "Добавить в дневник") {
                    // Пока заглушка: позже откроем sheet и выберем приём пищи
                }
                .padding(.top, 6)

                Text("Пока это статичный фронт. Позже подключим реальное добавление и расчёты.")
                    .font(.system(size: 12))
                    .foregroundColor(FTTheme.muted)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.top, 10)

                Spacer(minLength: 20)
            }
            .padding(.horizontal, 18)
            .padding(.top, 14)
        }
        .background(FTTheme.bg)
        .navigationBarHidden(true)
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
