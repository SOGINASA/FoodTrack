import SwiftUI

struct WeightTrackingView: View {
    @EnvironmentObject private var appState: AppState
    @Environment(\.dismiss) private var dismiss

    @State private var entries: [WeightEntryDTO] = []
    @State private var stats: WeightHistoryResponse.WeightStats?
    @State private var isLoading = true
    @State private var showAddSheet = false

    @State private var newWeight: String = ""
    @State private var newNotes: String = ""
    @State private var isAdding = false
    @State private var error: String?

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
                    Text("Трекер веса")
                        .font(.system(size: 17, weight: .semibold))
                    Spacer()
                    Button { showAddSheet = true } label: {
                        Image(systemName: "plus")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(Color(.systemBackground))
                            .padding(12)
                            .background(FTTheme.tint)
                            .clipShape(Circle())
                    }
                }

                if isLoading {
                    ProgressView().tint(FTTheme.tint)
                        .frame(maxWidth: .infinity)
                        .padding(.top, 30)
                } else {
                    // Stats summary
                    if let stats {
                        FTCard {
                            Text("Статистика")
                                .font(.system(size: 16, weight: .semibold))

                            HStack(spacing: 10) {
                                weightStatChip("Текущий", value: formatWeight(stats.current))
                                weightStatChip("Мин.", value: formatWeight(stats.min))
                                weightStatChip("Макс.", value: formatWeight(stats.max))
                                weightStatChip("Изменение", value: formatChange(stats.change), isChange: true)
                            }
                        }
                    }

                    // Chart
                    if entries.count >= 2 {
                        FTCard {
                            Text("График (90 дней)")
                                .font(.system(size: 16, weight: .semibold))

                            weightChart
                        }
                    }

                    // Goal info
                    if let target = appState.user?.target_weight_kg {
                        FTCard {
                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Цель")
                                        .font(.system(size: 13, weight: .medium))
                                        .foregroundColor(FTTheme.muted)
                                    Text("\(Int(target)) кг")
                                        .font(.system(size: 18, weight: .bold))
                                }
                                Spacer()
                                if let current = stats?.current {
                                    let diff = current - target
                                    VStack(alignment: .trailing, spacing: 4) {
                                        Text("Осталось")
                                            .font(.system(size: 13, weight: .medium))
                                            .foregroundColor(FTTheme.muted)
                                        Text("\(abs(diff), specifier: "%.1f") кг")
                                            .font(.system(size: 18, weight: .bold))
                                            .foregroundColor(abs(diff) < 1 ? FTTheme.success : FTTheme.text)
                                    }
                                }
                            }
                        }
                    }

                    // History
                    FTCard {
                        HStack {
                            Text("История")
                                .font(.system(size: 16, weight: .semibold))
                            Spacer()
                            Text("\(entries.count) записей")
                                .font(.system(size: 12))
                                .foregroundColor(FTTheme.muted)
                        }

                        if entries.isEmpty {
                            Text("Нет записей. Добавьте первый замер веса.")
                                .font(.system(size: 13))
                                .foregroundColor(FTTheme.muted)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 16)
                        } else {
                            VStack(spacing: 0) {
                                ForEach(entries) { entry in
                                    HStack {
                                        VStack(alignment: .leading, spacing: 4) {
                                            Text("\(entry.weight, specifier: "%.1f") кг")
                                                .font(.system(size: 15, weight: .semibold))
                                            Text(formatDate(entry.date))
                                                .font(.system(size: 12))
                                                .foregroundColor(FTTheme.muted)
                                            if let notes = entry.notes, !notes.isEmpty {
                                                Text(notes)
                                                    .font(.system(size: 12))
                                                    .foregroundColor(FTTheme.muted)
                                                    .lineLimit(1)
                                            }
                                        }
                                        Spacer()
                                        Button {
                                            Task {
                                                try? await APIClient.shared.deleteWeight(entry.id)
                                                await loadData()
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

                                    if entry.id != entries.last?.id {
                                        Divider().opacity(0.3)
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(minLength: 20)
            }
            .padding(.horizontal, FTTheme.hPad)
            .padding(.top, 14)
        }
        .background(FTTheme.bg)
        .navigationBarHidden(true)
        .task { await loadData() }
        .sheet(isPresented: $showAddSheet) {
            addWeightSheet
                .presentationDetents([.height(320)])
        }
    }

    // MARK: - Chart

    private var weightChart: some View {
        GeometryReader { geo in
            let sorted = entries.reversed()
            let weights = sorted.map(\.weight)
            let minW = (weights.min() ?? 0) - 2
            let maxW = (weights.max() ?? 0) + 2
            let range = max(maxW - minW, 1)
            let width = geo.size.width
            let height: CGFloat = 140

            ZStack(alignment: .topLeading) {
                // Grid lines
                ForEach(0..<3) { i in
                    let y = height * CGFloat(i) / 2
                    Path { path in
                        path.move(to: CGPoint(x: 0, y: y))
                        path.addLine(to: CGPoint(x: width, y: y))
                    }
                    .stroke(FTTheme.fill, lineWidth: 1)
                }

                // Line
                if sorted.count >= 2 {
                    Path { path in
                        for (i, entry) in sorted.enumerated() {
                            let x = width * CGFloat(i) / CGFloat(max(sorted.count - 1, 1))
                            let y = height - (CGFloat(entry.weight - minW) / CGFloat(range)) * height
                            if i == 0 { path.move(to: CGPoint(x: x, y: y)) }
                            else { path.addLine(to: CGPoint(x: x, y: y)) }
                        }
                    }
                    .stroke(FTTheme.tint, style: StrokeStyle(lineWidth: 2, lineCap: .round, lineJoin: .round))

                    // Dots
                    ForEach(Array(sorted.enumerated()), id: \.offset) { i, entry in
                        let x = width * CGFloat(i) / CGFloat(max(sorted.count - 1, 1))
                        let y = height - (CGFloat(entry.weight - minW) / CGFloat(range)) * height
                        Circle()
                            .fill(FTTheme.tint)
                            .frame(width: 6, height: 6)
                            .position(x: x, y: y)
                    }
                }

                // Labels
                HStack {
                    Text("\(Int(maxW)) кг")
                    Spacer()
                    Text("\(Int(minW)) кг")
                }
                .font(.system(size: 10))
                .foregroundColor(FTTheme.muted)
                .offset(y: height + 4)
            }
            .frame(height: height)
        }
        .frame(height: 160)
    }

    // MARK: - Add Sheet

    private var addWeightSheet: some View {
        VStack(spacing: 16) {
            Text("Добавить вес")
                .font(.system(size: 17, weight: .semibold))
                .padding(.top, 8)

            if let error {
                Text(error)
                    .font(.system(size: 13))
                    .foregroundColor(.red)
            }

            FTTextField(title: "Вес (кг)", text: $newWeight, keyboard: .decimalPad)
            FTTextField(title: "Заметка (опционально)", text: $newNotes)

            PrimaryButton(
                title: isAdding ? "Сохранение..." : "Сохранить",
                disabled: isAdding || newWeight.isEmpty
            ) {
                Task { await addWeight() }
            }

            Spacer()
        }
        .padding(.horizontal, FTTheme.hPad)
        .padding(.top, 14)
    }

    // MARK: - Data

    private func loadData() async {
        isLoading = true
        do {
            let resp = try await APIClient.shared.getWeightHistory()
            entries = resp.entries
            stats = resp.stats
        } catch {
            entries = []
        }
        isLoading = false
    }

    private func addWeight() async {
        isAdding = true
        error = nil

        guard let weight = Double(newWeight.replacingOccurrences(of: ",", with: ".")) else {
            error = "Введите корректный вес"
            isAdding = false
            return
        }

        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        let today = f.string(from: Date())

        do {
            _ = try await APIClient.shared.addWeight(
                AddWeightRequest(weight: weight, date: today, notes: newNotes.isEmpty ? nil : newNotes)
            )
            showAddSheet = false
            newWeight = ""
            newNotes = ""
            await loadData()
        } catch {
            self.error = error.localizedDescription
        }
        isAdding = false
    }

    // MARK: - Helpers

    private func weightStatChip(_ title: String, value: String, isChange: Bool = false) -> some View {
        VStack(spacing: 4) {
            Text(title)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(FTTheme.muted)
            Text(value)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(isChange ? (value.hasPrefix("-") ? FTTheme.success : value == "0.0" ? FTTheme.muted : .red.opacity(0.85)) : FTTheme.text)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 10)
        .background(FTTheme.fill.opacity(0.5))
        .cornerRadius(12)
    }

    private func formatWeight(_ w: Double?) -> String {
        guard let w else { return "-" }
        return String(format: "%.1f", w)
    }

    private func formatChange(_ c: Double?) -> String {
        guard let c else { return "-" }
        let sign = c > 0 ? "+" : ""
        return "\(sign)\(String(format: "%.1f", c))"
    }

    private func formatDate(_ dateStr: String?) -> String {
        guard let dateStr else { return "" }
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        guard let d = f.date(from: dateStr) else { return dateStr }
        let out = DateFormatter()
        out.locale = Locale(identifier: "ru_RU")
        out.dateFormat = "d MMM yyyy"
        return out.string(from: d)
    }
}
