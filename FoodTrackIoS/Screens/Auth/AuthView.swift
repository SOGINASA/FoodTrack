import SwiftUI

struct AuthView: View {
    @EnvironmentObject private var appState: AppState

    enum Mode { case login, register }
    @State private var mode: Mode = .login

    @State private var identifier = ""
    @State private var password = ""
    @State private var confirm = ""
    @State private var error = ""
    @State private var isLoading = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {

                // Logo
                HStack(spacing: 10) {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(FTTheme.fill)
                        .frame(width: 44, height: 44)
                        .overlay(Text("FT").font(.system(size: 14, weight: .bold)).foregroundColor(FTTheme.text))
                    VStack(alignment: .leading, spacing: 2) {
                        Text("FoodTrack").font(.system(size: 22, weight: .bold)).foregroundColor(FTTheme.text)
                        Text("Snap it. Track it.")
                            .font(.system(size: 13))
                            .foregroundColor(FTTheme.muted)
                    }
                    Spacer()
                }
                .padding(.bottom, 8)

                // Mode toggle
                HStack(spacing: 0) {
                    modeButton("Вход", isActive: mode == .login) { mode = .login; error = "" }
                    modeButton("Регистрация", isActive: mode == .register) { mode = .register; error = "" }
                }
                .padding(6)
                .background(FTTheme.fill)
                .cornerRadius(16)

                VStack(alignment: .leading, spacing: 6) {
                    Text(mode == .login ? "Добро пожаловать!" : "Создать аккаунт")
                        .font(.system(size: 26, weight: .semibold))
                        .foregroundColor(FTTheme.text)
                    Text(mode == .login
                         ? "Войдите в свой аккаунт"
                         : "Зарегистрируйтесь для доступа ко всем функциям")
                        .font(.system(size: 13))
                        .foregroundColor(FTTheme.muted)
                }

                VStack(spacing: 14) {
                    FTTextField(
                        title: "Ник или почта",
                        placeholder: "Например: tony или tony@mail.com",
                        text: $identifier,
                        keyboard: .emailAddress
                    )
                    FTTextField(
                        title: "Пароль",
                        placeholder: "Минимум 4 символа",
                        text: $password,
                        isSecure: true
                    )
                    if mode == .register {
                        FTTextField(
                            title: "Подтвердите пароль",
                            placeholder: "Повторите пароль",
                            text: $confirm,
                            isSecure: true
                        )
                    }
                }
                .padding(.top, 6)

                if !error.isEmpty {
                    Text(error)
                        .font(.system(size: 14))
                        .foregroundColor(.red)
                        .transition(.opacity)
                }

                PrimaryButton(
                    title: isLoading ? "Загрузка..." : (mode == .login ? "Войти" : "Зарегистрироваться"),
                    disabled: isLoading
                ) {
                    submit()
                }
                .padding(.top, 6)

                HStack {
                    Spacer()
                    Button {
                        withAnimation(.easeOut(duration: 0.2)) {
                            mode = mode == .login ? .register : .login
                            error = ""
                        }
                    } label: {
                        Text(mode == .login ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(FTTheme.muted)
                    }
                    Spacer()
                }
                .padding(.top, 4)

                Spacer()
            }
            .padding(.horizontal, FTTheme.hPad)
            .padding(.vertical, 20)
        }
        .background(FTTheme.bg)
    }

    // MARK: - Actions

    private func submit() {
        let trimmed = identifier.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { error = "Введите ник или почту"; return }
        guard password.count >= 4 else { error = "Пароль минимум 4 символа"; return }
        if mode == .register, confirm != password { error = "Пароли не совпадают"; return }

        error = ""
        isLoading = true

        Task {
            do {
                if mode == .login {
                    try await appState.login(identifier: trimmed, password: password)
                } else {
                    try await appState.register(identifier: trimmed, password: password)
                }
            } catch {
                self.error = error.localizedDescription
            }
            isLoading = false
        }
    }

    // MARK: - Helpers

    private func modeButton(_ text: String, isActive: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(text)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(isActive ? FTTheme.text : FTTheme.muted)
                .background(isActive ? FTTheme.card : Color.clear)
                .cornerRadius(14)
        }
    }
}
