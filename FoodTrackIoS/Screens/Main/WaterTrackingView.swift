import SwiftUI

struct WaterTrackingView: View {
    @State private var selectedDate = Date()
    @State private var entries: [WaterEntryDTO] = []
    @State private var totalMl = 0
    @State private var goalMl = 2000
    @State private var isLoading = true
    @State private var isAdding = false

    private let quickAmounts = [150, 250, 350, 500]

    private var progress: Double {
        guard goalMl > 0 else { return 0 }
        return min(1.0, Double(totalMl) / Double(goalMl))
    }

    private var goalReached: Bool { totalMl >= goalMl }

    private var ringColor: Color {
        goalReached ? FTTheme.success : .blue
    }

    private var isToday: Bool {
        Calendar.current.isDateInToday(selectedDate)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {

                    FTHeader(
                        title: "Вода",
                        subtitle: "Отслеживание водного баланса"
                    )
                    .padding(.top, 10)

                    // Date navigation
                    dateBar

                    if isLoading {
                        ProgressView().tint(FTTheme.tint)
                            .frame(maxWidth: .infinity)
                            .padding(.top, 30)
                    } else {
                        // Progress ring card
                        progressCard

                        // Quick add buttons
                        quickAddSection

                        // Entries list
                        entriesCard
                    }

                    Spacer(minLength: 20)
                }
                .padding(.horizontal, FTTheme.hPad)
                .padding(.bottom, 18)
            }
            .background(FTTheme.bg)
            .navigationBarHidden(true)
        }
        .task { await loadWater() }
    }

    // MARK: - Date Bar

    private var dateBar: some View {
        HStack {
            Button {
                selectedDate = Calendar.current.date(byAdding: .day, value: -1, to: selectedDate) ?? selectedDate
                Task { await loadWater() }
            } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(FTTheme.text.opacity(0.7))
                    .padding(10)
                    .background(FTTheme.fill)
                    .clipShape(Circle())
            }

            Spacer()

            VStack(spacing: 2) {
                Text(formattedDate(selectedDate))
                    .font(.system(size: 15, weight: .semibold))
                Text(dayName(selectedDate))
                    .font(.system(size: 12))
                    .foregroundColor(FTTheme.muted)
            }

            Spacer()

            Button {
                selectedDate = Calendar.current.date(byAdding: .day, value: 1, to: selectedDate) ?? selectedDate
                Task { await loadWater() }
            } label: {
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(FTTheme.text.opacity(0.7))
                    .padding(10)
                    .background(FTTheme.fill)
                    .clipShape(Circle())
            }
        }
    }

    // MARK: - Progress Ring Card

    private var progressCard: some View {
        FTCard {
            VStack(spacing: 16) {
                ZStack {
                    // Background ring
                    Circle()
                        .stroke(FTTheme.fill, lineWidth: 14)

                    // Progress ring
                    Circle()
                        .trim(from: 0, to: progress)
                        .stroke(
                            ringColor,
                            style: StrokeStyle(lineWidth: 14, lineCap: .round)
                        )
                        .rotationEffect(.degrees(-90))
                        .animation(.easeInOut(duration: 0.5), value: progress)

                    // Center label
                    VStack(spacing: 4) {
                        Image(systemName: "drop.fill")
                            .font(.system(size: 22))
                            .foregroundColor(ringColor)

                        Text("\(totalMl)")
                            .font(.system(size: 32, weight: .bold))
                            .foregroundColor(FTTheme.text)

                        Text("/ \(goalMl) мл")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(FTTheme.muted)
                    }
                }
                .frame(width: 180, height: 180)
                .frame(maxWidth: .infinity)

                // Status text
                HStack(spacing: 6) {
                    Image(systemName: goalReached ? "checkmark.circle.fill" : "info.circle")
                        .font(.system(size: 13))
                        .foregroundColor(goalReached ? FTTheme.success : .blue)

                    Text(goalReached
                         ? "Цель достигнута! Отличная работа."
                         : "Осталось \(goalMl - totalMl) мл до цели")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(goalReached ? FTTheme.success : FTTheme.muted)
                }
                .frame(maxWidth: .infinity)

                // Percentage bar
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Capsule().fill(FTTheme.fill).frame(height: 6)
                        Capsule()
                            .fill(ringColor)
                            .frame(width: geo.size.width * progress, height: 6)
                            .animation(.easeInOut(duration: 0.5), value: progress)
                    }
                }
                .frame(height: 6)

                HStack {
                    Text("\(Int(progress * 100))%")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(ringColor)
                    Spacer()
                    Text("\(goalMl) мл — цель")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(FTTheme.muted)
                }
            }
        }
    }

    // MARK: - Quick Add

    private var quickAddSection: some View {
        FTCard {
            Text("Быстрое добавление")
                .font(.system(size: 15, weight: .semibold))

            HStack(spacing: 10) {
                ForEach(quickAmounts, id: \.self) { amount in
                    Button {
                        Task { await addWater(amount: amount) }
                    } label: {
                        VStack(spacing: 6) {
                            Image(systemName: glassIcon(for: amount))
                                .font(.system(size: 18))
                                .foregroundColor(.blue)

                            Text("\(amount)")
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(FTTheme.text)

                            Text("мл")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(FTTheme.muted)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color.blue.opacity(0.06))
                        .overlay(
                            RoundedRectangle(cornerRadius: 14)
                                .stroke(Color.blue.opacity(0.15), lineWidth: 1)
                        )
                        .cornerRadius(14)
                    }
                    .disabled(isAdding)
                    .opacity(isAdding ? 0.6 : 1)
                }
            }
        }
    }

    // MARK: - Entries List

    private var entriesCard: some View {
        FTCard {
            HStack {
                Text("Записи за день")
                    .font(.system(size: 15, weight: .semibold))
                Spacer()
                Text("\(entries.count) шт.")
                    .font(.system(size: 12))
                    .foregroundColor(FTTheme.muted)
            }

            if entries.isEmpty {
                VStack(spacing: 8) {
                    Image(systemName: "drop")
                        .font(.system(size: 24))
                        .foregroundColor(FTTheme.muted)
                    Text("Нет записей за этот день")
                        .font(.system(size: 13))
                        .foregroundColor(FTTheme.muted)
                    Text("Нажмите кнопку выше, чтобы добавить воду")
                        .font(.system(size: 12))
                        .foregroundColor(FTTheme.muted.opacity(0.7))
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
            } else {
                VStack(spacing: 0) {
                    ForEach(entries) { entry in
                        waterEntryRow(entry)

                        if entry.id != entries.last?.id {
                            Divider().opacity(0.3)
                        }
                    }
                }
            }
        }
    }

    private func waterEntryRow(_ entry: WaterEntryDTO) -> some View {
        HStack(spacing: 12) {
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.blue.opacity(0.08))
                .frame(width: 44, height: 44)
                .overlay(
                    Image(systemName: "drop.fill")
                        .font(.system(size: 16))
                        .foregroundColor(.blue)
                )

            VStack(alignment: .leading, spacing: 4) {
                Text("\(entry.amount_ml) мл")
                    .font(.system(size: 15, weight: .semibold))

                if let createdAt = entry.created_at {
                    Text(formatTime(createdAt))
                        .font(.system(size: 12))
                        .foregroundColor(FTTheme.muted)
                }
            }

            Spacer()

            Button {
                Task {
                    try? await APIClient.shared.deleteWater(entry.id)
                    await loadWater()
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
        .transition(.opacity.combined(with: .move(edge: .trailing)))
    }

    // MARK: - Data

    private func loadWater() async {
        isLoading = true
        let dateStr = apiDateString(selectedDate)
        do {
            let resp = try await APIClient.shared.getWater(date: dateStr)
            withAnimation(.easeInOut(duration: 0.3)) {
                entries = resp.entries
                totalMl = resp.total_ml
                goalMl = resp.goal_ml > 0 ? resp.goal_ml : 2000
            }
        } catch {
            withAnimation {
                entries = []
                totalMl = 0
            }
        }
        isLoading = false
    }

    private func addWater(amount: Int) async {
        isAdding = true
        let dateStr = apiDateString(selectedDate)
        do {
            let resp = try await APIClient.shared.addWater(
                AddWaterRequest(amount_ml: amount, date: dateStr)
            )
            withAnimation(.easeInOut(duration: 0.4)) {
                totalMl = resp.total_ml
                goalMl = resp.goal_ml > 0 ? resp.goal_ml : goalMl
            }
            // Reload to get updated entries list
            await loadWater()
        } catch {
            // silently fail
        }
        isAdding = false
    }

    // MARK: - Helpers

    private func formattedDate(_ date: Date) -> String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "ru_RU")
        f.dateFormat = "d MMMM"
        return f.string(from: date)
    }

    private func dayName(_ date: Date) -> String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "ru_RU")
        f.dateFormat = "EEEE"
        return f.string(from: date).capitalized
    }

    private func apiDateString(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: date)
    }

    private func formatTime(_ isoString: String) -> String {
        // Try ISO8601 first
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = iso.date(from: isoString) {
            let out = DateFormatter()
            out.locale = Locale(identifier: "ru_RU")
            out.dateFormat = "HH:mm"
            return out.string(from: date)
        }
        // Fallback: try without fractional seconds
        iso.formatOptions = [.withInternetDateTime]
        if let date = iso.date(from: isoString) {
            let out = DateFormatter()
            out.locale = Locale(identifier: "ru_RU")
            out.dateFormat = "HH:mm"
            return out.string(from: date)
        }
        // Last resort: try extracting time from datetime string
        if isoString.count >= 16 {
            let start = isoString.index(isoString.startIndex, offsetBy: 11)
            let end = isoString.index(start, offsetBy: 5)
            return String(isoString[start..<end])
        }
        return ""
    }

    private func glassIcon(for amount: Int) -> String {
        switch amount {
        case ...150: return "cup.and.saucer"
        case ...250: return "mug"
        case ...350: return "takeoutbag.and.cup.and.straw"
        default: return "waterbottle"
        }
    }
}
