import SwiftUI

struct ProgressView: View {
    @State private var selectedTab = 0
    @State private var measurements: [MeasurementDTO] = []
    @State private var photos: [ProgressPhotoDTO] = []
    @State private var isLoading = true
    @State private var showAddMeasurement = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {

                    FTHeader(
                        title: "Прогресс",
                        subtitle: "Замеры тела и отслеживание результатов"
                    )
                    .padding(.top, 10)

                    // Segmented picker
                    Picker("", selection: $selectedTab) {
                        Text("Замеры").tag(0)
                        Text("Фото").tag(1)
                    }
                    .pickerStyle(.segmented)

                    if isLoading {
                        ProgressView()
                            .tint(FTTheme.tint)
                            .frame(maxWidth: .infinity)
                            .padding(.top, 30)
                    } else {
                        if selectedTab == 0 {
                            measurementsSection
                        } else {
                            photosSection
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
        .task { await loadAll() }
        .sheet(isPresented: $showAddMeasurement) {
            AddMeasurementSheet(onSaved: {
                Task { await loadMeasurements() }
            })
            .presentationDetents([.large])
        }
    }

    // MARK: - Measurements Section

    @ViewBuilder
    private var measurementsSection: some View {
        // Add button
        Button { showAddMeasurement = true } label: {
            HStack(spacing: 8) {
                Image(systemName: "plus.circle.fill")
                    .font(.system(size: 16))
                Text("Добавить замер")
                    .font(.system(size: 15, weight: .semibold))
            }
            .foregroundColor(Color(.systemBackground))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 13)
            .background(FTTheme.tint)
            .clipShape(Capsule())
        }

        // Latest stats
        if let latest = measurements.first {
            latestMeasurementCard(latest)
        }

        // History
        FTCard {
            HStack {
                HStack(spacing: 6) {
                    Image(systemName: "list.bullet.clipboard")
                        .font(.system(size: 13))
                        .foregroundColor(FTTheme.muted)
                    Text("История замеров")
                        .font(.system(size: 16, weight: .semibold))
                }
                Spacer()
                Text("\(measurements.count)")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(FTTheme.muted)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(FTTheme.fill)
                    .cornerRadius(10)
            }

            if measurements.isEmpty {
                emptyState(
                    icon: "ruler",
                    title: "Нет замеров",
                    subtitle: "Добавьте первый замер тела, чтобы отслеживать прогресс"
                )
            } else {
                VStack(spacing: 0) {
                    ForEach(measurements) { m in
                        measurementRow(m)

                        if m.id != measurements.last?.id {
                            Divider().opacity(0.3)
                        }
                    }
                }
            }
        }
    }

    // MARK: - Latest Measurement Card

    private func latestMeasurementCard(_ m: MeasurementDTO) -> some View {
        FTCard {
            HStack {
                HStack(spacing: 6) {
                    Image(systemName: "chart.line.uptrend.xyaxis")
                        .font(.system(size: 13))
                        .foregroundColor(FTTheme.muted)
                    Text("Последний замер")
                        .font(.system(size: 16, weight: .semibold))
                }
                Spacer()
                Text(formatDate(m.date))
                    .font(.system(size: 12))
                    .foregroundColor(FTTheme.muted)
            }

            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 10) {
                measurementStatChip(icon: "figure.stand", label: "Грудь", value: m.chest)
                measurementStatChip(icon: "circle.circle", label: "Талия", value: m.waist)
                measurementStatChip(icon: "figure.walk", label: "Бёдра", value: m.hips)
                measurementStatChip(icon: "figure.strengthtraining.traditional", label: "Бицепс", value: m.biceps)
                measurementStatChip(icon: "figure.run", label: "Бедро", value: m.thigh)
                measurementStatChip(icon: "person.bust", label: "Шея", value: m.neck)
            }
        }
    }

    private func measurementStatChip(icon: String, label: String, value: Double?) -> some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 14))
                .foregroundColor(FTTheme.tint)

            Text(label)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(FTTheme.muted)

            if let value {
                Text("\(Int(value)) см")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(FTTheme.text)
            } else {
                Text("--")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(FTTheme.muted)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 10)
        .background(FTTheme.fill.opacity(0.5))
        .cornerRadius(12)
    }

    // MARK: - Measurement Row

    private func measurementRow(_ m: MeasurementDTO) -> some View {
        HStack(alignment: .top, spacing: 12) {
            RoundedRectangle(cornerRadius: 12)
                .fill(FTTheme.fill)
                .frame(width: 44, height: 44)
                .overlay(
                    Image(systemName: "ruler")
                        .font(.system(size: 16))
                        .foregroundColor(FTTheme.text.opacity(0.7))
                )

            VStack(alignment: .leading, spacing: 4) {
                Text(formatDate(m.date))
                    .font(.system(size: 15, weight: .semibold))

                let parts = measurementSummary(m)
                if !parts.isEmpty {
                    Text(parts)
                        .font(.system(size: 12))
                        .foregroundColor(FTTheme.muted)
                        .lineLimit(2)
                }

                if let notes = m.notes, !notes.isEmpty {
                    Text(notes)
                        .font(.system(size: 12))
                        .foregroundColor(FTTheme.muted)
                        .italic()
                        .lineLimit(1)
                }
            }

            Spacer()

            Button {
                Task {
                    try? await APIClient.shared.deleteMeasurement(m.id)
                    await loadMeasurements()
                }
            } label: {
                Image(systemName: "trash")
                    .font(.system(size: 12))
                    .foregroundColor(.red.opacity(0.6))
                    .padding(8)
                    .background(Color.red.opacity(0.06))
                    .clipShape(Circle())
            }
        }
        .padding(.vertical, 10)
    }

    // MARK: - Photos Section

    @State private var selectedCategory: String? = nil

    private var photoCategories: [String] {
        let cats = photos.compactMap { $0.category }
        return Array(Set(cats)).sorted()
    }

    private var filteredPhotos: [ProgressPhotoDTO] {
        guard let cat = selectedCategory else { return photos }
        return photos.filter { $0.category == cat }
    }

    @ViewBuilder
    private var photosSection: some View {
        // Category filter chips
        if !photoCategories.isEmpty {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    categoryChip(label: "Все", category: nil)
                    ForEach(photoCategories, id: \.self) { cat in
                        categoryChip(label: categoryLabel(cat), category: cat)
                    }
                }
            }
        }

        if photos.isEmpty {
            FTCard {
                emptyState(
                    icon: "photo.on.rectangle.angled",
                    title: "Нет фотографий",
                    subtitle: "Здесь будут отображаться фото прогресса, когда вы их добавите"
                )
            }
        } else if filteredPhotos.isEmpty {
            FTCard {
                emptyState(
                    icon: "photo",
                    title: "Нет фото в категории",
                    subtitle: "Выберите другую категорию или сбросьте фильтр"
                )
            }
        } else {
            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: 12),
                GridItem(.flexible(), spacing: 12)
            ], spacing: 12) {
                ForEach(filteredPhotos) { photo in
                    photoCard(photo)
                }
            }
        }
    }

    private func categoryChip(label: String, category: String?) -> some View {
        let isSelected = selectedCategory == category
        return Button {
            withAnimation(.easeInOut(duration: 0.2)) {
                selectedCategory = category
            }
        } label: {
            Text(label)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(isSelected ? Color(.systemBackground) : FTTheme.text.opacity(0.7))
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(isSelected ? FTTheme.tint : FTTheme.fill)
                .cornerRadius(999)
        }
    }

    private func photoCard(_ photo: ProgressPhotoDTO) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            // Placeholder thumbnail
            ZStack {
                RoundedRectangle(cornerRadius: 14)
                    .fill(FTTheme.fill)
                    .frame(height: 140)

                VStack(spacing: 8) {
                    Image(systemName: categoryIcon(photo.category))
                        .font(.system(size: 28))
                        .foregroundColor(FTTheme.muted.opacity(0.6))
                    Text(categoryLabel(photo.category))
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(FTTheme.muted)
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(categoryLabel(photo.category))
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(FTTheme.text)

                    Spacer()

                    Button {
                        Task {
                            try? await APIClient.shared.deleteProgressPhoto(photo.id)
                            await loadPhotos()
                        }
                    } label: {
                        Image(systemName: "trash")
                            .font(.system(size: 11))
                            .foregroundColor(.red.opacity(0.6))
                    }
                }

                Text(formatDate(photo.date))
                    .font(.system(size: 11))
                    .foregroundColor(FTTheme.muted)

                if let notes = photo.notes, !notes.isEmpty {
                    Text(notes)
                        .font(.system(size: 11))
                        .foregroundColor(FTTheme.muted)
                        .lineLimit(1)
                }
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 8)
        }
        .background(FTTheme.card)
        .overlay(
            RoundedRectangle(cornerRadius: FTTheme.corner)
                .stroke(FTTheme.border, lineWidth: 1)
        )
        .cornerRadius(FTTheme.corner)
    }

    // MARK: - Empty State

    private func emptyState(icon: String, title: String, subtitle: String) -> some View {
        VStack(spacing: 10) {
            Image(systemName: icon)
                .font(.system(size: 32))
                .foregroundColor(FTTheme.muted.opacity(0.5))

            Text(title)
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(FTTheme.text)

            Text(subtitle)
                .font(.system(size: 13))
                .foregroundColor(FTTheme.muted)
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 24)
    }

    // MARK: - Data

    private func loadAll() async {
        isLoading = true
        await withTaskGroup(of: Void.self) { group in
            group.addTask { await loadMeasurements() }
            group.addTask { await loadPhotos() }
        }
        isLoading = false
    }

    @MainActor
    private func loadMeasurements() async {
        measurements = (try? await APIClient.shared.getMeasurements()) ?? []
    }

    @MainActor
    private func loadPhotos() async {
        photos = (try? await APIClient.shared.getProgressPhotos()) ?? []
    }

    // MARK: - Helpers

    private func formatDate(_ dateStr: String?) -> String {
        guard let dateStr else { return "Без даты" }
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        guard let d = f.date(from: dateStr) else { return dateStr }
        let out = DateFormatter()
        out.locale = Locale(identifier: "ru_RU")
        out.dateFormat = "d MMM yyyy"
        return out.string(from: d)
    }

    private func measurementSummary(_ m: MeasurementDTO) -> String {
        var parts: [String] = []
        if let v = m.chest { parts.append("Грудь \(Int(v))") }
        if let v = m.waist { parts.append("Талия \(Int(v))") }
        if let v = m.hips { parts.append("Бёдра \(Int(v))") }
        if let v = m.biceps { parts.append("Бицепс \(Int(v))") }
        if let v = m.thigh { parts.append("Бедро \(Int(v))") }
        if let v = m.neck { parts.append("Шея \(Int(v))") }
        return parts.joined(separator: " \u{2022} ")
    }

    private func categoryLabel(_ cat: String?) -> String {
        switch cat?.lowercased() {
        case "front": return "Спереди"
        case "side": return "Сбоку"
        case "back": return "Сзади"
        default: return cat?.capitalized ?? "Фото"
        }
    }

    private func categoryIcon(_ cat: String?) -> String {
        switch cat?.lowercased() {
        case "front": return "person.fill"
        case "side": return "person.fill.turn.right"
        case "back": return "person.fill.turn.left"
        default: return "photo"
        }
    }
}

// MARK: - Add Measurement Sheet

private struct AddMeasurementSheet: View {
    let onSaved: () -> Void
    @Environment(\.dismiss) private var dismiss

    @State private var selectedDate = Date()
    @State private var chest: String = ""
    @State private var waist: String = ""
    @State private var hips: String = ""
    @State private var biceps: String = ""
    @State private var thigh: String = ""
    @State private var neck: String = ""
    @State private var notes: String = ""
    @State private var isSaving = false
    @State private var error: String?

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

                    // Date picker
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Дата")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(FTTheme.text)

                        DatePicker(
                            "",
                            selection: $selectedDate,
                            displayedComponents: .date
                        )
                        .datePickerStyle(.compact)
                        .labelsHidden()
                        .environment(\.locale, Locale(identifier: "ru_RU"))
                    }

                    // Body fields in rows of 2
                    HStack(spacing: 12) {
                        FTTextField(title: "Грудь (см)", text: $chest, keyboard: .decimalPad)
                        FTTextField(title: "Талия (см)", text: $waist, keyboard: .decimalPad)
                    }

                    HStack(spacing: 12) {
                        FTTextField(title: "Бёдра (см)", text: $hips, keyboard: .decimalPad)
                        FTTextField(title: "Бицепс (см)", text: $biceps, keyboard: .decimalPad)
                    }

                    HStack(spacing: 12) {
                        FTTextField(title: "Бедро (см)", text: $thigh, keyboard: .decimalPad)
                        FTTextField(title: "Шея (см)", text: $neck, keyboard: .decimalPad)
                    }

                    FTTextField(title: "Заметка (опционально)", text: $notes)

                    PrimaryButton(
                        title: isSaving ? "Сохранение..." : "Сохранить замер",
                        disabled: isSaving || allFieldsEmpty
                    ) {
                        Task { await save() }
                    }

                    Spacer(minLength: 20)
                }
                .padding(.horizontal, FTTheme.hPad)
                .padding(.top, 14)
            }
            .background(FTTheme.bg)
            .navigationTitle("Новый замер")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Отмена") { dismiss() }
                }
            }
        }
    }

    private var allFieldsEmpty: Bool {
        chest.isEmpty && waist.isEmpty && hips.isEmpty &&
        biceps.isEmpty && thigh.isEmpty && neck.isEmpty
    }

    private func save() async {
        isSaving = true
        error = nil

        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        let dateStr = f.string(from: selectedDate)

        let req = AddMeasurementRequest(
            date: dateStr,
            chest: parseDouble(chest),
            waist: parseDouble(waist),
            hips: parseDouble(hips),
            biceps: parseDouble(biceps),
            thigh: parseDouble(thigh),
            neck: parseDouble(neck),
            notes: notes.isEmpty ? nil : notes
        )

        do {
            _ = try await APIClient.shared.addMeasurement(req)
            onSaved()
            dismiss()
        } catch {
            self.error = error.localizedDescription
        }
        isSaving = false
    }

    private func parseDouble(_ str: String) -> Double? {
        guard !str.isEmpty else { return nil }
        return Double(str.replacingOccurrences(of: ",", with: "."))
    }
}
