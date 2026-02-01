import SwiftUI

struct ProfileView: View {
    @EnvironmentObject private var appState: AppState
    @State private var showLogoutConfirm = false

    private var user: UserDTO? { appState.user }
    private var goals: GoalsDTO { appState.goals ?? GoalsDTO(calories_goal: nil, protein_goal: nil, carbs_goal: nil, fats_goal: nil, target_weight: nil, activity_level: nil, goal_type: nil, diet_type: nil) }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {

                    FTHeader(
                        title: "Профиль",
                        subtitle: "Цели, настройки и выход из аккаунта"
                    )
                    .padding(.top, 10)

                    // User card
                    FTCard {
                        HStack(spacing: 14) {
                            Circle()
                                .fill(Color.gray.opacity(0.15))
                                .frame(width: 54, height: 54)
                                .overlay(
                                    Text(user?.initials ?? "FT")
                                        .font(.system(size: 14, weight: .bold))
                                        .foregroundColor(.black.opacity(0.75))
                                )

                            VStack(alignment: .leading, spacing: 4) {
                                Text(user?.displayName ?? "User")
                                    .font(.system(size: 16, weight: .semibold))
                                if let email = user?.email {
                                    Text(email)
                                        .font(.system(size: 12))
                                        .foregroundColor(FTTheme.muted)
                                } else if let nick = user?.nickname {
                                    Text("@\(nick)")
                                        .font(.system(size: 12))
                                        .foregroundColor(FTTheme.muted)
                                }
                            }

                            Spacer()
                        }

                        Divider().opacity(0.35).padding(.top, 8)

                        Text("Дневная цель")
                            .font(.system(size: 15, weight: .semibold))
                            .padding(.top, 4)

                        HStack(spacing: 10) {
                            ProfileStatChip(title: "Калории", value: "\(goals.caloriesGoal)")
                            ProfileStatChip(title: "Белки", value: "\(goals.proteinGoal) г")
                            ProfileStatChip(title: "Жиры", value: "\(goals.fatsGoal) г")
                            ProfileStatChip(title: "Углеводы", value: "\(goals.carbsGoal) г")
                        }
                        .padding(.top, 8)

                        if let diet = user?.diet, diet != "none" {
                            HStack(spacing: 6) {
                                Image(systemName: "leaf")
                                    .font(.system(size: 12))
                                Text("Диета: \(diet)")
                                    .font(.system(size: 12))
                            }
                            .foregroundColor(FTTheme.muted)
                            .padding(.top, 8)
                        }
                    }

                    // Body info
                    if let weight = user?.weight_kg, let height = user?.height_cm {
                        FTCard {
                            Text("Параметры тела")
                                .font(.system(size: 15, weight: .semibold))

                            HStack(spacing: 10) {
                                ProfileStatChip(title: "Рост", value: "\(Int(height)) см")
                                ProfileStatChip(title: "Вес", value: "\(Int(weight)) кг")
                                if let target = user?.target_weight_kg {
                                    ProfileStatChip(title: "Цель", value: "\(Int(target)) кг")
                                }
                                if let workouts = user?.workouts_per_week {
                                    ProfileStatChip(title: "Тренировки", value: "\(workouts)/нед")
                                }
                            }
                        }
                    }

                    // Settings
                    FTCard {
                        Text("Настройки")
                            .font(.system(size: 16, weight: .semibold))

                        ProfileSettingRow(icon: "bell", title: "Уведомления", subtitle: "Напоминания про воду и приёмы пищи")
                        ProfileSettingRow(icon: "lock", title: "Приватность", subtitle: "Данные не видны другим пользователям")
                        ProfileSettingRow(icon: "globe", title: "Язык", subtitle: "Русский")

                        Divider().opacity(0.35).padding(.top, 8)

                        Button {
                            showLogoutConfirm = true
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

                    // About
                    FTCard {
                        Text("О FoodTrack")
                            .font(.system(size: 16, weight: .semibold))

                        Text("FoodTrack — дневник питания + анализ по фото. Контроль питания без чувства вины.")
                            .font(.system(size: 13))
                            .foregroundColor(.black.opacity(0.78))
                            .padding(.top, 4)

                        HStack(spacing: 10) {
                            ProfileMiniTag(text: "Дневник")
                            ProfileMiniTag(text: "Рецепты")
                            ProfileMiniTag(text: "Фото-анализ")
                            ProfileMiniTag(text: "Цели")
                            Spacer()
                        }
                        .padding(.top, 8)

                        Text("Версия: 1.0")
                            .font(.system(size: 12))
                            .foregroundColor(FTTheme.muted)
                            .padding(.top, 8)
                    }

                    Spacer(minLength: 18)
                }
                .padding(.horizontal, FTTheme.hPad)
                .padding(.bottom, 18)
            }
            .background(FTTheme.bg)
            .navigationBarHidden(true)
        }
        .alert("Выйти из аккаунта?", isPresented: $showLogoutConfirm) {
            Button("Отмена", role: .cancel) {}
            Button("Выйти", role: .destructive) { appState.logout() }
        } message: {
            Text("Вы сможете войти снова в любой момент")
        }
        .task { await appState.refreshUser() }
    }
}

// MARK: - Sub-views

private struct ProfileStatChip: View {
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

private struct ProfileSettingRow: View {
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
                Text(title).font(.system(size: 15, weight: .semibold))
                Text(subtitle).font(.system(size: 12)).foregroundColor(FTTheme.muted)
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

private struct ProfileMiniTag: View {
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
