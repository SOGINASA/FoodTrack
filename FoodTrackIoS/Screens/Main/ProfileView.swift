import SwiftUI

struct ProfileView: View {
    @EnvironmentObject private var appState: AppState

    // мок-профиль
    private let name = "Тони"
    private let plan = "Поддержание формы"
    private let kcal = 2100
    private let p = 140
    private let f = 70
    private let c = 220

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {

                    FTHeader(
                        title: "Профиль",
                        subtitle: "Цели, настройки и то самое место, где приложения обычно прячут “Выход”. Мы — не прячем."
                    )
                    .padding(.top, 10)

                    // Карточка пользователя
                    FTCard {
                        HStack(spacing: 14) {
                            Circle()
                                .fill(Color.gray.opacity(0.15))
                                .frame(width: 54, height: 54)
                                .overlay(Text("TS").font(.system(size: 14, weight: .bold)).foregroundColor(.black.opacity(0.75)))

                            VStack(alignment: .leading, spacing: 4) {
                                Text(name)
                                    .font(.system(size: 16, weight: .semibold))
                                Text(plan)
                                    .font(.system(size: 12))
                                    .foregroundColor(FTTheme.muted)
                            }

                            Spacer()

                            Text("PRO")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(.black.opacity(0.75))
                                .padding(.horizontal, 10)
                                .padding(.vertical, 6)
                                .background(Color.gray.opacity(0.12))
                                .cornerRadius(999)
                        }

                        Divider().opacity(0.35).padding(.top, 8)

                        Text("Дневная цель")
                            .font(.system(size: 15, weight: .semibold))
                            .padding(.top, 4)

                        HStack(spacing: 10) {
                            StatChip(title: "Калории", value: "\(kcal)")
                            StatChip(title: "Белки", value: "\(p) г")
                            StatChip(title: "Жиры", value: "\(f) г")
                            StatChip(title: "Углеводы", value: "\(c) г")
                        }
                        .padding(.top, 8)

                        Text("Эти значения берутся из онбординга. В будущем можно будет тонко настраивать режим (сушка/масса/поддержание).")
                            .font(.system(size: 12))
                            .foregroundColor(FTTheme.muted)
                            .padding(.top, 8)
                    }

                    // Настройки (пока статично)
                    FTCard {
                        Text("Настройки")
                            .font(.system(size: 16, weight: .semibold))

                        SettingRow(icon: "bell", title: "Уведомления", subtitle: "Напоминания про воду и приёмы пищи")
                        SettingRow(icon: "lock", title: "Приватность", subtitle: "Фото и данные не видны другим пользователям")
                        SettingRow(icon: "globe", title: "Язык", subtitle: "Русский")
                        SettingRow(icon: "wand.and.stars", title: "Точность анализа", subtitle: "Скоро: уточнение порции и ингредиентов")

                        Divider().opacity(0.35).padding(.top, 8)

                        Button {
                            appState.logout()
                        } label: {
                            HStack {
                                Image(systemName: "rectangle.portrait.and.arrow.right")
                                Text("Выйти из аккаунта")
                                    .font(.system(size: 15, weight: .semibold))
                                Spacer()
                            }
                            .foregroundColor(.red.opacity(0.9))
                            .padding(.top, 6)
                        }
                        .buttonStyle(.plain)
                    }

                    // О продукте
                    FTCard {
                        Text("О FoodTrack")
                            .font(.system(size: 16, weight: .semibold))

                        Text("FoodTrack — это дневник питания + быстрый анализ по фото. Наша цель — сделать контроль питания простым, без чувства вины и без необходимости жить с кухонными весами в обнимку.")
                            .font(.system(size: 13))
                            .foregroundColor(.black.opacity(0.78))
                            .padding(.top, 4)

                        HStack(spacing: 10) {
                            MiniTag(text: "Дневник")
                            MiniTag(text: "Рецепты")
                            MiniTag(text: "Фото-анализ")
                            MiniTag(text: "Цели")
                            Spacer()
                        }
                        .padding(.top, 8)

                        Text("Версия: 0.1 (UI Prototype)")
                            .font(.system(size: 12))
                            .foregroundColor(FTTheme.muted)
                            .padding(.top, 8)
                    }

                    Spacer(minLength: 18)
                }
                .padding(.horizontal, 18)
                .padding(.bottom, 18)
            }
            .background(FTTheme.bg)
            .navigationBarHidden(true)
        }
    }
}

// MARK: - Bits

private struct StatChip: View {
    let title: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(FTTheme.muted)
            Text(value)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.black.opacity(0.8))
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(Color.gray.opacity(0.10))
        .cornerRadius(14)
    }
}

private struct SettingRow: View {
    let icon: String
    let title: String
    let subtitle: String

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            RoundedRectangle(cornerRadius: 14)
                .fill(Color.gray.opacity(0.12))
                .frame(width: 44, height: 44)
                .overlay(Image(systemName: icon).font(.system(size: 18, weight: .semibold)).foregroundColor(.black.opacity(0.75)))

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 15, weight: .semibold))
                Text(subtitle)
                    .font(.system(size: 12))
                    .foregroundColor(FTTheme.muted)
            }
            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(FTTheme.muted)
                .padding(.top, 4)
        }
        .padding(.top, 12)
    }
}

private struct MiniTag: View {
    let text: String
    var body: some View {
        Text(text)
            .font(.system(size: 11, weight: .semibold))
            .foregroundColor(.black.opacity(0.75))
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(Color.gray.opacity(0.10))
            .cornerRadius(999)
    }
}
