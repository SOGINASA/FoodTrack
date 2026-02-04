import SwiftUI

struct TipsView: View {
    @State private var tips: [TipDTO] = []
    @State private var isLoading = true
    @State private var searchQuery = ""
    @State private var selectedCategory: TipCategory = .all
    @State private var selectedPriority: TipPriority = .all

    // MARK: - Filtered Tips

    private var filteredTips: [TipDTO] {
        let q = searchQuery.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        return tips.filter { tip in
            let matchesSearch = q.isEmpty
                || tip.title.lowercased().contains(q)
                || (tip.description?.lowercased().contains(q) ?? false)
            return matchesSearch
        }
    }

    // MARK: - Body

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 14) {
                FTHeader(
                    title: "Советы",
                    subtitle: "Персональные рекомендации по питанию"
                )

                // Search bar
                searchBar

                // Category chips
                categoryChips

                // Priority chips
                priorityChips

                // Content
                ScrollView {
                    if isLoading {
                        loadingView
                    } else if filteredTips.isEmpty {
                        emptyView
                    } else {
                        tipsListView
                    }
                }
            }
            .padding(.horizontal, FTTheme.hPad)
            .padding(.vertical, 16)
            .background(FTTheme.bg)
            .navigationBarHidden(true)
        }
        .task { await loadTips() }
    }

    // MARK: - Search Bar

    private var searchBar: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .foregroundColor(FTTheme.muted)

            TextField("Поиск по советам...", text: $searchQuery)
                .font(.system(size: 16))
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled(true)

            if !searchQuery.isEmpty {
                Button { searchQuery = "" } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(FTTheme.muted)
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .background(FTTheme.card)
        .overlay(
            RoundedRectangle(cornerRadius: FTTheme.corner)
                .stroke(FTTheme.border, lineWidth: 1)
        )
        .cornerRadius(FTTheme.corner)
    }

    // MARK: - Category Chips

    private var categoryChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(TipCategory.allCases, id: \.self) { category in
                    Button {
                        selectedCategory = category
                        Task { await loadTips() }
                    } label: {
                        HStack(spacing: 5) {
                            if let icon = category.icon {
                                Image(systemName: icon)
                                    .font(.system(size: 11))
                            }
                            Text(category.label)
                                .font(.system(size: 13, weight: .semibold))
                        }
                        .foregroundColor(
                            selectedCategory == category
                                ? FTTheme.bg
                                : FTTheme.text.opacity(0.75)
                        )
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(
                            selectedCategory == category
                                ? FTTheme.text
                                : FTTheme.fill
                        )
                        .cornerRadius(999)
                    }
                }
            }
        }
    }

    // MARK: - Priority Chips

    private var priorityChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(TipPriority.allCases, id: \.self) { priority in
                    Button {
                        selectedPriority = priority
                        Task { await loadTips() }
                    } label: {
                        HStack(spacing: 5) {
                            if let color = priority.color {
                                Circle()
                                    .fill(color)
                                    .frame(width: 8, height: 8)
                            }
                            Text(priority.label)
                                .font(.system(size: 13, weight: .semibold))
                        }
                        .foregroundColor(
                            selectedPriority == priority
                                ? FTTheme.bg
                                : FTTheme.text.opacity(0.75)
                        )
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(
                            selectedPriority == priority
                                ? FTTheme.text
                                : FTTheme.fill
                        )
                        .cornerRadius(999)
                    }
                }
            }
        }
    }

    // MARK: - Loading

    private var loadingView: some View {
        VStack(spacing: 12) {
            ProgressView().tint(FTTheme.tint)
            Text("Загрузка советов...")
                .font(.system(size: 13))
                .foregroundColor(FTTheme.muted)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 40)
    }

    // MARK: - Empty State

    private var emptyView: some View {
        VStack(spacing: 12) {
            Image(systemName: "lightbulb")
                .font(.system(size: 32))
                .foregroundColor(FTTheme.muted)

            Text("Советы не найдены")
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(FTTheme.text)

            Text("Попробуйте изменить фильтры или поисковый запрос")
                .font(.system(size: 13))
                .foregroundColor(FTTheme.muted)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 40)
    }

    // MARK: - Tips List

    private var tipsListView: some View {
        VStack(spacing: 12) {
            ForEach(filteredTips, id: \.safeId) { tip in
                TipCardView(tip: tip)
            }
        }
        .padding(.top, 2)
    }

    // MARK: - Data Loading

    private func loadTips() async {
        isLoading = true
        do {
            tips = try await APIClient.shared.getTips(
                category: selectedCategory.apiValue,
                priority: selectedPriority.apiValue
            )
        } catch {
            tips = []
        }
        isLoading = false
    }
}

// MARK: - Tip Card

private struct TipCardView: View {
    let tip: TipDTO

    var body: some View {
        FTCard {
            HStack(alignment: .top, spacing: 12) {
                // Icon
                RoundedRectangle(cornerRadius: 14)
                    .fill(FTTheme.fill)
                    .frame(width: 48, height: 48)
                    .overlay(
                        Image(systemName: iconName)
                            .font(.system(size: 20, weight: .semibold))
                            .foregroundColor(FTTheme.text.opacity(0.75))
                    )

                // Content
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text(tip.title)
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(FTTheme.text)
                            .lineLimit(2)
                            .fixedSize(horizontal: false, vertical: true)

                        Spacer()

                        // Priority badge
                        if let priority = tip.priority, !priority.isEmpty {
                            priorityBadge(priority)
                        }
                    }

                    if let desc = tip.description, !desc.isEmpty {
                        Text(desc)
                            .font(.system(size: 13))
                            .foregroundColor(FTTheme.muted)
                            .fixedSize(horizontal: false, vertical: true)
                    }

                    // Category chip
                    if let category = tip.category, !category.isEmpty {
                        HStack(spacing: 5) {
                            Image(systemName: TipCategory.iconFor(apiValue: category))
                                .font(.system(size: 10))
                            Text(TipCategory.labelFor(apiValue: category))
                                .font(.system(size: 11, weight: .semibold))
                        }
                        .foregroundColor(FTTheme.text.opacity(0.75))
                        .padding(.horizontal, 9)
                        .padding(.vertical, 5)
                        .background(FTTheme.fill)
                        .cornerRadius(999)
                    }
                }
            }
        }
    }

    // MARK: - Icon

    private var iconName: String {
        if let icon = tip.icon, !icon.isEmpty {
            return icon
        }
        if let category = tip.category {
            return TipCategory.iconFor(apiValue: category)
        }
        return "lightbulb"
    }

    // MARK: - Priority Badge

    private func priorityBadge(_ priority: String) -> some View {
        let (label, color) = priorityInfo(priority)
        return Text(label)
            .font(.system(size: 11, weight: .bold))
            .foregroundColor(color)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(color.opacity(0.15))
            .cornerRadius(999)
    }

    private func priorityInfo(_ priority: String) -> (String, Color) {
        switch priority.lowercased() {
        case "high":
            return ("Высокий", .red)
        case "medium":
            return ("Средний", .orange)
        case "low":
            return ("Низкий", .green)
        default:
            return (priority, FTTheme.muted)
        }
    }
}

// MARK: - Tip Category

private enum TipCategory: CaseIterable {
    case all
    case calories
    case protein
    case carbs
    case fats
    case lifestyle
    case motivation

    var label: String {
        switch self {
        case .all:        return "Все"
        case .calories:   return "Калории"
        case .protein:    return "Белок"
        case .carbs:      return "Углеводы"
        case .fats:       return "Жиры"
        case .lifestyle:  return "Образ жизни"
        case .motivation: return "Мотивация"
        }
    }

    var apiValue: String? {
        switch self {
        case .all:        return nil
        case .calories:   return "calories"
        case .protein:    return "protein"
        case .carbs:      return "carbs"
        case .fats:       return "fats"
        case .lifestyle:  return "lifestyle"
        case .motivation: return "motivation"
        }
    }

    var icon: String? {
        switch self {
        case .all:        return nil
        case .calories:   return "flame"
        case .protein:    return "fish"
        case .carbs:      return "leaf"
        case .fats:       return "drop"
        case .lifestyle:  return "heart"
        case .motivation: return "star"
        }
    }

    static func iconFor(apiValue: String) -> String {
        switch apiValue.lowercased() {
        case "calories":   return "flame"
        case "protein":    return "fish"
        case "carbs":      return "leaf"
        case "fats":       return "drop"
        case "lifestyle":  return "heart"
        case "motivation": return "star"
        default:           return "lightbulb"
        }
    }

    static func labelFor(apiValue: String) -> String {
        switch apiValue.lowercased() {
        case "calories":   return "Калории"
        case "protein":    return "Белок"
        case "carbs":      return "Углеводы"
        case "fats":       return "Жиры"
        case "lifestyle":  return "Образ жизни"
        case "motivation": return "Мотивация"
        default:           return apiValue
        }
    }
}

// MARK: - Tip Priority

private enum TipPriority: CaseIterable {
    case all
    case high
    case medium
    case low

    var label: String {
        switch self {
        case .all:    return "Все"
        case .high:   return "Высокий"
        case .medium: return "Средний"
        case .low:    return "Низкий"
        }
    }

    var apiValue: String? {
        switch self {
        case .all:    return nil
        case .high:   return "high"
        case .medium: return "medium"
        case .low:    return "low"
        }
    }

    var color: Color? {
        switch self {
        case .all:    return nil
        case .high:   return .red
        case .medium: return .orange
        case .low:    return .green
        }
    }
}
