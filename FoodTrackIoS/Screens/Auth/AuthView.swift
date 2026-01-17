import SwiftUI

struct AuthView: View {
    @EnvironmentObject private var appState: AppState

    enum Mode { case login, register }
    @State private var mode: Mode = .login

    @State private var identifier: String = ""
    @State private var password: String = ""
    @State private var confirm: String = ""

    @State private var error: String = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {

            // Лого + название (пока текстом; потом вставим картинку из Assets)
            HStack(spacing: 10) {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.gray.opacity(0.15))
                    .frame(width: 44, height: 44)
                    .overlay(Text("FT").font(.system(size: 14, weight: .bold)))
                VStack(alignment: .leading, spacing: 2) {
                    Text("FoodTrack").font(.system(size: 22, weight: .bold))
                    Text("Вход и регистрация").font(.system(size: 13)).foregroundColor(FTTheme.muted)
                }
                Spacer()
            }
            .padding(.bottom, 8)

            // Переключатель режима
            HStack(spacing: 0) {
                Button {
                    error = ""
                    mode = .login
                } label: {
                    Text("Вход")
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(mode == .login ? .black : FTTheme.muted)
                        .background(mode == .login ? Color.white : Color.clear)
                        .cornerRadius(14)
                }

                Button {
                    error = ""
                    mode = .register
                } label: {
                    Text("Регистрация")
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(mode == .register ? .black : FTTheme.muted)
                        .background(mode == .register ? Color.white : Color.clear)
                        .cornerRadius(14)
                }
            }
            .padding(6)
            .background(Color.gray.opacity(0.12))
            .cornerRadius(16)

            VStack(alignment: .leading, spacing: 6) {
                Text(mode == .login ? "Добро пожаловать!" : "Создать аккаунт")
                    .font(.system(size: 26, weight: .semibold))
                Text(mode == .login ? "Войдите в свой аккаунт" : "Зарегистрируйтесь для доступа ко всем функциям")
                    .font(.system(size: 13))
                    .foregroundColor(FTTheme.muted)
            }

            VStack(spacing: 14) {
                FTTextField(title: "Ник или почта", placeholder: "Например: tony или tony@mail.com", text: $identifier, keyboard: .emailAddress)
                FTTextField(title: "Пароль", placeholder: "Минимум 4 символа", text: $password, isSecure: true)

                if mode == .register {
                    FTTextField(title: "Подтвердите пароль", placeholder: "Повторите пароль", text: $confirm, isSecure: true)
                }
            }
            .padding(.top, 6)

            if !error.isEmpty {
                Text(error).font(.system(size: 14)).foregroundColor(.red)
            }

            PrimaryButton(title: mode == .login ? "Войти" : "Зарегистрироваться") {
                // Статично: проверка только для вида
                if identifier.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                    error = "Введите ник или почту"
                    return
                }
                if password.count < 4 {
                    error = "Пароль минимум 4 символа"
                    return
                }
                if mode == .register, confirm != password {
                    error = "Пароли не совпадают"
                    return
                }
                error = ""
                // после регистрации отправляем в онбординг, после логина — в main
                appState.finishAuth(goToOnboarding: mode == .register)
            }
            .padding(.top, 6)

            Spacer()
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 20)
        .background(FTTheme.bg)
    }
}
