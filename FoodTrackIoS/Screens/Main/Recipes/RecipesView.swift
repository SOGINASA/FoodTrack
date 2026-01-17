import SwiftUI

struct RecipesView: View {
    @State private var query: String = ""
    private let all = RecipeStore.all

    private var filtered: [Recipe] {
        let q = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        if q.isEmpty { return all }
        return all.filter {
            $0.title.lowercased().contains(q) ||
            $0.subtitle.lowercased().contains(q)
        }
    }

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 14) {

                // Заголовок
                VStack(alignment: .leading, spacing: 6) {
                    Text("Рецепты")
                        .font(.system(size: 26, weight: .semibold))
                    Text("Выберите рецепт — откроется карточка с БЖУ и шагами.")
                        .font(.system(size: 13))
                        .foregroundColor(FTTheme.muted)
                }

                // Поиск
                HStack(spacing: 10) {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(FTTheme.muted)

                    TextField("Поиск по рецептам…", text: $query)
                        .font(.system(size: 16))
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled(true)

                    if !query.isEmpty {
                        Button {
                            query = ""
                        } label: {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(FTTheme.muted)
                        }
                    }
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 12)
                .background(Color.white)
                .overlay(
                    RoundedRectangle(cornerRadius: FTTheme.corner)
                        .stroke(FTTheme.border, lineWidth: 1)
                )

                // Список
                ScrollView {
                    VStack(spacing: 12) {
                        ForEach(filtered) { recipe in
                            NavigationLink(value: recipe) {
                                RecipeRow(recipe: recipe)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.top, 2)
                }
            }
            .padding(.horizontal, 18)
            .padding(.vertical, 16)
            .background(FTTheme.bg)
            .navigationDestination(for: Recipe.self) { recipe in
                RecipeDetailView(recipe: recipe)
            }
            .navigationBarHidden(true)
        }
    }
}

private struct RecipeRow: View {
    let recipe: Recipe

    var body: some View {
        HStack(spacing: 12) {

            // Мини-"картинка"
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.gray.opacity(0.12))
                .frame(width: 72, height: 72)
                .overlay(
                    Image(systemName: recipe.imageSymbol)
                        .font(.system(size: 22, weight: .semibold))
                        .foregroundColor(.black.opacity(0.75))
                )

            VStack(alignment: .leading, spacing: 6) {
                Text(recipe.title)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.black)

                Text(recipe.subtitle)
                    .font(.system(size: 12))
                    .foregroundColor(FTTheme.muted)
                    .lineLimit(2)

                HStack(spacing: 10) {
                    chip("\(recipe.kcal) ккал")
                    chip("Б \(recipe.protein)  Ж \(recipe.fat)  У \(recipe.carbs)")
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(FTTheme.muted)
        }
        .padding(14)
        .background(Color.white)
        .overlay(
            RoundedRectangle(cornerRadius: FTTheme.corner)
                .stroke(FTTheme.border, lineWidth: 1)
        )
        .cornerRadius(FTTheme.corner)
    }

    private func chip(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 11, weight: .semibold))
            .foregroundColor(.black.opacity(0.75))
            .padding(.horizontal, 9)
            .padding(.vertical, 6)
            .background(Color.gray.opacity(0.10))
            .cornerRadius(999)
    }
}
