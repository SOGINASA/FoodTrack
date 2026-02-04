import SwiftUI

struct FridgeView: View {
    @State private var products: [FridgeProductDTO] = []
    @State private var isLoading = true
    @State private var selectedCategory = "all"
    @State private var showAddSheet = false
    @State private var errorMessage: String?

    private let categories: [(key: String, label: String)] = [
        ("all", "Все"),
        ("dairy", "Молочное"),
        ("meat", "Мясо"),
        ("vegetables", "Овощи"),
        ("fruits", "Фрукты"),
        ("other", "Другое")
    ]

    private var filteredProducts: [FridgeProductDTO] {
        if selectedCategory == "all" {
            return products
        }
        return products.filter { ($0.category ?? "other") == selectedCategory }
    }

    private var expiringCount: Int {
        products.filter { $0.isExpiringSoon && !$0.isExpired }.count
    }

    private var expiredCount: Int {
        products.filter { $0.isExpired }.count
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {

                    FTHeader(
                        title: "Холодильник",
                        subtitle: "Управление продуктами и сроки годности"
                    )
                    .padding(.top, 10)

                    // Expiry warnings
                    if !isLoading {
                        expiryWarningBanner
                    }

                    // Category filter chips
                    categoryChips

                    // Add product button
                    addProductButton

                    if isLoading {
                        VStack(spacing: 12) {
                            ProgressView().tint(FTTheme.tint)
                            Text("Загрузка...")
                                .font(.system(size: 13))
                                .foregroundColor(FTTheme.muted)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.top, 40)
                    } else if filteredProducts.isEmpty {
                        emptyState
                    } else {
                        // Product list
                        productList
                    }

                    // Error message
                    if let errorMessage {
                        Text(errorMessage)
                            .font(.system(size: 13))
                            .foregroundColor(.red)
                            .padding(12)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color.red.opacity(0.06))
                            .cornerRadius(12)
                    }

                    Spacer(minLength: 20)
                }
                .padding(.horizontal, FTTheme.hPad)
                .padding(.bottom, 18)
            }
            .background(FTTheme.bg)
            .navigationBarHidden(true)
        }
        .task { await loadProducts() }
        .sheet(isPresented: $showAddSheet) {
            AddFridgeProductSheet {
                Task { await loadProducts() }
            }
        }
    }

    // MARK: - Expiry Warning Banner

    @ViewBuilder
    private var expiryWarningBanner: some View {
        if expiredCount > 0 || expiringCount > 0 {
            VStack(spacing: 8) {
                if expiredCount > 0 {
                    HStack(spacing: 8) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.system(size: 14))
                            .foregroundColor(.red)
                        Text(expiredText(expiredCount))
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.red)
                        Spacer()
                    }
                    .padding(12)
                    .background(Color.red.opacity(0.08))
                    .cornerRadius(12)
                }

                if expiringCount > 0 {
                    HStack(spacing: 8) {
                        Image(systemName: "clock.badge.exclamationmark")
                            .font(.system(size: 14))
                            .foregroundColor(.orange)
                        Text(expiringText(expiringCount))
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.orange)
                        Spacer()
                    }
                    .padding(12)
                    .background(Color.orange.opacity(0.08))
                    .cornerRadius(12)
                }
            }
        }
    }

    // MARK: - Category Chips

    private var categoryChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(categories, id: \.key) { cat in
                    Button {
                        selectedCategory = cat.key
                    } label: {
                        HStack(spacing: 4) {
                            if cat.key != "all" {
                                Image(systemName: iconForCategory(cat.key))
                                    .font(.system(size: 11))
                            }
                            Text(cat.label)
                                .font(.system(size: 13, weight: .semibold))
                        }
                        .foregroundColor(selectedCategory == cat.key ? Color(.systemBackground) : FTTheme.text.opacity(0.7))
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(selectedCategory == cat.key ? FTTheme.tint : FTTheme.fill)
                        .cornerRadius(999)
                    }
                }
            }
        }
    }

    // MARK: - Add Product Button

    private var addProductButton: some View {
        Button {
            showAddSheet = true
        } label: {
            HStack(spacing: 8) {
                Image(systemName: "plus.circle.fill")
                    .font(.system(size: 16))
                Text("Добавить продукт")
                    .font(.system(size: 15, weight: .semibold))
            }
            .foregroundColor(Color(.systemBackground))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(FTTheme.tint)
            .clipShape(Capsule())
        }
    }

    // MARK: - Empty State

    private var emptyState: some View {
        FTCard {
            VStack(spacing: 12) {
                Image(systemName: "refrigerator")
                    .font(.system(size: 36))
                    .foregroundColor(FTTheme.muted)

                Text("Холодильник пуст")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(FTTheme.text)

                Text(selectedCategory == "all"
                     ? "Добавьте продукты, чтобы отслеживать сроки годности"
                     : "Нет продуктов в категории \"\(labelForCategory(selectedCategory))\"")
                    .font(.system(size: 13))
                    .foregroundColor(FTTheme.muted)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 20)
        }
    }

    // MARK: - Product List

    private var productList: some View {
        VStack(spacing: 10) {
            ForEach(filteredProducts) { product in
                FridgeProductRow(product: product) {
                    Task { await deleteProduct(product.id) }
                }
            }
        }
    }

    // MARK: - Data

    private func loadProducts() async {
        isLoading = true
        errorMessage = nil
        products = (try? await APIClient.shared.getFridgeProducts()) ?? []
        isLoading = false
    }

    private func deleteProduct(_ id: Int) async {
        errorMessage = nil
        do {
            try await APIClient.shared.deleteFridgeProduct(id)
            await loadProducts()
        } catch {
            errorMessage = "Не удалось удалить продукт: \(error.localizedDescription)"
        }
    }

    // MARK: - Helpers

    private func iconForCategory(_ key: String) -> String {
        switch key {
        case "dairy":      return "cup.and.saucer"
        case "meat":       return "fish"
        case "vegetables": return "leaf"
        case "fruits":     return "carrot"
        case "other":      return "bag"
        default:           return "bag"
        }
    }

    private func labelForCategory(_ key: String) -> String {
        categories.first { $0.key == key }?.label ?? "Другое"
    }

    private func expiredText(_ count: Int) -> String {
        let suffix: String
        let mod10 = count % 10
        let mod100 = count % 100
        if mod10 == 1 && mod100 != 11 {
            suffix = "продукт просрочен"
        } else if (2...4).contains(mod10) && !(12...14).contains(mod100) {
            suffix = "продукта просрочено"
        } else {
            suffix = "продуктов просрочено"
        }
        return "\(count) \(suffix)"
    }

    private func expiringText(_ count: Int) -> String {
        let suffix: String
        let mod10 = count % 10
        let mod100 = count % 100
        if mod10 == 1 && mod100 != 11 {
            suffix = "продукт скоро истекает"
        } else if (2...4).contains(mod10) && !(12...14).contains(mod100) {
            suffix = "продукта скоро истекают"
        } else {
            suffix = "продуктов скоро истекают"
        }
        return "\(count) \(suffix)"
    }
}

// MARK: - Fridge Product Row

private struct FridgeProductRow: View {
    let product: FridgeProductDTO
    let onDelete: () -> Void

    @State private var offset: CGFloat = 0
    @State private var showDeleteConfirm = false

    private var statusColor: Color {
        if product.isExpired { return .red }
        if product.isExpiringSoon { return .orange }
        return FTTheme.text
    }

    private var statusBadge: (text: String, color: Color)? {
        if product.isExpired {
            return ("Просрочен", .red)
        }
        if product.isExpiringSoon {
            return ("Скоро истекает", .orange)
        }
        return nil
    }

    private var categoryIcon: String {
        switch product.category ?? "other" {
        case "dairy":      return "cup.and.saucer"
        case "meat":       return "fish"
        case "vegetables": return "leaf"
        case "fruits":     return "carrot"
        case "other":      return "bag"
        default:           return "bag"
        }
    }

    private var categoryLabel: String {
        switch product.category ?? "other" {
        case "dairy":      return "Молочное"
        case "meat":       return "Мясо"
        case "vegetables": return "Овощи"
        case "fruits":     return "Фрукты"
        case "other":      return "Другое"
        default:           return "Другое"
        }
    }

    var body: some View {
        ZStack(alignment: .trailing) {
            // Delete background
            HStack {
                Spacer()
                Button {
                    showDeleteConfirm = true
                } label: {
                    Image(systemName: "trash.fill")
                        .font(.system(size: 16))
                        .foregroundColor(.white)
                        .frame(width: 60, height: 60)
                }
                .background(Color.red)
                .cornerRadius(FTTheme.corner)
            }

            // Card content
            FTCard {
                HStack(alignment: .top, spacing: 12) {
                    // Category icon
                    RoundedRectangle(cornerRadius: 12)
                        .fill(FTTheme.fill)
                        .frame(width: 44, height: 44)
                        .overlay(
                            Image(systemName: categoryIcon)
                                .font(.system(size: 16))
                                .foregroundColor(statusColor.opacity(0.8))
                        )

                    VStack(alignment: .leading, spacing: 4) {
                        HStack(spacing: 6) {
                            Text(product.name)
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(statusColor)
                                .lineLimit(1)

                            if let badge = statusBadge {
                                Text(badge.text)
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(badge.color)
                                    .cornerRadius(999)
                            }
                        }

                        HStack(spacing: 6) {
                            Text(categoryLabel)
                                .font(.system(size: 12))
                                .foregroundColor(FTTheme.muted)

                            if let quantity = product.quantity {
                                Text("\u{2022}")
                                    .font(.system(size: 10))
                                    .foregroundColor(FTTheme.muted)
                                Text(formatQuantity(quantity, unit: product.unit))
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(FTTheme.text.opacity(0.7))
                            }
                        }

                        if let expiry = product.expiry_date {
                            HStack(spacing: 4) {
                                Image(systemName: "calendar")
                                    .font(.system(size: 10))
                                Text("До: \(formatExpiryDate(expiry))")
                                    .font(.system(size: 11))
                            }
                            .foregroundColor(statusColor.opacity(0.7))
                        }

                        if let notes = product.notes, !notes.isEmpty {
                            Text(notes)
                                .font(.system(size: 11))
                                .foregroundColor(FTTheme.muted)
                                .lineLimit(1)
                        }
                    }

                    Spacer()

                    // Swipe hint / delete button
                    Button {
                        showDeleteConfirm = true
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
            .offset(x: offset)
            .gesture(
                DragGesture()
                    .onChanged { value in
                        if value.translation.width < 0 {
                            offset = max(value.translation.width, -80)
                        }
                    }
                    .onEnded { value in
                        withAnimation(.spring(response: 0.3)) {
                            if value.translation.width < -50 {
                                showDeleteConfirm = true
                            }
                            offset = 0
                        }
                    }
            )
        }
        .confirmationDialog("Удалить \"\(product.name)\"?", isPresented: $showDeleteConfirm, titleVisibility: .visible) {
            Button("Удалить", role: .destructive) {
                onDelete()
            }
            Button("Отмена", role: .cancel) {}
        }
    }

    private func formatQuantity(_ quantity: Double, unit: String?) -> String {
        let formatted = quantity.truncatingRemainder(dividingBy: 1) == 0
            ? String(format: "%.0f", quantity)
            : String(format: "%.1f", quantity)
        if let unit, !unit.isEmpty {
            return "\(formatted) \(unit)"
        }
        return formatted
    }

    private func formatExpiryDate(_ dateStr: String) -> String {
        let inputFormatter = DateFormatter()
        inputFormatter.dateFormat = "yyyy-MM-dd"
        guard let date = inputFormatter.date(from: dateStr) else { return dateStr }
        let outputFormatter = DateFormatter()
        outputFormatter.locale = Locale(identifier: "ru_RU")
        outputFormatter.dateFormat = "d MMMM yyyy"
        return outputFormatter.string(from: date)
    }
}

// MARK: - Add Fridge Product Sheet

private struct AddFridgeProductSheet: View {
    let onAdded: () -> Void
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var quantityText = ""
    @State private var selectedUnit = "шт"
    @State private var selectedCategory = "other"
    @State private var expiryDate = Date()
    @State private var hasExpiry = false
    @State private var notes = ""
    @State private var isSaving = false
    @State private var error: String?

    private let units = ["шт", "кг", "г", "л", "мл"]

    private let categories: [(key: String, label: String, icon: String)] = [
        ("dairy", "Молочное", "cup.and.saucer"),
        ("meat", "Мясо", "fish"),
        ("vegetables", "Овощи", "leaf"),
        ("fruits", "Фрукты", "carrot"),
        ("other", "Другое", "bag")
    ]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    if let error {
                        Text(error)
                            .font(.system(size: 13))
                            .foregroundColor(.red)
                            .padding(12)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color.red.opacity(0.06))
                            .cornerRadius(12)
                    }

                    // Name
                    FTTextField(title: "Название продукта", placeholder: "Например: Молоко", text: $name)

                    // Quantity and unit
                    HStack(spacing: 12) {
                        FTTextField(title: "Количество", placeholder: "1", text: $quantityText, keyboard: .decimalPad)

                        VStack(alignment: .leading, spacing: 8) {
                            Text("Единица")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(FTTheme.text)

                            Menu {
                                ForEach(units, id: \.self) { unit in
                                    Button(unit) {
                                        selectedUnit = unit
                                    }
                                }
                            } label: {
                                HStack {
                                    Text(selectedUnit)
                                        .font(.system(size: 16))
                                        .foregroundColor(FTTheme.text)
                                    Spacer()
                                    Image(systemName: "chevron.up.chevron.down")
                                        .font(.system(size: 12))
                                        .foregroundColor(FTTheme.muted)
                                }
                                .padding(.horizontal, 14)
                                .padding(.vertical, 12)
                                .background(FTTheme.elevated)
                                .overlay(
                                    RoundedRectangle(cornerRadius: FTTheme.corner)
                                        .stroke(FTTheme.border, lineWidth: 1)
                                )
                            }
                        }
                    }

                    // Category picker
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Категория")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(FTTheme.text)

                        LazyVGrid(columns: [
                            GridItem(.flexible()),
                            GridItem(.flexible()),
                            GridItem(.flexible())
                        ], spacing: 8) {
                            ForEach(categories, id: \.key) { cat in
                                Button {
                                    selectedCategory = cat.key
                                } label: {
                                    HStack(spacing: 4) {
                                        Image(systemName: cat.icon)
                                            .font(.system(size: 12))
                                        Text(cat.label)
                                            .font(.system(size: 13, weight: .semibold))
                                    }
                                    .foregroundColor(selectedCategory == cat.key ? Color(.systemBackground) : FTTheme.text.opacity(0.7))
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 10)
                                    .background(selectedCategory == cat.key ? FTTheme.tint : FTTheme.fill)
                                    .cornerRadius(12)
                                }
                            }
                        }
                    }

                    // Expiry date toggle + picker
                    VStack(alignment: .leading, spacing: 8) {
                        Toggle(isOn: $hasExpiry) {
                            HStack(spacing: 6) {
                                Image(systemName: "calendar.badge.clock")
                                    .font(.system(size: 14))
                                    .foregroundColor(FTTheme.muted)
                                Text("Срок годности")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(FTTheme.text)
                            }
                        }
                        .tint(FTTheme.tint)

                        if hasExpiry {
                            DatePicker(
                                "Годен до",
                                selection: $expiryDate,
                                displayedComponents: .date
                            )
                            .datePickerStyle(.graphical)
                            .environment(\.locale, Locale(identifier: "ru_RU"))
                            .padding(12)
                            .background(FTTheme.elevated)
                            .overlay(
                                RoundedRectangle(cornerRadius: FTTheme.corner)
                                    .stroke(FTTheme.border, lineWidth: 1)
                            )
                            .cornerRadius(FTTheme.corner)
                        }
                    }

                    // Notes
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Заметки")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(FTTheme.text)

                        TextEditor(text: $notes)
                            .font(.system(size: 15))
                            .frame(minHeight: 60)
                            .padding(10)
                            .scrollContentBackground(.hidden)
                            .background(FTTheme.elevated)
                            .overlay(
                                RoundedRectangle(cornerRadius: FTTheme.corner)
                                    .stroke(FTTheme.border, lineWidth: 1)
                            )
                            .cornerRadius(FTTheme.corner)
                    }

                    // Save button
                    PrimaryButton(
                        title: isSaving ? "Сохранение..." : "Добавить продукт",
                        disabled: isSaving || name.trimmingCharacters(in: .whitespaces).isEmpty
                    ) {
                        Task { await save() }
                    }
                    .padding(.top, 4)
                }
                .padding(.horizontal, FTTheme.hPad)
                .padding(.top, 14)
                .padding(.bottom, 24)
            }
            .background(FTTheme.bg)
            .navigationTitle("Новый продукт")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Отмена") { dismiss() }
                }
            }
        }
    }

    private func save() async {
        isSaving = true
        error = nil

        let quantity = Double(quantityText.replacingOccurrences(of: ",", with: "."))

        let expiryString: String? = hasExpiry ? {
            let formatter = DateFormatter()
            formatter.dateFormat = "yyyy-MM-dd"
            return formatter.string(from: expiryDate)
        }() : nil

        let request = AddFridgeProductRequest(
            name: name.trimmingCharacters(in: .whitespaces),
            quantity: quantity,
            unit: selectedUnit,
            category: selectedCategory,
            expiryDate: expiryString,
            notes: notes.trimmingCharacters(in: .whitespaces).isEmpty ? nil : notes.trimmingCharacters(in: .whitespaces)
        )

        do {
            _ = try await APIClient.shared.addFridgeProduct(request)
            onAdded()
            dismiss()
        } catch {
            self.error = "Не удалось добавить продукт: \(error.localizedDescription)"
        }
        isSaving = false
    }
}
