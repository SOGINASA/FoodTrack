import SwiftUI

struct RecipesView: View {
    @State private var query = ""
    @State private var recipes: [RecipeDTO] = []
    @State private var isLoading = true
    @State private var useFallback = false

    // Fallback local recipes
    private let localRecipes = RecipeStore.all

    private var filteredLocal: [Recipe] {
        let q = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        if q.isEmpty { return localRecipes }
        return localRecipes.filter {
            $0.title.lowercased().contains(q) ||
            $0.subtitle.lowercased().contains(q)
        }
    }

    private var filteredAPI: [RecipeDTO] {
        let q = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        if q.isEmpty { return recipes }
        return recipes.filter {
            $0.name.lowercased().contains(q) ||
            ($0.description?.lowercased().contains(q) ?? false)
        }
    }

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 14) {

                VStack(alignment: .leading, spacing: 6) {
                    Text("Рецепты")
                        .font(.system(size: 26, weight: .semibold))
                    Text("Выберите рецепт — откроется карточка с БЖУ и шагами")
                        .font(.system(size: 13))
                        .foregroundColor(FTTheme.muted)
                }

                // Search
                HStack(spacing: 10) {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(FTTheme.muted)

                    TextField("Поиск по рецептам...", text: $query)
                        .font(.system(size: 16))
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled(true)

                    if !query.isEmpty {
                        Button { query = "" } label: {
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

                // List
                ScrollView {
                    if isLoading {
                        ProgressView().tint(.black)
                            .frame(maxWidth: .infinity)
                            .padding(.top, 30)
                    } else if useFallback {
                        // Local recipes fallback
                        VStack(spacing: 12) {
                            ForEach(filteredLocal) { recipe in
                                NavigationLink(value: recipe) {
                                    RecipeRow(recipe: recipe)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(.top, 2)
                    } else {
                        // API recipes
                        VStack(spacing: 12) {
                            ForEach(filteredAPI) { recipe in
                                APIRecipeRow(recipe: recipe)
                            }
                        }
                        .padding(.top, 2)
                    }
                }
            }
            .padding(.horizontal, FTTheme.hPad)
            .padding(.vertical, 16)
            .background(FTTheme.bg)
            .navigationDestination(for: Recipe.self) { recipe in
                RecipeDetailView(recipe: recipe)
            }
            .navigationBarHidden(true)
        }
        .task { await loadRecipes() }
    }

    private func loadRecipes() async {
        isLoading = true
        do {
            recipes = try await APIClient.shared.getRecipes()
            useFallback = recipes.isEmpty
        } catch {
            useFallback = true
        }
        isLoading = false
    }
}

// MARK: - API Recipe Row

private struct APIRecipeRow: View {
    let recipe: RecipeDTO

    var body: some View {
        HStack(spacing: 12) {
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.gray.opacity(0.12))
                .frame(width: 72, height: 72)
                .overlay(
                    Image(systemName: "fork.knife")
                        .font(.system(size: 22, weight: .semibold))
                        .foregroundColor(.black.opacity(0.75))
                )

            VStack(alignment: .leading, spacing: 6) {
                Text(recipe.name)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.black)

                if let desc = recipe.description {
                    Text(desc)
                        .font(.system(size: 12))
                        .foregroundColor(FTTheme.muted)
                        .lineLimit(2)
                }

                HStack(spacing: 10) {
                    chip("\(Int(recipe.calories ?? 0)) ккал")
                    chip("Б \(Int(recipe.protein ?? 0))  Ж \(Int(recipe.fats ?? 0))  У \(Int(recipe.carbs ?? 0))")
                }
            }

            Spacer()

            if let time = recipe.preparation_time {
                Text("\(time) мин")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(FTTheme.muted)
            }
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

// Local recipe row (kept from original)
private struct RecipeRow: View {
    let recipe: Recipe

    var body: some View {
        HStack(spacing: 12) {
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
