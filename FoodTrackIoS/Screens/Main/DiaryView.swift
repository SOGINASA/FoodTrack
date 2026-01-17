import SwiftUI

struct DiaryView: View {
    // Мок-данные “как будто живые”
    private let today = Date()
    private let goalKcal = 2100
    private let goalProtein = 140
    private let goalFat = 70
    private let goalCarbs = 220

    private let consumedKcal = 1260
    private let consumedProtein = 78
    private let consumedFat = 42
    private let consumedCarbs = 128

    private let meals: [MealSection] = [
        MealSection(
            title: "Завтрак",
            timeHint: "08:40",
            items: [
                FoodEntry(title: "Овсянка с бананом", details: "1 порция • 320 г", kcal: 450, p: 14, f: 10, c: 78),
                FoodEntry(title: "Кофе", details: "без сахара", kcal: 5, p: 0, f: 0, c: 1)
            ]
        ),
        MealSection(
            title: "Обед",
            timeHint: "13:10",
            items: [
                FoodEntry(title: "Курица с рисом", details: "домашняя порция", kcal: 560, p: 40, f: 14, c: 68),
                FoodEntry(title: "Овощной салат", details: "огурец, помидор • 220 г", kcal: 140, p: 4, f: 8, c: 12)
            ]
        ),
        MealSection(
            title: "Перекус",
            timeHint: "16:30",
            items: [
                FoodEntry(title: "Йогурт натуральный", details: "200 г", kcal: 105, p: 10, f: 3, c: 9)
            ]
        ),
        MealSection(
            title: "Ужин",
            timeHint: "—",
            items: []
        )
    ]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {

                    FTHeader(
                        title: "Дневник",
                        subtitle: "Записывайте еду и следите за прогрессом. Даже идеально дисциплинированные люди иногда забывают про перекусы — мы не осуждаем, мы считаем."
                    )
                    .padding(.top, 10)

                    // Сводка дня
                    FTCard {
                        HStack(alignment: .top, spacing: 14) {
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Сегодня")
                                    .font(.system(size: 15, weight: .semibold))
                                Text(dateString(today))
                                    .font(.system(size: 12))
                                    .foregroundColor(FTTheme.muted)
                            }

                            Spacer()

                            VStack(alignment: .trailing, spacing: 6) {
                                Text("\(consumedKcal) / \(goalKcal) ккал")
                                    .font(.system(size: 15, weight: .semibold))
                                Text(consumedKcal <= goalKcal ? "В пределах плана" : "Превышение плана")
                                    .font(.system(size: 12))
                                    .foregroundColor(consumedKcal <= goalKcal ? .green.opacity(0.85) : .red.opacity(0.85))
                            }
                        }

                        ProgressRow(label: "Белки", value: consumedProtein, goal: goalProtein, suffix: "г")
                        ProgressRow(label: "Жиры", value: consumedFat, goal: goalFat, suffix: "г")
                        ProgressRow(label: "Углеводы", value: consumedCarbs, goal: goalCarbs, suffix: "г")

                        HStack(spacing: 10) {
                            MiniChip(icon: "flame", text: "Серия: 4 дня")
                            MiniChip(icon: "drop", text: "Вода: 1.2 л")
                            MiniChip(icon: "figure.walk", text: "Шаги: 6 430")
                            Spacer()
                        }
                        .padding(.top, 6)
                    }

                    // Быстрые действия
                    FTCard {
                        Text("Быстрые действия")
                            .font(.system(size: 16, weight: .semibold))

                        VStack(spacing: 10) {
                            ActionRow(
                                icon: "camera",
                                title: "Добавить по фото",
                                subtitle: "Сфотографируйте блюдо — получим примерные ккал и БЖУ",
                                badge: "быстро"
                            )
                            ActionRow(
                                icon: "plus.circle",
                                title: "Добавить вручную",
                                subtitle: "Подойдёт для рецептов, перекусов и точных граммовок",
                                badge: nil
                            )
                            ActionRow(
                                icon: "book",
                                title: "Добавить из рецептов",
                                subtitle: "Выберите рецепт и добавьте порцию в дневник",
                                badge: nil
                            )
                        }
                    }

                    // Приёмы пищи
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Приёмы пищи")
                            .font(.system(size: 18, weight: .semibold))

                        ForEach(meals) { section in
                            MealSectionView(section: section)
                        }
                    }

                    Text("Совет дня: лучшее приложение — то, которое вы реально используете. Не получилось идеально? Запишите как есть.")
                        .font(.system(size: 12))
                        .foregroundColor(FTTheme.muted)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding(.top, 6)

                    Spacer(minLength: 20)
                }
                .padding(.horizontal, 18)
                .padding(.bottom, 18)
            }
            .background(FTTheme.bg)
            .navigationBarHidden(true)
        }
    }

    private func dateString(_ date: Date) -> String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "ru_RU")
        f.dateFormat = "d MMMM, EEEE"
        return f.string(from: date).capitalized
    }
}

// MARK: - UI bits

private struct FoodEntry: Identifiable {
    let id = UUID()
    let title: String
    let details: String
    let kcal: Int
    let p: Int
    let f: Int
    let c: Int
}

private struct MealSection: Identifiable {
    let id = UUID()
    let title: String
    let timeHint: String
    let items: [FoodEntry]
}

private struct MealSectionView: View {
    let section: MealSection

    var body: some View {
        FTCard {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(section.title)
                        .font(.system(size: 16, weight: .semibold))
                    Text(section.timeHint == "—" ? "Пока пусто" : "Последнее: \(section.timeHint)")
                        .font(.system(size: 12))
                        .foregroundColor(FTTheme.muted)
                }
                Spacer()
                Image(systemName: "plus")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.black.opacity(0.7))
                    .padding(10)
                    .background(Color.gray.opacity(0.10))
                    .clipShape(Circle())
            }

            if section.items.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Ничего не добавлено")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.black.opacity(0.75))
                    Text("Добавьте блюдо вручную, по фото или из рецептов — как вам удобнее.")
                        .font(.system(size: 12))
                        .foregroundColor(FTTheme.muted)
                }
                .padding(.top, 6)
            } else {
                VStack(spacing: 10) {
                    ForEach(section.items) { item in
                        HStack(alignment: .top, spacing: 12) {
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.gray.opacity(0.12))
                                .frame(width: 44, height: 44)
                                .overlay(
                                    Text("\(item.kcal)")
                                        .font(.system(size: 12, weight: .bold))
                                        .foregroundColor(.black.opacity(0.75))
                                )

                            VStack(alignment: .leading, spacing: 4) {
                                Text(item.title)
                                    .font(.system(size: 15, weight: .semibold))
                                Text(item.details)
                                    .font(.system(size: 12))
                                    .foregroundColor(FTTheme.muted)
                                Text("Б \(item.p) • Ж \(item.f) • У \(item.c)")
                                    .font(.system(size: 12, weight: .semibold))
                                    .foregroundColor(.black.opacity(0.7))
                            }

                            Spacer()

                            Image(systemName: "chevron.right")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(FTTheme.muted)
                                .padding(.top, 2)
                        }
                        if item.id != section.items.last?.id {
                            Divider().opacity(0.35)
                        }
                    }
                }
                .padding(.top, 6)
            }
        }
    }
}

private struct ProgressRow: View {
    let label: String
    let value: Int
    let goal: Int
    let suffix: String

    var ratio: Double {
        guard goal > 0 else { return 0 }
        return min(1.0, Double(value) / Double(goal))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(label)
                    .font(.system(size: 13, weight: .medium))
                Spacer()
                Text("\(value) / \(goal)\(suffix)")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.black.opacity(0.7))
            }

            ZStack(alignment: .leading) {
                Capsule().fill(Color.gray.opacity(0.12)).frame(height: 8)
                Capsule().fill(Color.black).frame(width: CGFloat(ratio) * 260, height: 8)
            }
        }
        .padding(.top, 10)
    }
}

private struct MiniChip: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: icon).font(.system(size: 12, weight: .semibold))
            Text(text).font(.system(size: 12, weight: .semibold))
        }
        .foregroundColor(.black.opacity(0.75))
        .padding(.horizontal, 10)
        .padding(.vertical, 8)
        .background(Color.gray.opacity(0.10))
        .cornerRadius(999)
    }
}

private struct ActionRow: View {
    let icon: String
    let title: String
    let subtitle: String
    let badge: String?

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            RoundedRectangle(cornerRadius: 14)
                .fill(Color.gray.opacity(0.12))
                .frame(width: 44, height: 44)
                .overlay(Image(systemName: icon).font(.system(size: 18, weight: .semibold)).foregroundColor(.black.opacity(0.75)))

            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 8) {
                    Text(title)
                        .font(.system(size: 15, weight: .semibold))
                    if let badge {
                        Text(badge.uppercased())
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(.black.opacity(0.7))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color.gray.opacity(0.12))
                            .cornerRadius(999)
                    }
                }

                Text(subtitle)
                    .font(.system(size: 12))
                    .foregroundColor(FTTheme.muted)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(FTTheme.muted)
                .padding(.top, 4)
        }
        .padding(14)
        .background(Color.white)
        .overlay(RoundedRectangle(cornerRadius: FTTheme.corner).stroke(FTTheme.border, lineWidth: 1))
        .cornerRadius(FTTheme.corner)
    }
}
