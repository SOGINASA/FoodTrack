import SwiftUI

struct LoginView: View {
    @EnvironmentObject private var authVM: AuthViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var identity = ""
    @State private var password = ""
    @State private var errorText: String?

    var body: some View {
        VStack(spacing: 16) {
            HStack {
                Button {
                    dismiss()
                } label: {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.black)
                        .padding(10)
                        .background(Color.black.opacity(0.04))
                        .cornerRadius(12)
                }
                Spacer()
            }
            .padding(.horizontal, 16)

            VStack(alignment: .leading, spacing: 8) {
                Text("Вход")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.black)

                Text("Пока демо — любой логин/пароль пропустит.")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.black.opacity(0.55))
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 16)

            VStack(spacing: 12) {
                AuthTextField(title: "Ник/почта", placeholder: "tony или tony@mail.com", text: $identity)
                SecureAuthTextField(title: "Пароль", placeholder: "••••••••", text: $password)

                if let errorText {
                    Text(errorText)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.red)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }

                PrimaryButton(title: authVM.isLoading ? "Входим..." : "Войти") {
                    errorText = nil
                    authVM.login(identity: identity, password: password) { ok, message in
                        if !ok { errorText = message }
                    }
                }
                .disabled(authVM.isLoading)
            }
            .padding(16)
            .background(Color.black.opacity(0.03))
            .cornerRadius(18)
            .padding(.horizontal, 16)

            Spacer()
        }
        .padding(.top, 12)
        .background(Color.white)
        .navigationBarBackButtonHidden(true)
    }
}
